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
  { name: "Mainnet deployment (3/6)", status: "complete" },
  { name: "Browser extension", status: "complete" },
  { name: "Phase 2 programs (AVP, OXO, VTP)", status: "building" },
  { name: "Security audit", status: "planned" },
  { name: "Merchant integrations", status: "planned" },
];

const mainnetPrograms = [
  { name: "loop_cred", address: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG", description: "USDC-backed stable token", network: "mainnet" },
  { name: "loop_vault", address: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT", description: "User vaults, stacking, inheritance", network: "mainnet" },
  { name: "loop_shopping", address: "HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ", description: "Merchant rewards, value capture", network: "mainnet" },
];

const upcomingPrograms = [
  { name: "loop_avp", description: "Agent identity & binding", status: "Ready for deployment" },
  { name: "loop_oxo", description: "Bonding curves, trading", status: "Ready for deployment" },
  { name: "loop_vtp", description: "Transfers, escrow, conditions", status: "Ready for deployment" },
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
    status: "complete",
    period: "Q1-Q2 2026",
    items: ["All 6 Solana programs built", "TypeScript SDK released", "Integration tests passing", "3 programs live on mainnet"],
  },
  {
    phase: "Phase 3",
    name: "Agent Marketplace",
    status: "current",
    period: "Q2 2026",
    items: ["AVP, OXO, VTP deployment", "Agent registration live", "Token trading enabled", "Service agent demos"],
  },
  {
    phase: "Phase 4",
    name: "Ecosystem",
    status: "next",
    period: "Q3-Q4 2026",
    items: ["Merchant integrations", "Additional capture modules", "Mobile app", "Cross-chain expansion"],
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
            Current phase: Agent Marketplace. 3 programs live on Solana mainnet. Phase 2 deployment imminent.
          </p>
        </motion.div>

        {/* Mainnet Programs - Live on chain */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-display text-xl font-semibold text-emerald-400">
              Live on Solana Mainnet
            </h3>
          </div>
          <p className="text-text-secondary mb-6">
            3 core programs deployed and initialized. Click to view on Solscan.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {mainnetPrograms.map((program) => (
              <a
                key={program.name}
                href={`https://solscan.io/account/${program.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-bg-surface border border-border-subtle hover:border-emerald-500 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-emerald-400">{program.name}</span>
                  <svg className="w-4 h-4 text-text-muted group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <p className="text-xs text-text-muted">{program.description}</p>
                <p className="text-xs text-text-muted mt-2 font-mono truncate">{program.address.slice(0, 8)}...{program.address.slice(-4)}</p>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Programs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 p-6 rounded-2xl bg-gold/10 border border-gold/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-gold" />
            <h3 className="font-display text-xl font-semibold text-gold">
              Phase 2: Ready for Deployment
            </h3>
          </div>
          <p className="text-text-secondary mb-6">
            3 additional programs audited and ready. Enables agent marketplace, token trading, and escrow.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {upcomingPrograms.map((program) => (
              <div
                key={program.name}
                className="p-4 rounded-xl bg-bg-surface border border-border-subtle"
              >
                <span className="font-mono text-sm text-gold">{program.name}</span>
                <p className="text-xs text-text-muted mt-2">{program.description}</p>
                <p className="text-xs text-gold/60 mt-2">{program.status}</p>
              </div>
            ))}
          </div>
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
              {timeline.map((phase) => (
                <div
                  key={phase.phase}
                  className={`p-5 rounded-xl border ${
                    phase.status === "current"
                      ? "bg-bg-elevated border-forest"
                      : phase.status === "complete"
                      ? "bg-bg-surface border-emerald-500/30"
                      : "bg-bg-surface border-border-subtle"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`text-xs font-mono font-medium ${
                        phase.status === "current"
                          ? "text-forest-light"
                          : phase.status === "complete"
                          ? "text-emerald-400"
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
                    {phase.status === "complete" && (
                      <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                        ✓ Done
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
                              : phase.status === "complete"
                              ? "bg-emerald-400"
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
