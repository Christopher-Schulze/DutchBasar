import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { useState, useEffect } from 'react';
import { DUTCH_BASAR_ABI, type AuctionInfo, type MintInfo, type Phase, type MintParams } from '@/lib/contracts';
import { getContractAddress, ZERO_ADDR } from '@/lib/wagmi';

/**
 * Custom hook for interacting with DutchBasar contract
 * Provides real-time auction data, minting functions, and transaction tracking
 */
export function useDutchBasar(contractAddress?: `0x${string}`) {
  const { address } = useAccount();
  const chainId = useChainId();
  contractAddress = contractAddress || getContractAddress(chainId);
  const enabled = contractAddress !== ZERO_ADDR;

  const formatNumber = (num: number, decimals = 2): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Contract read hooks
  const { data: currentPrice, refetch: refetchPrice } = useReadContract({
    address: contractAddress,
    abi: DUTCH_BASAR_ABI,
    functionName: 'getCurrentPrice',
    query: {
      refetchInterval: 1000, // Update every second
      enabled,
    },
  });

  const { data: currentPhase, refetch: refetchPhase } = useReadContract({
    address: contractAddress,
    abi: DUTCH_BASAR_ABI,
    functionName: 'getCurrentPhase',
    query: {
      refetchInterval: 5000, // Update every 5 seconds
      enabled,
    },
  });

  const { data: auctionInfo } = useReadContract({
    address: contractAddress,
    abi: DUTCH_BASAR_ABI,
    functionName: 'getAuctionInfo',
    query: { enabled },
  });

  const { data: mintInfo } = useReadContract({
    address: contractAddress,
    abi: DUTCH_BASAR_ABI,
    functionName: 'getMintInfo',
    query: { enabled },
  });

  const { data: totalSupply, refetch: refetchSupply } = useReadContract({
    address: contractAddress,
    abi: DUTCH_BASAR_ABI,
    functionName: 'totalSupply',
    query: {
      refetchInterval: 5000,
      enabled,
    },
  });

  const { data: remainingSupply, refetch: refetchRemainingSupply } = useReadContract({
    address: contractAddress,
    abi: DUTCH_BASAR_ABI,
    functionName: 'getRemainingSupply',
    query: {
      refetchInterval: 5000,
      enabled,
    },
  });

  const { data: userBalance, refetch: refetchUserBalance } = useReadContract({
    address: contractAddress,
    abi: DUTCH_BASAR_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && enabled,
      refetchInterval: 10000,
    },
  });

  const { data: allowlistMinted, refetch: refetchAllowlistMinted } = useReadContract({
    address: contractAddress,
    abi: DUTCH_BASAR_ABI,
    functionName: 'allowlistMinted',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && enabled,
      refetchInterval: 10000,
    },
  });

  const { data: revealed } = useReadContract({
    address: contractAddress,
    abi: DUTCH_BASAR_ABI,
    functionName: 'revealed',
    query: { enabled },
  });

  // Write contract hook
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Transaction receipt hook
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // State for real-time updates
  const [priceHistory, setPriceHistory] = useState<Array<{ timestamp: number; price: bigint }>>([]);

  // Update price history
  useEffect(() => {
    if (currentPrice) {
      setPriceHistory(prev => {
        const price = currentPrice as unknown as bigint;
        const newEntry = { timestamp: Date.now(), price };
        const updated = [...prev, newEntry];
        // Keep only last 100 entries
        return updated.slice(-100);
      });
    }
  }, [currentPrice]);

  // Minting functions
  const publicMint = async (quantity: number) => {
    if (!currentPrice || !enabled) return;

    const totalCost = (currentPrice as bigint) * BigInt(quantity);

    writeContract({
      address: contractAddress,
      abi: DUTCH_BASAR_ABI,
      functionName: 'publicMint',
      args: [BigInt(quantity)],
      value: totalCost,
    });
  };

  const allowlistMint = async (params: MintParams) => {
    if (!currentPrice || !enabled || !params.maxAllowed || !params.proof) return;

    const totalCost = (currentPrice as bigint) * BigInt(params.quantity);

    writeContract({
      address: contractAddress,
      abi: DUTCH_BASAR_ABI,
      functionName: 'allowlistMint',
      args: [BigInt(params.quantity), BigInt(params.maxAllowed), params.proof],
      value: totalCost,
    });
  };

  // Refetch all data
  const refetchAll = () => {
    refetchPrice();
    refetchPhase();
    refetchSupply();
    refetchRemainingSupply();
    refetchUserBalance();
    refetchAllowlistMinted();
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!auctionInfo) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const info = auctionInfo as AuctionInfo;
    const endTime = Number(info.endTime);
    const remaining = endTime - now;
    
    if (remaining <= 0) return 0;
    return remaining;
  };

  // Calculate progress percentage
  const getAuctionProgress = () => {
    if (!auctionInfo) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    const info = auctionInfo as AuctionInfo;
    const startTime = Number(info.startTime);
    const endTime = Number(info.endTime);
    
    if (now < startTime) return 0;
    if (now >= endTime) return 100;
    
    const elapsed = now - startTime;
    const total = endTime - startTime;
    
    return Math.min(100, (elapsed / total) * 100);
  };

  // Calculate mint progress
  const getMintProgress = () => {
    if (!totalSupply || !mintInfo) return 0;
    
    const info = mintInfo as MintInfo;
    return Math.min(100, (Number(totalSupply) / info.maxSupply) * 100);
  };

  return {
    // Contract data
    contractAddress,
    isContractConfigured: enabled,
    currentPrice,
    currentPhase: currentPhase as Phase,
    auctionInfo: auctionInfo as AuctionInfo,
    mintInfo: mintInfo as MintInfo,
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    remainingSupply: remainingSupply ? Number(remainingSupply) : 0,
    userBalance: userBalance ? Number(userBalance) : 0,
    allowlistMinted: allowlistMinted ? Number(allowlistMinted) : 0,
    revealed: revealed as boolean,
    
    // Real-time data
    priceHistory,
    timeRemaining: getTimeRemaining(),
    auctionProgress: getAuctionProgress(),
    mintProgress: getMintProgress(),
    
    // Actions
    publicMint,
    allowlistMint,
    refetchAll,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    formatNumber,
  };
}

