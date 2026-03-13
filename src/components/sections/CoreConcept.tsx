"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function CoreConcept() {
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
            Core Concept
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-8">
            User-Captured Value
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-lg text-text-secondary leading-relaxed mb-6">
              Every economic interaction generates value. When you shop, your 
              purchase data is sold. When you browse, your attention is monetized. 
              When you exist, your location is tracked and licensed.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed mb-6">
              This value is captured by intermediaries — banks, platforms, data brokers. 
              You create it. They capture it.
            </p>
            <p className="text-lg text-text-primary leading-relaxed font-medium">
              Loop Protocol inverts this. Your agents capture value from your 
              activities and deposit it into your vault. It compounds over time. 
              It passes to your heirs. No intermediary extracts it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl bg-bg-surface border border-border-subtle"
          >
            <h3 className="font-display text-xl font-semibold mb-6 text-forest-light">
              How Value Flows
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-forest/20 flex items-center justify-center text-forest-light text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Activity generates value</p>
                  <p className="text-sm text-text-muted">Shopping, data, presence, attention</p>
                </div>
              </div>

              <div className="h-6 w-px bg-border-default ml-4" />

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-forest/20 flex items-center justify-center text-forest-light text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Agent captures proof</p>
                  <p className="text-sm text-text-muted">Cryptographic attestation from source</p>
                </div>
              </div>

              <div className="h-6 w-px bg-border-default ml-4" />

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-forest/20 flex items-center justify-center text-forest-light text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Module verifies & rewards</p>
                  <p className="text-sm text-text-muted">Cred minted to your vault</p>
                </div>
              </div>

              <div className="h-6 w-px bg-border-default ml-4" />

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-medium text-gold">Vault compounds</p>
                  <p className="text-sm text-text-muted">Stake for yield. Inherit to heirs.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
