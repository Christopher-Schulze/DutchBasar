// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {DutchBasar} from "../src/DutchBasar.sol";

contract DutchBasarMoreTest is Test {
    DutchBasar internal dutch;

    address internal owner = makeAddr("owner");
    address internal roy = makeAddr("roy");
    address internal user = makeAddr("user");
    
    string constant UNREVEALED = "ipfs://unrevealed";

    function setUp() public {
        vm.prank(owner);
        dutch = new DutchBasar("Coll", "COL", UNREVEALED, owner, roy, 500);

        // configure auction and mint to enable pricing
        vm.prank(owner);
        dutch.configureAuction(1 ether, 0.1 ether, uint64(block.timestamp + 10), uint64(block.timestamp + 1010), 100);

        vm.prank(owner);
        dutch.configureMint(1000, 5, 10);

        vm.deal(user, 100 ether);
    }

    function test_UpdateBaseURI_RevertWhenNotRevealed() public {
        vm.expectRevert(DutchBasar.NotRevealed.selector);
        vm.prank(owner);
        dutch.updateBaseURI("ipfs://x/");
    }

    function test_RevealTwice_RevertsAlreadyRevealed() public {
        vm.prank(owner);
        dutch.reveal("ipfs://base/", keccak256("prov"));
        vm.prank(owner);
        vm.expectRevert(DutchBasar.AlreadyRevealed.selector);
        dutch.reveal("ipfs://base/", keccak256("prov"));
    }

    function test_WithdrawTo_ErrorsAndSuccess() public {
        // fund contract
        vm.warp(block.timestamp + 11);
        vm.prank(owner);
        dutch.setPhase(DutchBasar.Phase.Public);
        uint256 price = dutch.getCurrentPrice();
        vm.prank(user);
        dutch.publicMint{value: price}(1);

        // zero address
        vm.prank(owner);
        vm.expectRevert(DutchBasar.ZeroAddress.selector);
        dutch.withdrawTo(address(0), 1);

        // amount zero
        vm.prank(owner);
        vm.expectRevert(DutchBasar.InvalidWithdrawalAmount.selector);
        dutch.withdrawTo(owner, 0);

        // too much
        vm.prank(owner);
        vm.expectRevert(DutchBasar.InvalidWithdrawalAmount.selector);
        dutch.withdrawTo(owner, type(uint256).max);

        // success path
        uint256 balBefore = owner.balance;
        uint256 contractBal = address(dutch).balance;
        vm.prank(owner);
        dutch.withdrawTo(owner, contractBal);
        assertEq(address(dutch).balance, 0);
        assertEq(owner.balance, balBefore + contractBal);
    }

    function test_IsAllowlistedAndRemainingMints() public {
        // set merkle root to user leaf
        bytes32 root = keccak256(abi.encodePacked(user, uint256(3)));
        vm.prank(owner);
        dutch.configureAllowlist(root);

        // allowlist view helpers
        assertTrue(dutch.isAllowlisted(user, 3, new bytes32[](0)));
        assertEq(dutch.getRemainingAllowlistMints(user, 3), 3);
    }

    function test_GetChainOptimizations_Branches() public {
        // else-branch (default)
        (uint256 gm, uint256 bs) = dutch.getChainOptimizations();
        assertEq(gm, 120);
        assertEq(bs, 50);

        // Base branch
        vm.chainId(8453);
        (gm, bs) = dutch.getChainOptimizations();
        assertEq(gm, 110);
        assertEq(bs, 100);

        // Polygon branch
        vm.chainId(137);
        (gm, bs) = dutch.getChainOptimizations();
        assertEq(gm, 105);
        assertEq(bs, 150);
    }

    function test_TokenURI_and_SupportsInterface_and_Bridge() public {
        // Mint one token to user
        vm.prank(owner);
        dutch.ownerMint(user, 1);

        // Before reveal: tokenURI returns unrevealed URI
        assertEq(dutch.tokenURI(1), UNREVEALED);

        // Reveal and check tokenURI format
        vm.prank(owner);
        dutch.reveal("ipfs://base/", keccak256("prov"));
        assertEq(dutch.tokenURI(1), string(abi.encodePacked("ipfs://base/", "1.json")));

        // supportsInterface: ERC2981 (0x2a55205a)
        assertTrue(dutch.supportsInterface(0x2a55205a));

        // Bridge contract config
        address bridge = address(0x1110000000000000000000000000000000000111);
        vm.prank(owner);
        dutch.setBridgeContract(8453, bridge);
        assertEq(dutch.bridgeContracts(8453), bridge);
    }
}
