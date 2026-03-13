"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const components = [
  { name: "Repository structure", status: "complete" },
  { name: "Architecture specification", status: "complete" },
  { name: "Whitepaper draft", status: "complete" },
  { name: "AVP specification", status: "complete" },
  { name: "VTP specification", status: "complete" },
  { name: "Vault specification", status: "complete" },
  { name: "Cred token spec", status: "complete" },
  { name: "OXO token spec", status: "complete" },
  { name: "veOXO spec", status: "complete" },
  { name: "Shopping module spec", status: "complete" },
  { name: "Solana programs (6)", status: "complete" },
  { name: "TypeScript SDK", status: "complete" },
  { name: "Integration tests", status: "complete" },
  { name: "Devnet deployment", status: "building" },
  { name: "Security audit", status: "planned" },
  { name: "Merchant integrations", status: "planned" },
];

const timeline = [
  {
    phase: "Phase 1",
    name: "Foundation",
    status: "complete",
    period: "Q1 2026",
    items: ["Specifications complete", "Architecture defined", "Whitepaper published"],
  },
  {
    phase: "Phase 2",
    name: "Core Protocol",
    status: "current",
    period: "Q1-Q2 2026",
    items: ["All 6 Solana programs built", "TypeScript SDK released", "Integration tests passing", "Devnet deployment"],
  },
  {
    phase: "Phase 3",
    name: "Audit & Launch",
    status: "next",
    period: "Q2 2026",
    items: ["Security audit", "elizaOS integration", "Mainnet deployment", "Agent demos"],
  },
  {
    phase: "Phase 4",
    name: "Ecosystem",
    status: "future",
    period: "Q3-Q4 2026",
    items: ["Merchant integrations", "Additional capture modules", "Service Agent marketplace", "Mobile app"],
  },
];

export function Development() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="roadmap" ref={containerRef} className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-forest-light text-sm font-medium tracking-wider uppercase mb-4 block">
            Development Status
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Building in Public
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl">
            Current phase: Core Protocol. All programs built. SDK released. Preparing for audit.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Component status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="font-display text-xl font-semibold mb-6">
              Component Status
            </h3>
            <div className="space-y-3">
              {components.map((component) => (
                <div
                  key={component.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-bg-surface border border-border-subtle"
                >
                  <span className="text-sm">{component.name}</span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      component.status === "complete"
                        ? "bg-forest/20 text-forest-light"
                        : component.status === "building"
                        ? "bg-gold/20 text-gold"
                        : "bg-bg-elevated text-text-muted"
                    }`}
                  >
                    {component.status === "complete"
                      ? "✓ Complete"
                      : component.status === "building"
                      ? "→ Building"
                      : "Planned"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-display text-xl font-semibold mb-6">
              Timeline
            </h3>
            <div className="space-y-6">
              {timeline.map((phase, index) => (
                <div
                  key={phase.phase}
                  className={`p-5 rounded-xl border ${
                    phase.status === "current"
                      ? "bg-bg-elevated border-forest"
                      : "bg-bg-surface border-border-subtle"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`text-xs font-mono font-medium ${
                        phase.status === "current"
                          ? "text-forest-light"
                          : "text-text-muted"
                      }`}
                    >
                      {phase.phase}
                    </span>
                    <span className="text-text-muted">•</span>
                    <span className="text-xs text-text-muted">{phase.period}</span>
                    {phase.status === "current" && (
                      <span className="ml-auto text-xs bg-forest/20 text-forest-light px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold mb-2">{phase.name}</h4>
                  <ul className="space-y-1">
                    {phase.items.map((item, i) => (
                      <li key={i} className="text-sm text-text-muted flex items-center gap-2">
                        <span
                          className={`w-1 h-1 rounded-full ${
                            phase.status === "current"
                              ? "bg-forest-light"
                              : "bg-text-muted"
                          }`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
