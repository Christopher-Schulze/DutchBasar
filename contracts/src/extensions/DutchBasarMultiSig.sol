// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {DutchBasar} from "../DutchBasar.sol";

/**
 * @title DutchBasarMultiSig
 * @notice Multi-signature wallet integration for DutchBasar
 * @dev Implements 2-of-3 multi-sig for critical functions
 */
contract DutchBasarMultiSig {
    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    event ProposalCreated(uint256 indexed proposalId, bytes4 selector, bytes data);
    event ProposalSigned(uint256 indexed proposalId, address signer);
    event ProposalExecuted(uint256 indexed proposalId);
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    
    error NotSigner();
    error AlreadySigned();
    error InsufficientSignatures();
    error ProposalExpired();
    error InvalidSigner();
    
    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    
    struct Proposal {
        bytes4 selector;
        bytes data;
        uint256 signatures;
        uint256 expiry;
        mapping(address => bool) signed;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public signers;
    uint256 public proposalCount;
    uint256 public requiredSignatures = 2;
    uint256 public totalSigners = 3;
    
    DutchBasar public immutable dutchBasar;
    
    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/
    
    modifier onlySigner() {
        if (!signers[msg.sender]) revert NotSigner();
        _;
    }
    
    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    
    constructor(address _dutchBasar, address[3] memory _signers) {
        dutchBasar = DutchBasar(_dutchBasar);
        for (uint i = 0; i < 3; i++) {
            signers[_signers[i]] = true;
        }
    }
    
    /*//////////////////////////////////////////////////////////////
                        PROPOSAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    function propose(bytes4 selector, bytes calldata data) external onlySigner returns (uint256) {
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.selector = selector;
        proposal.data = data;
        proposal.expiry = block.timestamp + 48 hours;
        
        emit ProposalCreated(proposalId, selector, data);
        return proposalId;
    }
    
    function sign(uint256 proposalId) external onlySigner {
        Proposal storage proposal = proposals[proposalId];
        if (block.timestamp > proposal.expiry) revert ProposalExpired();
        if (proposal.signed[msg.sender]) revert AlreadySigned();
        
        proposal.signed[msg.sender] = true;
        proposal.signatures++;
        
        emit ProposalSigned(proposalId, msg.sender);
        
        if (proposal.signatures >= requiredSignatures) {
            execute(proposalId);
        }
    }
    
    function execute(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.signatures < requiredSignatures) revert InsufficientSignatures();
        
        (bool success,) = address(dutchBasar).call(
            abi.encodePacked(proposal.selector, proposal.data)
        );
        require(success, "Execution failed");
        
        emit ProposalExecuted(proposalId);
    }
}
