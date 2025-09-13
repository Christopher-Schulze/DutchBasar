// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {DutchBasar} from "../src/DutchBasar.sol";
import {DutchBasarFactory} from "../src/DutchBasarFactory.sol";

/**
 * @title DeployScript
 * @notice Deployment script for DutchBasar contracts across multiple chains
 * @dev Supports Ethereum, Base, Polygon, Arbitrum, Optimism, Scroll, and zkSync Era
 */
contract DeployScript is Script {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct DeploymentConfig {
        string name;
        string symbol;
        string unrevealedURI;
        address owner;
        address royaltyRecipient;
        uint96 royaltyFeeBasisPoints;
        uint256 deploymentFee;
    }

    struct ChainConfig {
        uint256 chainId;
        string name;
        string rpcUrl;
        string explorerUrl;
        bool isTestnet;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    // Default configuration
    DeploymentConfig public defaultConfig = DeploymentConfig({
        name: "DutchBasar Collection",
        symbol: "DBC",
        unrevealedURI: "https://api.dutchbasar.com/metadata/unrevealed.json",
        owner: address(0), // Will be set to deployer
        royaltyRecipient: address(0), // Will be set to deployer
        royaltyFeeBasisPoints: 500, // 5%
        deploymentFee: 0.001 ether
    });

    // Chain configurations
    mapping(uint256 => ChainConfig) public chainConfigs;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
        _setupChainConfigs();
    }

    /*//////////////////////////////////////////////////////////////
                            DEPLOYMENT FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Deploy DutchBasar contract
     * @dev Run with: forge script script/Deploy.s.sol:DeployScript --rpc-url <RPC_URL> --broadcast --verify
     */
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Update config with deployer address
        defaultConfig.owner = deployer;
        defaultConfig.royaltyRecipient = deployer;
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy main contract
        DutchBasar dutchBasar = new DutchBasar(
            defaultConfig.name,
            defaultConfig.symbol,
            defaultConfig.unrevealedURI,
            defaultConfig.owner,
            defaultConfig.royaltyRecipient,
            defaultConfig.royaltyFeeBasisPoints
        );
        
        // Deploy factory contract
        DutchBasarFactory factory = new DutchBasarFactory(
            deployer,
            defaultConfig.deploymentFee
        );
        
        vm.stopBroadcast();
        
        // Log deployment information
        _logDeployment(address(dutchBasar), address(factory), deployer);
        
        // Save deployment addresses
        _saveDeploymentAddresses(address(dutchBasar), address(factory));
    }

    /**
     * @notice Deploy only the factory contract
     */
    function deployFactory() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        DutchBasarFactory factory = new DutchBasarFactory(
            deployer,
            defaultConfig.deploymentFee
        );
        
        vm.stopBroadcast();
        
        console2.log("Factory deployed at:", address(factory));
        console2.log("Owner:", deployer);
        console2.log("Deployment fee:", defaultConfig.deploymentFee);
    }

    /**
     * @notice Deploy with custom configuration
     * @param config Custom deployment configuration
     */
    function deployWithConfig(DeploymentConfig memory config) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        DutchBasar dutchBasar = new DutchBasar(
            config.name,
            config.symbol,
            config.unrevealedURI,
            config.owner,
            config.royaltyRecipient,
            config.royaltyFeeBasisPoints
        );
        
        vm.stopBroadcast();
        
        console2.log("Custom DutchBasar deployed at:", address(dutchBasar));
    }

    /**
     * @notice Deploy to all supported chains
     * @dev This function demonstrates multi-chain deployment capability
     */
    function deployMultiChain() external view {
        console2.log("=== MULTI-CHAIN DEPLOYMENT GUIDE ===");
        console2.log("");
        
        // Ethereum Mainnet
        console2.log("1. ETHEREUM MAINNET:");
        console2.log("   forge script script/Deploy.s.sol:DeployScript --rpc-url mainnet --broadcast --verify");
        console2.log("");
        
        // Base
        console2.log("2. BASE:");
        console2.log("   forge script script/Deploy.s.sol:DeployScript --rpc-url base --broadcast --verify");
        console2.log("");
        
        // Polygon
        console2.log("3. POLYGON:");
        console2.log("   forge script script/Deploy.s.sol:DeployScript --rpc-url polygon --broadcast --verify");
        console2.log("");
        
        // Arbitrum
        console2.log("4. ARBITRUM:");
        console2.log("   forge script script/Deploy.s.sol:DeployScript --rpc-url arbitrum --broadcast --verify");
        console2.log("");
        
        // Optimism
        console2.log("5. OPTIMISM:");
        console2.log("   forge script script/Deploy.s.sol:DeployScript --rpc-url optimism --broadcast --verify");
        console2.log("");
        
        // Scroll
        console2.log("6. SCROLL:");
        console2.log("   forge script script/Deploy.s.sol:DeployScript --rpc-url scroll --broadcast --verify");
        console2.log("");

        // BSC
        console2.log("7. BSC:");
        console2.log("   forge script script/Deploy.s.sol:DeployScript --rpc-url bsc --broadcast --verify --etherscan-api-key $BSCSCAN_API_KEY");
        console2.log("");
        
        // Testnets
        console2.log("=== TESTNET DEPLOYMENTS ===");
        console2.log("Sepolia: forge script script/Deploy.s.sol:DeployScript --rpc-url sepolia --broadcast --verify");
        console2.log("Base Sepolia: forge script script/Deploy.s.sol:DeployScript --rpc-url base_sepolia --broadcast --verify");
        console2.log("BSC Testnet: forge script script/Deploy.s.sol:DeployScript --rpc-url bsc_testnet --broadcast --verify --etherscan-api-key $BSCSCAN_API_KEY");
        console2.log("");
        
        console2.log("Note: Make sure to set the following environment variables:");
        console2.log("- PRIVATE_KEY");
        console2.log("- ETHERSCAN_API_KEY (for Ethereum)");
        console2.log("- BASESCAN_API_KEY (for Base)");
        console2.log("- POLYGONSCAN_API_KEY (for Polygon)");
        console2.log("- ARBISCAN_API_KEY (for Arbitrum)");
        console2.log("- OPTIMISTIC_ETHERSCAN_API_KEY (for Optimism)");
        console2.log("- SCROLLSCAN_API_KEY (for Scroll)");
    }

    /*//////////////////////////////////////////////////////////////
                            HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _setupChainConfigs() internal {
        // Mainnets
        chainConfigs[1] = ChainConfig({
            chainId: 1,
            name: "Ethereum",
            rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/",
            explorerUrl: "https://etherscan.io",
            isTestnet: false
        });
        
        chainConfigs[8453] = ChainConfig({
            chainId: 8453,
            name: "Base",
            rpcUrl: "https://mainnet.base.org",
            explorerUrl: "https://basescan.org",
            isTestnet: false
        });
        
        chainConfigs[137] = ChainConfig({
            chainId: 137,
            name: "Polygon",
            rpcUrl: "https://polygon-rpc.com",
            explorerUrl: "https://polygonscan.com",
            isTestnet: false
        });
        
        chainConfigs[42161] = ChainConfig({
            chainId: 42161,
            name: "Arbitrum",
            rpcUrl: "https://arb1.arbitrum.io/rpc",
            explorerUrl: "https://arbiscan.io",
            isTestnet: false
        });
        
        chainConfigs[10] = ChainConfig({
            chainId: 10,
            name: "Optimism",
            rpcUrl: "https://mainnet.optimism.io",
            explorerUrl: "https://optimistic.etherscan.io",
            isTestnet: false
        });
        
        chainConfigs[534352] = ChainConfig({
            chainId: 534352,
            name: "Scroll",
            rpcUrl: "https://rpc.scroll.io",
            explorerUrl: "https://scrollscan.com",
            isTestnet: false
        });
        
        chainConfigs[324] = ChainConfig({
            chainId: 324,
            name: "zkSync Era",
            rpcUrl: "https://mainnet.era.zksync.io",
            explorerUrl: "https://explorer.zksync.io",
            isTestnet: false
        });

        // BSC Mainnet
        chainConfigs[56] = ChainConfig({
            chainId: 56,
            name: "BSC",
            rpcUrl: "https://bsc-dataseed.binance.org/",
            explorerUrl: "https://bscscan.com",
            isTestnet: false
        });
        
        // Testnets
        chainConfigs[11155111] = ChainConfig({
            chainId: 11155111,
            name: "Sepolia",
            rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/",
            explorerUrl: "https://sepolia.etherscan.io",
            isTestnet: true
        });
        
        chainConfigs[84532] = ChainConfig({
            chainId: 84532,
            name: "Base Sepolia",
            rpcUrl: "https://sepolia.base.org",
            explorerUrl: "https://sepolia.basescan.org",
            isTestnet: true
        });

        // BSC Testnet
        chainConfigs[97] = ChainConfig({
            chainId: 97,
            name: "BSC Testnet",
            rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            explorerUrl: "https://testnet.bscscan.com",
            isTestnet: true
        });
    }

    function _logDeployment(address dutchBasar, address factory, address deployer) internal view {
        ChainConfig memory chainConfig = chainConfigs[block.chainid];
        
        console2.log("=== DEPLOYMENT SUCCESSFUL ===");
        console2.log("Chain:", chainConfig.name);
        console2.log("Chain ID:", block.chainid);
        console2.log("Deployer:", deployer);
        console2.log("DutchBasar:", dutchBasar);
        console2.log("Factory:", factory);
        console2.log("Explorer:", string.concat(chainConfig.explorerUrl, "/address/", _addressToString(dutchBasar)));
        console2.log("");
        
        console2.log("=== CONTRACT VERIFICATION ===");
        console2.log("DutchBasar verification:");
        console2.log(string.concat("forge verify-contract ", _addressToString(dutchBasar), " src/DutchBasar.sol:DutchBasar --chain-id ", vm.toString(block.chainid)));
        console2.log("");
        console2.log("Factory verification:");
        console2.log(string.concat("forge verify-contract ", _addressToString(factory), " src/DutchBasarFactory.sol:DutchBasarFactory --chain-id ", vm.toString(block.chainid)));
        console2.log("");
        
        console2.log("=== NEXT STEPS ===");
        console2.log("1. Configure auction parameters");
        console2.log("2. Set up allowlist (if needed)");
        console2.log("3. Update frontend contract addresses");
        console2.log("4. Test minting functionality");
        console2.log("5. Deploy subgraph for indexing");
    }

    function _saveDeploymentAddresses(address dutchBasar, address factory) internal {
        string memory chainId = vm.toString(block.chainid);
        string memory deploymentData = string.concat(
            "{\n",
            '  "chainId": ', chainId, ',\n',
            '  "dutchBasar": "', _addressToString(dutchBasar), '",\n',
            '  "factory": "', _addressToString(factory), '",\n',
            '  "deployer": "', _addressToString(msg.sender), '",\n',
            '  "timestamp": ', vm.toString(block.timestamp), '\n',
            "}"
        );
        
        string memory filename = string.concat("deployments/", chainId, ".json");
        vm.writeFile(filename, deploymentData);
        
        console2.log("Deployment addresses saved to:", filename);
    }

    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory data = abi.encodePacked(addr);
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < data.length; i++) {
            str[2 + i * 2] = alphabet[uint256(uint8(data[i] >> 4))];
            str[3 + i * 2] = alphabet[uint256(uint8(data[i] & 0x0f))];
        }
        return string(str);
    }

    /*//////////////////////////////////////////////////////////////
                        CONFIGURATION FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Configure auction after deployment
     * @param contractAddress Address of deployed DutchBasar contract
     */
    function configureAuction(address contractAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        DutchBasar dutchBasar = DutchBasar(contractAddress);
        
        // Configure auction with example parameters
        dutchBasar.configureAuction(
            1 ether,        // Start price: 1 ETH
            0.1 ether,      // End price: 0.1 ETH
            uint64(block.timestamp + 3600),  // Start in 1 hour
            uint64(block.timestamp + 3600 + 86400), // End in 25 hours
            100             // Price decay rate
        );
        
        // Configure mint parameters
        dutchBasar.configureMint(
            10000,  // Max supply
            5,      // Max per wallet (allowlist)
            10      // Max per transaction (public)
        );
        
        vm.stopBroadcast();
        
        console2.log("Auction configured for contract:", contractAddress);
        console2.log("Start price: 1 ETH");
        console2.log("End price: 0.1 ETH");
        console2.log("Max supply: 10,000");
    }

    /**
     * @notice Set up allowlist with Merkle root
     * @param contractAddress Address of deployed DutchBasar contract
     * @param merkleRoot Merkle root for allowlist
     */
    function setupAllowlist(address contractAddress, bytes32 merkleRoot) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        DutchBasar dutchBasar = DutchBasar(contractAddress);
        dutchBasar.configureAllowlist(merkleRoot);
        
        vm.stopBroadcast();
        
        console2.log("Allowlist configured for contract:", contractAddress);
        console2.log("Merkle root:", vm.toString(merkleRoot));
    }

    /*//////////////////////////////////////////////////////////////
                            UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get deployment configuration for current chain
     */
    function getChainConfig() external view returns (ChainConfig memory) {
        return chainConfigs[block.chainid];
    }

    /**
     * @notice Estimate deployment costs
     */
    function estimateDeploymentCosts() external view {
        console2.log("=== DEPLOYMENT COST ESTIMATES ===");
        console2.log("");
        
        // Gas estimates based on our test results
        uint256 dutchBasarGas = 2_800_000;
        uint256 factoryGas = 2_600_000;
        
        console2.log("DutchBasar Contract:");
        console2.log("  Gas required: ~", dutchBasarGas);
        console2.log("  At 20 gwei: ~", (dutchBasarGas * 20) / 1e9, " ETH");
        console2.log("  At 50 gwei: ~", (dutchBasarGas * 50) / 1e9, " ETH");
        console2.log("");
        
        console2.log("Factory Contract:");
        console2.log("  Gas required: ~", factoryGas);
        console2.log("  At 20 gwei: ~", (factoryGas * 20) / 1e9, " ETH");
        console2.log("  At 50 gwei: ~", (factoryGas * 50) / 1e9, " ETH");
        console2.log("");
        
        console2.log("Total deployment cost (both contracts):");
        console2.log("  At 20 gwei: ~", ((dutchBasarGas + factoryGas) * 20) / 1e9, " ETH");
        console2.log("  At 50 gwei: ~", ((dutchBasarGas + factoryGas) * 50) / 1e9, " ETH");
    }

    /**
     * @notice Verify contracts on block explorer
     * @param dutchBasarAddress Address of DutchBasar contract
     * @param factoryAddress Address of Factory contract
     */
    function verifyContracts(address dutchBasarAddress, address factoryAddress) external view {
        console2.log("=== CONTRACT VERIFICATION COMMANDS ===");
        console2.log("");
        
        console2.log("DutchBasar Contract:");
        console2.log("forge verify-contract", _addressToString(dutchBasarAddress), "src/DutchBasar.sol:DutchBasar --chain-id", block.chainid);
        console2.log("");
        
        console2.log("Factory Contract:");
        console2.log("forge verify-contract", _addressToString(factoryAddress), "src/DutchBasarFactory.sol:DutchBasarFactory --chain-id", block.chainid);
        console2.log("");
        
        console2.log("Make sure you have the appropriate API key set:");
        ChainConfig memory chainConfig = chainConfigs[block.chainid];
        console2.log("Chain:", chainConfig.name);
        console2.log("Explorer:", chainConfig.explorerUrl);
    }
}