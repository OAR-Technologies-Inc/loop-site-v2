"use client";

import { motion } from "framer-motion";

const frameworks = [
  {
    name: "elizaOS",
    description: "a16z's agent operating system",
    logo: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <rect x="4" y="4" width="32" height="32" rx="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="20" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "LangChain",
    description: "Build context-aware agents",
    logo: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <path d="M8 20h8M24 20h8M20 8v8M20 24v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="2" />
        <circle cx="8" cy="20" r="3" fill="currentColor" />
        <circle cx="32" cy="20" r="3" fill="currentColor" />
        <circle cx="20" cy="8" r="3" fill="currentColor" />
        <circle cx="20" cy="32" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "CrewAI",
    description: "Multi-agent orchestration",
    logo: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <circle cx="12" cy="14" r="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="28" cy="14" r="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="28" r="5" stroke="currentColor" strokeWidth="2" />
        <path d="M15 18l3 6M25 18l-3 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "AutoGPT",
    description: "Autonomous goal-oriented agents",
    logo: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <path d="M20 6v28M6 20h28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2" />
        <path d="M20 12l4 4-4 4-4-4z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Custom Agents",
    description: "Any framework, any stack",
    logo: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <rect x="6" y="10" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="22" y="10" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M18 16h4M18 20h4M18 24h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Frameworks() {
  return (
    <section className="py-16 border-b border-white/5">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-text-secondary text-lg mb-2">
            Works with the agents you already use
          </p>
          <h2 className="font-display text-2xl font-semibold text-text-primary">
            Integrate once. Capture value everywhere.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {frameworks.map((framework, index) => (
            <motion.div
              key={framework.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-forest/30 hover:bg-forest/5 transition-all duration-300 group"
            >
              <div className="text-text-secondary group-hover:text-forest-light transition-colors mb-3">
                {framework.logo}
              </div>
              <span className="font-medium text-text-primary text-sm">
                {framework.name}
              </span>
              <span className="text-text-secondary text-xs mt-1 text-center">
                {framework.description}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-text-secondary text-sm mt-8"
        >
          Loop is the economic layer. Bring your own intelligence.
        </motion.p>
      </div>
    </section>
  );
}
