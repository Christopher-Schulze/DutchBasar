// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title MerkleAllowlist
 * @notice Utility contract for managing Merkle tree-based allowlists with batch verification
 * @dev Gas-optimized implementation for allowlist management with flexible allocation per address
 */
library MerkleAllowlist {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidProof();
    error InvalidMerkleRoot();
    error InvalidAllocation();

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event AllowlistUpdated(bytes32 indexed merkleRoot, uint256 totalAddresses);
    event AllowlistVerified(address indexed account, uint256 allocation);

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct AllowlistEntry {
        address account;
        uint256 allocation;
    }

    /*//////////////////////////////////////////////////////////////
                            VERIFICATION LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Verify a single address against the Merkle tree
     * @param merkleRoot The Merkle root to verify against
     * @param account The address to verify
     * @param allocation The allocation for this address
     * @param proof The Merkle proof
     * @return True if the proof is valid
     */
    function verify(
        bytes32 merkleRoot,
        address account,
        uint256 allocation,
        bytes32[] memory proof
    ) internal pure returns (bool) {
        if (merkleRoot == bytes32(0)) revert InvalidMerkleRoot();
        if (account == address(0)) revert InvalidAllocation();
        if (allocation == 0) revert InvalidAllocation();

        bytes32 leaf = keccak256(abi.encodePacked(account, allocation));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    /**
     * @notice Verify multiple addresses against the Merkle tree in a single call
     * @param merkleRoot The Merkle root to verify against
     * @param entries Array of allowlist entries to verify
     * @param proofs Array of Merkle proofs corresponding to each entry
     * @return results Array of verification results
     */
    function verifyBatch(
        bytes32 merkleRoot,
        AllowlistEntry[] memory entries,
        bytes32[][] memory proofs
    ) internal pure returns (bool[] memory results) {
        if (merkleRoot == bytes32(0)) revert InvalidMerkleRoot();
        if (entries.length != proofs.length) revert InvalidProof();

        results = new bool[](entries.length);
        
        for (uint256 i = 0; i < entries.length; ) {
            AllowlistEntry memory entry = entries[i];
            bytes32[] memory proof = proofs[i];
            
            if (entry.account == address(0) || entry.allocation == 0) {
                results[i] = false;
            } else {
                bytes32 leaf = keccak256(abi.encodePacked(entry.account, entry.allocation));
                results[i] = MerkleProof.verify(proof, merkleRoot, leaf);
            }
            
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Generate a leaf hash for a given account and allocation
     * @param account The address
     * @param allocation The allocation for this address
     * @return The leaf hash
     */
    function generateLeaf(address account, uint256 allocation) internal pure returns (bytes32) {
        if (account == address(0)) revert InvalidAllocation();
        if (allocation == 0) revert InvalidAllocation();
        
        return keccak256(abi.encodePacked(account, allocation));
    }

    /**
     * @notice Generate leaf hashes for multiple entries
     * @param entries Array of allowlist entries
     * @return leaves Array of leaf hashes
     */
    function generateLeaves(AllowlistEntry[] memory entries) 
        internal 
        pure 
        returns (bytes32[] memory leaves) 
    {
        leaves = new bytes32[](entries.length);
        
        for (uint256 i = 0; i < entries.length; ) {
            AllowlistEntry memory entry = entries[i];
            
            if (entry.account == address(0) || entry.allocation == 0) {
                revert InvalidAllocation();
            }
            
            leaves[i] = keccak256(abi.encodePacked(entry.account, entry.allocation));
            
            unchecked {
                ++i;
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                            UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Check if an address is in the allowlist without requiring a proof
     * @dev This is a view function that requires the caller to provide the proof
     * @param merkleRoot The Merkle root
     * @param account The address to check
     * @param allocation The claimed allocation
     * @param proof The Merkle proof
     * @return True if the address is allowlisted with the given allocation
     */
    function isAllowlisted(
        bytes32 merkleRoot,
        address account,
        uint256 allocation,
        bytes32[] memory proof
    ) internal pure returns (bool) {
        return verify(merkleRoot, account, allocation, proof);
    }

    /**
     * @notice Validate allowlist parameters
     * @param merkleRoot The Merkle root to validate
     * @param entries Sample entries to validate against the root
     * @param proofs Corresponding proofs for the sample entries
     * @return True if all sample entries are valid
     */
    function validateAllowlist(
        bytes32 merkleRoot,
        AllowlistEntry[] memory entries,
        bytes32[][] memory proofs
    ) internal pure returns (bool) {
        if (merkleRoot == bytes32(0)) return false;
        if (entries.length == 0) return false;
        if (entries.length != proofs.length) return false;

        bool[] memory results = verifyBatch(merkleRoot, entries, proofs);
        
        for (uint256 i = 0; i < results.length; ) {
            if (!results[i]) return false;
            unchecked {
                ++i;
            }
        }
        
        return true;
    }

    /*//////////////////////////////////////////////////////////////
                        MERKLE TREE HELPERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Calculate the Merkle root from a list of leaves
     * @dev This is a gas-intensive operation and should be used off-chain for large datasets
     * @param leaves Array of leaf hashes
     * @return The calculated Merkle root
     */
    function calculateMerkleRoot(bytes32[] memory leaves) internal pure returns (bytes32) {
        if (leaves.length == 0) revert InvalidMerkleRoot();
        if (leaves.length == 1) return leaves[0];

        // Sort leaves to ensure deterministic root
        _quickSort(leaves, 0, int256(leaves.length - 1));

        while (leaves.length > 1) {
            bytes32[] memory nextLevel = new bytes32[]((leaves.length + 1) / 2);
            
            for (uint256 i = 0; i < leaves.length; i += 2) {
                if (i + 1 < leaves.length) {
                    nextLevel[i / 2] = _hashPair(leaves[i], leaves[i + 1]);
                } else {
                    nextLevel[i / 2] = leaves[i];
                }
            }
            
            leaves = nextLevel;
        }

        return leaves[0];
    }

    /**
     * @notice Hash two leaf nodes together
     * @param a First leaf
     * @param b Second leaf
     * @return The combined hash
     */
    function _hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }

    /**
     * @notice Quick sort implementation for bytes32 arrays
     * @param arr Array to sort
     * @param left Left index
     * @param right Right index
     */
    function _quickSort(bytes32[] memory arr, int256 left, int256 right) private pure {
        if (left < right) {
            int256 pivotIndex = _partition(arr, left, right);
            _quickSort(arr, left, pivotIndex - 1);
            _quickSort(arr, pivotIndex + 1, right);
        }
    }

    /**
     * @notice Partition function for quick sort
     * @param arr Array to partition
     * @param left Left index
     * @param right Right index
     * @return Pivot index
     */
    function _partition(bytes32[] memory arr, int256 left, int256 right) private pure returns (int256) {
        bytes32 pivot = arr[uint256(right)];
        int256 i = left - 1;

        for (int256 j = left; j < right; j++) {
            if (arr[uint256(j)] <= pivot) {
                i++;
                (arr[uint256(i)], arr[uint256(j)]) = (arr[uint256(j)], arr[uint256(i)]);
            }
        }

        (arr[uint256(i + 1)], arr[uint256(right)]) = (arr[uint256(right)], arr[uint256(i + 1)]);
        return i + 1;
    }
}