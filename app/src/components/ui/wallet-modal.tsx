"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ArrowLeft, Check, ExternalLink, Copy, Shield, Loader2 } from "lucide-react";

type WalletType = "metamask" | "walletconnect" | "rainbow" | "coinbase" | "trust" | "argent" | "ledger" | "safe";

const WALLETS = [
  {
    id: "metamask" as WalletType,
    name: "MetaMask",
    description: "Connect using browser extension",
    color: "#F6851B",
    popular: true,
    logo: (
      <svg width="32" height="32" viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg">
        <path fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" d="m274.1 35.5-99.5 73.9L193 65.8z"/>
        <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="m44.4 35.5 98.7 74.6-17.5-44.3zm193.9 171.3-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z"/>
        <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="m103.6 138.2-15.8 23.9 56.3 2.5-2-60.5zm111.3 0-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5 33.9 16.5-4.7-39.3z"/>
        <path fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" d="m177.9 230.9-33.9-16.5 2.7 22.1-.3 9.3zm-71.1 0 31.5 14.9-.2-9.3 2.5-22.1z"/>
        <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="m138.8 193.5-28.2-8.3 19.9-9.1zm40.9 0 8.3-17.4 20 9.1z"/>
        <path fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" d="m106.8 247.4 4.8-40.6-31.3.9zM173.1 206.8l4.8 40.6 26.5-39.7zM214.9 162.1l-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-126.7 23.1 20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z"/>
        <path fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" d="m87.8 162.1 23.6 46-.8-22.9zm104.4 23.1-.8 22.9 23.7-46zM158.7 164.6l-5.3 28.9 6.6 34.1 1.5-44.9zm51.2 0-2.7 18 1.2 45 6.7-34.1z"/>
      </svg>
    )
  },
  {
    id: "walletconnect" as WalletType,
    name: "WalletConnect",
    description: "Scan with wallet to connect",
    color: "#3B99FC",
    popular: true,
    logo: (
      <svg width="32" height="32" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M126.613 93.9842C178.948 41.6494 261.052 41.6494 313.387 93.9842L321.689 102.286C324.483 105.08 324.483 109.609 321.689 112.403L296.737 137.355C295.34 138.752 293.075 138.752 291.678 137.355L279.151 124.828C244.64 90.3172 188.36 90.3172 153.849 124.828L140.485 138.192C139.088 139.589 136.823 139.589 135.426 138.192L110.474 113.24C107.68 110.446 107.68 105.917 110.474 103.123L126.613 93.9842ZM363.291 143.888L385.728 166.325C388.522 169.119 388.522 173.648 385.728 176.442L290.245 271.925C287.451 274.719 282.922 274.719 280.128 271.925L209.365 201.162C208.668 200.465 207.535 200.465 206.838 201.162L136.075 271.925C133.281 274.719 128.752 274.719 125.958 271.925L30.4729 176.44C27.6789 173.646 27.6789 169.117 30.4729 166.323L52.9099 143.886C55.7039 141.092 60.2329 141.092 63.0269 143.886L133.79 214.649C134.487 215.346 135.62 215.346 136.317 214.649L207.08 143.886C209.874 141.092 214.403 141.092 217.197 143.886L287.96 214.649C288.657 215.346 289.79 215.346 290.487 214.649L361.248 143.888C364.042 141.094 368.571 141.094 371.365 143.888H363.291Z" fill="#3B99FC"/>
      </svg>
    )
  },
  {
    id: "rainbow" as WalletType,
    name: "Rainbow",
    description: "The fun, simple wallet",
    color: "#001E59",
    popular: true,
    logo: (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#001E59] to-[#0052FF] flex items-center justify-center">
        <span className="text-white font-bold text-lg">R</span>
      </div>
    )
  },
  {
    id: "coinbase" as WalletType,
    name: "Coinbase Wallet",
    description: "Connect with Coinbase",
    color: "#0052FF",
    popular: false,
    logo: (
      <div className="w-8 h-8 rounded-full bg-[#0052FF] flex items-center justify-center">
        <span className="text-white font-bold text-lg">C</span>
      </div>
    )
  },
  {
    id: "trust" as WalletType,
    name: "Trust Wallet",
    description: "Mobile crypto wallet",
    color: "#3375BB",
    popular: false,
    logo: (
      <div className="w-8 h-8 rounded-lg bg-[#3375BB] flex items-center justify-center">
        <span className="text-white font-bold text-lg">T</span>
      </div>
    )
  },
  {
    id: "argent" as WalletType,
    name: "Argent",
    description: "Smart contract wallet",
    color: "#FF875B",
    popular: false,
    logo: (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF875B] to-[#FF6B00] flex items-center justify-center">
        <span className="text-white font-bold text-lg">A</span>
      </div>
    )
  },
  {
    id: "ledger" as WalletType,
    name: "Ledger",
    description: "Hardware wallet",
    color: "#000000",
    popular: false,
    logo: (
      <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
        <span className="text-white font-bold text-lg">L</span>
      </div>
    )
  },
  {
    id: "safe" as WalletType,
    name: "Safe",
    description: "Multi-sig wallet",
    color: "#12FF80",
    popular: false,
    logo: (
      <div className="w-8 h-8 rounded-lg bg-[#12FF80] flex items-center justify-center">
        <span className="text-black font-bold text-lg">S</span>
      </div>
    )
  }
];

