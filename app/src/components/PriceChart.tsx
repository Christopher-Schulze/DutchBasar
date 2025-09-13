'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, Activity, Zap } from 'lucide-react';
import { useRealTimePrice } from '@/hooks/useDutchBasar';
import { formatEther, cn } from '@/lib/utils';

interface PriceChartProps {
  className?: string;
}

export function PriceChart({ className }: PriceChartProps) {
  const { currentPrice, priceHistory, priceVelocity, auctionInfo } = useRealTimePrice();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 400, height: 200 });
  const [isAnimating, setIsAnimating] = useState(false);

  // Responsive chart sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current?.parentElement) {
        const parent = canvasRef.current.parentElement;
        setChartDimensions({
          width: parent.clientWidth - 32, // Account for padding
          height: Math.min(parent.clientWidth * 0.4, 300)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Advanced chart rendering with smooth animations
  useEffect(() => {
    if (!canvasRef.current || priceHistory.length < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = chartDimensions.width * dpr;
    canvas.height = chartDimensions.height * dpr;
    canvas.style.width = `${chartDimensions.width}px`;
    canvas.style.height = `${chartDimensions.height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, chartDimensions.width, chartDimensions.height);

    // Chart configuration
    const padding = 40;
    const chartWidth = chartDimensions.width - padding * 2;
    const chartHeight = chartDimensions.height - padding * 2;

    // Calculate price range
    const prices = priceHistory.map(p => Number(p.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Time range
    // const timeRange = priceHistory[priceHistory.length - 1].timestamp - priceHistory[0].timestamp;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, padding, 0, chartHeight + padding);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
    gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.6)');
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0.4)');

    // Draw grid lines
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(chartWidth + padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (chartWidth * i) / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, chartHeight + padding);
      ctx.stroke();
    }

    // Draw price line with smooth curves
    if (priceHistory.length > 1) {
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Create smooth curve using quadratic curves
      ctx.beginPath();
      
      const points = priceHistory.map((point, index) => {
        const x = padding + (chartWidth * index) / (priceHistory.length - 1);
        const y = padding + chartHeight - ((Number(point.price) - minPrice) / priceRange) * chartHeight;
        return { x, y };
      });

      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currentPoint = points[i];
        
        if (i === 1) {
          ctx.lineTo(currentPoint.x, currentPoint.y);
        } else {
          const cpx = (prevPoint.x + currentPoint.x) / 2;
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, currentPoint.y);
        }
      }

      ctx.stroke();

      // Fill area under curve
      ctx.lineTo(points[points.length - 1].x, chartHeight + padding);
      ctx.lineTo(padding, chartHeight + padding);
      ctx.closePath();
      
      const areaGradient = ctx.createLinearGradient(0, padding, 0, chartHeight + padding);
      areaGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      areaGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
      ctx.fillStyle = areaGradient;
      ctx.fill();

      // Draw data points
      points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = index === points.length - 1 ? '#ef4444' : '#3b82f6';
        ctx.fill();
        
        // Glow effect for current price
        if (index === points.length - 1) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.fill();
        }
      });
    }

    // Draw price labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * (5 - i)) / 5;
      const y = padding + (chartHeight * i) / 5;
      ctx.fillText(`${(price / 1e18).toFixed(3)} ETH`, padding - 10, y + 4);
    }

    setIsAnimating(false);
  }, [priceHistory, chartDimensions]);

  // Trigger animation on price change
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentPrice]);

  // (Removed unused price change calculations to satisfy ESLint)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border border-white/20 shadow-2xl",
        "dark:from-gray-900/90 dark:to-gray-800/90 dark:border-gray-700/30",
        className
      )}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      
      {/* Pulse animation for live updates */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full"
          />
        )}
      </AnimatePresence>

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Live Price Chart
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
              </div>
              
              {priceVelocity !== 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    priceVelocity < 0 
                      ? "bg-green-500/20 text-green-600" 
                      : "bg-red-500/20 text-red-600"
                  )}
                >
                  {priceVelocity < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  <span>
                    {Math.abs(priceVelocity / 1e18).toFixed(6)} ETH/s
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative mb-6">
          <canvas
            ref={canvasRef}
            className="w-full rounded-2xl bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20"
            style={{ 
              filter: isAnimating ? 'brightness(1.1) saturate(1.2)' : 'none',
              transition: 'filter 0.3s ease'
            }}
          />
          
          {/* Chart overlay effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 dark:to-black/10 rounded-2xl pointer-events-none" />
        </div>

        {/* Chart Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Data Points</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {priceHistory.length}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Total Drop</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {auctionInfo && priceHistory.length > 0 ? (
                `${((Number(auctionInfo.startPrice) - Number(currentPrice || 0n)) / 1e18).toFixed(3)} ETH`
              ) : (
                '0.000 ETH'
              )}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Velocity</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.abs(priceVelocity / 1e18).toFixed(6)}
            </div>
          </div>
        </div>

        {/* Price prediction indicator */}
        {auctionInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Target End Price:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatEther(auctionInfo.endPrice)} ETH
              </span>
            </div>
            
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.max(0, Math.min(100, 
                    ((Number(auctionInfo.startPrice) - Number(currentPrice || 0n)) / 
                     (Number(auctionInfo.startPrice) - Number(auctionInfo.endPrice))) * 100
                  ))}%`
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Real-time updates indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-green-500 rounded-full"
          />
          <span>Updates every second • {priceHistory.length} data points collected</span>
        </div>
      </div>
    </motion.div>
  );
}