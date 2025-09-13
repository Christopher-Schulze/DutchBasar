'use client';

import { motion } from 'framer-motion';
import { Clock, TrendingDown, Users, Zap } from 'lucide-react';
import { useDutchBasar, useRealTimePrice } from '@/hooks/useDutchBasar';
import { formatEther, formatTimeRemaining, formatNumber, formatPercentage, cn } from '@/lib/utils';
import { PHASE_NAMES } from '@/lib/contracts';
import type { AuctionInfo } from '@/lib/contracts';

interface AuctionCardProps {
  className?: string;
}

export function AuctionCard({ className }: AuctionCardProps) {
  const {
    currentPhase,
    auctionInfo,
    mintInfo,
    totalSupply,
    remainingSupply,
    timeRemaining,
    auctionProgress,
    mintProgress,
  } = useDutchBasar();

  const { currentPrice, priceVelocity } = useRealTimePrice();
  const auction = auctionInfo as AuctionInfo | undefined;

  const isActive = currentPhase === 1 || currentPhase === 2; // Allowlist or Public

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
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
      
      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <motion.div
          animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
            isActive ? "bg-green-500/20 text-green-600 border border-green-500/30" : "bg-gray-500/20 text-gray-600 border border-gray-500/30"
          )}
        >
          {PHASE_NAMES[currentPhase]}
        </motion.div>
      </div>

      <div className="relative p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
            Dutch Auction
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Premium NFT Collection with Dynamic Pricing
          </p>
        </div>

        {/* Current Price Display */}
        <div className="mb-8">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Current Price</span>
            {priceVelocity < 0 && (
              <motion.div
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center text-green-500"
              >
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs ml-1">Dropping</span>
              </motion.div>
            )}
          </div>
          
          <motion.div
            key={currentPrice?.toString()}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            {formatEther((currentPrice ?? 0n) as bigint)} ETH
          </motion.div>
          
          {auction && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Start: {formatEther((auction.startPrice ?? 0n) as bigint)} ETH</span>
              <span>•</span>
              <span>End: {formatEther((auction.endPrice ?? 0n) as bigint)} ETH</span>
            </div>
          )}
        </div>

        {/* Progress Bars */}
        <div className="space-y-6 mb-8">
          {/* Time Progress */}
          {timeRemaining !== null && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Time Remaining</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
              
              <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${auctionProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
          )}

          {/* Supply Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Minted</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatNumber(totalSupply)} / {formatNumber(mintInfo?.maxSupply || 0)}
              </span>
            </div>
            
            <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${mintProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Remaining</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatNumber(remainingSupply)}
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatPercentage(mintProgress)}
            </div>
          </div>
        </div>

        {/* Phase-specific information */}
        {currentPhase === 0 && (
          <div className="text-center py-4">
            <div className="text-gray-500 dark:text-gray-400 mb-2">Auction starts soon</div>
            {auctionInfo && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Starting at {formatEther(auctionInfo.startPrice)} ETH
              </div>
            )}
          </div>
        )}

        {currentPhase === 3 && (
          <div className="text-center py-4">
            <div className="text-red-500 font-semibold mb-2">Auction Ended</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Final price: {formatEther((currentPrice ?? 0n) as bigint)} ETH
            </div>
          </div>
        )}

        {/* Live price chart indicator */}
        {isActive && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Live Auction</span>
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-400">
                Price updates every second
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}