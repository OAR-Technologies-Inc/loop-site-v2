"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center pt-24 pb-16">
      {/* Subtle background */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest/10 border border-forest/20 text-forest-light text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-forest-light animate-pulse" />
            Building on Solana
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8"
        >
          The Economic Layer
          <br />
          <span className="gradient-text">for the Agentic Era</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-text-secondary leading-relaxed mb-10 max-w-3xl mx-auto"
        >
          Infrastructure for AI agents to capture, transfer, compound, and 
          inherit value on behalf of humans. Any agent can implement it. 
          Any human can benefit from it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="primary" size="lg" href="https://app.looplocal.io">
            Open App
          </Button>
          <Button variant="secondary" size="lg" href="https://github.com/southerncory/loop-protocol">
            Read Whitepaper
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
