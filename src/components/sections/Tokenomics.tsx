"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const tokens = [
  {
    id: "cred",
    symbol: "CRED",
    name: "Your Stable Wealth",
    tagline: "Stack it. Stake it. Grow it.",
    description:
      "Cred is your wealth layer. Stable value (1 CRED = $1), elastic supply, designed for accumulation. Your agents capture value as Cred. You stake it to earn yield. Wealth that compounds, not fluctuates.",
    features: [
      { label: "Value", value: "$1 stable" },
      { label: "Supply", value: "Elastic" },
      { label: "Staking APY", value: "10-20%" },
      { label: "Purpose", value: "Wealth accumulation" },
    ],
    color: "forest",
    icon: (
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
        <text
          x="20"
          y="25"
          textAnchor="middle"
          fill="currentColor"
          fontSize="14"
          fontWeight="700"
        >
          C
        </text>
      </svg>
    ),
  },
  {
    id: "oxo",
    symbol: "OXO",
    name: "Protocol Equity",
    tagline: "Own the network. Shape its future.",
    description:
      "OXO is your stake in Loop itself. Fixed supply (1B), governance rights via veOXO, value accrues as the protocol grows. Lock OXO to earn protocol fees and vote on the future.",
    features: [
      { label: "Supply", value: "1,000,000,000" },
      { label: "Type", value: "Fixed" },
      { label: "Governance", value: "veOXO" },
      { label: "Purpose", value: "Protocol ownership" },
    ],
    color: "gold",
    icon: (
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="28" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" />
        <line
          x1="16"
          y1="20"
          x2="24"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

function TokenCard({
  token,
  isActive,
  onClick,
}: {
  token: (typeof tokens)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      className={`relative p-8 rounded-2xl border cursor-pointer transition-all duration-500 ${
        isActive
          ? token.color === "gold"
            ? "bg-bg-elevated border-gold shadow-lg shadow-gold/10"
            : "bg-bg-elevated border-forest shadow-lg shadow-forest/10"
          : "bg-bg-surface border-border-subtle hover:border-border-default"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-8 right-8 h-px transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        } ${
          token.color === "gold"
            ? "bg-gradient-to-r from-transparent via-gold to-transparent"
            : "bg-gradient-to-r from-transparent via-forest to-transparent"
        }`}
      />

      <div className="flex items-start gap-6">
        {/* Icon */}
        <div
          className={`w-16 h-16 flex-shrink-0 ${
            token.color === "gold" ? "text-gold" : "text-forest-light"
          }`}
        >
          {token.icon}
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`font-mono text-2xl font-bold ${
                token.color === "gold" ? "text-gold" : "text-forest-light"
              }`}
            >
              ${token.symbol}
            </span>
            <span className="text-text-muted">—</span>
            <span className="text-text-secondary">{token.name}</span>
          </div>

          <p className="text-lg text-text-primary mb-2">{token.tagline}</p>
          <p className="text-text-secondary leading-relaxed mb-6">
            {token.description}
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {token.features.map((feature) => (
              <div key={feature.label}>
                <div
                  className={`text-lg font-semibold ${
                    token.color === "gold" ? "text-gold" : "text-forest-light"
                  }`}
                >
                  {feature.value}
                </div>
                <div className="text-sm text-text-muted">{feature.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Tokenomics() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeToken, setActiveToken] = useState("cred");

  return (
    <section
      id="tokenomics"
      ref={containerRef}
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-surface/30 to-bg-base" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Two Tokens, Clear Purpose
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Cred is your wealth. OXO is your ownership. No confusion. No
            complexity. Just aligned incentives.
          </p>
        </motion.div>

        <div className="space-y-6">
          {tokens.map((token, index) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <TokenCard
                token={token}
                isActive={activeToken === token.id}
                onClick={() => setActiveToken(token.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Key insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-xl bg-bg-surface border border-border-subtle">
            <span className="text-forest-light font-mono font-bold">CRED</span>
            <span className="text-text-muted">builds your wealth</span>
            <span className="text-text-muted">•</span>
            <span className="text-gold font-mono font-bold">OXO</span>
            <span className="text-text-muted">grows with the protocol</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
