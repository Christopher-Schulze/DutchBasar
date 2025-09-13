// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";

// Script to remove Counter.sol from the project
// Run: forge script script/RemoveCounter.s.sol
contract RemoveCounter is Script {
    function run() public {
        // This script serves as documentation that Counter.sol should be removed
        // Counter.sol is a test contract that should not be in production
    }
}
