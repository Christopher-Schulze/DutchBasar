'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';


export function PerformanceMonitor({ className }: { className?: string }) {
  const [metrics, setMetrics] = useState<Record<string, number | string>>({});
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const formatBytes = (bytes: number, decimals = 2): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i] as string;
    };

    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Memory usage (if available)
        interface PerformanceWithMemory extends Performance {
          memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
        const perf = performance as PerformanceWithMemory;
        const memoryValue = perf.memory 
          ? formatBytes(perf.memory.usedJSHeapSize)
          : '0 Bytes';

        // Navigation timing
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navTiming ? Math.round(navTiming.loadEventEnd - navTiming.loadEventStart) : 0;
        const renderTime = navTiming ? Math.round(navTiming.domComplete - navTiming.domInteractive) : 0;

        setMetrics({
          fps,
          memory: memoryValue,
          loadTime,
          renderTime,
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 p-2 bg-black/80 text-white rounded-lg backdrop-blur-sm"
      >
        <Activity className="w-4 h-4" />
      </button>

      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "fixed bottom-16 right-4 z-50 p-4 bg-black/90 text-white rounded-lg backdrop-blur-sm min-w-[200px]",
            className
          )}
        >
          <h3 className="text-xs font-bold mb-3 text-gray-400">PERFORMANCE</h3>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                FPS
              </span>
              <span className={cn(
                "font-mono",
                (typeof metrics.fps === 'number' && metrics.fps >= 50) ? '🟢' : (typeof metrics.fps === 'number' && metrics.fps >= 30) ? '🟡' : '🔴',
                (typeof metrics.fps === 'number' && metrics.fps >= 55) ? "text-green-400" : 
                (typeof metrics.fps === 'number' && metrics.fps >= 30) ? "text-yellow-400" : "text-red-400"
              )}>
                {metrics.fps}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Memory
              </span>
              <span className="font-mono text-blue-400">
                {metrics.memory} MB
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Load
              </span>
              <span className="font-mono text-purple-400">
                {metrics.loadTime} ms
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Render
              </span>
              <span className="font-mono text-orange-400">
                {metrics.renderTime} ms
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
