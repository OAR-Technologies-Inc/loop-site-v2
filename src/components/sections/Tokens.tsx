"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function Tokens() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="tokenomics" ref={containerRef} className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-surface/30 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-forest-light text-sm font-medium tracking-wider uppercase mb-4 block">
            Token Economics
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Two Tokens
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl">
            Cred is wealth. OXO is ownership. Different purposes, aligned incentives.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* CRED */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 md:p-10 rounded-2xl bg-bg-surface border border-forest/30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-forest/20 flex items-center justify-center">
                <span className="font-mono text-xl font-bold text-forest-light">C</span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold">Cred</h3>
                <p className="text-text-muted">Stable value layer</p>
              </div>
            </div>

            <p className="text-text-secondary leading-relaxed mb-8">
              Cred is your wealth token. Pegged 1:1 to USD with elastic supply — 
              minted when you capture value, burned when you extract. Designed for 
              accumulation, not speculation.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-2xl font-bold text-forest-light">$1.00</p>
                <p className="text-sm text-text-muted">Stable value</p>
              </div>
              <div>
                <p className="text-2xl font-bold">Elastic</p>
                <p className="text-sm text-text-muted">Supply</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-forest-light">3-15%</p>
                <p className="text-sm text-text-muted">Staking APY</p>
              </div>
              <div>
                <p className="text-2xl font-bold">5%</p>
                <p className="text-sm text-text-muted">Extraction fee</p>
              </div>
            </div>

            <div className="pt-6 border-t border-border-subtle">
              <p className="text-sm text-text-muted mb-3">What you do with Cred:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-forest-light" />
                  Stack (lock) for yield — longer lock = higher APY
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-forest-light" />
                  Transfer to other vaults
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-forest-light" />
                  Extract to fiat (resets vault to zero)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-forest-light" />
                  Pass to heirs on death
                </li>
              </ul>
            </div>
          </motion.div>

          {/* OXO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 md:p-10 rounded-2xl bg-bg-surface border border-gold/30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="font-mono text-xl font-bold text-gold">O</span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold">OXO</h3>
                <p className="text-text-muted">Protocol equity layer</p>
              </div>
            </div>

            <p className="text-text-secondary leading-relaxed mb-8">
              OXO is your stake in the protocol itself. Fixed supply of 1 billion. 
              Lock for veOXO to vote on governance, earn protocol fees, and access 
              boosted capture rates. Required for Service Agent creation.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-2xl font-bold text-gold">1B</p>
                <p className="text-sm text-text-muted">Fixed supply</p>
              </div>
              <div>
                <p className="text-2xl font-bold">veOXO</p>
                <p className="text-sm text-text-muted">Governance token</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gold">500</p>
                <p className="text-sm text-text-muted">OXO to launch Service Agent</p>
              </div>
              <div>
                <p className="text-2xl font-bold">6mo-4yr</p>
                <p className="text-sm text-text-muted">Lock duration</p>
              </div>
            </div>

            <div className="pt-6 border-t border-border-subtle">
              <p className="text-sm text-text-muted mb-3">What you do with OXO:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  Lock for veOXO — governance voting power
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  Earn share of protocol fees
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  Boost capture rates (+10-25%)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  Create and launch Service Agents
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Value distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 p-8 rounded-2xl bg-bg-surface border border-border-subtle"
        >
          <h3 className="font-display text-xl font-semibold mb-6">
            Value Distribution
          </h3>
          <p className="text-text-secondary mb-6">
            When value is captured, it&apos;s distributed across the ecosystem:
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-forest-light" />
              <span className="text-sm">
                <span className="font-bold">80-85%</span> → User vault
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-forest" />
              <span className="text-sm">
                <span className="font-bold">10-14%</span> → Protocol treasury
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gold" />
              <span className="text-sm">
                <span className="font-bold">5-6%</span> → veOXO stakers
              </span>
            </div>
          </div>
        </motion.div>

        {/* OXO Token Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 p-8 rounded-2xl bg-bg-surface border border-gold/30"
        >
          <h3 className="font-display text-xl font-semibold mb-6">
            OXO Token Distribution
          </h3>
          <p className="text-text-secondary mb-8">
            1 billion OXO, fixed supply. No inflation. No surprise mints.
          </p>
          
          {/* Distribution bars */}
          <div className="space-y-4 mb-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Community & Public</span>
                <span className="text-gold font-bold">50% — 500M OXO</span>
              </div>
              <div className="h-3 bg-bg-base rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: '50%' }} />
              </div>
              <p className="text-xs text-text-muted mt-1">Airdrops, capture bonuses, staking rewards, referrals</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Treasury</span>
                <span className="text-forest-light font-bold">25% — 250M OXO</span>
              </div>
              <div className="h-3 bg-bg-base rounded-full overflow-hidden">
                <div className="h-full bg-forest-light rounded-full" style={{ width: '25%' }} />
              </div>
              <p className="text-xs text-text-muted mt-1">DAO-governed, max 10% annual emission for grants & development</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Team & Early Contributors</span>
                <span className="text-text-secondary font-bold">15% — 150M OXO</span>
              </div>
              <div className="h-3 bg-bg-base rounded-full overflow-hidden">
                <div className="h-full bg-text-muted rounded-full" style={{ width: '15%' }} />
              </div>
              <p className="text-xs text-text-muted mt-1">2-year vest, 6-month cliff</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Liquidity</span>
                <span className="text-forest font-bold">5% — 50M OXO</span>
              </div>
              <div className="h-3 bg-bg-base rounded-full overflow-hidden">
                <div className="h-full bg-forest rounded-full" style={{ width: '5%' }} />
              </div>
              <p className="text-xs text-text-muted mt-1">DEX liquidity pools at launch</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Ecosystem Partners</span>
                <span className="text-forest font-bold">5% — 50M OXO</span>
              </div>
              <div className="h-3 bg-bg-base rounded-full overflow-hidden">
                <div className="h-full bg-forest/70 rounded-full" style={{ width: '5%' }} />
              </div>
              <p className="text-xs text-text-muted mt-1">Integrations, agent frameworks, merchants — 1-year vest</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border-subtle text-center">
            <p className="text-sm text-text-secondary">
              <span className="text-gold font-semibold">50% to community.</span> This isn&apos;t a VC exit. This is user-owned infrastructure.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
