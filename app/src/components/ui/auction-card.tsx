import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cn"
import { PriceDisplay } from "./price-display"
import { AuctionButton } from "./auction-button"

interface AuctionCardProps {
  className?: string
  onMint?: () => void
  onQuickMint?: () => void
  onDetails?: () => void
}

const AuctionCard: React.FC<AuctionCardProps> = ({ className, onMint, onQuickMint, onDetails }) => {
  return (
    <motion.div
      className={cn(
        "relative p-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -2 }}
    >
      {/* Subtle Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-dutch-teal/5 to-dutch-navy/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-dutch-navy dark:text-dutch-cream mb-1">
              Live Dutch Auction
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-dutch-orange rounded-full animate-pulse" />
              <span className="text-sm font-medium text-dutch-teal">Phase: Public Sale</span>
            </div>
          </div>
          <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">ACTIVE</span>
          </div>
        </div>

        {/* Price Display */}
        <PriceDisplay 
          currentPrice="0.08"
          startPrice="0.15"
          endPrice="0.05"
          trend="down"
          className="mb-6"
        />

        {/* Auction Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-lg font-bold text-dutch-navy dark:text-dutch-cream">3,456</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Minted</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-lg font-bold text-dutch-navy dark:text-dutch-cream">6,544</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-lg font-bold text-dutch-teal">2h 34m</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Time Left</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-dutch-navy dark:text-dutch-cream">34.56%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-dutch-teal to-dutch-navy rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "34.56%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <AuctionButton onClick={onMint} variant="bid" size="md" className="w-full">
            Mint at Current Price
          </AuctionButton>
          <div className="grid grid-cols-2 gap-3">
            <AuctionButton onClick={onQuickMint} variant="mint" size="sm">
              Quick Mint
            </AuctionButton>
            <AuctionButton onClick={onDetails} variant="withdraw" size="sm">
              View Details
            </AuctionButton>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export { AuctionCard }
