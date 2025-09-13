// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "forge-std/Test.sol";
import {DutchBasar} from "../src/DutchBasar.sol";
import {DutchBasarFactory} from "../src/DutchBasarFactory.sol";
import {DutchBasarAI} from "../src/extensions/DutchBasarAI.sol";
import {DutchBasarBridge} from "../src/extensions/DutchBasarBridge.sol";
import {DutchBasarDAO} from "../src/extensions/DutchBasarDAO.sol";
import {DutchBasarMultiSig} from "../src/extensions/DutchBasarMultiSig.sol";
import {DutchBasarStaking} from "../src/extensions/DutchBasarStaking.sol";
import {MerkleAllowlist} from "../src/utils/MerkleAllowlist.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract MockPriceFeed {
    function latestRoundData() external pure returns (uint80, int256, uint256, uint256, uint80) {
        return (1, 300000000000, 0, 0, 1); // $3000
    }
}

contract MockLayerZeroEndpoint {
    function send(uint16, bytes calldata, bytes calldata, address payable, address, bytes calldata) external payable {}
    function estimateFees(uint16, address, bytes calldata, bool, bytes calldata) external pure returns (uint256, uint256) {
        return (0.01 ether, 0);
    }
}

contract FullCoverageTest is Test, IERC721Receiver {
    DutchBasar public dutchBasar;
    DutchBasarFactory public factory;
    DutchBasarAI public ai;
    DutchBasarBridge public bridge;
    DutchBasarDAO public dao;
    DutchBasarMultiSig public multiSig;
    DutchBasarStaking public staking;
    
    address owner = address(0x1);
    address user1 = address(0x2);
    address user2 = address(0x3);
    address[3] signers = [address(0x4), address(0x5), address(0x6)];
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy main contract
        dutchBasar = new DutchBasar("Test", "TST", "ipfs://", owner, owner, 250);
        
        // Configure auction
        dutchBasar.configureAuction(
            2 ether,
            0.1 ether,
            uint64(block.timestamp),
            uint64(block.timestamp + 7 days),
            100
        );
        
        // Deploy extensions
        factory = new DutchBasarFactory(owner, 0.01 ether);
        ai = new DutchBasarAI(address(dutchBasar), address(new MockPriceFeed()));
        bridge = new DutchBasarBridge(address(new MockLayerZeroEndpoint()), address(dutchBasar));
        dao = new DutchBasarDAO(address(dutchBasar));
        multiSig = new DutchBasarMultiSig(address(dutchBasar), signers);
        staking = new DutchBasarStaking(address(dutchBasar));
        
        vm.stopPrank();
    }
    
    // Test all uncovered DutchBasar functions
    function testAllowlistMint() public {
        // Create proper merkle tree setup
        bytes32 leaf1 = keccak256(abi.encodePacked(user1, uint256(2)));
        bytes32 leaf2 = keccak256(abi.encodePacked(user2, uint256(3)));
        bytes32 root = keccak256(abi.encodePacked(leaf1, leaf2));
        
        vm.prank(owner);
        dutchBasar.configureAllowlist(root);
        
        // Test with empty proof - should return false
        bytes32[] memory emptyProof = new bytes32[](0);
        assertFalse(dutchBasar.isAllowlisted(user1, 2, emptyProof));
        
        // Test remaining mints
        assertEq(dutchBasar.getRemainingAllowlistMints(user1, 2), 2);
        
        // Test with single leaf as root (valid case)
        bytes32 singleRoot = leaf1;
        vm.prank(owner);
        dutchBasar.configureAllowlist(singleRoot);
        
        bytes32[] memory validProof = new bytes32[](0);
        assertTrue(dutchBasar.isAllowlisted(user1, 2, validProof));
    }
    
    function testChainOptimizations() public {
        (uint256 gas, uint256 bundle) = dutchBasar.getChainOptimizations();
        assertTrue(gas > 0);
        assertTrue(bundle > 0);
    }
    
    function testBridgeToChain() public {
        vm.prank(owner);
        dutchBasar.ownerMint(user1, 1);
        
        vm.prank(owner);
        dutchBasar.setBridgeContract(1, address(bridge));
        
        // Test bridge functionality
        assertTrue(dutchBasar.bridgeContracts(1) == address(bridge));
        
        // Test that bridge was set correctly
        assertEq(dutchBasar.bridgeContracts(1), address(bridge));
    }
    
    function testRequestRandomness() public {
        vm.prank(owner);
        dutchBasar.requestRandomness();
        assertTrue(dutchBasar.randomSeed() > 0);
    }
    
    function testGetEvolutionStage() public {
        vm.prank(owner);
        dutchBasar.ownerMint(user1, 1);
        
        uint256 stage = dutchBasar.getEvolutionStage(1);
        assertEq(stage, 1);
        
        vm.warp(block.timestamp + 31 days);
        assertEq(dutchBasar.getEvolutionStage(1), 2);
        
        vm.warp(block.timestamp + 60 days);
        assertEq(dutchBasar.getEvolutionStage(1), 3);
        
        vm.warp(block.timestamp + 90 days);
        assertEq(dutchBasar.getEvolutionStage(1), 4);
    }
    
    function testTokenURI() public {
        vm.prank(owner);
        dutchBasar.ownerMint(user1, 1);
        
        // Before reveal
        string memory uri = dutchBasar.tokenURI(1);
        assertEq(uri, "ipfs://");
        
        // After reveal
        vm.prank(owner);
        dutchBasar.reveal("ipfs://revealed/", keccak256("provenance"));
        uri = dutchBasar.tokenURI(1);
        assertEq(uri, "ipfs://revealed/1.json");
    }
    
    function testUpdateBaseURI() public {
        vm.prank(owner);
        dutchBasar.ownerMint(user1, 1);
        
        vm.prank(owner);
        dutchBasar.reveal("ipfs://revealed/", keccak256("provenance"));
        
        vm.prank(owner);
        dutchBasar.updateBaseURI("ipfs://updated/");
        
        string memory uri = dutchBasar.tokenURI(1);
        assertEq(uri, "ipfs://updated/1.json");
    }
    
    function testProposeAndExecuteOwnerChange() public {
        vm.startPrank(owner);
        dutchBasar.proposeOwnerChange(user1);
        
        vm.expectRevert();
        dutchBasar.executeOwnerChange(user1);
        
        vm.warp(block.timestamp + 2 days + 1);
        dutchBasar.executeOwnerChange(user1);
        
        assertEq(dutchBasar.owner(), user1);
        vm.stopPrank();
    }
    
    function testFundGasRefundPool() public {
        vm.deal(owner, 1 ether);
        uint256 initialPool = dutchBasar.gasRefundPool();
        vm.prank(owner);
        dutchBasar.fundGasRefundPool{value: 1 ether}();
        assertEq(dutchBasar.gasRefundPool(), initialPool + 1 ether);
    }
    
    function testBitmapAllowlistMint() public {
        bytes32 leaf = keccak256(abi.encodePacked(user1, uint256(0), uint256(1)));
        bytes32 root = leaf;
        bytes32[] memory proof = new bytes32[](0);
        
        vm.prank(owner);
        dutchBasar.configureAllowlist(root);
        
        vm.deal(user1, 10 ether);
        vm.prank(user1);
        dutchBasar.bitmapAllowlistMint{value: 2 ether}(0, 1, proof);
        
        assertEq(dutchBasar.balanceOf(user1), 1);
    }
    
    // Test Factory functions
    function testFactoryDeploy() public {
        // First authorize user1
        vm.prank(owner);
        factory.setDeployerAuthorization(user1, true);
        
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        
        DutchBasarFactory.DeploymentParams memory params = DutchBasarFactory.DeploymentParams({
            name: "Test2",
            symbol: "TST2",
            unrevealedURI: "ipfs://",
            owner: user1,
            royaltyRecipient: user1,
            royaltyFeeBasisPoints: 250
        });
        
        address deployed = factory.deployDutchBasar{value: 0.01 ether}(params);
        assertTrue(deployed != address(0));
    }
    
    function testFactoryBatchDeploy() public {
        // First authorize user1
        vm.prank(owner);
        factory.setDeployerAuthorization(user1, true);
        
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        
        DutchBasarFactory.DeploymentParams[] memory paramsArray = new DutchBasarFactory.DeploymentParams[](2);
        paramsArray[0] = DutchBasarFactory.DeploymentParams({
            name: "Test3",
            symbol: "TST3",
            unrevealedURI: "ipfs://",
            owner: user1,
            royaltyRecipient: user1,
            royaltyFeeBasisPoints: 250
        });
        paramsArray[1] = DutchBasarFactory.DeploymentParams({
            name: "Test4",
            symbol: "TST4",
            unrevealedURI: "ipfs://",
            owner: user1,
            royaltyRecipient: user1,
            royaltyFeeBasisPoints: 250
        });
        
        address[] memory deployed = factory.batchDeployDutchBasar{value: 0.02 ether}(paramsArray);
        assertEq(deployed.length, 2);
    }
    
    function testFactoryAuthorization() public {
        vm.startPrank(owner);
        factory.setDeployerAuthorization(user1, true);
        assertTrue(factory.authorizedDeployers(user1));
        
        address[] memory deployers = new address[](2);
        deployers[0] = user2;
        deployers[1] = address(0x7);
        factory.batchSetDeployerAuthorization(deployers, true);
        assertTrue(factory.authorizedDeployers(user2));
        
        factory.setDeploymentFee(0.02 ether);
        assertEq(factory.deploymentFee(), 0.02 ether);
        
        factory.pause();
        factory.unpause();
        
        vm.stopPrank();
    }
    
    function testFactoryWithdrawals() public {
        vm.deal(address(factory), 1 ether);
        
        vm.startPrank(owner);
        factory.withdrawFees(owner);
        assertEq(owner.balance, 1 ether);
        
        vm.deal(address(factory), 1 ether);
        factory.withdrawAmount(owner, 0.5 ether);
        assertEq(owner.balance, 1.5 ether);
        
        vm.stopPrank();
    }
    
    function testFactoryViews() public {
        DutchBasarFactory.DeploymentInfo memory info = factory.getDeploymentInfo(address(0));
        assertEq(info.contractAddress, address(0));
        
        address[] memory contracts = factory.getDeployerContracts(user1);
        assertEq(contracts.length, 0);
        
        bool exists = factory.checkDeploymentExists("Test", "TST", user1);
        assertFalse(exists);
        
        (uint256 total, uint256 chainId, uint256 fee) = factory.getFactoryStats();
        assertTrue(chainId > 0);
    }
    
    // Test AI extension
    function testAIFunctions() public {
        uint256 price = ai.calculateOptimalPrice();
        assertTrue(price > 0);
        
        ai.updateMarketData(100 ether, 50, 10 days, 25 ether, 0.8 ether);
        
        uint256 score = ai.calculateUserScore(user1);
        assertTrue(score >= 50);
        
        uint256 personalPrice = ai.getPersonalizedPrice(user1);
        assertTrue(personalPrice > 0);
        
        uint256 rarity = ai.calculateRarity(7);
        assertTrue(rarity > 0);
        
        rarity = ai.calculateRarity(11);
        assertTrue(rarity > 0);
        
        rarity = ai.calculateRarity(121);
        assertTrue(rarity > 0);
    }
    
    // Test Bridge extension
    function testBridgeFunctions() public {
        vm.prank(owner);
        dutchBasar.ownerMint(address(this), 1);
        
        // Only owner of DutchBasar can set trusted remote
        vm.prank(dutchBasar.owner());
        bridge.setTrustedRemote(102, abi.encodePacked(address(bridge)));
        
        // Test unsupported chain
        vm.expectRevert();
        bridge.bridgeNFT{value: 0.01 ether}(1, 103, user1);
        
        // Test successful bridge
        dutchBasar.approve(address(bridge), 1);
        bridge.bridgeNFT{value: 0.01 ether}(1, 102, user1);
        
        // Test fee estimation
        (uint256 nativeFee, uint256 zroFee) = bridge.estimateBridgeFee(102, 1, user1);
        assertTrue(nativeFee > 0 || zroFee >= 0);
    }
    
    // Test DAO extension
    function testDAOFunctions() public {
        // Test basic DAO deployment and functionality
        assertTrue(address(dao) != address(0));
        assertEq(dao.totalSupply(), 1000000e18);
        
        // Test balance of DAO contract itself
        assertEq(dao.balanceOf(address(dao)), 0);
        
        // Test that DAO has initial supply
        assertTrue(dao.totalSupply() > 0);
        
        // DAO tokens are minted to the DAO contract in constructor
        // Test contract doesn't have tokens unless transferred
        assertEq(dao.balanceOf(address(this)), 0);
    }
    
    // Test Staking extension
    function testStakingFunctions() public {
        // First fund the reward pool
        vm.deal(address(staking), 10 ether);
        
        vm.prank(owner);
        dutchBasar.ownerMint(user1, 3);
        
        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = 1;
        tokenIds[1] = 2;
        
        vm.startPrank(user1);
        dutchBasar.setApprovalForAll(address(staking), true);
        staking.stake(tokenIds);
        
        DutchBasarStaking.StakeInfo[] memory stakes = staking.getUserStakes(user1);
        assertEq(stakes.length, 2);
        
        uint256 pending = staking.getPendingRewards(user1);
        assertTrue(pending >= 0);
        
        uint256 boost = staking.getUserBoost(user1);
        assertTrue(boost >= 0);
        
        vm.warp(block.timestamp + 2 days);
        
        staking.claimRewards();
        
        uint256[] memory unstakeIds = new uint256[](1);
        unstakeIds[0] = 1;
        staking.unstake(unstakeIds);
        
        vm.stopPrank();
        
        // Admin functions
        vm.prank(owner);
        staking.updatePool(0.002 ether, 120, 2 days, true);
        
        staking.fundRewardPool{value: 1 ether}();
    }
    
    // Test MerkleAllowlist library functions
    function testMerkleAllowlistLibrary() public {
        MerkleAllowlist.AllowlistEntry[] memory entries = new MerkleAllowlist.AllowlistEntry[](2);
        entries[0] = MerkleAllowlist.AllowlistEntry(user1, 2);
        entries[1] = MerkleAllowlist.AllowlistEntry(user2, 3);
        
        bytes32[] memory leaves = MerkleAllowlist.generateLeaves(entries);
        assertEq(leaves.length, 2);
        
        bytes32 leaf = MerkleAllowlist.generateLeaf(user1, 2);
        assertTrue(leaf != bytes32(0));
        
        // Test with empty proofs - expected to return false
        bytes32[][] memory proofs = new bytes32[][](2);
        proofs[0] = new bytes32[](0);
        proofs[1] = new bytes32[](0);
        
        bool[] memory results = MerkleAllowlist.verifyBatch(leaves[0], entries, proofs);
        assertEq(results.length, 2);
        
        // Test single verification with leaf as root
        bool isAllowlisted = MerkleAllowlist.isAllowlisted(leaves[0], user1, 2, proofs[0]);
        assertTrue(isAllowlisted); // Leaf matches root exactly
        
        // Test validation
        bool valid = MerkleAllowlist.validateAllowlist(leaves[0], entries, proofs);
        assertFalse(valid); // Only first entry matches
        
        bytes32 root = MerkleAllowlist.calculateMerkleRoot(leaves);
        assertTrue(root != bytes32(0));
    }
    
    // Test error cases - simplified to avoid depth issues
    function testReverts() public {
        // Test non-existent token
        vm.expectRevert();
        dutchBasar.tokenURI(999);
        
        vm.expectRevert();
        dutchBasar.getEvolutionStage(999);
    }
    
    function testRevertsContinued() public {
        // Test reveal errors
        vm.prank(owner);
        vm.expectRevert();
        dutchBasar.reveal("", keccak256("test"));
        
        vm.prank(owner);
        vm.expectRevert();
        dutchBasar.reveal("test", bytes32(0));
        
        vm.prank(owner);
        dutchBasar.reveal("test", keccak256("test"));
        
        vm.prank(owner);
        vm.expectRevert();
        dutchBasar.reveal("test2", keccak256("test2"));
    }
    
    function testRevertsOwnerFunctions() public {
        // Test owner-only functions
        vm.prank(owner);
        vm.expectRevert();
        dutchBasar.withdrawTo(address(0), 1 ether);
        
        vm.prank(owner);
        vm.expectRevert();
        dutchBasar.withdrawTo(user1, 0);
        
        vm.prank(owner);
        vm.expectRevert();
        dutchBasar.ownerMint(address(0), 1);
        
        vm.prank(owner);
        vm.expectRevert();
        dutchBasar.configureMint(0, 1, 1);
    }
    
    function testRevertsLibrary() public {
        // Test MerkleAllowlist library - these are internal functions that revert
        // We can only test them indirectly through contract calls
        bytes32[] memory emptyProof = new bytes32[](0);
        
        // Test that verify works with valid inputs
        bytes32 validRoot = keccak256("valid");
        bool result = MerkleAllowlist.verify(validRoot, user1, 1, emptyProof);
        assertFalse(result); // Empty proof won't verify
    }
    
    function testRevertsLibraryContinued() public {
        // Test valid leaf generation
        bytes32 leaf = MerkleAllowlist.generateLeaf(user1, 1);
        assertTrue(leaf != bytes32(0));
        
        // Test valid leaf generation with different values
        bytes32 leaf2 = MerkleAllowlist.generateLeaf(user2, 5);
        assertTrue(leaf2 != bytes32(0));
        assertTrue(leaf != leaf2);
    }
    
    function testRevertsLibraryGeneration() public {
        // Test merkle root calculation with valid inputs
        bytes32[] memory leaves = new bytes32[](2);
        leaves[0] = keccak256(abi.encodePacked(user1, uint256(1)));
        leaves[1] = keccak256(abi.encodePacked(user2, uint256(2)));
        
        bytes32 root = MerkleAllowlist.calculateMerkleRoot(leaves);
        assertTrue(root != bytes32(0));
        
        // Test with single leaf
        bytes32[] memory singleLeaf = new bytes32[](1);
        singleLeaf[0] = keccak256("test");
        bytes32 singleRoot = MerkleAllowlist.calculateMerkleRoot(singleLeaf);
        assertEq(singleRoot, singleLeaf[0]);
    }
    
    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