type Step = "select" | "connecting" | "approve" | "network" | "success" | "error";

export function UltraRealisticWalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = React.useState<Step>("select");
  const [selectedWallet, setSelectedWallet] = React.useState<WalletType | null>(null);
  const [showAll, setShowAll] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  
  const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1";
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("select");
        setSelectedWallet(null);
        setShowAll(false);
      }, 300);
    }
  }, [open]);

  React.useEffect(() => {
    if (step === "connecting" && selectedWallet) {
      const timer = setTimeout(() => setStep("approve"), 2000);
      return () => clearTimeout(timer);
    }
  }, [step, selectedWallet]);

  const handleConnect = (wallet: WalletType) => {
    setSelectedWallet(wallet);
    setStep("connecting");
  };

  const handleApprove = () => {
    setStep("network");
  };

  const handleNetworkConfirm = () => {
    setStep("success");
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayWallets = showAll ? WALLETS : WALLETS.filter(w => w.popular);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
          
          <motion.div
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            {/* Header */}
            <div className="relative p-6 pb-0">
              <div className="flex items-center justify-between mb-2">
                {step !== "select" && (
                  <button
                    onClick={() => setStep("select")}
                    className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
                  {step === "select" && "Connect Wallet"}
                  {step === "connecting" && "Connecting..."}
                  {step === "approve" && "Approve Connection"}
                  {step === "network" && "Switch Network"}
                  {step === "success" && "Connected"}
                  {step === "error" && "Connection Failed"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {step === "select" && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose your preferred wallet to connect
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {step === "select" && (
                <div className="space-y-3">
                  {displayWallets.map((wallet) => (
                    <motion.button
                      key={wallet.id}
                      onClick={() => handleConnect(wallet.id)}
                      className="w-full p-4 flex items-center gap-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-shrink-0">{wallet.logo}</div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {wallet.name}
                          {wallet.popular && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {wallet.description}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    </motion.button>
                  ))}
                  
                  {!showAll && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="w-full p-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Show more wallets
                    </button>
                  )}
                </div>
              )}

              {step === "connecting" && selectedWallet && (
                <div className="flex flex-col items-center py-12">
                  <div className="mb-6">
                    {WALLETS.find(w => w.id === selectedWallet)?.logo}
                  </div>
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Opening {WALLETS.find(w => w.id === selectedWallet)?.name}...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-2">
                    Confirm connection in your wallet
                  </p>
                </div>
              )}

              {step === "approve" && selectedWallet && (
                <div className="space-y-6">
                  <div className="flex items-center justify-center mb-4">
                    {WALLETS.find(w => w.id === selectedWallet)?.logo}
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex gap-3">
                      <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          DutchBasar would like to connect to your wallet
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          This will allow the app to view your account address, balance, and suggest transactions
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-green-500" />
                      View your wallet balance and activity
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-green-500" />
                      Request approval for transactions
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("select")}
                      className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApprove}
                      className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              )}

              {step === "network" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ExternalLink className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Switch Network</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      You need to switch to Ethereum Mainnet to continue
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                      <div className="text-sm font-medium text-red-900 dark:text-red-100">Current Network</div>
                      <div className="text-xs text-red-700 dark:text-red-300">Polygon (137)</div>
                    </div>
                    
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="text-sm font-medium text-green-900 dark:text-green-100">Required Network</div>
                      <div className="text-xs text-green-700 dark:text-green-300">Ethereum Mainnet (1)</div>
                    </div>
                  </div>

                  <button
                    onClick={handleNetworkConfirm}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                  >
                    Switch Network
                  </button>
                </div>
              )}

              {step === "success" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Successfully Connected!</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your wallet is now connected to DutchBasar
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">Account</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-medium">{shortAddress}</span>
                        <button
                          onClick={handleCopy}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Balance</span>
                      <span className="text-sm font-medium">2.847 ETH</span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {step === "select" && (
              <div className="px-6 pb-6">
                <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                  By connecting, you agree to our{" "}
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Privacy Policy
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
