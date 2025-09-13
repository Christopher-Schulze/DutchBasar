'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fuel, Zap, TrendingDown, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useChainId, useGasPrice } from 'wagmi';
import { formatEther, formatNumber, cn } from '@/lib/utils';

interface GasOptimizationDisplayProps {
  quantity: number;
  className?: string;
}

interface GasEstimate {
  operation: string;
  gasUsed: number;
  costETH: string;
  costUSD: string;
  efficiency: 'EXCELLENT' | 'GOOD' | 'AVERAGE';
}

interface ChainInfo {
  name: string;
  gasMultiplier: number;
  avgBlockTime: number;
  color: string;
  icon: string;
}

const CHAIN_INFO: Record<number, ChainInfo> = {
  1: { name: 'Ethereum', gasMultiplier: 1.2, avgBlockTime: 12, color: 'blue', icon: '⟠' },
  56: { name: 'BNB Smart Chain', gasMultiplier: 1.05, avgBlockTime: 3, color: 'yellow', icon: '🟡' },
  97: { name: 'BSC Testnet', gasMultiplier: 1.05, avgBlockTime: 3, color: 'yellow', icon: '🟡' },
  8453: { name: 'Base', gasMultiplier: 1.1, avgBlockTime: 2, color: 'blue', icon: '🔵' },
  137: { name: 'Polygon', gasMultiplier: 1.1, avgBlockTime: 2, color: 'purple', icon: '🟣' },
  42161: { name: 'Arbitrum', gasMultiplier: 1.0, avgBlockTime: 1, color: 'blue', icon: '🔷' },
  10: { name: 'Optimism', gasMultiplier: 1.0, avgBlockTime: 2, color: 'red', icon: '🔴' },
  534352: { name: 'Scroll', gasMultiplier: 1.1, avgBlockTime: 3, color: 'orange', icon: '🟠' },
  324: { name: 'zkSync Era', gasMultiplier: 1.0, avgBlockTime: 1, color: 'gray', icon: '⚫' },
};

const BASE_GAS_ESTIMATES = {
  singleMint: 67000,
  batchMint5: 289000,
  batchMint10: 178000,
  allowlistMint: 44000,
};

