"use client";
import * as React from "react";
import { getMetaMaskProvider } from "@/lib/metamask";

export function ConnectMetaMask({ className = "" }: { className?: string }) {
  const [connecting, setConnecting] = React.useState(false);
  const [account, setAccount] = React.useState<string | null>(null);

  const onClick = async () => {
    try {
      setConnecting(true);
      const provider = getMetaMaskProvider();
      if (!provider) {
        console.warn("MetaMask provider not available. Please install MetaMask.");
        setConnecting(false);
        return;
      }
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      setAccount(accounts?.[0] ?? null);
    } catch (err) {
      console.error("MetaMask connect failed", err);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={connecting}
      className={[
        // Original MetaMask button styling - orange/fox colors, rounded
        "inline-flex items-center gap-3 rounded-lg bg-[#f6851b] hover:bg-[#e2761b] h-11 px-5 text-base text-white font-semibold",
        "shadow-lg hover:shadow-xl transition-all duration-200 border border-[#e2761b] disabled:opacity-60",
        className,
      ].join(" ")}
      aria-label="Connect with MetaMask"
    >
      {/* Official MetaMask Fox Logo */}
      <svg width="24" height="24" viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" d="m274.1 35.5-99.5 73.9L193 65.8z"/>
        <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="m44.4 35.5 98.7 74.6-17.5-44.3zm193.9 171.3-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z"/>
        <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="m103.6 138.2-15.8 23.9 56.3 2.5-2-60.5zm111.3 0-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5 33.9 16.5-4.7-39.3z"/>
        <path fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" d="m177.9 230.9-33.9-16.5 2.7 22.1-.3 9.3zm-71.1 0 31.5 14.9-.2-9.3 2.5-22.1z"/>
        <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="m138.8 193.5-28.2-8.3 19.9-9.1zm40.9 0 8.3-17.4 20 9.1z"/>
        <path fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" d="m106.8 247.4 4.8-40.6-31.3.9zM173.1 206.8l4.8 40.6 26.5-39.7zM214.9 162.1l-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-126.7 23.1 20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z"/>
        <path fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" d="m87.8 162.1 23.6 46-.8-22.9zm104.4 23.1-.8 22.9 23.7-46zM158.7 164.6l-5.3 28.9 6.6 34.1 1.5-44.9zm51.2 0-2.7 18 1.2 45 6.7-34.1z"/>
      </svg>
      {account ? `${account.slice(0, 6)}…${account.slice(-4)}` : connecting ? "Connecting..." : "Connect with MetaMask"}
    </button>
  );
}
