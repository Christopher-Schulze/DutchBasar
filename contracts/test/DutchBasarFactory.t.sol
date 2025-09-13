// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {DutchBasarFactory} from "../src/DutchBasarFactory.sol";

contract DutchBasarFactoryTest is Test {
    address owner = makeAddr("owner");
    address deployer = makeAddr("deployer");
    address other = makeAddr("other");

    DutchBasarFactory factory;

    function setUp() public {
        vm.prank(owner);
        factory = new DutchBasarFactory(owner, 0.05 ether);

        // authorize deployer
        vm.prank(owner);
        factory.setDeployerAuthorization(deployer, true);

        vm.deal(deployer, 10 ether);
        vm.deal(owner, 1 ether);
        vm.deal(other, 1 ether);
    }

    function _params(string memory name, string memory symbol) internal view returns (DutchBasarFactory.DeploymentParams memory p) {
        p.name = name;
        p.symbol = symbol;
        p.unrevealedURI = "ipfs://unrevealed";
        p.owner = owner;
        p.royaltyRecipient = owner;
        p.royaltyFeeBasisPoints = 500;
    }

    function test_DeployDutchBasar() public {
        DutchBasarFactory.DeploymentParams memory p = _params("Coll", "COL");
        vm.prank(deployer);
        address ca = factory.deployDutchBasar{value: 0.05 ether}(p);

        // deployment info recorded
        DutchBasarFactory.DeploymentInfo memory info = factory.getDeploymentInfo(ca);
        assertEq(info.deployer, deployer);
        assertEq(info.name, "Coll");
        assertEq(info.symbol, "COL");

        // refund of excess works
        vm.prank(deployer);
        address ca2 = factory.deployDutchBasar{value: 0.08 ether}(_params("Coll2", "CL2"));
        assertTrue(ca2 != address(0));
    }

    function test_BatchDeploy() public {
        DutchBasarFactory.DeploymentParams[] memory arr = new DutchBasarFactory.DeploymentParams[](2);
        arr[0] = _params("A", "A");
        arr[1] = _params("B", "B");

        vm.prank(deployer);
        address[] memory cas = factory.batchDeployDutchBasar{value: 0.10 ether}(arr);
        assertEq(cas.length, 2);
        assertTrue(cas[0] != address(0));
        assertTrue(cas[1] != address(0));
    }

    function test_DuplicateDeploymentReverts() public {
        DutchBasarFactory.DeploymentParams memory p = _params("Coll", "COL");
        vm.prank(deployer);
        factory.deployDutchBasar{value: 0.05 ether}(p);

        vm.prank(deployer);
        vm.expectRevert(DutchBasarFactory.DuplicateDeployment.selector);
        factory.deployDutchBasar{value: 0.05 ether}(p);
    }

    function test_InvalidParamsRevert() public {
        DutchBasarFactory.DeploymentParams memory p = _params("", "SYM");
        vm.prank(deployer);
        vm.expectRevert(DutchBasarFactory.InvalidParameters.selector);
        factory.deployDutchBasar{value: 0.05 ether}(p);
    }

    function test_WithdrawFees() public {
        // generate fees
        vm.prank(deployer);
        factory.deployDutchBasar{value: 0.05 ether}(_params("A", "A"));

        uint256 beforeBal = owner.balance;
        vm.prank(owner);
        factory.withdrawFees(owner);
        assertGt(owner.balance, beforeBal);
    }

    function test_SetDeploymentFee() public {
        vm.prank(owner);
        factory.setDeploymentFee(0.1 ether);
        (,, uint256 fee) = factory.getFactoryStats();
        assertEq(fee, 0.1 ether);
    }
}