/**
 * Hook for real-time price updates with smooth animations
 */
export function useRealTimePrice() {
  const { currentPrice, priceHistory, auctionInfo, formatNumber } = useDutchBasar();
  const [animatedPrice, setAnimatedPrice] = useState<bigint>(0n);

  useEffect(() => {
    if (currentPrice) {
      // Smooth price animation triggered only when target price changes
      const startPrice = animatedPrice;
      const endPrice = currentPrice;
      const duration = 1000; // 1 second animation
      const startTime = Date.now();
      let cancelled = false;
      
      const animate = (timestamp: number) => {
        if (cancelled) return;
        
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        const priceDiff = Number(endPrice as bigint) - Number(startPrice as bigint);
        const currentAnimatedPrice = startPrice + BigInt(
          Math.floor(priceDiff * easeOutCubic)
        );
        
        setAnimatedPrice(currentAnimatedPrice);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);

      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice]);

  // Calculate price velocity (change per second)
  const getPriceVelocity = () => {
    if (priceHistory.length < 2) return 0;
    
    const recent = priceHistory.slice(-10); // Last 10 data points
    if (recent.length < 2) return 0;
    
    const first = recent[0];
    const last = recent[recent.length - 1];
    const timeDiff = (last.timestamp - first.timestamp) / 1000; // seconds
    const priceDiff = Number(last.price - first.price);
    
    return timeDiff > 0 ? priceDiff / timeDiff : 0;
  };

  return {
    currentPrice: formatNumber(Number(animatedPrice || currentPrice || 0n), 0) || 0n,
    priceHistory,
    priceVelocity: getPriceVelocity(),
    auctionInfo,
  };
}

/**
 * Hook for managing transaction states with user feedback
 */
export function useTransactionFeedback() {
  const [txStates, setTxStates] = useState<Record<string, {
    status: 'idle' | 'pending' | 'confirming' | 'success' | 'error';
    message: string;
    hash?: string;
  }>>({});

  const updateTxState = (id: string, state: typeof txStates[string]) => {
    setTxStates(prev => ({ ...prev, [id]: state }));
  };

  const clearTxState = (id: string) => {
    setTxStates(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  return {
    txStates,
    updateTxState,
    clearTxState,
  };
}