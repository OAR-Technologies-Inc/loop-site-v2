"use client";

import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Link2, 
  Eye, 
  Database, 
  Cpu, 
  Network, 
  Brain,
  TrendingUp,
  Zap,
  Users,
  Shield
} from "lucide-react";

const layers = [
  {
    name: "Shopping",
    icon: ShoppingCart,
    description: "Earn from every purchase. Merchant rewards flow directly to your vault.",
    lowEstimate: 50,
    highEstimate: 200,
    status: "live",
  },
  {
    name: "Referral",
    icon: Link2,
    description: "Share products, earn commission. Your agent auto-tags affiliate links.",
    lowEstimate: 20,
    highEstimate: 100,
    status: "building",
  },
  {
    name: "Attention",
    icon: Eye,
    description: "Opt-in to ads you choose. Get paid for your attention, not exploited.",
    lowEstimate: 10,
    highEstimate: 40,
    status: "building",
  },
  {
    name: "Data",
    icon: Database,
    description: "License your data on your terms. You set the price, you keep the value.",
    lowEstimate: 20,
    highEstimate: 50,
    status: "planned",
  },
  {
    name: "Compute",
    icon: Cpu,
    description: "Rent your idle CPU/GPU. Your devices earn while you sleep.",
    lowEstimate: 15,
    highEstimate: 60,
    status: "planned",
  },
  {
    name: "Network",
    icon: Network,
    description: "Run nodes, vote in DAOs, attest data. Passive protocol participation.",
    lowEstimate: 10,
    highEstimate: 30,
    status: "planned",
  },
  {
    name: "Skill",
    icon: Brain,
    description: "License your behavior patterns. Your expertise becomes passive income.",
    lowEstimate: 10,
    highEstimate: 50,
    status: "planned",
  },
  {
    name: "Liquidity",
    icon: TrendingUp,
    description: "Your agent deploys idle capital. DeFi yields without the complexity.",
    lowEstimate: 0,
    highEstimate: 0,
    isApy: true,
    apyRange: "8-20%",
    status: "planned",
  },
  {
    name: "Energy",
    icon: Zap,
    description: "EV and battery arbitrage. Buy low, sell high, automatically.",
    lowEstimate: 30,
    highEstimate: 150,
    status: "planned",
  },
  {
    name: "Social",
    icon: Users,
    description: "Monetize your network. Paid intros, reputation staking, access gating.",
    lowEstimate: 0,
    highEstimate: 500,
    status: "planned",
  },
  {
    name: "Insurance",
    icon: Shield,
    description: "Risk pooling across vaults. Lower premiums, shared coverage.",
    lowEstimate: 20,
    highEstimate: 100,
    isSavings: true,
    status: "planned",
  },
];

function StatusBadge({ status }: { status: string }) {
  const colors = {
    live: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    building: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    planned: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };
  
  const labels = {
    live: "Live on Devnet",
    building: "Building Now",
    planned: "Roadmap",
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${colors[status as keyof typeof colors]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}

export function CaptureLayers() {
  // Note: Total estimates available if needed
  // Low: ~$2,300/yr, High: ~$8,100/yr across all capture layers
  
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-black pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-emerald-400 font-mono text-sm mb-4">PASSIVE INCOME STACK</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            11 Ways Your Agent Earns
            <br />
            <span className="text-emerald-400">While You Live Your Life</span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Every dimension of existence generates value. Your agent captures it. 
            Your vault compounds it. Your heirs inherit it.
          </p>
        </motion.div>
        
        {/* Grid of layers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {layers.map((layer, index) => (
            <motion.div
              key={layer.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                  <layer.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <StatusBadge status={layer.status} />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">{layer.name}</h3>
              <p className="text-zinc-400 text-sm mb-4">{layer.description}</p>
              
              <div className="pt-4 border-t border-zinc-800">
                {layer.isApy ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-400">{layer.apyRange}</span>
                    <span className="text-zinc-500 text-sm">APY on deployed capital</span>
                  </div>
                ) : layer.isSavings ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-400">${layer.lowEstimate}-{layer.highEstimate}</span>
                    <span className="text-zinc-500 text-sm">/mo savings</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-400">${layer.lowEstimate}-{layer.highEstimate}</span>
                    <span className="text-zinc-500 text-sm">/month</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Summary box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-3xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-zinc-400 mb-2">Average User Monthly</p>
              <p className="text-4xl font-bold text-white">$200-300</p>
              <p className="text-emerald-400 text-sm mt-1">passive income</p>
            </div>
            <div>
              <p className="text-zinc-400 mb-2">Compounded @ 12% APY</p>
              <p className="text-4xl font-bold text-white">$2.3M+</p>
              <p className="text-emerald-400 text-sm mt-1">after 40 years</p>
            </div>
            <div>
              <p className="text-zinc-400 mb-2">Power User Potential</p>
              <p className="text-4xl font-bold text-white">$11M+</p>
              <p className="text-emerald-400 text-sm mt-1">with all layers active</p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-emerald-500/20 text-center">
            <p className="text-xl text-white">
              <span className="text-emerald-400 font-semibold">Inheritable.</span> Your children start where you left off.
            </p>
            <p className="text-zinc-400 mt-2">
              This isn&apos;t UBI. This is sovereign wealth you earn by existing.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
