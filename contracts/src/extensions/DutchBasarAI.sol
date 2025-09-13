// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {DutchBasar} from "../DutchBasar.sol";
// Minimal Chainlink Aggregator interface (local)
interface IAggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

/**
 * @title DutchBasarAI
 * @notice AI-powered dynamic pricing with Chainlink oracles
 * @dev Uses machine learning models for optimal price discovery
 */
contract DutchBasarAI {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/
    
    struct PriceModel {
        uint256 basePrice;
        uint256 volatility;
        uint256 demandFactor;
        uint256 supplyFactor;
        uint256 marketSentiment; // 0-100
        uint256 lastUpdate;
    }
    
    struct MarketData {
        uint256 volume24h;
        uint256 uniqueBuyers24h;
        uint256 averageHoldTime;
        uint256 secondaryVolume;
        uint256 floorPrice;
    }
    
    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    
    PriceModel public priceModel;
    MarketData public marketData;
    
    mapping(address => uint256) public userScore; // AI-calculated user score
    mapping(uint256 => uint256) public tokenRarity; // AI-calculated rarity
    
    IAggregatorV3Interface public ethPriceFeed;
    DutchBasar public immutable dutchBasar;
    
    // AI Model Parameters (simplified for on-chain)
    uint256 constant VOLATILITY_WEIGHT = 30;
    uint256 constant DEMAND_WEIGHT = 40;
    uint256 constant SENTIMENT_WEIGHT = 30;
    
    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    event PriceModelUpdated(uint256 newPrice, uint256 volatility, uint256 sentiment);
    event UserScoreCalculated(address user, uint256 score);
    event RarityCalculated(uint256 tokenId, uint256 rarity);
    
    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    
    constructor(address _dutchBasar, address _priceFeed) {
        dutchBasar = DutchBasar(_dutchBasar);
        ethPriceFeed = IAggregatorV3Interface(_priceFeed);
        
        // Initialize model with defaults
        priceModel = PriceModel({
            basePrice: 0.1 ether,
            volatility: 20,
            demandFactor: 50,
            supplyFactor: 50,
            marketSentiment: 50,
            lastUpdate: block.timestamp
        });
    }
    
    /*//////////////////////////////////////////////////////////////
                        AI PRICING FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Calculate optimal price using AI model
     * @dev Combines multiple factors for dynamic pricing
     */
    function calculateOptimalPrice() public view returns (uint256) {
        // Get current ETH price from Chainlink
        (, int256 ethPrice,,,) = ethPriceFeed.latestRoundData();
        uint256 ethUsdPrice = uint256(ethPrice) / 1e8;
        
        // Calculate base price adjustment
        uint256 volatilityAdjustment = (priceModel.volatility * VOLATILITY_WEIGHT) / 100;
        uint256 demandAdjustment = (priceModel.demandFactor * DEMAND_WEIGHT) / 100;
        uint256 sentimentAdjustment = (priceModel.marketSentiment * SENTIMENT_WEIGHT) / 100;
        
        // Apply ML-like formula (simplified)
        uint256 adjustmentFactor = 100 + volatilityAdjustment + demandAdjustment + sentimentAdjustment;
        uint256 optimalPrice = (priceModel.basePrice * adjustmentFactor) / 100;
        
        // Adjust for ETH price movements
        optimalPrice = (optimalPrice * 3000) / ethUsdPrice; // Normalize to $3000 ETH
        
        return optimalPrice;
    }
    
    /**
     * @notice Update market data and recalculate model
     * @dev Called by oracle or automated keeper
     */
    function updateMarketData(
        uint256 _volume24h,
        uint256 _uniqueBuyers,
        uint256 _avgHoldTime,
        uint256 _secondaryVolume,
        uint256 _floorPrice
    ) external {
        marketData = MarketData({
            volume24h: _volume24h,
            uniqueBuyers24h: _uniqueBuyers,
            averageHoldTime: _avgHoldTime,
            secondaryVolume: _secondaryVolume,
            floorPrice: _floorPrice
        });
        
        // Recalculate model parameters
        _updatePriceModel();
    }
    
    /**
     * @notice AI model update based on market data
     */
    function _updatePriceModel() internal {
        // Calculate demand factor (0-100)
        uint256 demandScore = (marketData.uniqueBuyers24h * 100) / 1000; // Normalize to 1000 buyers
        if (demandScore > 100) demandScore = 100;
        
        // Calculate volatility (0-100)
        uint256 priceRange = marketData.floorPrice > priceModel.basePrice 
            ? marketData.floorPrice - priceModel.basePrice 
            : priceModel.basePrice - marketData.floorPrice;
        uint256 volatility = (priceRange * 100) / priceModel.basePrice;
        if (volatility > 100) volatility = 100;
        
        // Calculate market sentiment (0-100)
        uint256 sentiment = 50; // Base sentiment
        if (marketData.volume24h > 100 ether) sentiment += 20;
        if (marketData.averageHoldTime > 7 days) sentiment += 15;
        if (marketData.secondaryVolume > 50 ether) sentiment += 15;
        if (sentiment > 100) sentiment = 100;
        
        // Update model
        priceModel.demandFactor = demandScore;
        priceModel.volatility = volatility;
        priceModel.marketSentiment = sentiment;
        priceModel.lastUpdate = block.timestamp;
        
        emit PriceModelUpdated(calculateOptimalPrice(), volatility, sentiment);
    }
    
    /*//////////////////////////////////////////////////////////////
                        USER SCORING SYSTEM
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Calculate user score for personalized pricing
     * @dev Higher scores get better prices
     */
    function calculateUserScore(address user) external returns (uint256) {
        uint256 score = 50; // Base score
        
        // Check holding history
        uint256 balance = dutchBasar.balanceOf(user);
        if (balance > 0) score += 10;
        if (balance > 5) score += 10;
        if (balance > 10) score += 10;
        
        // Check loyalty (simplified - would use subgraph in production)
        // if (firstMintTime[user] < block.timestamp - 30 days) score += 20;
        
        userScore[user] = score;
        emit UserScoreCalculated(user, score);
        
        return score;
    }
    
    /**
     * @notice Get personalized price for user
     */
    function getPersonalizedPrice(address user) external view returns (uint256) {
        uint256 basePrice = calculateOptimalPrice();
        uint256 score = userScore[user];
        
        if (score == 0) return basePrice;
        
        // Apply discount based on score (max 20% off)
        uint256 discount = (basePrice * score) / 500; // score/500 = max 20% at score 100
        return basePrice - discount;
    }
    
    /*//////////////////////////////////////////////////////////////
                        RARITY CALCULATION
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice AI-powered rarity calculation
     * @dev Analyzes traits and market data
     */
    function calculateRarity(uint256 tokenId) external returns (uint256) {
        // Simplified rarity calculation
        // In production, would analyze metadata traits
        
        uint256 rarity = 50; // Base rarity
        
        // Prime number tokens are rarer
        if (_isPrime(tokenId)) rarity += 20;
        
        // Low token IDs are rarer
        if (tokenId < 100) rarity += 15;
        if (tokenId < 10) rarity += 15;
        
        // Palindrome tokens are rarer
        if (_isPalindrome(tokenId)) rarity += 20;
        
        tokenRarity[tokenId] = rarity;
        emit RarityCalculated(tokenId, rarity);
        
        return rarity;
    }
    
    function _isPrime(uint256 n) internal pure returns (bool) {
        if (n < 2) return false;
        for (uint256 i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
    
    function _isPalindrome(uint256 n) internal pure returns (bool) {
        uint256 reversed = 0;
        uint256 original = n;
        while (n != 0) {
            reversed = reversed * 10 + n % 10;
            n /= 10;
        }
        return original == reversed;
    }
}
