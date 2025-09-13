'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Wallet, Shield, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useDutchBasar } from '@/hooks/useDutchBasar';
import { Button } from '@/components/ui/Button';
import { formatEther, formatNumber, cn } from '@/lib/utils';
import { PHASE_NAMES } from '@/lib/contracts';

interface MintSectionProps {
  className?: string;
}

export function MintSection({ className }: MintSectionProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  // Deduplicate connectors (RainbowKit/Wagmi can expose WalletConnect multiple times in dev)
  const uniqueConnectors = connectors.filter((c, i, arr) =>
    arr.findIndex((x) => x.id === c.id && x.name === c.name) === i
  );
  const { disconnect } = useDisconnect();
  
  const {
    currentPrice,
    currentPhase,
    mintInfo,
    userBalance,
    allowlistMinted,
    remainingSupply,
    publicMint,
    allowlistMint,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  } = useDutchBasar();

  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset success state when new transaction starts
  useEffect(() => {
    if (isPending) {
      setShowSuccess(false);
    }
  }, [isPending]);

  // Show success animation when transaction confirms
  useEffect(() => {
    if (isConfirmed) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [isConfirmed]);

  const maxQuantity = mintInfo?.maxPerTransaction || 10;
  const totalCost = currentPrice ? (currentPrice as bigint) * BigInt(quantity) : 0n;
  const canMint = currentPhase === 1 || currentPhase === 2;
  const isAllowlistPhase = currentPhase === 1;
  const isPublicPhase = currentPhase === 2;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(maxQuantity, prev + delta)));
  };

  const handleMint = async () => {
    if (!canMint || !currentPrice) return;

    try {
      if (isPublicPhase) {
        await publicMint(quantity);
      } else if (isAllowlistPhase) {
        // For demo purposes, using empty proof - in real app, this would come from allowlist data
        await allowlistMint({
          quantity,
          maxAllowed: 5,
          proof: [],
        });
      }
    } catch (err) {
      console.error('Mint failed:', err);
    }
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border border-white/20 shadow-2xl",
          "dark:from-gray-900/90 dark:to-gray-800/90 dark:border-gray-700/30",
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        
        <div className="relative p-8 text-center">
          <div className="mb-6">
            <Wallet className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your wallet to participate in the Dutch auction
            </p>
          </div>
          
          <div className="space-y-3">
            {uniqueConnectors.map((connector, idx) => (
              <Button
                key={`${connector.id}-${idx}`}
                onClick={() => connect({ connector })}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Connect {connector.name}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border border-white/20 shadow-2xl",
        "dark:from-gray-900/90 dark:to-gray-800/90 dark:border-gray-700/30",
        className
      )}
    >
      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/10 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="bg-green-500 text-white p-6 rounded-full"
            >
              <CheckCircle className="w-12 h-12" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5" />
      
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mint NFTs
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isAllowlistPhase ? 'Allowlist Phase' : isPublicPhase ? 'Public Phase' : 'Not Available'}
            </p>
          </div>
          
          {isAllowlistPhase && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-600 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              Allowlist
            </div>
          )}
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Balance</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {formatNumber(userBalance)} NFTs
            </div>
          </div>
          
          {isAllowlistPhase && (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Allowlist Minted</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatNumber(allowlistMinted)} / {mintInfo?.maxPerWallet || 0}
              </div>
            </div>
          )}
        </div>

        {/* Quantity Selector */}
        {canMint && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quantity
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Max: {maxQuantity}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
                    className="w-full text-center text-2xl font-bold bg-white/50 dark:bg-gray-800/50 border border-white/20 rounded-2xl py-4 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl pointer-events-none" />
                </div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= maxQuantity}
                className="rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quick quantity buttons */}
            <div className="flex gap-2 mt-4">
              {[1, 3, 5, maxQuantity].filter((q, i, arr) => arr.indexOf(q) === i && q <= maxQuantity).map((q) => (
                <Button
                  key={q}
                  variant={quantity === q ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setQuantity(q)}
                  className="flex-1"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        {canMint && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Price per NFT</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatEther((currentPrice ?? 0n) as bigint)} ETH
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Quantity</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {quantity}
                </span>
              </div>
              
              <div className="border-t border-blue-200/50 dark:border-blue-700/50 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">Total Cost</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatEther(totalCost)} ETH
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mint Button */}
        {canMint ? (
          <div className="space-y-4">
            <Button
              onClick={handleMint}
              disabled={!canMint || isPending || isConfirming || remainingSupply < quantity}
              loading={isPending || isConfirming}
              variant="premium"
              size="xl"
              className="w-full"
            >
              {isPending ? (
                "Preparing Transaction..."
              ) : isConfirming ? (
                "Confirming..."
              ) : remainingSupply < quantity ? (
                "Insufficient Supply"
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Mint {quantity} NFT{quantity > 1 ? 's' : ''}
                </>
              )}
            </Button>
            
            {/* Transaction status */}
            <AnimatePresence>
              {(isPending || isConfirming || error) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl border"
                >
                  {isPending && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Waiting for wallet confirmation...</span>
                    </div>
                  )}
                  
                  {isConfirming && (
                    <div className="flex items-center gap-3 text-yellow-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Transaction confirming...</span>
                    </div>
                  )}
                  
                  {error && (
                    <div className="flex items-center gap-3 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span>Transaction failed: {error.message}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Transaction hash */}
            {hash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <a
                  href={`https://etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  View on Etherscan
                </a>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              {currentPhase === 0 ? 'Auction not started' : 'Auction ended'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Current phase: {PHASE_NAMES[currentPhase]}
            </div>
          </div>
        )}

        {/* Wallet info */}
        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {userBalance} NFTs owned
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => disconnect()}
              className="text-red-500 hover:text-red-600"
            >
              Disconnect
            </Button>
          </div>
        </div>

        {/* Phase-specific tips */}
        {isAllowlistPhase && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Allowlist Phase Active
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Only allowlisted addresses can mint during this phase. Public minting starts later.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {isPublicPhase && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50"
          >
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                  Public Minting Open
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Anyone can mint now. Price decreases over time - mint early for better deals!
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}