"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Check, Loader2, ExternalLink, Copy, Clock, Zap, Shield, AlertTriangle } from "lucide-react";

type TransactionStep = "review" | "confirm" | "pending" | "success" | "failed";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  type: "mint" | "quickMint";
  quantity: number;
  slippage: number;
}

export function TransactionModal({ open, onClose, type, quantity, slippage }: TransactionModalProps) {
  const [step, setStep] = React.useState<TransactionStep>("review");
  const [txHash, setTxHash] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const gasPrice = 42;
  const priorityFee = 2;
  
  const unitPrice = 0.08;
  const isQuick = type === "quickMint";
  const gasEstimate = isQuick ? 0.0045 : 0.0032;
  const subtotal = unitPrice * quantity;
  const total = subtotal + gasEstimate;
  
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("review");
        setTxHash("");
      }, 300);
    }
  }, [open]);

  React.useEffect(() => {
    if (step === "pending") {
      const timer = setTimeout(() => {
        setTxHash("0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385");
        setStep("success");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleConfirm = () => {
    setStep("confirm");
  };

  const handleSign = () => {
    setStep("pending");
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={step === "success" ? onClose : undefined} />
          
          <motion.div
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Header */}
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {step === "review" && (isQuick ? "Quick Mint" : "Confirm Mint")}
                  {step === "confirm" && "Confirm in Wallet"}
                  {step === "pending" && "Transaction Pending"}
                  {step === "success" && "Transaction Successful"}
                  {step === "failed" && "Transaction Failed"}
                </h2>
                {(step === "review" || step === "success" || step === "failed") && (
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === "review" && (
                <div className="space-y-4">
                  {/* NFT Info */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">#{quantity}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Dutch Auction NFT</p>
                        <p className="font-semibold">CyberApe Collection</p>
                        <p className="text-xs text-gray-500 mt-1">Minting {quantity} NFT{quantity > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Unit Price</span>
                      <span className="font-medium">{unitPrice} ETH</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Quantity</span>
                      <span className="font-medium">×{quantity}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="font-medium">{subtotal.toFixed(3)} ETH</span>
                      </div>
                    </div>
                  </div>

                  {/* Gas Settings */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Gas Settings</span>
                      </div>
                      {isQuick && (
                        <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full">
                          Priority
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Gas Price</span>
                        <span>{gasPrice} gwei</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Priority Fee</span>
                        <span>{isQuick ? priorityFee * 2 : priorityFee} gwei</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Max Fee</span>
                        <span>{gasEstimate} ETH (~${(gasEstimate * 2400).toFixed(2)})</span>
                      </div>
                    </div>
                  </div>

                  {/* Slippage Warning */}
                  {slippage > 2 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-medium text-amber-900 dark:text-amber-100">High slippage tolerance</p>
                          <p className="text-amber-700 dark:text-amber-300">Your transaction may be frontrun</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total (incl. gas)</span>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{total.toFixed(4)} ETH</p>
                        <p className="text-xs text-gray-400">≈ ${(total * 2400).toFixed(2)} USD</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              {step === "confirm" && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-full flex items-center justify-center mb-4">
                      <Shield className="w-10 h-10 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Confirm in your wallet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Please confirm this transaction in your connected wallet
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">From</span>
                      <span className="font-mono text-xs">0x742d...bEb1</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">To</span>
                      <span className="font-mono text-xs">0x5FbD...8aA4</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Amount</span>
                      <span className="font-medium">{total.toFixed(4)} ETH</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSign}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700"
                  >
                    Sign Transaction
                  </button>
                </div>
              )}

              {step === "pending" && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center py-8">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Transaction Submitted</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Your transaction has been submitted to the blockchain
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Estimated time</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Pending confirmations</span>
                        <span className="font-medium">0/12</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-blue-600 h-2 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "30%" }}
                          transition={{ duration: 3 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      This may take a few seconds...
                    </p>
                  </div>
                </div>
              )}

              {step === "success" && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center py-8">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Transaction Successful!</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      You successfully minted {quantity} NFT{quantity > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Hash</span>
                      <button
                        onClick={handleCopy}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-xs break-all">{txHash}</p>
                    <a
                      href={`https://etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View on Etherscan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Token IDs</p>
                      <p className="font-semibold">#8721-#872{quantity}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Gas Used</p>
                      <p className="font-semibold">{(gasEstimate * 0.8).toFixed(4)} ETH</p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
