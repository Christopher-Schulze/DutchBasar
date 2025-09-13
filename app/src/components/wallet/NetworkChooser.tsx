"use client";
import * as React from "react";
import { ChevronDown } from "lucide-react";

interface Network {
  id: string;
  name: string;
  chainId: number;
  logo: React.ReactNode;
}

const networks: Network[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    chainId: 1,
    logo: (
      <svg width="20" height="20" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg">
        <path fill="#343434" d="m127.961 0-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
        <path fill="#8C8C8C" d="m127.962 0-127.962 212.32 127.962 75.639V154.158z"/>
        <path fill="#3C3C3B" d="m127.961 312.187-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
        <path fill="#8C8C8C" d="m127.962 416.905v-104.72L0 236.585z"/>
        <path fill="#141414" d="m127.961 287.958 127.96-75.637-127.96-58.162z"/>
        <path fill="#393939" d="m0 212.32 127.96 75.638v-133.8z"/>
      </svg>
    )
  },
  {
    id: "base",
    name: "Base",
    chainId: 8453,
    logo: (
      <svg width="20" height="20" viewBox="0 0 111 111" xmlns="http://www.w3.org/2000/svg">
        <path fill="#0052FF" d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.632 85.359 0 54.921 0C26.790 0 3.67 21.471 0.637 48.956H74.544V61.078H0.637C3.67 88.563 26.790 110.034 54.921 110.034Z"/>
      </svg>
    )
  },
  {
    id: "arbitrum",
    name: "Arbitrum One",
    chainId: 42161,
    logo: (
      <svg width="20" height="20" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <path fill="#213147" d="M128 256c70.692 0 128-57.308 128-128S198.692 0 128 0 0 57.308 0 128s57.308 128 128 128z"/>
        <path fill="#12AAFF" d="M160.935 147.694c-2.252 4.461-6.118 7.963-10.684 9.686l-36.366 13.726c-5.24 1.978-11.096 1.978-16.336 0l-36.366-13.726c-4.566-1.723-8.432-5.225-10.684-9.686L35.47 119.23c-2.252-4.461-2.252-9.686 0-14.147l15.029-28.464c2.252-4.461 6.118-7.963 10.684-9.686l36.366-13.726c5.24-1.978 11.096-1.978 16.336 0l36.366 13.726c4.566 1.723 8.432 5.225 10.684 9.686l15.029 28.464c2.252 4.461 2.252 9.686 0 14.147l-15.029 28.464z"/>
        <path fill="#FFFFFF" d="M128 180.706c-29.106 0-52.706-23.6-52.706-52.706S98.894 75.294 128 75.294 180.706 98.894 180.706 128 157.106 180.706 128 180.706zm0-89.412c-20.235 0-36.706 16.471-36.706 36.706S107.765 164.706 128 164.706 164.706 148.235 164.706 128 148.235 91.294 128 91.294z"/>
      </svg>
    )
  },
  {
    id: "optimism",
    name: "Optimism",
    chainId: 10,
    logo: (
      <svg width="20" height="20" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#FF0420"/>
        <path fill="#FFFFFF" d="M73.5 143.2c-8.3 0-14.9-2.7-19.8-8.1-4.9-5.4-7.3-12.9-7.3-22.5s2.4-17.1 7.3-22.5c4.9-5.4 11.5-8.1 19.8-8.1s14.9 2.7 19.8 8.1c4.9 5.4 7.3 12.9 7.3 22.5s-2.4 17.1-7.3 22.5c-4.9 5.4-11.5 8.1-19.8 8.1zm0-16.2c2.7 0 4.9-.9 6.5-2.8 1.6-1.9 2.4-4.6 2.4-8.2s-.8-6.3-2.4-8.2c-1.6-1.9-3.8-2.8-6.5-2.8s-4.9.9-6.5 2.8c-1.6 1.9-2.4 4.6-2.4 8.2s.8 6.3 2.4 8.2c1.6 1.9 3.8 2.8 6.5 2.8zm36.5-44.5h22.8c8.1 0 14.5 2.1 19.2 6.3 4.7 4.2 7 10 7 17.4 0 7.4-2.3 13.2-7 17.4-4.7 4.2-11.1 6.3-19.2 6.3h-4.6v12.6H110V82.5zm18.2 31.8h3.6c2.7 0 4.8-.7 6.3-2.1 1.5-1.4 2.2-3.3 2.2-5.7s-.7-4.3-2.2-5.7c-1.5-1.4-3.6-2.1-6.3-2.1h-3.6v15.6z"/>
      </svg>
    )
  },
  {
    id: "scroll",
    name: "Scroll",
    chainId: 534352,
    logo: (
      <svg width="20" height="20" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#FFEEDA"/>
        <path fill="#EB7A3D" d="M128 40c48.6 0 88 39.4 88 88s-39.4 88-88 88-88-39.4-88-88 39.4-88 88-88zm0 16c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"/>
        <path fill="#EB7A3D" d="M128 80c26.5 0 48 21.5 48 48s-21.5 48-48 48-48-21.5-48-48 21.5-48 48-48zm0 16c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32z"/>
      </svg>
    )
  },
  {
    id: "polygon-zkevm",
    name: "Polygon zkEVM",
    chainId: 1101,
    logo: (
      <svg width="20" height="20" viewBox="0 0 38 33" xmlns="http://www.w3.org/2000/svg">
        <path fill="#8247E5" d="M29 10.2c-.7-.4-1.6-.4-2.4 0L21 13.5c-1.3.7-2.3 2.1-2.3 3.5v6.6c0 1.4 1 2.8 2.3 3.5l5.6 3.3c.7.4 1.6.4 2.4 0l5.6-3.3c1.3-.7 2.3-2.1 2.3-3.5V17c0-1.4-1-2.8-2.3-3.5l-5.6-3.3zm-11.8 9l-9.8-5.7c-.7-.4-1.6-.4-2.4 0L0 16.8V10l11.3-6.6c.7-.4 1.6-.4 2.4 0L25 10v6.8l-7.8-4.5z"/>
      </svg>
    )
  },
  {
    id: "zksync",
    name: "zkSync Era",
    chainId: 324,
    logo: (
      <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4E529A" d="M24 0L0 14.4v19.2L24 48l24-14.4V14.4z"/>
        <path fill="#8C8DFC" d="M24 7.2L7.2 17.28V27.36L24 37.44V7.2z"/>
        <path fill="#FFFFFF" d="M24 7.2l16.8 10.08V27.36L24 37.44V7.2z"/>
      </svg>
    )
  },
  {
    id: "bnb",
    name: "BNB Smart Chain",
    chainId: 56,
    logo: (
      <svg width="20" height="20" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <path fill="#F3BA2F" d="M20 0l5.66 5.66-3.77 3.77-1.89-1.89-1.89 1.89-3.77-3.77L20 0zm5.66 14.34l3.77-3.77L35.09 16.23l-3.77 3.77-5.66-5.66zm-11.32 0L8.68 20l5.66 5.66 3.77-3.77-3.77-3.77zm5.66 5.66l3.77 3.77-3.77 3.77-3.77-3.77 3.77-3.77zm5.66 5.66l3.77 3.77-3.77 3.77-3.77-3.77 3.77-3.77zm-11.32 0l-3.77 3.77 3.77 3.77 3.77-3.77-3.77-3.77zm5.66 5.66l1.89 1.89 1.89-1.89 3.77 3.77L20 40l-5.66-5.66 3.77-3.77z"/>
      </svg>
    )
  }
];

export function NetworkChooser({ className = "" }: { className?: string }) {
  const [selectedNetwork, setSelectedNetwork] = React.useState(networks[0]);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 h-11 px-4 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
        aria-label="Choose Network"
      >
        {selectedNetwork.logo}
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {selectedNetwork.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => {
                  setSelectedNetwork(network);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedNetwork.id === network.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {network.logo}
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {network.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Chain ID: {network.chainId}
                  </div>
                </div>
                {selectedNetwork.id === network.id && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
