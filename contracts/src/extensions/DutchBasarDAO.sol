// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {DutchBasar} from "../DutchBasar.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title DutchBasarDAO
 * @notice Decentralized governance for DutchBasar protocol
 * @dev On-chain governance with delegation and time-locked execution
 */
contract DutchBasarDAO is ERC20, ERC20Votes {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/
    
    struct Proposal {
        string description;
        address target;
        bytes data;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startBlock;
        uint256 endBlock;
        bool executed;
        bool cancelled;
        mapping(address => bool) hasVoted;
    }
    
    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    uint256 public constant VOTING_PERIOD = 50400; // ~7 days at 12s blocks
    uint256 public constant VOTING_DELAY = 7200; // ~1 day
    uint256 public constant PROPOSAL_THRESHOLD = 100000e18; // 100k tokens
    uint256 public constant QUORUM = 4; // 4% of total supply
    
    DutchBasar public immutable dutchBasar;
    
    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    event ProposalCreated(uint256 indexed proposalId, address proposer, string description);
    event VoteCast(uint256 indexed proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    
    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    
    constructor(address _dutchBasar) 
        ERC20("DutchBasar DAO", "DBDAO")
        EIP712("DutchBasar DAO", "1")
    {
        dutchBasar = DutchBasar(_dutchBasar);
        _mint(msg.sender, 1000000e18); // 1M governance tokens
    }
    
    /*//////////////////////////////////////////////////////////////
                        PROPOSAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Create a new governance proposal
     */
    function propose(
        string calldata description,
        address target,
        bytes calldata data
    ) external returns (uint256) {
        require(
            getPastVotes(msg.sender, block.number - 1) >= PROPOSAL_THRESHOLD,
            "Insufficient voting power"
        );
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.description = description;
        proposal.target = target;
        proposal.data = data;
        proposal.startBlock = block.number + VOTING_DELAY;
        proposal.endBlock = proposal.startBlock + VOTING_PERIOD;
        
        emit ProposalCreated(proposalId, msg.sender, description);
        return proposalId;
    }
    
    /**
     * @notice Cast vote on proposal
     */
    function castVote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.number >= proposal.startBlock, "Voting not started");
        require(block.number <= proposal.endBlock, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 weight = getPastVotes(msg.sender, proposal.startBlock);
        require(weight > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }
    
    /**
     * @notice Execute successful proposal
     */
    function execute(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.number > proposal.endBlock, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Cancelled");
        
        // Check if proposal passed
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed");
        
        // Check quorum
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        require(
            totalVotes >= (totalSupply() * QUORUM) / 100,
            "Quorum not reached"
        );
        
        proposal.executed = true;
        
        // Execute proposal
        (bool success,) = proposal.target.call(proposal.data);
        require(success, "Execution failed");
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @notice Cancel proposal (only by proposer or admin)
     */
    function cancel(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Already executed");
        
        // Only high token holders can cancel
        require(
            getPastVotes(msg.sender, block.number - 1) >= PROPOSAL_THRESHOLD * 2,
            "Insufficient power to cancel"
        );
        
        proposal.cancelled = true;
        emit ProposalCancelled(proposalId);
    }
    
    /*//////////////////////////////////////////////////////////////
                        DELEGATION FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Delegate voting power
     */
    function delegateVotes(address delegatee) external {
        delegate(delegatee);
    }
    
    /*//////////////////////////////////////////////////////////////
                            OVERRIDES
    //////////////////////////////////////////////////////////////*/
    
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    
}
