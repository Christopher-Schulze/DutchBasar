import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cn"

interface PriceDisplayProps {
  currentPrice: string
  startPrice?: string
  endPrice?: string
  currency?: string
  trend?: "up" | "down" | "stable"
  className?: string
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  currentPrice,
  startPrice,
  endPrice,
  currency = "ETH",
  trend = "down",
  className
}) => {
  const trendColors = {
    up: "from-green-500 to-emerald-600",
    down: "from-dutch-orange to-dutch-tulip",
    stable: "from-dutch-teal to-dutch-navy"
  }

  const trendIcons = {
    up: "↗",
    down: "↘",
    stable: "→"
  }

  return (
    <div className={cn("relative", className)}>
      {/* Main Price Display */}
      <motion.div 
        className="relative p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-dutch-teal/20 shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow Effect */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-10 rounded-2xl blur-xl",
          trendColors[trend]
        )} />
        
        <div className="relative z-10">
          {/* Current Price */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Price</span>
              <motion.span 
                className={cn("text-lg", trend === "down" ? "text-dutch-orange" : "text-dutch-teal")}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {trendIcons[trend]}
              </motion.span>
            </div>
            <motion.div 
              className="text-4xl md:text-5xl font-black"
              key={currentPrice}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                trendColors[trend]
              )}>
                {currentPrice}
              </span>
              <span className="text-lg font-medium text-gray-600 dark:text-gray-400 ml-2">
                {currency}
              </span>
            </motion.div>
          </div>

          {/* Price Range */}
          {(startPrice || endPrice) && (
            <div className="flex items-center justify-between pt-4 border-t border-dutch-teal/10">
              {startPrice && (
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Start</div>
                  <div className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream">
                    {startPrice} {currency}
                  </div>
                </div>
              )}
              
              {startPrice && endPrice && (
                <div className="flex-1 mx-4">
                  <div className="relative h-2 bg-dutch-cream/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <motion.div 
                      className={cn("h-full bg-gradient-to-r rounded-full", trendColors[trend])}
                      initial={{ width: "100%" }}
                      animate={{ width: "30%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              )}
              
              {endPrice && (
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">End</div>
                  <div className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream">
                    {endPrice} {currency}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export { PriceDisplay }
