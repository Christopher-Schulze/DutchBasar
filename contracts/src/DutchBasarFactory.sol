// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {DutchBasar} from "./DutchBasar.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title DutchBasarFactory
 * @notice Factory contract for deploying DutchBasar NFT auction contracts across multiple chains
 * @dev Provides standardized deployment with configurable parameters and cross-chain compatibility
 */
contract DutchBasarFactory is Ownable, Pausable {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidParameters();
    error DeploymentFailed();
    error UnauthorizedDeployer();
    error DuplicateDeployment();

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event DutchBasarDeployed(
        address indexed contractAddress,
        address indexed deployer,
        string name,
        string symbol,
        uint256 chainId
    );

    event DeployerAuthorized(address indexed deployer, bool authorized);
    event DeploymentFeeUpdated(uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct DeploymentParams {
        string name;
        string symbol;
        string unrevealedURI;
        address owner;
        address royaltyRecipient;
        uint96 royaltyFeeBasisPoints;
    }

    struct DeploymentInfo {
        address contractAddress;
        address deployer;
        uint256 timestamp;
        uint256 chainId;
        string name;
        string symbol;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    // Deployment tracking
    mapping(address => DeploymentInfo) public deployments;
    mapping(address => address[]) public deployerContracts;
    mapping(bytes32 => bool) public deploymentExists;
    
    // Authorization
    mapping(address => bool) public authorizedDeployers;
    
    // Configuration
    uint256 public deploymentFee;
    uint256 public totalDeployments;
    
    // Chain information
    uint256 public immutable CHAIN_ID;
    
    // Constants
    uint256 private constant MAX_ROYALTY_FEE = 1000; // 10%
    uint256 private constant BASIS_POINTS = 10000;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address owner, uint256 _deploymentFee) Ownable(owner) {
        CHAIN_ID = block.chainid;
        deploymentFee = _deploymentFee;
        
        // Factory owner is automatically authorized
        authorizedDeployers[owner] = true;
        emit DeployerAuthorized(owner, true);
    }

    /*//////////////////////////////////////////////////////////////
                        DEPLOYMENT FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Deploy a new DutchBasar contract
     * @param params Deployment parameters
     * @return contractAddress Address of the deployed contract
     */
    function deployDutchBasar(DeploymentParams calldata params) 
        external 
        payable 
        whenNotPaused 
        returns (address contractAddress) 
    {
        // Check authorization
        if (!authorizedDeployers[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedDeployer();
        }
        
        // Check deployment fee
        if (msg.value < deploymentFee) {
            revert InvalidParameters();
        }
        
        // Validate parameters
        _validateDeploymentParams(params);
        
        // Check for duplicate deployment
        bytes32 deploymentHash = keccak256(
            abi.encodePacked(params.name, params.symbol, msg.sender, CHAIN_ID)
        );
        if (deploymentExists[deploymentHash]) {
            revert DuplicateDeployment();
        }
        
        // Deploy the contract
        try new DutchBasar(
            params.name,
            params.symbol,
            params.unrevealedURI,
            params.owner,
            params.royaltyRecipient,
            params.royaltyFeeBasisPoints
        ) returns (DutchBasar newContract) {
            contractAddress = address(newContract);
        } catch {
            revert DeploymentFailed();
        }
        
        // Record deployment
        DeploymentInfo memory info = DeploymentInfo({
            contractAddress: contractAddress,
            deployer: msg.sender,
            timestamp: block.timestamp,
            chainId: CHAIN_ID,
            name: params.name,
            symbol: params.symbol
        });
        
        deployments[contractAddress] = info;
        deployerContracts[msg.sender].push(contractAddress);
        deploymentExists[deploymentHash] = true;
        totalDeployments++;
        
        // Refund excess payment
        if (msg.value > deploymentFee) {
            _refund(msg.sender, msg.value - deploymentFee);
        }
        
        emit DutchBasarDeployed(
            contractAddress,
            msg.sender,
            params.name,
            params.symbol,
            CHAIN_ID
        );
    }

    /**
     * @notice Deploy multiple DutchBasar contracts in a single transaction
     * @param paramsArray Array of deployment parameters
     * @return contractAddresses Array of deployed contract addresses
     */
    function batchDeployDutchBasar(DeploymentParams[] calldata paramsArray)
        external
        payable
        whenNotPaused
        returns (address[] memory contractAddresses)
    {
        // Check authorization
        if (!authorizedDeployers[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedDeployer();
        }
        
        uint256 totalFee = deploymentFee * paramsArray.length;
        if (msg.value < totalFee) {
            revert InvalidParameters();
        }
        
        contractAddresses = new address[](paramsArray.length);
        
        for (uint256 i = 0; i < paramsArray.length; ) {
            DeploymentParams calldata params = paramsArray[i];
            
            // Validate parameters
            _validateDeploymentParams(params);
            
            // Check for duplicate deployment
            bytes32 deploymentHash = keccak256(
                abi.encodePacked(params.name, params.symbol, msg.sender, CHAIN_ID)
            );
            if (deploymentExists[deploymentHash]) {
                revert DuplicateDeployment();
            }
            
            // Deploy the contract
            address contractAddress;
            try new DutchBasar(
                params.name,
                params.symbol,
                params.unrevealedURI,
                params.owner,
                params.royaltyRecipient,
                params.royaltyFeeBasisPoints
            ) returns (DutchBasar newContract) {
                contractAddress = address(newContract);
            } catch {
                revert DeploymentFailed();
            }
            
            contractAddresses[i] = contractAddress;
            
            // Record deployment
            DeploymentInfo memory info = DeploymentInfo({
                contractAddress: contractAddress,
                deployer: msg.sender,
                timestamp: block.timestamp,
                chainId: CHAIN_ID,
                name: params.name,
                symbol: params.symbol
            });
            
            deployments[contractAddress] = info;
            deployerContracts[msg.sender].push(contractAddress);
            deploymentExists[deploymentHash] = true;
            totalDeployments++;
            
            emit DutchBasarDeployed(
                contractAddress,
                msg.sender,
                params.name,
                params.symbol,
                CHAIN_ID
            );
            
            unchecked {
                ++i;
            }
        }
        
        // Refund excess payment
        if (msg.value > totalFee) {
            _refund(msg.sender, msg.value - totalFee);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        AUTHORIZATION FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Authorize or deauthorize a deployer
     * @param deployer Address to authorize/deauthorize
     * @param authorized True to authorize, false to deauthorize
     */
    function setDeployerAuthorization(address deployer, bool authorized) external onlyOwner {
        if (deployer == address(0)) revert InvalidParameters();
        
        authorizedDeployers[deployer] = authorized;
        emit DeployerAuthorized(deployer, authorized);
    }

    /**
     * @notice Authorize multiple deployers at once
     * @param deployers Array of addresses to authorize
     * @param authorized True to authorize, false to deauthorize
     */
    function batchSetDeployerAuthorization(
        address[] calldata deployers,
        bool authorized
    ) external onlyOwner {
        for (uint256 i = 0; i < deployers.length; ) {
            if (deployers[i] != address(0)) {
                authorizedDeployers[deployers[i]] = authorized;
                emit DeployerAuthorized(deployers[i], authorized);
            }
            
            unchecked {
                ++i;
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                        CONFIGURATION FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Update the deployment fee
     * @param newFee New deployment fee in wei
     */
    function setDeploymentFee(uint256 newFee) external onlyOwner {
        deploymentFee = newFee;
        emit DeploymentFeeUpdated(newFee);
    }

    /**
     * @notice Pause the factory
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the factory
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                        WITHDRAWAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Withdraw accumulated fees
     * @param to Address to withdraw to
     */
    function withdrawFees(address to) external onlyOwner {
        if (to == address(0)) revert InvalidParameters();
        
        uint256 balance = address(this).balance;
        if (balance == 0) revert InvalidParameters();
        
        _withdraw(to, balance);
    }

    /**
     * @notice Withdraw specific amount
     * @param to Address to withdraw to
     * @param amount Amount to withdraw
     */
    function withdrawAmount(address to, uint256 amount) external onlyOwner {
        if (to == address(0) || amount == 0) revert InvalidParameters();
        if (amount > address(this).balance) revert InvalidParameters();
        
        _withdraw(to, amount);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get deployment information for a contract
     * @param contractAddress Address of the deployed contract
     * @return Deployment information
     */
    function getDeploymentInfo(address contractAddress) 
        external 
        view 
        returns (DeploymentInfo memory) 
    {
        return deployments[contractAddress];
    }

    /**
     * @notice Get all contracts deployed by a specific deployer
     * @param deployer Address of the deployer
     * @return Array of contract addresses
     */
    function getDeployerContracts(address deployer) 
        external 
        view 
        returns (address[] memory) 
    {
        return deployerContracts[deployer];
    }

    /**
     * @notice Check if a deployment combination already exists
     * @param name Contract name
     * @param symbol Contract symbol
     * @param deployer Deployer address
     * @return True if deployment exists
     */
    function checkDeploymentExists(
        string calldata name,
        string calldata symbol,
        address deployer
    ) external view returns (bool) {
        bytes32 deploymentHash = keccak256(
            abi.encodePacked(name, symbol, deployer, CHAIN_ID)
        );
        return deploymentExists[deploymentHash];
    }

    /**
     * @notice Get factory statistics
     * @return totalDeployments_ Total number of deployments
     * @return chainId Current chain ID
     * @return deploymentFee_ Current deployment fee
     */
    function getFactoryStats() 
        external 
        view 
        returns (
            uint256 totalDeployments_,
            uint256 chainId,
            uint256 deploymentFee_
        ) 
    {
        return (totalDeployments, CHAIN_ID, deploymentFee);
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Validate deployment parameters
     * @param params Parameters to validate
     */
    function _validateDeploymentParams(DeploymentParams calldata params) internal pure {
        if (bytes(params.name).length == 0) revert InvalidParameters();
        if (bytes(params.symbol).length == 0) revert InvalidParameters();
        if (bytes(params.unrevealedURI).length == 0) revert InvalidParameters();
        if (params.owner == address(0)) revert InvalidParameters();
        if (params.royaltyRecipient == address(0)) revert InvalidParameters();
        if (params.royaltyFeeBasisPoints > MAX_ROYALTY_FEE) revert InvalidParameters();
    }

    /**
     * @notice Internal withdrawal function
     * @param to Address to send funds to
     * @param amount Amount to send
     */
    function _withdraw(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        if (!success) revert DeploymentFailed();
        
        emit FeesWithdrawn(to, amount);
    }

    /**
     * @notice Internal refund function
     * @param to Address to refund
     * @param amount Amount to refund
     */
    function _refund(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        if (!success) revert DeploymentFailed();
    }

    /*//////////////////////////////////////////////////////////////
                        EMERGENCY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emergency function to recover stuck tokens (not ETH)
     * @param token Token contract address
     * @param to Address to send tokens to
     * @param amount Amount to send
     */
    function emergencyTokenRecovery(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        if (token == address(0) || to == address(0)) revert InvalidParameters();
        
        // Use low-level call to avoid importing token interface
        (bool success, ) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );
        
        if (!success) revert DeploymentFailed();
    }
}