'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Hash } from 'viem';

export interface TransactionState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  hash?: Hash;
  error?: Error;
  confirmations: number;
}

export interface UseTransactionFeedbackOptions {
  successMessage?: string;
  errorMessage?: string;
  pendingMessage?: string;
  onSuccess?: (hash: Hash) => void;
  onError?: (error: Error) => void;
  requiredConfirmations?: number;
}

export function useTransactionFeedback(options: UseTransactionFeedbackOptions = {}) {
  const {
    successMessage = 'Transaction successful!',
    errorMessage = 'Transaction failed',
    pendingMessage = 'Transaction pending...',
    onSuccess,
    onError,
    requiredConfirmations = 1,
  } = options;

  const [state, setState] = useState<TransactionState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    confirmations: 0,
  });

  const startTransaction = useCallback(() => {
    setState({
      isLoading: true,
      isSuccess: false,
      isError: false,
      confirmations: 0,
    });
    
    if (pendingMessage) {
      toast.loading(pendingMessage, { id: 'tx-feedback' });
    }
  }, [pendingMessage]);

  const handleSuccess = useCallback((hash: Hash, confirmations = 1) => {
    setState({
      isLoading: false,
      isSuccess: true,
      isError: false,
      hash,
      confirmations,
    });

    if (successMessage) {
      toast.success(successMessage, { 
        id: 'tx-feedback',
        description: `Transaction: ${hash.slice(0, 10)}...${hash.slice(-8)}`,
      });
    }

    onSuccess?.(hash);
  }, [successMessage, onSuccess]);

  const handleError = useCallback((error: Error) => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: true,
      error,
      confirmations: 0,
    });

    const message = error.message || errorMessage;
    toast.error(message, { 
      id: 'tx-feedback',
      description: 'Please try again',
    });

    onError?.(error);
  }, [errorMessage, onError]);

  const updateConfirmations = useCallback((confirmations: number) => {
    setState(prev => ({
      ...prev,
      confirmations,
    }));

    if (confirmations >= requiredConfirmations && state.isSuccess) {
      toast.success(`Transaction confirmed (${confirmations} blocks)`, {
        id: 'tx-confirmations',
      });
    }
  }, [requiredConfirmations, state.isSuccess]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      confirmations: 0,
    });
    toast.dismiss('tx-feedback');
    toast.dismiss('tx-confirmations');
  }, []);

  // Auto-reset after success
  useEffect(() => {
    if (state.isSuccess) {
      const timer = setTimeout(() => {
        reset();
      }, 10000); // Reset after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [state.isSuccess, reset]);

  return {
    ...state,
    startTransaction,
    handleSuccess,
    handleError,
    updateConfirmations,
    reset,
  };
}

// Export helper for tracking multiple transactions
export function useMultipleTransactions() {
  const [transactions, setTransactions] = useState<Map<string, TransactionState>>(new Map());

  const trackTransaction = useCallback((id: string, state: TransactionState) => {
    setTransactions(prev => new Map(prev).set(id, state));
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setTransactions(new Map());
  }, []);

  return {
    transactions,
    trackTransaction,
    removeTransaction,
    clearAll,
  };
}
