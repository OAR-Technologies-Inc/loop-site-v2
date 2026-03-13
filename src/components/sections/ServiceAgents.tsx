"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function ServiceAgents() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-forest-light text-sm font-medium tracking-wider uppercase mb-4 block">
            Creator Economy
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Service Agents
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl">
            Build agents that serve the ecosystem. Earn from their usage.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-lg text-text-secondary leading-relaxed mb-6">
              Personal Agents serve one human. Service Agents serve many. If you're 
              a developer, you can create Service Agents that provide capabilities 
              to the ecosystem — data analysis, trading strategies, content generation, 
              specialized capture modules.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed mb-6">
              Service Agents charge fees for their services. Creators receive 90% 
              of fees. Service Agents can optionally launch their own token on a 
              bonding curve, allowing community co-ownership.
            </p>
            <p className="text-lg text-text-primary leading-relaxed font-medium">
              This creates a two-sided ecosystem: users benefit from Personal Agents, 
              creators profit from Service Agents.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Lifecycle */}
            <div className="p-6 rounded-xl bg-bg-surface border border-border-subtle">
              <h3 className="font-display text-lg font-semibold mb-4">
                Service Agent Lifecycle
              </h3>
              <ol className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest/20 flex items-center justify-center text-forest-light font-bold flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Pay 500 OXO registration fee</p>
                    <p className="text-text-muted">Stake requirement ensures commitment</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest/20 flex items-center justify-center text-forest-light font-bold flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Register capabilities and fee structure</p>
                    <p className="text-text-muted">Declare what your agent does</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest/20 flex items-center justify-center text-forest-light font-bold flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Optionally launch agent token</p>
                    <p className="text-text-muted">Bonding curve, graduate at 25k OXO</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold flex-shrink-0">
                    4
                  </span>
                  <div>
                    <p className="font-medium text-gold">Earn 90% of service fees</p>
                    <p className="text-text-muted">Revenue to creator wallet</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle">
                <p className="text-2xl font-bold text-forest-light">90%</p>
                <p className="text-sm text-text-muted">Creator fee share</p>
              </div>
              <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle">
                <p className="text-2xl font-bold">500</p>
                <p className="text-sm text-text-muted">OXO to launch</p>
              </div>
              <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle">
                <p className="text-2xl font-bold text-gold">25,000</p>
                <p className="text-sm text-text-muted">OXO to graduate</p>
              </div>
              <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle">
                <p className="text-2xl font-bold">10yr</p>
                <p className="text-sm text-text-muted">LP lock post-graduation</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
