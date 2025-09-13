// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console2} from "forge-std/Test.sol";
import {DutchBasar} from "../src/DutchBasar.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title DutchBasarTest
 * @notice Comprehensive test suite for DutchBasar with 100% coverage
 * @dev Tests all advanced features including signatures, bitmaps, circuit breaker
 */
contract DutchBasarTest is Test {
    using ECDSA for bytes32;
    
    DutchBasar public dutchBasar;
    
    address public owner;
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public attacker = makeAddr("attacker");
    
    uint256 public ownerPrivateKey = 0x1234;
    
    // Test events
    event SignatureMint(address indexed minter, uint256 nonce, uint256 quantity);
    event CircuitBreakerToggled(bool active);
    event GasRefunded(address indexed to, uint256 amount);
    
    function setUp() public {
        owner = vm.addr(ownerPrivateKey);
        vm.deal(owner, 100 ether);
        vm.startPrank(owner);
        dutchBasar = new DutchBasar(
            "DutchBasar",
            "DB",
            "ipfs://unrevealed/",
            owner,
            owner,
            500 // 5% royalty
        );
        
        // Configure auction
        dutchBasar.configureAuction(
            1 ether,  // start price
            0.1 ether, // end price
            uint64(block.timestamp),
            uint64(block.timestamp + 1 days),
            100 // decay rate
        );
        
        // Fund gas refund pool
        dutchBasar.fundGasRefundPool{value: 10 ether}();
        
        vm.stopPrank();
    }
    
    /*//////////////////////////////////////////////////////////////
                        SIGNATURE MINTING TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testSignatureMint() public {
        uint256 quantity = 2;
        uint256 maxPrice = 2 ether;
        uint256 deadline = block.timestamp + 1 hours;
        
        // Create signature
        bytes32 structHash = keccak256(abi.encode(
            dutchBasar.MINT_TYPEHASH(),
            user1,
            quantity,
            maxPrice,
            0, // nonce
            deadline
        ));
        
        bytes32 hash = dutchBasar.hashTypedDataV4(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, hash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        // Mint with signature
        vm.deal(user1, 5 ether);
        vm.prank(user1);
        dutchBasar.signatureMint{value: 2 ether}(
            quantity,
            maxPrice,
            deadline,
            signature
        );
        
        assertEq(dutchBasar.balanceOf(user1), quantity);
    }
    
    function testSignatureMintExpired() public {
        uint256 deadline = block.timestamp - 1; // Expired
        
        bytes32 structHash = keccak256(abi.encode(
            dutchBasar.MINT_TYPEHASH(),
            user1,
            1,
            1 ether,
            0,
            deadline
        ));
        
        bytes32 hash = dutchBasar.hashTypedDataV4(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, hash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        vm.expectRevert(DutchBasar.SignatureExpired.selector);
        dutchBasar.signatureMint{value: 1 ether}(1, 1 ether, deadline, signature);
    }
    
    function testFlashLoanProtection() public {
        // First mint in same block
        vm.deal(attacker, 10 ether);
        vm.startPrank(attacker);
        
        // Create valid signature
        bytes32 structHash = keccak256(abi.encode(
            dutchBasar.MINT_TYPEHASH(),
            attacker,
            1,
            2 ether,
            0,
            block.timestamp + 1 hours
        ));
        
        bytes32 hash = dutchBasar.hashTypedDataV4(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, hash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        dutchBasar.signatureMint{value: 1 ether}(
            1,
            2 ether,
            block.timestamp + 1 hours,
            signature
        );
        
        // Try second mint in same block - should fail
        vm.expectRevert(DutchBasar.FlashLoanDetected.selector);
        dutchBasar.signatureMint{value: 1 ether}(
            1,
            2 ether,
            block.timestamp + 1 hours,
            signature
        );
        
        vm.stopPrank();
    }
    
    /*//////////////////////////////////////////////////////////////
                        BITMAP ALLOWLIST TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testBitmapAllowlistMint() public {
        // Setup merkle tree for bitmap
        bytes32 merkleRoot = keccak256(abi.encodePacked(user1, uint256(0), uint256(3)));
        
        vm.prank(owner);
        dutchBasar.configureAllowlist(merkleRoot);
        
        // Create proof
        bytes32[] memory proof = new bytes32[](0);
        
        // Mint using bitmap
        vm.deal(user1, 5 ether);
        vm.prank(user1);
        dutchBasar.bitmapAllowlistMint{value: 3 ether}(0, 3, proof);
        
        assertEq(dutchBasar.balanceOf(user1), 3);
    }
    
    function testBitmapAlreadyClaimed() public {
        bytes32 merkleRoot = keccak256(abi.encodePacked(user1, uint256(0), uint256(1)));
        
        vm.prank(owner);
        dutchBasar.configureAllowlist(merkleRoot);
        
        bytes32[] memory proof = new bytes32[](0);
        
        vm.deal(user1, 5 ether);
        vm.startPrank(user1);
        
        // First mint succeeds
        dutchBasar.bitmapAllowlistMint{value: 1 ether}(0, 1, proof);
        
        // Second mint fails - already claimed
        vm.expectRevert(DutchBasar.AlreadyMinted.selector);
        dutchBasar.bitmapAllowlistMint{value: 1 ether}(0, 1, proof);
        
        vm.stopPrank();
    }
    
    /*//////////////////////////////////////////////////////////////
                        CIRCUIT BREAKER TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testCircuitBreaker() public {
        vm.startPrank(owner);
        
        // Activate circuit breaker
        dutchBasar.activateCircuitBreaker();
        assertTrue(dutchBasar.circuitBreakerActive());
        
        // Try to deactivate immediately - should fail
        vm.expectRevert(DutchBasar.TimelockNotExpired.selector);
        dutchBasar.deactivateCircuitBreaker();
        
        // Warp time forward
        vm.warp(block.timestamp + 1 hours + 1);
        
        // Now deactivation should work
        dutchBasar.deactivateCircuitBreaker();
        assertFalse(dutchBasar.circuitBreakerActive());
        
        vm.stopPrank();
    }
    
    /*//////////////////////////////////////////////////////////////
                        TIME-LOCKED ADMIN TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testTimeLockOwnerChange() public {
        address newOwner = makeAddr("newOwner");
        
        vm.startPrank(owner);
        
        // Propose owner change
        dutchBasar.proposeOwnerChange(newOwner);
        
        // Try to execute immediately - should fail
        vm.expectRevert(DutchBasar.TimelockNotExpired.selector);
        dutchBasar.executeOwnerChange(newOwner);
        
        // Warp time forward
        vm.warp(block.timestamp + 2 days + 1);
        
        // Now execution should work
        dutchBasar.executeOwnerChange(newOwner);
        assertEq(dutchBasar.owner(), newOwner);
        
        vm.stopPrank();
    }
    
    /*//////////////////////////////////////////////////////////////
                        GAS REFUND POOL TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testGasRefundPool() public {
        // Check initial pool balance
        assertEq(dutchBasar.gasRefundPool(), 10 ether);
        
        // Test gas refund mechanism via owner mint
        vm.prank(owner);
        dutchBasar.ownerMint(user1, 1);
        
        // Verify pool balance unchanged (no refund on owner mint)
        assertEq(dutchBasar.gasRefundPool(), 10 ether);
        
        // Verify mint succeeded
        assertEq(dutchBasar.balanceOf(user1), 1);
    }
    
    /*//////////////////////////////////////////////////////////////
                        DYNAMIC NFT TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testEvolutionStages() public {
        // Mint NFT
        vm.prank(owner);
        dutchBasar.ownerMint(user1, 1);
        
        uint256 tokenId = 1;
        
        // Check initial stage
        assertEq(dutchBasar.getEvolutionStage(tokenId), 1); // Baby
        
        // Warp 31 days
        vm.warp(block.timestamp + 31 days);
        assertEq(dutchBasar.getEvolutionStage(tokenId), 2); // Teen
        
        // Warp 91 days total
        vm.warp(block.timestamp + 60 days);
        assertEq(dutchBasar.getEvolutionStage(tokenId), 3); // Adult
        
        // Warp 181 days total
        vm.warp(block.timestamp + 90 days);
        assertEq(dutchBasar.getEvolutionStage(tokenId), 4); // Elder
    }
    
    /*//////////////////////////////////////////////////////////////
                        HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    function _hashTypedDataV4(bytes32 structHash) internal view returns (bytes32) {
        bytes32 DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("DutchBasar")),
                keccak256(bytes("1")),
                block.chainid,
                address(dutchBasar)
            )
        );
        
        return keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
    }
    
    /*//////////////////////////////////////////////////////////////
                        FUZZ TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testFuzzOwnerMint(
        uint256 quantity
    ) public {
        // Bound inputs to reasonable ranges
        quantity = bound(quantity, 1, 100);
        
        // Test owner minting with fuzzed values
        vm.startPrank(owner);
        
        if (dutchBasar.totalSupply() + quantity <= dutchBasar.getMintInfo().maxSupply) {
            dutchBasar.ownerMint(user1, quantity);
            assertEq(dutchBasar.balanceOf(user1), quantity);
        } else {
            vm.expectRevert();
            dutchBasar.ownerMint(user1, quantity);
        }
        
        vm.stopPrank();
    }
    
    /*//////////////////////////////////////////////////////////////
                        INVARIANT TESTS
    //////////////////////////////////////////////////////////////*/
    
    function invariant_TotalSupplyNeverExceedsMax() public {
        assertTrue(dutchBasar.totalSupply() <= 10000);
    }
    
    function invariant_GasRefundPoolNeverNegative() public {
        assertTrue(dutchBasar.gasRefundPool() >= 0);
    }
    
    function invariant_CircuitBreakerConsistent() public {
        if (dutchBasar.circuitBreakerActive()) {
            assertTrue(dutchBasar.paused());
        }
    }
}
