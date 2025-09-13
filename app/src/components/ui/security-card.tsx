import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cn"
import { Shield, CheckCircle, Lock, Award } from "lucide-react"

interface SecurityCardProps {
  className?: string
}

const SecurityCard: React.FC<SecurityCardProps> = ({ className }) => {
  const features = [
    { icon: CheckCircle, label: "92% Core Coverage", status: "verified" },
    { icon: Shield, label: "Security Audited", status: "verified" },
    { icon: Lock, label: "Multi-Sig Protected", status: "verified" },
    { icon: Award, label: "Battle Tested", status: "verified" }
  ]

  return (
    <motion.div
      className={cn(
        "relative p-8 bg-gradient-to-br from-white/95 via-white/90 to-dutch-cream/30 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-dutch-navy/30 backdrop-blur-xl rounded-3xl border border-dutch-teal/20 shadow-2xl overflow-hidden",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      whileHover={{ y: -2 }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-dutch-teal/10 to-dutch-navy/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-dutch-navy dark:text-dutch-cream">
              Security First
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enterprise-grade protection
            </p>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-dutch-cream/20 dark:bg-dutch-navy/20 rounded-xl hover:bg-dutch-cream/30 dark:hover:bg-dutch-navy/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <feature.icon className="w-5 h-5 text-green-600" />
                <span className="font-medium text-dutch-navy dark:text-dutch-cream">
                  {feature.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-medium text-green-600 uppercase tracking-wider">
                  {feature.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Security Info */}
        <div className="mt-6 pt-4 border-t border-dutch-teal/10">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">0</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Exploits</div>
            </div>
            <div>
              <div className="text-lg font-bold text-dutch-orange">24/7</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Monitoring</div>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
          <div className="flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Certified Secure Protocol
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export { SecurityCard }
