import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cn"

interface Chain {
  name: string
  type: string
  fee: string
  logo: React.ReactNode
}

const chains: Chain[] = [
  { 
    name: "Ethereum", 
    type: "Layer 1", 
    fee: "0.00126", 
    logo: (
      <svg width="16" height="16" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg">
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
    name: "Base", 
    type: "Layer 2", 
    fee: "0.00011", 
    logo: (
      <svg width="16" height="16" viewBox="0 0 111 111" xmlns="http://www.w3.org/2000/svg">
        <path fill="#0052FF" d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.632 85.359 0 54.921 0C26.790 0 3.67 21.471 0.637 48.956H74.544V61.078H0.637C3.67 88.563 26.790 110.034 54.921 110.034Z"/>
      </svg>
    )
  },
  { 
    name: "Arbitrum One", 
    type: "Layer 2", 
    fee: "0.00013", 
    logo: (
      <svg width="16" height="16" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <path fill="#213147" d="M128 256c70.692 0 128-57.308 128-128S198.692 0 128 0 0 57.308 0 128s57.308 128 128 128z"/>
        <path fill="#12AAFF" d="M160.935 147.694c-2.252 4.461-6.118 7.963-10.684 9.686l-36.366 13.726c-5.24 1.978-11.096 1.978-16.336 0l-36.366-13.726c-4.566-1.723-8.432-5.225-10.684-9.686L35.47 119.23c-2.252-4.461-2.252-9.686 0-14.147l15.029-28.464c2.252-4.461 6.118-7.963 10.684-9.686l36.366-13.726c5.24-1.978 11.096-1.978 16.336 0l36.366 13.726c4.566 1.723 8.432 5.225 10.684 9.686l15.029 28.464c2.252 4.461 2.252 9.686 0 14.147l-15.029 28.464z"/>
        <path fill="#FFFFFF" d="M128 180.706c-29.106 0-52.706-23.6-52.706-52.706S98.894 75.294 128 75.294 180.706 98.894 180.706 128 157.106 180.706 128 180.706zm0-89.412c-20.235 0-36.706 16.471-36.706 36.706S107.765 164.706 128 164.706 164.706 148.235 164.706 128 148.235 91.294 128 91.294z"/>
      </svg>
    )
  },
  { 
    name: "Optimism", 
    type: "Layer 2", 
    fee: "0.00010", 
    logo: (
      <svg width="16" height="16" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#FF0420"/>
        <path fill="#FFFFFF" d="M158.887 107.332c-14.132 0-25.64 8.245-28.640 19.201h-12.494c-3-10.956-14.508-19.201-28.64-19.201-15.464 0-28 12.536-28 28s12.536 28 28 28c14.132 0 25.64-8.245 28.64-19.201h12.494c3 10.956 14.508 19.201 28.64 19.201 15.464 0 28-12.536 28-28s-12.536-28-28-28z"/>
      </svg>
    )
  },
  { 
    name: "Scroll", 
    type: "Layer 2", 
    fee: "0.00012", 
    logo: (
      <svg width="16" height="16" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#FFEEDA"/>
        <path fill="#EB7A3D" d="M128 40c48.6 0 88 39.4 88 88s-39.4 88-88 88-88-39.4-88-88 39.4-88 88-88zm0 16c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"/>
        <path fill="#EB7A3D" d="M128 80c26.5 0 48 21.5 48 48s-21.5 48-48 48-48-21.5-48-48 21.5-48 48-48zm0 16c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32z"/>
      </svg>
    )
  },
  { 
    name: "Polygon zkEVM", 
    type: "Layer 2", 
    fee: "0.00009", 
    logo: (
      <svg width="16" height="16" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <path fill="#8247E5" d="M128 256c70.692 0 128-57.308 128-128S198.692 0 128 0 0 57.308 0 128s57.308 128 128 128z"/>
        <path fill="#FFFFFF" d="M174.4 93.44L145.6 77.12c-4.8-2.72-10.72-2.72-15.52 0L101.28 93.44c-4.8 2.72-7.68 7.68-7.68 13.12v32.64c0 5.44 2.88 10.4 7.68 13.12l28.8 16.32c4.8 2.72 10.72 2.72 15.52 0l28.8-16.32c4.8-2.72 7.68-7.68 7.68-13.12v-32.64c0-5.44-2.88-10.4-7.68-13.12z"/>
      </svg>
    )
  },
  { 
    name: "zkSync Era", 
    type: "Layer 2", 
    fee: "0.00009", 
    logo: (
      <svg width="16" height="16" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#8C8DFC"/>
        <path fill="#FFFFFF" d="M128 64l64 64-64 64-64-64z"/>
        <path fill="#4E529A" d="M128 96l32 32-32 32-32-32z"/>
      </svg>
    )
  },
  { 
    name: "BNB Smart Chain", 
    type: "Layer 1", 
    fee: "0.00024", 
    logo: (
      <svg width="16" height="16" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#F3BA2F"/>
        <path fill="#FFFFFF" d="M128 64l24 24-24 24-24-24zm-48 48l24-24 24 24-24 24zm96 0l24-24 24 24-24 24zm-48 48l24-24 24 24-24 24z"/>
        <path fill="#FFFFFF" d="M128 128l16-16h32l-16 16 16 16h-32z"/>
      </svg>
    )
  }
]

interface MultichainCardProps {
  className?: string
}

const MultichainCard: React.FC<MultichainCardProps> = ({ className }) => {
  return (
    <motion.div
      className={cn(
        "relative p-8 bg-gradient-to-br from-white/95 via-white/90 to-dutch-cream/30 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-dutch-navy/30 backdrop-blur-xl rounded-3xl border border-dutch-teal/20 shadow-2xl overflow-hidden",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -2 }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-dutch-teal/10 to-dutch-navy/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-dutch-orange/10 to-dutch-gold/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-dutch-navy dark:text-dutch-cream mb-2">
            Multichain and Layer 2 Support
          </h3>
        </div>

        {/* Live Fees Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Live Estimated Fees (ETH per Mint)
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-600">Live</span>
          </div>
        </div>

        {/* Separator */}
        <div className="mb-6 border-t border-dutch-teal/10"></div>

        {/* Chains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {chains.map((chain, index) => (
            <motion.div
              key={chain.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-dutch-cream/20 dark:bg-dutch-navy/20 rounded-xl hover:bg-dutch-cream/30 dark:hover:bg-dutch-navy/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {chain.logo}
                <div>
                  <div className="font-medium text-dutch-navy dark:text-dutch-cream text-sm">
                    {chain.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {chain.type}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-dutch-orange group-hover:text-dutch-tulip transition-colors">
                  {chain.fee}
                </div>
                <div className="text-xs text-gray-500">{chain.name === "BNB Smart Chain" ? "BNB" : "ETH"}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Separator */}
        <div className="mt-6 mb-4 border-t border-dutch-teal/10"></div>

        {/* Implementation & Security Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-lg font-semibold text-dutch-navy dark:text-dutch-cream mb-2">
              ERC-721A Implementation
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Batch Minting and Optimized Storage Patterns
            </p>
          </div>
          <div className="border-l border-dutch-teal/10 pl-6">
            <h4 className="text-lg font-semibold text-dutch-navy dark:text-dutch-cream mb-2">
              Security First
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              92% Core Test Coverage • Audited with Slither
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  )
}

export { MultichainCard }
