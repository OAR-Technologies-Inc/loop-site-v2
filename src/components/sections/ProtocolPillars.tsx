"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const pillars = [
  {
    number: "01",
    name: "Agent Value Protocol (AVP)",
    tagline: "Identity & binding for AI agents",
    description:
      "AVP defines how agents exist on-chain and prove their authority to act. Each agent is a Solana wallet with a verifiable identity. Principals (humans) bind to agents via biometric proof. Once bound, the agent can capture value, manage the vault, and transact — all accountable to a real human.",
    details: [
      "register_personal_agent() — Creates agent identity + vault",
      "bind_agent() — Binds agent to principal via biometric proof",
      "declare_capabilities() — Declares what the agent can do",
      "revoke_agent() — Revokes agent authority",
    ],
    color: "forest",
  },
  {
    number: "02",
    name: "Capture Modules",
    tagline: "Pluggable value capture from real activities",
    description:
      "Capture modules are independent systems that intercept value from your activities. Each module defines its own proof format and verification logic. Any activity that generates value can have a capture module. Shopping is first. Data, presence, and attention follow.",
    details: [
      "Shopping — Merchant-signed receipts → rewards",
      "Data — License your data, earn Cred",
      "Presence — Location proof, foot traffic rewards",
      "Attention — Opt-in ad viewing, earn Cred",
    ],
    color: "forest-light",
  },
  {
    number: "03",
    name: "The Vault",
    tagline: "Your personal wealth container",
    description:
      "Every personal agent has exactly one vault. Value flows in from capture modules. You stake it for yield. It compounds over time. When you die, it transfers to your designated heir — no reset, no penalty. You can extract to fiat, but extraction resets your vault to zero. The incentive is to stay and compound.",
    details: [
      "Cred storage — Stable value, $1 per Cred",
      "Staking positions — Lock for 3-15% APY",
      "OXO holdings — Protocol equity",
      "Inheritance config — Designate heirs",
    ],
    color: "gold",
  },
  {
    number: "04",
    name: "Value Transfer Protocol (VTP)",
    tagline: "Trustless settlement between agents",
    description:
      "VTP is the state machine for moving value. Request → Negotiate → Transact → Verify. Simple transfers for direct payments. Escrow for conditional transfers (held until verified). Inheritance triggers for death-activated transfers. Dispute resolution for conflicts.",
    details: [
      "simple_transfer() — Direct vault-to-vault",
      "create_escrow() — Conditional transfer with timeout",
      "release_escrow() — Release on verification",
      "execute_inheritance() — Death-triggered transfer",
    ],
    color: "forest-light",
  },
];

function PillarCard({ pillar, index }: { pillar: typeof pillars[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative"
    >
      <div className="p-8 md:p-10 rounded-2xl bg-bg-surface border border-border-subtle hover:border-border-default transition-colors">
        {/* Number and name */}
        <div className="flex items-start gap-6 mb-6">
          <span
            className={`font-mono text-4xl font-bold ${
              pillar.color === "gold" ? "text-gold/30" : "text-forest/30"
            }`}
          >
            {pillar.number}
          </span>
          <div>
            <h3 className="font-display text-2xl font-bold mb-1">
              {pillar.name}
            </h3>
            <p className="text-text-muted">{pillar.tagline}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-text-secondary leading-relaxed mb-8">
          {pillar.description}
        </p>

        {/* Details */}
        <div className="space-y-3">
          {pillar.details.map((detail, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                  pillar.color === "gold" ? "bg-gold" : "bg-forest-light"
                }`}
              />
              <code className="text-sm text-text-secondary font-mono">
                {detail}
              </code>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function ProtocolPillars() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="protocol" ref={containerRef} className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-forest-light text-sm font-medium tracking-wider uppercase mb-4 block">
            Protocol Architecture
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Four Pillars
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl">
            The core components of Loop Protocol. Each pillar is independent 
            but designed to work together.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {pillars.map((pillar, index) => (
            <PillarCard key={pillar.number} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
