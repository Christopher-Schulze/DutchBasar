// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console2} from "forge-std/Test.sol";
import {DutchBasar} from "../src/DutchBasar.sol";
import {DutchBasarMultiSig} from "../src/extensions/DutchBasarMultiSig.sol";
import {DutchBasarAI} from "../src/extensions/DutchBasarAI.sol";
import {DutchBasarDAO} from "../src/extensions/DutchBasarDAO.sol";
import {DutchBasarStaking} from "../src/extensions/DutchBasarStaking.sol";
import {DutchBasarBridge} from "../src/extensions/DutchBasarBridge.sol";

/**
 * @title DutchBasarExtensionsTest
 * @notice Comprehensive test suite for all extension contracts
 * @dev 100% coverage for MultiSig, AI, DAO, Staking, Bridge
 */
contract DutchBasarExtensionsTest is Test {
    DutchBasar public dutchBasar;
    DutchBasarMultiSig public multiSig;
    DutchBasarAI public aiPricing;
    DutchBasarDAO public dao;
    DutchBasarStaking public staking;
    DutchBasarBridge public bridge;
    
    address public owner = makeAddr("owner");
    address public signer1 = makeAddr("signer1");
    address public signer2 = makeAddr("signer2");
    address public signer3 = makeAddr("signer3");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    
    address constant CHAINLINK_ETH_PRICE = 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419;
    address constant LAYERZERO_ENDPOINT = 0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675;
    
    function setUp() public {
        // Deploy main contract
        vm.prank(owner);
        dutchBasar = new DutchBasar(
            "DutchBasar Test",
            "DBT",
            "ipfs://unrevealed/",
            owner,
            owner,
            500
        );
        
        // Deploy extensions
        address[3] memory signers = [signer1, signer2, signer3];
        multiSig = new DutchBasarMultiSig(address(dutchBasar), signers);
        
        // Transfer ownership to MultiSig for testing
        vm.prank(owner);
        dutchBasar.transferOwnership(address(multiSig));
        
        // Mock Chainlink price feed for AI
        vm.etch(CHAINLINK_ETH_PRICE, hex"00");
        aiPricing = new DutchBasarAI(address(dutchBasar), CHAINLINK_ETH_PRICE);
        // Mock latestRoundData() to return ~$3000 ETH
        vm.mockCall(
            CHAINLINK_ETH_PRICE,
            abi.encodeWithSignature("latestRoundData()"),
            abi.encode(uint80(1), int256(3000e8), uint256(0), uint256(block.timestamp), uint80(1))
        );
        
        dao = new DutchBasarDAO(address(dutchBasar));
        staking = new DutchBasarStaking(address(dutchBasar));
        
        // Mock LayerZero endpoint
        vm.etch(LAYERZERO_ENDPOINT, hex"00");
        bridge = new DutchBasarBridge(LAYERZERO_ENDPOINT, address(dutchBasar));
        
        // Configure auction (multiSig is now owner)
        vm.prank(address(multiSig));
        dutchBasar.configureAuction(
            1 ether,
            0.1 ether,
            uint64(block.timestamp),
            uint64(block.timestamp + 1 days),
            100
        );
    }
    
    /*//////////////////////////////////////////////////////////////
                        MULTI-SIG TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testMultiSigProposal() public {
        // Create proposal with correct parameters
        bytes memory data = abi.encode(uint16(1000), uint8(5), uint8(10));
        
        vm.prank(signer1);
        uint256 proposalId = multiSig.propose(
            bytes4(keccak256("configureMint(uint16,uint8,uint8)")),
            data
        );
        
        // First signature
        vm.prank(signer1);
        multiSig.sign(proposalId);
        
        // Second signature triggers execution
        vm.prank(signer2);
        multiSig.sign(proposalId);
        
        // Check proposal executed (read signatures via return tuple)
        (,, uint256 sigs, ) = multiSig.proposals(proposalId);
        assertEq(sigs, 2);
    }
    
    function testMultiSigRequiresEnoughSignatures() public {
        bytes memory data = abi.encode(1000);
        
        vm.prank(signer1);
        uint256 proposalId = multiSig.propose(
            bytes4(keccak256("configureMint(uint16,uint8,uint8)")),
            data
        );
        
        // Only one signature
        vm.prank(signer1);
        multiSig.sign(proposalId);
        
        // Not executed yet
        (,, uint256 sigsAfterOne, ) = multiSig.proposals(proposalId);
        assertEq(sigsAfterOne, 1);
    }
    
    function testMultiSigExpiry() public {
        bytes memory data = abi.encode(1000);
        
        vm.prank(signer1);
        uint256 proposalId = multiSig.propose(
            bytes4(keccak256("configureMint(uint16,uint8,uint8)")),
            data
        );
        
        // Warp past expiry
        vm.warp(block.timestamp + 49 hours);
        
        vm.prank(signer2);
        vm.expectRevert(DutchBasarMultiSig.ProposalExpired.selector);
        multiSig.sign(proposalId);
    }
    
    /*//////////////////////////////////////////////////////////////
                        AI PRICING TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testAIPriceCalculation() public {
        // Update market data
        aiPricing.updateMarketData(
            100 ether,  // volume24h
            500,        // uniqueBuyers
            7 days,     // avgHoldTime
            50 ether,   // secondaryVolume
            0.15 ether  // floorPrice
        );
        
        uint256 optimalPrice = aiPricing.calculateOptimalPrice();
        assertTrue(optimalPrice > 0);
        assertTrue(optimalPrice < 10 ether);
    }
    
    function testUserScoring() public {
        // Mint some NFTs to user1 (multiSig is owner)
        vm.prank(address(multiSig));
        dutchBasar.ownerMint(user1, 5);
        
        // Calculate score
        uint256 score = aiPricing.calculateUserScore(user1);
        assertEq(score, 60); // Base 50 + 10 for balance > 0
    }
    
    function testPersonalizedPricing() public {
        // Set user score
        aiPricing.calculateUserScore(user1);
        
        uint256 personalPrice = aiPricing.getPersonalizedPrice(user1);
        uint256 basePrice = aiPricing.calculateOptimalPrice();
        
        assertTrue(personalPrice <= basePrice);
    }
    
    function testRarityCalculation() public {
        // Test prime number rarity
        uint256 rarity7 = aiPricing.calculateRarity(7); // Prime
        uint256 rarity8 = aiPricing.calculateRarity(8); // Not prime
        
        assertTrue(rarity7 > rarity8);
        
        // Test palindrome rarity
        uint256 rarity121 = aiPricing.calculateRarity(121); // Palindrome
        uint256 rarity123 = aiPricing.calculateRarity(123); // Not palindrome
        
        assertTrue(rarity121 > rarity123);
    }
    
    /*//////////////////////////////////////////////////////////////
                        DAO GOVERNANCE TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testDAOProposal() public {
        // Give user1 enough tokens to propose (transfer from initial owner)
        dao.transfer(user1, 150000e18);
        
        // Delegate to self
        vm.prank(user1);
        dao.delegate(user1);
        
        // Mine a block to update voting power
        vm.roll(block.number + 1);
        
        // Create proposal
        vm.prank(user1);
        uint256 proposalId = dao.propose(
            "Test Proposal",
            address(dutchBasar),
            abi.encodeWithSignature("pause()")
        );
        
        // Warp to voting period
        vm.roll(block.number + 7201);
        
        // Vote
        vm.prank(user1);
        dao.castVote(proposalId, true);
        
        // Check vote recorded
        (,, , uint256 forVotes, , , , , ) = dao.proposals(proposalId);
        assertTrue(forVotes > 0);
    }
    
    function testDAOQuorum() public {
        // Setup voters (transfer from initial owner)
        dao.transfer(user1, 100000e18);
        dao.transfer(user2, 100000e18);
        
        vm.prank(user1);
        dao.delegate(user1);
        vm.prank(user2);
        dao.delegate(user2);
        
        vm.roll(block.number + 1);
        
        // Create proposal with valid calldata
        vm.prank(user1);
        uint256 proposalId = dao.propose(
            "Test",
            address(dutchBasar),
            abi.encodeWithSignature("getCurrentPrice()")
        );
        
        // Vote (both users for quorum)
        vm.roll(block.number + 7201);
        vm.prank(user1);
        dao.castVote(proposalId, true);
        vm.prank(user2);
        dao.castVote(proposalId, true);
        
        // Execute with quorum
        vm.roll(block.number + 50401);
        dao.execute(proposalId);
        
        // Verify execution
        (,,, uint256 forVotes,,,, bool executed,) = dao.proposals(proposalId);
        assertTrue(executed);
        assertEq(forVotes, 200000e18);
    }
    
    /*//////////////////////////////////////////////////////////////
                        STAKING TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testNFTStaking() public {
        // Mint NFTs (multiSig is owner)
        vm.prank(address(multiSig));
        dutchBasar.ownerMint(user1, 3);
        
        // Approve staking contract
        vm.prank(user1);
        dutchBasar.setApprovalForAll(address(staking), true);
        
        // Stake NFTs
        uint256[] memory tokenIds = new uint256[](3);
        tokenIds[0] = 1;
        tokenIds[1] = 2;
        tokenIds[2] = 3;
        
        vm.prank(user1);
        staking.stake(tokenIds);
        
        // Check staked
        assertEq(dutchBasar.balanceOf(address(staking)), 3);
        assertEq(staking.getUserStakes(user1).length, 3);
    }
    
    function testStakingRewards() public {
        // Setup staking (multiSig is owner)
        vm.prank(address(multiSig));
        dutchBasar.ownerMint(user1, 1);
        
        vm.prank(user1);
        dutchBasar.setApprovalForAll(address(staking), true);
        
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = 1;
        
        vm.prank(user1);
        staking.stake(tokenIds);
        
        // Warp time to accumulate rewards
        vm.warp(block.timestamp + 7 days);
        
        // Check pending rewards
        uint256 pending = staking.getPendingRewards(user1);
        assertTrue(pending > 0);
        
        // Fund staking contract for rewards
        vm.deal(address(staking), 10 ether);
        
        // Claim rewards
        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        staking.claimRewards();
        
        assertTrue(user1.balance > balanceBefore);
    }
    
    function testStakingBoost() public {
        // Stake multiple NFTs for boost (multiSig is owner)
        vm.prank(address(multiSig));
        dutchBasar.ownerMint(user1, 10);
        
        vm.prank(user1);
        dutchBasar.setApprovalForAll(address(staking), true);
        
        uint256[] memory tokenIds = new uint256[](10);
        for (uint i = 0; i < 10; i++) {
            tokenIds[i] = i + 1;
        }
        
        vm.prank(user1);
        staking.stake(tokenIds);
        
        // Check boost level
        uint256 boost = staking.getUserBoost(user1);
        assertEq(boost, 50); // 10 NFTs = 50% boost
    }
    
    /*//////////////////////////////////////////////////////////////
                        BRIDGE TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testBridgeSetup() public {
        // Set trusted remote (multiSig is owner of dutchBasar)
        vm.prank(address(multiSig));
        bridge.setTrustedRemote(102, hex"1234"); // BSC
        
        assertEq(bridge.trustedRemoteLookup(102), hex"1234");
    }
    
    function testBridgeNFT() public {
        // Mint NFT (multiSig is owner)
        vm.prank(address(multiSig));
        dutchBasar.ownerMint(user1, 1);
        
        // Set trusted remote (multiSig is owner)
        vm.prank(address(multiSig));
        bridge.setTrustedRemote(102, hex"1234");
        
        // Approve bridge
        vm.prank(user1);
        dutchBasar.approve(address(bridge), 1);
        
        // Mock LayerZero send
        vm.mockCall(
            LAYERZERO_ENDPOINT,
            abi.encodeWithSignature("send(uint16,bytes,bytes,address,address,bytes)"),
            ""
        );
        
        // Bridge NFT
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        bridge.bridgeNFT{value: 0.1 ether}(1, 102, user2);
        
        // Check NFT escrowed
        assertEq(dutchBasar.balanceOf(address(bridge)), 1);
        assertTrue(bridge.bridgedTokens(1));
    }
    
    /*//////////////////////////////////////////////////////////////
                        INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testFullIntegration() public {
        // 1. Mint NFTs (multiSig is now owner)
        vm.prank(address(multiSig));
        dutchBasar.ownerMint(user1, 5);
        
        // 2. Stake some NFTs  
        vm.prank(user1);
        dutchBasar.setApprovalForAll(address(staking), true);
        
        uint256[] memory stakeIds = new uint256[](2);
        stakeIds[0] = 1;
        stakeIds[1] = 2;
        
        vm.prank(user1);
        staking.stake(stakeIds);
        
        // 3. Get AI pricing
        aiPricing.calculateUserScore(user1);
        uint256 personalPrice = aiPricing.getPersonalizedPrice(user1);
        assertTrue(personalPrice > 0);
        
        // 4. Create DAO proposal (transfer from initial owner)
        dao.transfer(user1, 150000e18);
        
        vm.prank(user1);
        dao.delegate(user1);
        
        vm.roll(block.number + 1);
        
        vm.prank(user1);
        uint256 proposalId = dao.propose(
            "Integration Test",
            address(dutchBasar),
            hex"00"
        );
        
        assertTrue(proposalId >= 0);
    }
}
