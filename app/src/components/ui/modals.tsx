"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, CheckCircle2, AlertTriangle, Loader2, Settings } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

export function BaseModal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  const maxW = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg";
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={`relative w-full ${maxW} p-6 rounded-2xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-dutch-navy dark:text-dutch-cream">{title}</h3>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">{children}</div>
            {footer && <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function WalletMockModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = React.useState<"choose" | "connecting" | "connected">("choose");
  const fakeAddr = "0x7a9f34A2bE1c90E4C93F1Cdb0F6E83a23D3d2cB2";

  React.useEffect(() => {
    if (!open) setStep("choose");
  }, [open]);

  return (
    <BaseModal open={open} onClose={onClose} title="Connect Wallet" size="md">
      {step === "choose" && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "MetaMask", color: "bg-[#f6851b]", icon: <Wallet className="w-5 h-5" /> },
            { name: "WalletConnect", color: "bg-[#3b99fc]", icon: <Wallet className="w-5 h-5" /> },
            { name: "Rainbow", color: "bg-[#0012ff]", icon: <Wallet className="w-5 h-5" /> },
            { name: "Coinbase", color: "bg-[#1652f0]", icon: <Wallet className="w-5 h-5" /> },
          ].map((w) => (
            <button
              key={w.name}
              onClick={() => setStep("connecting")}
              className={`h-12 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 ${w.color} hover:opacity-90 transition`}
            >
              {w.icon}
              {w.name}
            </button>
          ))}
        </div>
      )}

      {step === "connecting" && (
        <div className="flex flex-col items-center text-center py-6">
          <Loader2 className="w-8 h-8 text-dutch-teal animate-spin mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting wallet confirmation…</p>
          <button
            onClick={() => setStep("connected")}
            className="mt-4 h-10 px-4 rounded-xl bg-dutch-teal text-white font-semibold hover:bg-dutch-teal/90"
          >
            Simulate Confirm
          </button>
        </div>
      )}

      {step === "connected" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Connected</span>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500">Account</div>
            <div className="font-mono text-sm">{fakeAddr}</div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="h-10 px-4 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Close</button>
          </div>
        </div>
      )}
    </BaseModal>
  );
}

export function MintMockModal({ open, onClose, quantity, slippage }: { open: boolean; onClose: () => void; quantity: number; slippage: number; }) {
  const unitPrice = 0.08;
  const estGas = 0.0032;
  const total = unitPrice * quantity + estGas;
  return (
    <BaseModal open={open} onClose={onClose} title="Confirm Mint" size="md">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500">Quantity</div>
          <div className="text-sm font-bold">{quantity}</div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500">Unit Price</div>
          <div className="text-sm font-bold">{unitPrice.toFixed(2)} ETH</div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500">Estimated Gas</div>
          <div className="text-sm font-bold">{estGas.toFixed(4)} ETH</div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500">Slippage</div>
          <div className="text-sm font-bold">{slippage.toFixed(1)}%</div>
        </div>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-gray-200/50 dark:border-gray-800/50">
        <span className="text-sm text-gray-600">Total (incl. gas)</span>
        <span className="text-lg font-extrabold text-dutch-navy dark:text-dutch-cream">{total.toFixed(4)} ETH</span>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="h-10 px-4 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Cancel</button>
        <button onClick={onClose} className="h-10 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold">Confirm Mint</button>
      </div>
    </BaseModal>
  );
}

export function QuickMintMockModal({ open, onClose, quantity }: { open: boolean; onClose: () => void; quantity: number; }) {
  return (
    <BaseModal open={open} onClose={onClose} title="Quick Mint" size="sm">
      <p className="text-sm text-gray-600 dark:text-gray-400">Fast path mint with slightly higher priority fee.</p>
      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <div className="flex justify-between text-sm">
          <span>Quantity</span>
          <span className="font-bold">{quantity}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Priority Fee</span>
          <span className="font-bold text-amber-600">+10%</span>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="h-10 px-4 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Close</button>
        <button onClick={onClose} className="h-10 px-4 rounded-xl bg-dutch-teal hover:bg-dutch-teal/90 text-white font-semibold">Start Quick Mint</button>
      </div>
    </BaseModal>
  );
}

export function DetailsMockModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BaseModal open={open} onClose={onClose} title="Mint Details" size="lg">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs text-gray-500">Auction Phases</div>
          <ul className="text-sm list-disc ml-4 space-y-1 text-gray-700 dark:text-gray-300">
            <li>Start: 0.15 ETH — 18:00 UTC</li>
            <li>Now: 0.08 ETH — price reduces every 15m</li>
            <li>Reserve: 0.05 ETH</li>
          </ul>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-500">Recent Activity</div>
          <ul className="text-sm space-y-1 font-mono">
            <li>0x7a9f…3d2c minted 2 — 0.16 ETH</li>
            <li>0xc4d8…9f2a minted 10 — 0.80 ETH</li>
            <li>0x9b12…aa02 minted 1 — 0.08 ETH</li>
          </ul>
        </div>
      </div>
      <div className="flex items-center gap-2 text-amber-600">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-xs">Mocks for demo purposes only. No on-chain transactions are executed.</span>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="h-10 px-4 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Close</button>
      </div>
    </BaseModal>
  );
}

export function SlippageModal({ open, onClose, value, onChange }: { open: boolean; onClose: () => void; value: number; onChange: (v: number) => void; }) {
  const [local, setLocal] = React.useState(value);
  React.useEffect(() => setLocal(value), [value, open]);
  return (
    <BaseModal open={open} onClose={onClose} title="Slippage Tolerance" size="sm">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-dutch-teal" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Set the maximum price deviation allowed</span>
        </div>
        <input
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={local}
          onChange={(e) => setLocal(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="text-center text-lg font-bold">{local.toFixed(1)}%</div>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="h-10 px-4 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Cancel</button>
        <button onClick={() => { onChange(local); onClose(); }} className="h-10 px-4 rounded-xl bg-dutch-teal hover:bg-dutch-teal/90 text-white font-semibold">Apply</button>
      </div>
    </BaseModal>
  );
}
