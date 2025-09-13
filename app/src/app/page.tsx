'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
// Removed unused imports - cleaned up for production
import { AuctionCard } from '@/components/ui/auction-card';
import { AuctionButton } from '@/components/ui/auction-button';
import { MultichainCard } from '@/components/ui/multichain-card';
// import { AnalyticsChart } from '@/components/ui/analytics-chart'; // Removed - not used
import { NetworkChooser } from '@/components/wallet/NetworkChooser';
import { SlippageModal, DetailsMockModal } from '@/components/ui/modals';
import { UltraRealisticWalletModal } from '@/components/ui/wallet-modal';
import { TransactionModal } from '@/components/ui/transaction-modal';
import { 
  Gavel,
  Clock,
  TrendingDown,
  BarChart3,
  CheckCircle,
  Activity
} from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  // Deterministic particle positions/timing to avoid SSR hydration mismatches
  const particles = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({
      left: (i * 37) % 100,
      top: (i * 61) % 100,
      duration: 8 + (i % 4),
      delay: i % 8,
      color: i < 20 ? 'teal' : 'dutch-orange'
    })),
    []
  );

  // Demo/mock dialog state
  const [walletOpen, setWalletOpen] = useState(false);
  const [mintOpen, setMintOpen] = useState(false);
  const [quickMintOpen, setQuickMintOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [slippageOpen, setSlippageOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [quantity, setQuantity] = useState(1);
  // Live Analytics canvas ref and demo data
  const analyticsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyticsLabels = useMemo(() => ['00:00','04:00','08:00','12:00','16:00','20:00','Now'], []);
  const analyticsPrices = useMemo(() => [0.15, 0.145, 0.138, 0.126, 0.112, 0.098, 0.08], []);
  const analyticsVolumes = useMemo(() => [2, 3, 2.6, 4, 4.8, 5.6, 6.4], []);

  useEffect(() => {
    const canvas = analyticsCanvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const parent = canvas.parentElement as HTMLElement | null;
      if (!parent) return;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.setLineDash([]);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const margin = { left: 34, right: 12, top: 10, bottom: 16 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      // Scales
      const yMax = 0.15; // 0.15 ETH top
      const yMin = 0.03; // bottom
      const yScale = (v: number) => margin.top + (yMax - v) * (innerH / (yMax - yMin));
      const xScale = (i: number) => margin.left + (i * (innerW / (analyticsLabels.length - 1)));

      // Grid
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      [0.15, 0.12, 0.09, 0.06, 0.03].forEach(v => {
        const y = yScale(v);
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(width - margin.right, y);
        ctx.stroke();
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px ui-sans-serif, system-ui, -apple-system';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(v.toFixed(2), 4, y);
      });

      // Volume bars - orange with better gradients
      const maxVol = Math.max(...analyticsVolumes) || 1;
      analyticsVolumes.forEach((vol, i) => {
        const x = xScale(i) - 8;
        const h = (vol / maxVol) * (innerH * 0.65);
        const y = margin.top + innerH - h;
        
        // Shadow for depth
        ctx.shadowColor = 'rgba(249,115,22,0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        
        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, 'rgba(249,115,22,0.45)');
        grad.addColorStop(0.5, 'rgba(251,146,60,0.35)');
        grad.addColorStop(1, 'rgba(254,215,170,0.15)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, 16, h);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      });

      // Price area fill gradient (extend to right edge to avoid a vertical seam near last bar)
      ctx.beginPath();
      analyticsPrices.forEach((p, i) => {
        const x = xScale(i);
        const y = yScale(p);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      const ly = yScale(analyticsPrices[analyticsPrices.length - 1]);
      ctx.lineTo(width - margin.right, ly);
      ctx.lineTo(width - margin.right, margin.top + innerH);
      ctx.lineTo(margin.left, margin.top + innerH);
      ctx.closePath();
      
      const areaGrad = ctx.createLinearGradient(0, margin.top, 0, margin.top + innerH);
      areaGrad.addColorStop(0, 'rgba(16,185,129,0.15)');
      areaGrad.addColorStop(0.5, 'rgba(6,182,212,0.08)');
      areaGrad.addColorStop(1, 'rgba(168,85,247,0.02)');
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Price line with glow effect
      const gradLine = ctx.createLinearGradient(margin.left, 0, width - margin.right, 0);
      gradLine.addColorStop(0, '#10b981');
      gradLine.addColorStop(0.5, '#06b6d4');
      gradLine.addColorStop(0.8, '#a855f7');
      gradLine.addColorStop(1, '#ef4444');

      // Glow effect
      ctx.shadowColor = 'rgba(6,182,212,0.5)';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = gradLine;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      analyticsPrices.forEach((p, i) => {
        const x = xScale(i);
        const y = yScale(p);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Points with pulse effect
      analyticsPrices.forEach((p, i) => {
        const x = xScale(i);
        const y = yScale(p);
        
        // Outer glow for last point
        if (i === analyticsPrices.length - 1) {
          ctx.fillStyle = 'rgba(239,68,68,0.2)';
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = gradLine;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, i === analyticsPrices.length - 1 ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Value labels on points (skip first to avoid clipping)
        if ((i % 2 === 0 && i !== 0) || i === analyticsPrices.length - 1) {
          ctx.fillStyle = i === analyticsPrices.length - 1 ? '#ef4444' : '#6b7280';
          ctx.font = '9px ui-sans-serif, system-ui, -apple-system';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`${p.toFixed(3)}`, x, y - 8);
        }
      });

      // Current price badge
      const lastX = xScale(analyticsPrices.length - 1);
      const lastY = yScale(analyticsPrices[analyticsPrices.length - 1]);
      
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(lastX + 10, lastY - 10, 55, 20);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px ui-sans-serif, system-ui, -apple-system';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('0.080 ETH', lastX + 37, lastY);
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [analyticsLabels, analyticsPrices, analyticsVolumes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dutch-cream via-white to-dutch-teal/10 dark:from-gray-900 dark:via-dutch-navy/20 dark:to-dutch-teal/10 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-96 h-96 bg-emerald-200/40 rounded-full mix-blend-normal filter blur-xl opacity-70" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-200 rounded-full mix-blend-normal filter blur-xl opacity-70" 
        />
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 10 }}
          className="absolute top-40 left-40 w-96 h-96 bg-amber-200/40 rounded-full mix-blend-normal filter blur-xl opacity-70" 
        />
        
        {/* Floating particles (deterministic for SSR) */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
            className={i < 20
              ? "absolute w-2 h-2 bg-dutch-teal/40 rounded-full opacity-20"
              : "absolute w-2 h-2 bg-dutch-orange/40 rounded-full opacity-20"}
            style={{ left: `${p.left}%`, top: `${p.top}%` }}
          />
        ))}
      </div>

      {/* Premium Header */}
      <header className="relative z-10 border-b border-dutch-teal/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center gap-4"
            >
              <Image 
                src="/DutchBasar.png" 
                alt="DutchBasar" 
                width={48} 
                height={48} 
                className="rounded-xl shadow-lg"
                priority
              />
              <div className="space-y-0">
                <h1 className="text-2xl font-bold text-dutch-navy dark:text-dutch-cream">
                  DutchBasar
                </h1>
                <p className="text-xs font-medium text-dutch-teal">
                  Dutch Auctions for Web3
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex items-center gap-4"
            >
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-dutch-cream/30 dark:bg-dutch-navy/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-dutch-navy dark:text-dutch-cream">Live on 8 chains</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <NetworkChooser />
                <button onClick={() => setWalletOpen(true)} className="h-11 px-5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-base font-medium transition-colors inline-flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" />
                    <path d="M16 7h2a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4h-2z" />
                  </svg>
                  Connect Wallet
                </button>
              </div>
            </motion.div>
          </nav>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pb-20">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-16 md:py-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-dutch-cream/50 dark:bg-dutch-navy/50 rounded-full mb-8 backdrop-blur-sm"
          >
            <Gavel className="w-4 h-4 text-dutch-orange" />
            <span className="text-sm font-medium text-dutch-navy dark:text-dutch-cream">
              Descending Price Auctions
            </span>
          </motion.div>

          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/30 via-sky-200/30 to-amber-200/30 blur-3xl"></div>
            <h2 className="relative text-4xl md:text-6xl font-black mb-6 leading-tight">
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #E741EA 0%, #D832E6 8%, #C824E2 16%, #B01BDD 24%, #9A33EA 32%, #8344F5 40%, #6D56FF 48%, #5A6AFF 56%, #4680FF 64%, #3395FF 72%, #20AAFF 80%, #0DBFFF 88%, #00D4FF 96%, #00E8FF 100%)'
                }}
              >
                Dutch Auction
                <br />
                NFT Marketplace
              </span>
            </h2>
            <div className="flex justify-center mb-6">
              <Image 
                src="/DutchBasar.png" 
                alt="DutchBasar" 
                width={240} 
                height={240} 
                className="rounded-2xl"
                priority
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p>Time-based price discovery mechanism for NFT collections.</p>
            <p>Start high, decrease over time, mint at your preferred price.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
              <Clock className="w-4 h-4 text-dutch-orange" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time-Based Pricing</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
              <TrendingDown className="w-4 h-4 text-dutch-teal" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Automatic Price Reduction</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Fair Distribution</span>
            </div>
          </motion.div>
        </motion.section>



        {/* Main Auction Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid lg:grid-cols-2 gap-8 mb-0"
        >
          <div className="h-full">
            <AuctionCard 
              onMint={() => setMintOpen(true)}
              onQuickMint={() => setQuickMintOpen(true)}
              onDetails={() => setDetailsOpen(true)}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="space-y-6 h-full"
          >
            <div className="p-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl h-full flex flex-col">
              <h3 className="text-2xl font-bold text-dutch-navy dark:text-dutch-cream mb-6">Mint Controls</h3>

              {/* Mint Settings (moved to top) */}
              <div className="mb-6 pb-6 border-b border-dutch-teal/10">
                <h4 className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream mb-3">Mint Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Max per wallet</span>
                    <span className="text-sm font-medium text-dutch-navy dark:text-dutch-cream">10 NFTs</span>
                  </div>
                  <button onClick={() => setSlippageOpen(true)} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Slippage tolerance</span>
                    <span className="text-sm font-medium text-dutch-navy dark:text-dutch-cream">{slippage.toFixed(1)}%</span>
                  </button>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gas optimization</span>
                    <span className="text-sm font-medium text-green-600">Enabled</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <span className="font-medium text-dutch-navy dark:text-dutch-cream">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 transition-colors">-</button>
                    <span className="w-12 text-center font-bold text-dutch-navy dark:text-dutch-cream">{quantity}</span>
                    <button onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 transition-colors">+</button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <span className="font-medium text-dutch-navy dark:text-dutch-cream">Total Cost</span>
                  <span className="text-xl font-bold text-dutch-orange">0.08 ETH</span>
                </div>
              </div>
              
              <div className="space-y-3 mt-auto">
                <AuctionButton onClick={() => setMintOpen(true)} variant="bid" size="md" className="w-full">
                  Mint Now
                </AuctionButton>
                <div className="grid grid-cols-2 gap-3">
                  <AuctionButton onClick={() => setQuickMintOpen(true)} variant="mint" size="sm">
                    Quick Mint
                  </AuctionButton>
                  <AuctionButton onClick={() => setDetailsOpen(true)} variant="withdraw" size="sm">
                    View Details
                  </AuctionButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.section className="mt-24 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-dutch-navy dark:text-dutch-cream mb-4">
              Live Auction Feed
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time minting activity and price movements
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recent Mint Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  #42
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Just minted</p>
                  <p className="font-semibold text-dutch-navy dark:text-dutch-cream">CyberApe #8721</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-orange-500">0.42 ETH</span>
                <span className="text-xs text-gray-500">by 0x7a9f...3d2c</span>
              </div>
            </motion.div>

            {/* Whale Alert Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-700/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🐋</span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">WHALE ALERT</span>
              </div>
              <p className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream mb-1">10 NFTs Minted</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">0xc4d8...9f2a</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-2">0.8 ETH</p>
            </motion.div>

            {/* Price Update Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-green-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Price Drop</span>
              </div>
              <p className="text-2xl font-bold text-dutch-navy dark:text-dutch-cream">0.08 ETH</p>
              <p className="text-xs text-green-600 mt-1">-20% from start</p>
              <p className="text-xs text-gray-500 mt-2">Next: 0.075 ETH in 15m</p>
            </motion.div>

            {/* Top Holder Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 backdrop-blur-xl rounded-2xl border border-amber-200/50 dark:border-amber-700/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👑</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">TOP HOLDER</span>
              </div>
              <p className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream">vitalik.eth</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">42 NFTs owned</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">3.36 ETH spent</p>
            </motion.div>

            {/* Recent Sale Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  #99
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Secondary sale</p>
                  <p className="font-semibold text-dutch-navy dark:text-dutch-cream">DigiDragon #1337</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-cyan-600">0.65 ETH</span>
                <span className="text-xs text-green-600">+225% profit</span>
              </div>
            </motion.div>

            {/* Gas Tracker Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-dutch-teal" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Gas Tracker</span>
              </div>
              <p className="text-2xl font-bold text-dutch-navy dark:text-dutch-cream">42 gwei</p>
              <p className="text-xs text-dutch-teal mt-1">Optimal time to mint</p>
              <p className="text-xs text-gray-500 mt-2">~$3.20 per mint</p>
            </motion.div>

            {/* Rarity Mint Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur-xl rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💎</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">RARE MINT</span>
              </div>
              <p className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream">GoldenApe #100</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">1 of 100 special edition</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">0.88 ETH</p>
            </motion.div>

            {/* Activity Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-dutch-navy" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">24h Activity</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Mints</span>
                  <span className="text-sm font-bold text-dutch-navy dark:text-dutch-cream">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Volume</span>
                  <span className="text-sm font-bold text-dutch-navy dark:text-dutch-cream">98.7 ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Holders</span>
                  <span className="text-sm font-bold text-dutch-navy dark:text-dutch-cream">892</span>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.section>

        {/* Technical Infrastructure */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-24 mb-24"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-dutch-navy dark:text-dutch-cream mb-4">
              Technical Infrastructure
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built with security, efficiency, and scalability in mind
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MultichainCard />
            </div>
            {/* Live Analytics Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="h-full p-8 bg-gradient-to-br from-white/95 via-white/90 to-dutch-cream/30 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-dutch-navy/30 backdrop-blur-xl rounded-3xl border border-dutch-teal/20 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-dutch-navy dark:text-dutch-cream">Live Analytics</h3>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  Real-time
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6">Price Discovery & Volume Metrics</p>
              
              {/* Chart Area */}
              <div className="flex-[1.5] min-h-0 mb-0">
                <div className="relative">
                  <div className="h-44 md:h-52">
                    <canvas ref={analyticsCanvasRef} className="absolute inset-0 w-full h-full" />
                  </div>
                  
                  {/* Time Labels – unter der Chart */}
                  <div className="flex justify-between px-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>00:00</span>
                    <span>04:00</span>
                    <span>08:00</span>
                    <span>12:00</span>
                    <span>16:00</span>
                    <span>20:00</span>
                    <span className="font-semibold text-dutch-navy dark:text-dutch-cream">Now</span>
                  </div>
                </div>
              </div>

              {/* Main Stats (unter der Chart, ohne Überlappung) */}
              <div className="grid grid-cols-2 gap-4 mt-3 mb-4">
                <div className="text-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Current Price</span>
                  </div>
                  <div className="font-bold text-dutch-orange">0.08 ETH</div>
                  <div className="text-xs text-green-500 font-medium">-46.7% from start</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">24h Volume</span>
                  </div>
                  <div className="font-bold text-dutch-orange">8.16 ETH</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">102 mints</div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream">89%</div>
                  <div className="text-xs text-gray-500">Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream">1.2k</div>
                  <div className="text-xs text-gray-500">Mints</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream">42</div>
                  <div className="text-xs text-gray-500">Gwei</div>
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-base">👥</div>
                  <div className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream">342</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Holders</div>
                </div>
                <div className="text-center">
                  <div className="text-base">💰</div>
                  <div className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream">0.05</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Floor</div>
                </div>
                <div className="text-center">
                  <div className="text-base">⏱️</div>
                  <div className="text-sm font-semibold text-dutch-navy dark:text-dutch-cream">2h 34m</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Left</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

      </main>

      {/* Realistic Dialogs */}
      <UltraRealisticWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      <TransactionModal open={mintOpen} onClose={() => setMintOpen(false)} type="mint" quantity={quantity} slippage={slippage} />
      <TransactionModal open={quickMintOpen} onClose={() => setQuickMintOpen(false)} type="quickMint" quantity={quantity} slippage={slippage} />
      <DetailsMockModal open={detailsOpen} onClose={() => setDetailsOpen(false)} />
      <SlippageModal open={slippageOpen} onClose={() => setSlippageOpen(false)} value={slippage} onChange={setSlippage} />

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-dutch-teal/5 bg-dutch-cream/20 dark:bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Built with Foundry & Next.js • Dutch Auction Protocol • Christopher Schulze • 2025
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}