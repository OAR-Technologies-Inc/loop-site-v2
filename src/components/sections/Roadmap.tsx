"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const phases = [
  {
    phase: "Phase 1",
    title: "Foundation",
    status: "current",
    timeline: "Q1 2026",
    items: [
      "Protocol architecture finalized",
      "Specification complete",
      "Core team assembled",
      "Community building begins",
    ],
  },
  {
    phase: "Phase 2",
    title: "Core Protocol",
    status: "upcoming",
    timeline: "Q2 2026",
    items: [
      "AVP on devnet",
      "Vault system live",
      "VTP integration",
      "Token contracts deployed",
    ],
  },
  {
    phase: "Phase 3",
    title: "Capture Integration",
    status: "upcoming",
    timeline: "Q3 2026",
    items: [
      "Shopping capture module",
      "POS integrations (Square, Stripe)",
      "Auto-staking system",
      "Mobile app beta",
    ],
  },
  {
    phase: "Phase 4",
    title: "Mainnet & Expansion",
    status: "upcoming",
    timeline: "Q4 2026",
    items: [
      "Mainnet launch",
      "Data capture module",
      "Presence module",
      "Agent marketplace",
    ],
  },
];

export function Roadmap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      id="roadmap"
      ref={containerRef}
      className="relative py-32 overflow-hidden"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Roadmap
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Building wealth infrastructure for the next era. Methodically.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-forest via-forest to-transparent hidden md:block" />

          <div className="space-y-16 md:space-y-0">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative md:w-1/2 ${
                  index % 2 === 0
                    ? "md:pr-16 md:ml-0"
                    : "md:pl-16 md:ml-auto"
                }`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute top-6 hidden md:flex items-center justify-center w-4 h-4 rounded-full border-2 ${
                    phase.status === "current"
                      ? "bg-forest border-forest-light"
                      : "bg-bg-base border-forest/50"
                  } ${index % 2 === 0 ? "right-0 translate-x-[calc(100%+2rem)]" : "left-0 -translate-x-[calc(100%+2rem)]"}`}
                >
                  {phase.status === "current" && (
                    <motion.div
                      className="absolute w-4 h-4 rounded-full bg-forest"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Card */}
                <div
                  className={`p-6 rounded-xl border transition-all duration-300 ${
                    phase.status === "current"
                      ? "bg-bg-elevated border-forest"
                      : "bg-bg-surface border-border-subtle"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`text-sm font-mono font-medium ${
                        phase.status === "current"
                          ? "text-forest-light"
                          : "text-text-muted"
                      }`}
                    >
                      {phase.phase}
                    </span>
                    <span className="text-text-muted">•</span>
                    <span className="text-sm text-text-muted">
                      {phase.timeline}
                    </span>
                    {phase.status === "current" && (
                      <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-forest/20 text-forest-light">
                        Current
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-4">
                    {phase.title}
                  </h3>

                  <ul className="space-y-2">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            phase.status === "current"
                              ? "bg-forest-light"
                              : "bg-text-muted"
                          }`}
                        />
                        <span className="text-text-secondary">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
