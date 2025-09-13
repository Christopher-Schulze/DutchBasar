import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cn"
import { TrendingUp, Activity, Users, DollarSign } from "lucide-react"

interface AnalyticsChartProps {
  className?: string
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ className }) => {
  // Mock data for price history chart
  const priceData = [
    { time: "00:00", price: 0.15, volume: 0 },
    { time: "04:00", price: 0.14, volume: 12 },
    { time: "08:00", price: 0.12, volume: 28 },
    { time: "12:00", price: 0.10, volume: 45 },
    { time: "16:00", price: 0.08, volume: 67 },
    { time: "20:00", price: 0.08, volume: 89 },
    { time: "Now", price: 0.08, volume: 102 }
  ]

  const maxPrice = Math.max(...priceData.map(d => d.price))
  const maxVolume = Math.max(...priceData.map(d => d.volume))

  return (
    <motion.div
      className={cn(
        "relative p-8 bg-gradient-to-br from-white/95 via-white/90 to-dutch-cream/30 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-dutch-navy/30 backdrop-blur-xl rounded-3xl border border-dutch-teal/20 shadow-2xl overflow-hidden",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      whileHover={{ y: -2 }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/10 to-amber-500/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-dutch-navy dark:text-dutch-cream">
              Live Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Price Discovery & Volume Metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-600">Real-time</span>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative h-48 mb-6 bg-gradient-to-b from-dutch-cream/10 to-transparent dark:from-dutch-navy/10 rounded-xl p-4">
          <svg className="w-full h-full" viewBox="0 0 400 160">
            {/* Grid lines */}
            {[0, 40, 80, 120].map(y => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2,2" />
            ))}
            
            {/* Volume bars */}
            {priceData.map((point, i) => (
              <motion.rect
                key={`vol-${i}`}
                x={i * 57 + 10}
                y={160 - (point.volume / maxVolume) * 80}
                width="40"
                height={(point.volume / maxVolume) * 80}
                fill="url(#volumeGradient)"
                opacity="0.3"
                initial={{ height: 0 }}
                animate={{ height: (point.volume / maxVolume) * 80 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            ))}
            
            {/* Price line */}
            <motion.polyline
              points={priceData.map((point, i) => 
                `${i * 57 + 30},${160 - (point.price / maxPrice) * 140}`
              ).join(' ')}
              fill="none"
              stroke="url(#priceGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            {/* Price points */}
            {priceData.map((point, i) => (
              <motion.circle
                key={`point-${i}`}
                cx={i * 57 + 30}
                cy={160 - (point.price / maxPrice) * 140}
                r="4"
                fill="white"
                stroke="url(#priceGradient)"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 + 0.5 }}
              />
            ))}
            
            {/* Gradients */}
            <defs>
              <linearGradient id="priceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-500">
            {priceData.map((point, i) => (
              <span key={i} className="text-center">{point.time}</span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-900/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Current Price</span>
            </div>
            <div className="text-xl font-bold text-dutch-navy dark:text-dutch-cream">0.08 ETH</div>
            <div className="text-xs text-green-600">-46.7% from start</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">24h Volume</span>
            </div>
            <div className="text-xl font-bold text-dutch-navy dark:text-dutch-cream">8.16 ETH</div>
            <div className="text-xs text-gray-500">102 mints</div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-dutch-cream/20 dark:bg-dutch-navy/20 rounded-xl">
            <Users className="w-5 h-5 mx-auto mb-2 text-dutch-teal" />
            <div className="text-sm font-bold text-dutch-navy dark:text-dutch-cream">342</div>
            <div className="text-xs text-gray-500">Holders</div>
          </div>
          <div className="text-center p-4 bg-dutch-cream/20 dark:bg-dutch-navy/20 rounded-xl">
            <DollarSign className="w-5 h-5 mx-auto mb-2 text-dutch-orange" />
            <div className="text-sm font-bold text-dutch-navy dark:text-dutch-cream">0.05</div>
            <div className="text-xs text-gray-500">Floor Price</div>
          </div>
          <div className="text-center p-4 bg-dutch-cream/20 dark:bg-dutch-navy/20 rounded-xl">
            <Activity className="w-5 h-5 mx-auto mb-2 text-pink-500" />
            <div className="text-sm font-bold text-dutch-navy dark:text-dutch-cream">2h 34m</div>
            <div className="text-xs text-gray-500">Time Left</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export { AnalyticsChart }
