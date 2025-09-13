import * as React from "react"
import { motion } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/cn"

type AuctionButtonBaseProps = Omit<HTMLMotionProps<'button'>, 'ref'>

interface AuctionButtonProps extends AuctionButtonBaseProps {
  variant?: "bid" | "mint" | "withdraw" | "claim"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  children: React.ReactNode
}

const AuctionButton = React.forwardRef<HTMLButtonElement, AuctionButtonProps>(
  ({ className, variant = "bid", size = "md", loading = false, children, disabled, ...props }, ref) => {
    const variants = {
      bid: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl border-0",
      mint: "bg-dutch-teal hover:bg-dutch-teal/90 text-white shadow-md hover:shadow-lg border-0",
      withdraw: "bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg border-0",
      claim: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg border-0"
    }

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg",
      md: "h-10 px-4 text-sm rounded-xl",
      lg: "h-12 px-6 text-base rounded-xl"
    }

    
    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-dutch-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-dutch-orange/20 to-dutch-gold/20 blur-xl" />
        </div>
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && (
            <motion.div
              className="w-3 h-3 border border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
          {children}
        </span>
      </motion.button>
    )
  }
)

AuctionButton.displayName = "AuctionButton"

export { AuctionButton }
