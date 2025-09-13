// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {DutchBasar} from "../DutchBasar.sol";

/**
 * @title DutchBasarBridge
 * @notice Cross-chain NFT bridge using LayerZero
 * @dev Enables NFT transfers across 8+ chains
 */
contract DutchBasarBridge {
    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    
    ILayerZeroEndpoint public immutable lzEndpoint;
    DutchBasar public immutable dutchBasar;
    
    mapping(uint16 => bytes) public trustedRemoteLookup;
    mapping(uint256 => bool) public bridgedTokens;
    mapping(uint256 => address) public tokenEscrow;
    
    // Chain IDs
    uint16 constant ETHEREUM = 101;
    uint16 constant BSC = 102;
    uint16 constant POLYGON = 109;
    uint16 constant ARBITRUM = 110;
    uint16 constant OPTIMISM = 111;
    uint16 constant BASE = 184;
    
    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    event TokenBridged(uint256 tokenId, uint16 dstChainId, address recipient);
    event TokenReceived(uint256 tokenId, uint16 srcChainId, address recipient);
    event TrustedRemoteSet(uint16 chainId, bytes trustedRemote);
    
    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    
    constructor(address _lzEndpoint, address _dutchBasar) {
        lzEndpoint = ILayerZeroEndpoint(_lzEndpoint);
        dutchBasar = DutchBasar(_dutchBasar);
    }
    
    /*//////////////////////////////////////////////////////////////
                        BRIDGE FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Bridge NFT to another chain
     * @dev Burns on source, mints on destination
     */
    function bridgeNFT(
        uint256 tokenId,
        uint16 dstChainId,
        address recipient
    ) external payable {
        require(dutchBasar.ownerOf(tokenId) == msg.sender, "Not owner");
        require(trustedRemoteLookup[dstChainId].length > 0, "Chain not supported");
        
        // Escrow NFT (or burn if preferred)
        dutchBasar.transferFrom(msg.sender, address(this), tokenId);
        tokenEscrow[tokenId] = msg.sender;
        bridgedTokens[tokenId] = true;
        
        // Prepare payload
        bytes memory payload = abi.encode(tokenId, recipient);
        
        // Send via LayerZero
        _lzSend(
            dstChainId,
            payload,
            payable(msg.sender),
            address(0),
            bytes(""),
            msg.value
        );
        
        emit TokenBridged(tokenId, dstChainId, recipient);
    }
    
    /**
     * @notice Receive NFT from another chain
     */
    function lzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64,
        bytes memory _payload
    ) external {
        require(msg.sender == address(lzEndpoint), "Invalid endpoint");
        require(
            keccak256(_srcAddress) == keccak256(trustedRemoteLookup[_srcChainId]),
            "Invalid source"
        );
        
        (uint256 tokenId, address recipient) = abi.decode(_payload, (uint256, address));
        
        // Mint or release from escrow
        if (tokenEscrow[tokenId] != address(0)) {
            // Release from escrow
            dutchBasar.transferFrom(address(this), recipient, tokenId);
            delete tokenEscrow[tokenId];
        } else {
            // Mint new (requires special permission)
            dutchBasar.ownerMint(recipient, 1);
        }
        
        emit TokenReceived(tokenId, _srcChainId, recipient);
    }
    
    /**
     * @notice Estimate bridge fees
     */
    function estimateBridgeFee(
        uint16 dstChainId,
        uint256 tokenId,
        address recipient
    ) external view returns (uint256 nativeFee, uint256 zroFee) {
        bytes memory payload = abi.encode(tokenId, recipient);
        return lzEndpoint.estimateFees(
            dstChainId,
            address(this),
            payload,
            false,
            bytes("")
        );
    }
    
    /*//////////////////////////////////////////////////////////////
                        ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Set trusted remote addresses
     */
    function setTrustedRemote(uint16 _chainId, bytes calldata _trustedRemote) external {
        require(msg.sender == dutchBasar.owner(), "Not authorized");
        trustedRemoteLookup[_chainId] = _trustedRemote;
        emit TrustedRemoteSet(_chainId, _trustedRemote);
    }
    
    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    function _lzSend(
        uint16 _dstChainId,
        bytes memory _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes memory _adapterParams,
        uint256 _nativeFee
    ) internal {
        lzEndpoint.send{value: _nativeFee}(
            _dstChainId,
            trustedRemoteLookup[_dstChainId],
            _payload,
            _refundAddress,
            _zroPaymentAddress,
            _adapterParams
        );
    }
}

// Simplified interface
interface ILayerZeroEndpoint {
    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;
    
    function estimateFees(
        uint16 _dstChainId,
        address _userApplication,
        bytes calldata _payload,
        bool _payInZRO,
        bytes calldata _adapterParam
    ) external view returns (uint256 nativeFee, uint256 zroFee);
}
