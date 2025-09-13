'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Brain, 
  Users, 
  Coins, 
  Link2, 
  Zap,
  Lock,
  TrendingUp,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stats: string;
  active: boolean;
  onClick: () => void;
}

function FeatureCard({ icon, title, description, stats, active, onClick }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-6 rounded-xl border cursor-pointer transition-all",
        active 
          ? "bg-gradient-to-br from-orange-500/20 to-teal-500/20 border-orange-500/50" 
          : "bg-gray-900/50 border-gray-800 hover:border-gray-700"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/20 to-teal-500/20">
          {icon}
        </div>
        <span className="text-xs font-mono text-teal-400">{stats}</span>
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
      {active && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">Active</span>
        </div>
      )}
    </motion.div>
  );
}

export function AdvancedFeatures() {
  const [activeFeature, setActiveFeature] = useState<string>('ai');

  const features = [
    {
      id: 'ai',
      icon: <Brain className="w-6 h-6 text-orange-500" />,
      title: 'AI Dynamic Pricing',
      description: 'Machine learning optimizes prices based on market sentiment and demand',
      stats: 'Save 23%',
    },
    {
      id: 'multisig',
      icon: <Shield className="w-6 h-6 text-teal-500" />,
      title: 'Multi-Sig Security',
      description: '2-of-3 signature requirement for critical contract functions',
      stats: '100% Secure',
    },
    {
      id: 'dao',
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: 'DAO Governance',
      description: 'On-chain voting with delegation and time-locked execution',
      stats: '4% Quorum',
    },
    {
      id: 'staking',
      icon: <Coins className="w-6 h-6 text-yellow-500" />,
      title: 'NFT Staking',
      description: 'Earn yield while your NFTs are staked during the auction',
      stats: '12% APY',
    },
    {
      id: 'bridge',
      icon: <Link2 className="w-6 h-6 text-blue-500" />,
      title: 'Cross-Chain Bridge',
      description: 'Transfer NFTs seamlessly across 8 different blockchains',
      stats: '8 Chains',
    },
    {
      id: 'gasless',
      icon: <Zap className="w-6 h-6 text-green-500" />,
      title: 'Gasless Minting',
      description: 'EIP-712 signature minting with gas refund pool',
      stats: 'Save 100%',
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Advanced Protocol Features
        </h2>
        <p className="text-gray-400">
          World-class features that set DutchBasar apart from competitors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            {...feature}
            active={activeFeature === feature.id}
            onClick={() => setActiveFeature(feature.id)}
          />
        ))}
      </div>

      {/* Feature Details Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700"
      >
        {activeFeature === 'ai' && (
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Brain className="w-8 h-8 text-orange-500" />
              AI-Powered Dynamic Pricing Engine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-orange-400">How it Works</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Analyzes 24h volume and unique buyers</li>
                  <li>• Calculates market sentiment (0-100)</li>
                  <li>• Adjusts prices based on volatility</li>
                  <li>• Personalized pricing per user score</li>
                  <li>• Chainlink oracle integration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-orange-400">Current Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-gray-400">Optimal Price</span>
                    <span className="font-mono text-orange-400">0.142 ETH</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-gray-400">Market Sentiment</span>
                    <span className="font-mono text-green-400">78/100</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-gray-400">Volatility</span>
                    <span className="font-mono text-yellow-400">23%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFeature === 'multisig' && (
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Shield className="w-8 h-8 text-teal-500" />
              Multi-Signature Wallet Protection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-teal-400">Security Features</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• 2-of-3 signatures required</li>
                  <li>• 48-hour proposal expiry</li>
                  <li>• Time-locked execution</li>
                  <li>• On-chain proposal storage</li>
                  <li>• Emergency circuit breaker</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-teal-400">Active Signers</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Signer 1</span>
                      <Lock className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="font-mono text-xs">0x742d...8963</span>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Signer 2</span>
                      <Lock className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="font-mono text-xs">0x8f3a...2b4c</span>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Signer 3</span>
                      <Lock className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="font-mono text-xs">0x1a9c...7e5d</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFeature === 'staking' && (
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Coins className="w-8 h-8 text-yellow-500" />
              NFT Staking & Yield Generation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Total Staked</span>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold">3,847</p>
                <p className="text-xs text-gray-500">NFTs</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Current APY</span>
                  <Award className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">12.4%</p>
                <p className="text-xs text-gray-500">Annual Yield</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Rewards Pool</span>
                  <Coins className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold">847.3</p>
                <p className="text-xs text-gray-500">ETH Available</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-sm text-yellow-400">
                💡 Stake your NFTs to earn passive income while participating in the auction. 
                Boost levels increase with longer staking periods!
              </p>
            </div>
          </div>
        )}

        {activeFeature === 'dao' && (
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-500" />
              Decentralized Governance
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Total Proposals</p>
                  <p className="text-xl font-bold">42</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Active Voters</p>
                  <p className="text-xl font-bold">1,284</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Quorum</p>
                  <p className="text-xl font-bold text-purple-400">4%</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Voting Period</p>
                  <p className="text-xl font-bold">7 days</p>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
                <h4 className="font-semibold mb-2">Active Proposal</h4>
                <p className="text-sm text-gray-300 mb-3">
                  &quot;Reduce auction duration from 24h to 12h for faster price discovery&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }} />
                  </div>
                  <span className="text-sm font-mono">67% For</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFeature === 'bridge' && (
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Link2 className="w-8 h-8 text-blue-500" />
              Cross-Chain Bridge (LayerZero)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Ethereum', color: 'blue', transfers: '1,234' },
                { name: 'BSC', color: 'yellow', transfers: '892' },
                { name: 'Polygon', color: 'purple', transfers: '2,103' },
                { name: 'Arbitrum', color: 'orange', transfers: '567' },
                { name: 'Optimism', color: 'red', transfers: '445' },
                { name: 'Base', color: 'blue', transfers: '789' },
                { name: 'zkSync', color: 'indigo', transfers: '234' },
                { name: 'Scroll', color: 'teal', transfers: '156' },
              ].map((chain) => (
                <div key={chain.name} className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{chain.name}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      `bg-${chain.color}-500`
                    )} />
                  </div>
                  <p className="text-xs text-gray-400">{chain.transfers} transfers</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-400">
                🌉 Bridge your NFTs instantly across 8 chains with LayerZero. 
                Average bridge time: 2-3 minutes. Gas costs optimized per chain.
              </p>
            </div>
          </div>
        )}

        {activeFeature === 'gasless' && (
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Zap className="w-8 h-8 text-green-500" />
              Gasless Minting & Refund Pool
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-400">EIP-712 Signature Minting</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Signatures Processed</p>
                    <p className="text-xl font-bold">12,847</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Gas Saved Per User</p>
                    <p className="text-xl font-bold text-green-400">100%</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-green-400">Gas Refund Pool</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Pool Balance</p>
                    <p className="text-xl font-bold">42.7 ETH</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Refunds Given</p>
                    <p className="text-xl font-bold text-green-400">8,234</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg">
              <p className="text-sm text-green-400">
                ⚡ Mint without paying gas! Our signature minting system and gas refund pool 
                ensure you never pay for transactions. First 1000 minters get automatic refunds!
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
