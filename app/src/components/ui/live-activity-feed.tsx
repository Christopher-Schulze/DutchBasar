'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingDown, 
  Zap, 
  Award
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'mint' | 'price' | 'whale' | 'holder' | 'sale' | 'gas' | 'rare' | 'stats';
  title: string;
  description: string;
  value?: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

export function LiveActivityFeed() {
  useEffect(() => {
    // Initialize with sample data
    const initialActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'mint',
        title: 'New Mint',
        description: '0x742d...8963 minted 3 NFTs',
        value: '0.42 ETH',
        timestamp: new Date(),
        icon: <Activity className="w-4 h-4" />,
        color: 'from-purple-500 to-pink-500'
      },
      {
        id: '2',
        type: 'whale',
        title: 'Whale Alert ',
        description: '0x8f3a...2b4c minted 25 NFTs',
        value: '3.5 ETH',
        timestamp: new Date(Date.now() - 60000),
        icon: <Award className="w-4 h-4" />,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        id: '3',
        type: 'price',
        title: 'Price Drop',
        description: 'Current price decreased',
        value: '0.135 ETH',
        timestamp: new Date(Date.now() - 120000),
        icon: <TrendingDown className="w-4 h-4" />,
        color: 'from-orange-500 to-red-500'
      },
      {
        id: '4',
        type: 'gas',
        title: 'Gas Tracker',
        description: 'Current gas price',
        value: '42 gwei',
        timestamp: new Date(Date.now() - 180000),
        icon: <Zap className="w-4 h-4" />,
        color: 'from-green-500 to-emerald-500'
      }
    ];
    // Activities are now static for demo
    // In production, these would come from WebSocket or API
    console.log('LiveActivityFeed initialized with', initialActivities.length, 'items');
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* CyberApe #8721 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            #42
          </div>
          <div>
            <div className="text-xs text-purple-600 font-medium">Just minted</div>
            <div className="text-sm font-semibold">CyberApe #8721</div>
          </div>
        </div>
        <div className="text-lg font-bold text-orange-500 mb-1">0.42 ETH</div>
        <div className="text-xs text-gray-500">by 0x7a9f...3d2c</div>
      </motion.div>

      {/* Whale Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            🐋
          </div>
          <div>
            <div className="text-xs text-blue-600 font-medium">WHALE ALERT</div>
            <div className="text-sm font-semibold">10 NFTs Minted</div>
          </div>
        </div>
        <div className="text-lg font-bold text-purple-500 mb-1">0.8 ETH</div>
        <div className="text-xs text-gray-500">0xc4d8...9f2a</div>
      </motion.div>

      {/* Price Drop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            📉
          </div>
          <div>
            <div className="text-xs text-green-600 font-medium">Price Drop</div>
            <div className="text-sm font-semibold">0.08 ETH</div>
          </div>
        </div>
        <div className="text-sm text-green-500 mb-1">-20% from start</div>
        <div className="text-xs text-gray-500">Next: 0.075 ETH in 15m</div>
      </motion.div>

      {/* Top Holder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
            👑
          </div>
          <div>
            <div className="text-xs text-yellow-600 font-medium">TOP HOLDER</div>
            <div className="text-sm font-semibold">vitalik.eth</div>
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-1">42 NFTs owned</div>
        <div className="text-lg font-bold text-orange-500">3.36 ETH spent</div>
      </motion.div>

      {/* DigiDragon #1337 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            #99
          </div>
          <div>
            <div className="text-xs text-teal-600 font-medium">Secondary sale</div>
            <div className="text-sm font-semibold">DigiDragon #1337</div>
          </div>
        </div>
        <div className="text-lg font-bold text-teal-500 mb-1">0.65 ETH</div>
        <div className="text-xs text-green-500">+225% profit</div>
      </motion.div>

      {/* Gas Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            ⚡
          </div>
          <div>
            <div className="text-xs text-cyan-600 font-medium">Gas Tracker</div>
            <div className="text-lg font-bold">42 gwei</div>
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-1">Optimal time to mint</div>
        <div className="text-xs text-gray-500">~$3.20 per mint</div>
      </motion.div>

      {/* Rare Mint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            💎
          </div>
          <div>
            <div className="text-xs text-blue-600 font-medium">RARE MINT</div>
            <div className="text-sm font-semibold">GoldenApe #100</div>
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-1">1 of 100 special edition</div>
        <div className="text-lg font-bold text-blue-500">0.88 ETH</div>
      </motion.div>

      {/* 24h Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
            📊
          </div>
          <div>
            <div className="text-xs text-gray-600 font-medium">24h Activity</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Mints</span>
            <span className="font-semibold">1,234</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Volume</span>
            <span className="font-semibold">98.7 ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Holders</span>
            <span className="font-semibold">892</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