export function GasOptimizationDisplay({ quantity, className }: GasOptimizationDisplayProps) {
  const chainId = useChainId();
  const { data: gasPrice } = useGasPrice();
  const [isExpanded, setIsExpanded] = useState(false);
  const [ethPrice, setEthPrice] = useState(2000); // Default ETH price

  const chainInfo = CHAIN_INFO[chainId] || CHAIN_INFO[1];

  // Fetch ETH price (simplified for demo)
  useEffect(() => {
    // In production, fetch from CoinGecko or similar API
    setEthPrice(2000);
  }, []);

  // Calculate gas estimates based on quantity and chain
  const calculateGasEstimates = (): GasEstimate[] => {
    const currentGasPrice = gasPrice || BigInt(20e9); // 20 gwei default
    
    const estimates: GasEstimate[] = [];

    if (quantity === 1) {
      const gasUsed = Math.floor(BASE_GAS_ESTIMATES.singleMint * chainInfo.gasMultiplier);
      const costWei = BigInt(gasUsed) * currentGasPrice;
      const costETH = formatEther(costWei, 6);
      const costUSD = (Number(costETH) * ethPrice).toFixed(2);
      
      estimates.push({
        operation: 'Single Mint',
        gasUsed,
        costETH,
        costUSD,
        efficiency: gasUsed < 70000 ? 'EXCELLENT' : gasUsed < 100000 ? 'GOOD' : 'AVERAGE'
      });
    } else if (quantity <= 5) {
      const gasUsed = Math.floor(BASE_GAS_ESTIMATES.batchMint5 * chainInfo.gasMultiplier);
      const costWei = BigInt(gasUsed) * currentGasPrice;
      const costETH = formatEther(costWei, 6);
      const costUSD = (Number(costETH) * ethPrice).toFixed(2);
      
      estimates.push({
        operation: `Batch Mint (${quantity})`,
        gasUsed,
        costETH,
        costUSD,
        efficiency: gasUsed < 300000 ? 'EXCELLENT' : gasUsed < 400000 ? 'GOOD' : 'AVERAGE'
      });
    } else {
      const gasUsed = Math.floor(BASE_GAS_ESTIMATES.batchMint10 * chainInfo.gasMultiplier);
      const costWei = BigInt(gasUsed) * currentGasPrice;
      const costETH = formatEther(costWei, 6);
      const costUSD = (Number(costETH) * ethPrice).toFixed(2);
      
      estimates.push({
        operation: `Large Batch (${quantity})`,
        gasUsed,
        costETH,
        costUSD,
        efficiency: gasUsed < 200000 ? 'EXCELLENT' : gasUsed < 300000 ? 'GOOD' : 'AVERAGE'
      });
    }

    // Add comparison with individual mints
    if (quantity > 1) {
      const individualGas = Math.floor(BASE_GAS_ESTIMATES.singleMint * quantity * chainInfo.gasMultiplier);
      const individualCostWei = BigInt(individualGas) * currentGasPrice;
      const individualCostETH = formatEther(individualCostWei, 6);
      const individualCostUSD = (Number(individualCostETH) * ethPrice).toFixed(2);
      
      estimates.push({
        operation: `${quantity} Individual Mints`,
        gasUsed: individualGas,
        costETH: individualCostETH,
        costUSD: individualCostUSD,
        efficiency: 'AVERAGE'
      });
    }

    return estimates;
  };

  const gasEstimates = calculateGasEstimates();
  const primaryEstimate = gasEstimates[0];
  const savings = gasEstimates.length > 1 
    ? ((gasEstimates[1].gasUsed - gasEstimates[0].gasUsed) / gasEstimates[1].gasUsed) * 100
    : 0;

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
      case 'EXCELLENT': return 'text-green-600 bg-green-500/20 border-green-500/30';
      case 'GOOD': return 'text-blue-600 bg-blue-500/20 border-blue-500/30';
      default: return 'text-yellow-600 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border border-white/20 shadow-2xl",
        "dark:from-gray-900/90 dark:to-gray-800/90 dark:border-gray-700/30",
        className
      )}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Gas Optimization
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{chainInfo.icon} {chainInfo.name}</span>
                <span>•</span>
                <span>{gasPrice ? `${(Number(gasPrice) / 1e9).toFixed(1)} gwei` : 'Loading...'}</span>
              </div>
            </div>
          </div>

          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold border",
            getEfficiencyColor(primaryEstimate.efficiency)
          )}>
            {primaryEstimate.efficiency}
          </div>
        </div>

        {/* Primary Gas Estimate */}
        <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-200/50 dark:border-yellow-700/50">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Gas</div>
              <motion.div
                key={primaryEstimate.gasUsed}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                {formatNumber(primaryEstimate.gasUsed)}
              </motion.div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(primaryEstimate.gasUsed / quantity).toFixed(0)} gas per NFT
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Cost</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {primaryEstimate.costETH} ETH
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ~${primaryEstimate.costUSD} USD
              </div>
            </div>
          </div>

          {/* Savings indicator */}
          {savings > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400"
            >
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">
                {savings.toFixed(1)}% gas savings vs individual mints
              </span>
            </motion.div>
          )}
        </div>

        {/* Expandable detailed breakdown */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Detailed Gas Analysis
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-3"
              >
                {gasEstimates.map((estimate, index) => (
                  <motion.div
                    key={estimate.operation}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {estimate.operation}
                      </span>
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold border",
                        getEfficiencyColor(estimate.efficiency)
                      )}>
                        {estimate.efficiency}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Gas</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatNumber(estimate.gasUsed)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">ETH</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {estimate.costETH}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">USD</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ${estimate.costUSD}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* ERC-721A Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50"
                >
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-semibold text-green-700 dark:text-green-300 mb-1">
                        ERC-721A Optimization
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 space-y-1">
                        <div>• Batch minting reduces gas cost per token</div>
                        <div>• Storage optimization saves ~40% gas vs standard ERC-721</div>
                        <div>• {chainInfo.name} specific optimizations applied</div>
                        {quantity > 1 && (
                          <div>• You&apos;re saving ~{savings.toFixed(1)}% with batch minting</div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Network-specific optimizations */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{chainInfo.icon}</span>
                    <div>
                      <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                        {chainInfo.name} Optimizations
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                        <div>• Gas multiplier: {chainInfo.gasMultiplier}x</div>
                        <div>• Average block time: {chainInfo.avgBlockTime}s</div>
                        {chainId === 8453 && (
                          <>
                            <div>• Base L2: ~95% cheaper than Ethereum</div>
                            <div>• Instant finality with OP Stack</div>
                          </>
                        )}
                        {chainId === 137 && (
                          <>
                            <div>• Polygon: Ultra-low fees (~$0.01)</div>
                            <div>• Fast 2-second block times</div>
                          </>
                        )}
                        {chainId === 1 && (
                          <>
                            <div>• Ethereum L1: Maximum security</div>
                            <div>• Optimized for gas efficiency</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick gas tips */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gas Optimization Tips
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>• Mint multiple NFTs in one transaction to save gas</div>
                <div>• Use {chainInfo.name === 'Ethereum' ? 'Base or Polygon' : 'this network'} for lower fees</div>
                <div>• Monitor gas prices and mint during off-peak hours</div>
                <div>• ERC-721A makes batch minting extremely efficient</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time gas price indicator */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full"
            />
            <span>Real-time gas price: {gasPrice ? `${(Number(gasPrice) / 1e9).toFixed(1)} gwei` : 'Loading...'}</span>
          </div>
          <span>ETH: ${ethPrice.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}