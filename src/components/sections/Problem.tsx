"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const problems = [
  {
    title: "The Extraction Economy",
    description:
      "Every transaction, every click, every moment of attention generates value. But you don't capture it. Platforms do. Banks do. Card networks take 3% of every purchase. You get nothing.",
    stat: "3%",
    statLabel: "extracted per transaction",
  },
  {
    title: "AI Accelerates Extraction",
    description:
      "AI agents are coming. They'll optimize, automate, and capture value at unprecedented scale. Without infrastructure to capture that value for yourself, you'll be extracted faster than ever.",
    stat: "10x",
    statLabel: "faster extraction ahead",
  },
  {
    title: "No Wealth Infrastructure",
    description:
      "Traditional finance isn't built for this. No way to capture micro-value. No way to compound automatically. No way for your agents to build wealth on your behalf.",
    stat: "0",
    statLabel: "tools built for you",
  },
];

export function Problem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      id="problem"
      ref={containerRef}
      className="relative py-32 overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-surface/50 to-bg-base" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            The Problem
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            The current economy is designed to extract value from you, not build
            wealth for you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-2xl bg-bg-surface border border-border-subtle hover:border-negative/30 transition-colors duration-300">
                {/* Red accent line */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-negative/50 to-transparent" />

                {/* Stat */}
                <div className="mb-6">
                  <span className="font-display text-5xl font-bold text-negative">
                    {problem.stat}
                  </span>
                  <span className="block text-text-muted text-sm mt-1">
                    {problem.statLabel}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold mb-4">
                  {problem.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {problem.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-negative/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transition statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-2xl md:text-3xl font-display font-medium text-text-secondary">
            It doesn&apos;t have to be this way.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
