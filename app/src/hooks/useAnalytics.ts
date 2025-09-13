import { useEffect, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Advanced analytics hook for tracking user interactions and performance metrics
 * Integrates with multiple analytics providers and provides real-time insights
 */
export function useAnalytics() {
  const { address } = useAccount();
  const chainId = useChainId();

  // Track page views
  useEffect(() => {
    trackEvent({
      action: 'page_view',
      category: 'navigation',
      metadata: {
        path: window.location.pathname,
        referrer: document.referrer,
        chainId,
        wallet: address ? 'connected' : 'disconnected',
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainId]);

  const trackEvent = useCallback((event: AnalyticsEvent) => {
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }

    // Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag;
      gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata,
      });
    }

    // Custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          timestamp: Date.now(),
          sessionId: getSessionId(),
          userId: address,
          chainId,
        }),
      }).catch(() => {
        // Silently fail analytics
      });
    }
  }, [address, chainId]);

  const trackMintEvent = useCallback((quantity: number, price: bigint, phase: string) => {
    trackEvent({
      action: 'mint_initiated',
      category: 'transaction',
      label: phase,
      value: quantity,
      metadata: {
        price: price.toString(),
        phase,
        quantity,
        chainId,
        wallet: address,
      },
    });
  }, [address, chainId, trackEvent]);

  const trackWalletConnection = useCallback((walletType: string, success: boolean) => {
    trackEvent({
      action: success ? 'wallet_connected' : 'wallet_connection_failed',
      category: 'wallet',
      label: walletType,
      metadata: {
        walletType,
        chainId,
        success,
      },
    });
  }, [chainId, trackEvent]);

  const trackPerformance = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      trackEvent({
        action: 'performance_metrics',
        category: 'performance',
        metadata: {
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          firstPaint: perfData.responseEnd - perfData.requestStart,
        },
      });
    }
  }, [trackEvent]);

  return {
    trackEvent,
    trackMintEvent,
    trackWalletConnection,
    trackPerformance,
  };
}

// Session management
function getSessionId(): string {
  const key = 'dutchbasar_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
