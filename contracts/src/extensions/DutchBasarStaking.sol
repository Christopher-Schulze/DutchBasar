// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {DutchBasar} from "../DutchBasar.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DutchBasarStaking
 * @notice NFT staking with yield generation during auction
 * @dev Stake NFTs to earn rewards and boost auction privileges
 */
contract DutchBasarStaking is IERC721Receiver, ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/
    
    struct StakeInfo {
        uint256 tokenId;
        uint256 stakedAt;
        uint256 lastRewardClaim;
        uint256 accumulatedRewards;
        uint256 boostLevel; // 0-100
    }
    
    struct Pool {
        uint256 totalStaked;
        uint256 rewardRate; // Rewards per second per NFT
        uint256 boostMultiplier;
        uint256 minStakeDuration;
        bool active;
    }
    
    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    
    DutchBasar public immutable dutchBasar;
    
    mapping(address => StakeInfo[]) public userStakes;
    mapping(uint256 => address) public tokenOwner;
    mapping(address => uint256) public userRewards;
    mapping(address => uint256) public stakingScore;
    
    Pool public stakingPool;
    uint256 public totalRewardsDistributed;
    uint256 public constant MAX_BOOST = 100;
    uint256 public constant REWARD_PRECISION = 1e18;
    
    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    event Staked(address indexed user, uint256 tokenId, uint256 timestamp);
    event Unstaked(address indexed user, uint256 tokenId, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);
    event BoostActivated(address indexed user, uint256 boostLevel);
    event PoolUpdated(uint256 rewardRate, uint256 boostMultiplier);
    
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    
    error NotTokenOwner();
    error AlreadyStaked();
    error NotStaked();
    error StakingPeriodNotMet();
    error PoolInactive();
    error InsufficientRewards();
    
    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    
    constructor(address _dutchBasar) {
        dutchBasar = DutchBasar(_dutchBasar);
        
        // Initialize staking pool
        stakingPool = Pool({
            totalStaked: 0,
            rewardRate: 0.001 ether, // 0.001 ETH per day per NFT
            boostMultiplier: 110, // 10% boost
            minStakeDuration: 1 days,
            active: true
        });
    }
    
    /*//////////////////////////////////////////////////////////////
                        STAKING FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Stake NFTs to earn rewards
     */
    function stake(uint256[] calldata tokenIds) external nonReentrant {
        if (!stakingPool.active) revert PoolInactive();
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            
            // Verify ownership
            if (dutchBasar.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
            if (tokenOwner[tokenId] != address(0)) revert AlreadyStaked();
            
            // Transfer NFT to staking contract
            dutchBasar.safeTransferFrom(msg.sender, address(this), tokenId);
            
            // Record stake
            tokenOwner[tokenId] = msg.sender;
            userStakes[msg.sender].push(StakeInfo({
                tokenId: tokenId,
                stakedAt: block.timestamp,
                lastRewardClaim: block.timestamp,
                accumulatedRewards: 0,
                boostLevel: _calculateBoostLevel(msg.sender)
            }));
            
            stakingPool.totalStaked++;
            emit Staked(msg.sender, tokenId, block.timestamp);
        }
        
        // Update staking score
        _updateStakingScore(msg.sender);
    }
    
    /**
     * @notice Unstake NFTs and claim rewards
     */
    function unstake(uint256[] calldata tokenIds) external nonReentrant {
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            
            if (tokenOwner[tokenId] != msg.sender) revert NotStaked();
            
            // Find and remove stake
            StakeInfo[] storage stakes = userStakes[msg.sender];
            for (uint256 j = 0; j < stakes.length; j++) {
                if (stakes[j].tokenId == tokenId) {
                    StakeInfo memory stakeInfo = stakes[j];
                    
                    // Check minimum staking period
                    if (block.timestamp < stakeInfo.stakedAt + stakingPool.minStakeDuration) {
                        revert StakingPeriodNotMet();
                    }
                    
                    // Calculate rewards
                    uint256 rewards = _calculateRewards(stakeInfo);
                    totalRewards += rewards;
                    
                    // Remove stake
                    stakes[j] = stakes[stakes.length - 1];
                    stakes.pop();
                    
                    // Transfer NFT back
                    dutchBasar.safeTransferFrom(address(this), msg.sender, tokenId);
                    delete tokenOwner[tokenId];
                    
                    stakingPool.totalStaked--;
                    emit Unstaked(msg.sender, tokenId, rewards);
                    
                    break;
                }
            }
        }
        
        // Transfer rewards
        if (totalRewards > 0) {
            userRewards[msg.sender] += totalRewards;
            _transferRewards(msg.sender, totalRewards);
        }
        
        _updateStakingScore(msg.sender);
    }
    
    /**
     * @notice Claim accumulated rewards without unstaking
     */
    function claimRewards() external nonReentrant {
        uint256 totalRewards = 0;
        StakeInfo[] storage stakes = userStakes[msg.sender];
        
        for (uint256 i = 0; i < stakes.length; i++) {
            uint256 rewards = _calculateRewards(stakes[i]);
            totalRewards += rewards;
            stakes[i].lastRewardClaim = block.timestamp;
            stakes[i].accumulatedRewards = 0;
        }
        
        if (totalRewards > 0) {
            userRewards[msg.sender] += totalRewards;
            _transferRewards(msg.sender, totalRewards);
            emit RewardsClaimed(msg.sender, totalRewards);
        }
    }
    
    /*//////////////////////////////////////////////////////////////
                        REWARD CALCULATIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Calculate rewards for a stake
     */
    function _calculateRewards(StakeInfo memory stakeInfo) internal view returns (uint256) {
        uint256 stakingDuration = block.timestamp - stakeInfo.lastRewardClaim;
        uint256 baseReward = (stakingDuration * stakingPool.rewardRate) / 1 days;
        
        // Apply boost
        uint256 boostedReward = (baseReward * (100 + stakeInfo.boostLevel)) / 100;
        
        // Apply pool multiplier
        boostedReward = (boostedReward * stakingPool.boostMultiplier) / 100;
        
        return boostedReward + stakeInfo.accumulatedRewards;
    }
    
    /**
     * @notice Calculate boost level based on staking history
     */
    function _calculateBoostLevel(address user) internal view returns (uint256) {
        uint256 stakedCount = userStakes[user].length;
        uint256 boost = 0;
        
        if (stakedCount >= 1) boost = 10;
        if (stakedCount >= 5) boost = 25;
        if (stakedCount >= 10) boost = 50;
        if (stakedCount >= 20) boost = MAX_BOOST;
        
        // Additional boost for long-term stakers
        if (stakingScore[user] > 1000) boost += 20;
        
        return boost > MAX_BOOST ? MAX_BOOST : boost;
    }
    
    /**
     * @notice Update user's staking score
     */
    function _updateStakingScore(address user) internal {
        uint256 score = 0;
        StakeInfo[] memory stakes = userStakes[user];
        
        for (uint256 i = 0; i < stakes.length; i++) {
            uint256 duration = block.timestamp - stakes[i].stakedAt;
            score += duration / 1 days;
        }
        
        stakingScore[user] = score;
    }
    
    /**
     * @notice Transfer rewards to user
     */
    function _transferRewards(address user, uint256 amount) internal {
        if (address(this).balance < amount) revert InsufficientRewards();
        
        (bool success, ) = payable(user).call{value: amount}("");
        require(success, "Reward transfer failed");
        
        totalRewardsDistributed += amount;
    }
    
    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Get user's staked NFTs
     */
    function getUserStakes(address user) external view returns (StakeInfo[] memory) {
        return userStakes[user];
    }
    
    /**
     * @notice Get pending rewards for user
     */
    function getPendingRewards(address user) external view returns (uint256) {
        uint256 totalRewards = 0;
        StakeInfo[] memory stakes = userStakes[user];
        
        for (uint256 i = 0; i < stakes.length; i++) {
            totalRewards += _calculateRewards(stakes[i]);
        }
        
        return totalRewards;
    }
    
    /**
     * @notice Get user's boost level
     */
    function getUserBoost(address user) external view returns (uint256) {
        return _calculateBoostLevel(user);
    }
    
    /*//////////////////////////////////////////////////////////////
                        ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Update pool parameters
     */
    function updatePool(
        uint256 rewardRate,
        uint256 boostMultiplier,
        uint256 minStakeDuration,
        bool active
    ) external {
        // Only owner can update (simplified - use access control in production)
        require(msg.sender == address(dutchBasar.owner()), "Not authorized");
        
        stakingPool.rewardRate = rewardRate;
        stakingPool.boostMultiplier = boostMultiplier;
        stakingPool.minStakeDuration = minStakeDuration;
        stakingPool.active = active;
        
        emit PoolUpdated(rewardRate, boostMultiplier);
    }
    
    /**
     * @notice Fund reward pool
     */
    function fundRewardPool() external payable {
        // Accept ETH for rewards
    }
    
    /*//////////////////////////////////////////////////////////////
                        ERC721 RECEIVER
    //////////////////////////////////////////////////////////////*/
    
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
