"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const protocolLayers = [
  {
    id: "capture",
    name: "Capture Modules",
    tagline: "Value flows in",
    description:
      "Modular systems that capture value from your everyday activities. Shopping, data, presence, attention — every source of value you generate flows into your vault.",
    modules: ["Shopping", "Data", "Presence", "Attention"],
    color: "forest",
  },
  {
    id: "avp",
    name: "Agent Value Protocol",
    tagline: "Agents work for you",
    description:
      "Register agents that act on your behalf. They capture value, execute strategies, and build wealth — all bound to your identity and accountable to you.",
    features: ["Agent Registration", "Identity Binding", "Permissions", "Accountability"],
    color: "forest-light",
  },
  {
    id: "vault",
    name: "The Vault",
    tagline: "Your wealth compounds",
    description:
      "Your personal wealth container. Value flows in, stakes automatically, compounds over time. Protected. Inheritable. Yours forever.",
    features: ["Auto-Staking", "Yield Generation", "Inheritance", "Full Custody"],
    color: "gold",
  },
  {
    id: "vtp",
    name: "Value Transfer Protocol",
    tagline: "Move value freely",
    description:
      "Secure, efficient transfers between vaults, agents, and the outside world. Escrow for safety. Settlement for finality.",
    features: ["Instant Transfers", "Escrow System", "Multi-sig", "Settlement"],
    color: "forest-light",
  },
];

function ArchitectureDiagram({ activeLayer }: { activeLayer: string | null }) {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection lines */}
        <motion.path
          d="M200 50 L200 100 M100 150 L150 150 M250 150 L300 150 M200 200 L200 250"
          stroke="rgba(45, 122, 94, 0.3)"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />

        {/* Capture Layer - Top */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <rect
            x="100"
            y="20"
            width="200"
            height="60"
            rx="8"
            fill={activeLayer === "capture" ? "rgba(27, 77, 62, 0.3)" : "rgba(27, 77, 62, 0.1)"}
            stroke={activeLayer === "capture" ? "#2D7A5E" : "#1B4D3E"}
            strokeWidth="2"
            className="transition-all duration-300"
          />
          <text x="200" y="55" textAnchor="middle" fill="#F5F5F5" fontSize="14" fontWeight="600">
            Capture Modules
          </text>
        </motion.g>

        {/* AVP Layer - Left */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <rect
            x="20"
            y="120"
            width="120"
            height="60"
            rx="8"
            fill={activeLayer === "avp" ? "rgba(45, 122, 94, 0.3)" : "rgba(45, 122, 94, 0.1)"}
            stroke={activeLayer === "avp" ? "#2D7A5E" : "#1B4D3E"}
            strokeWidth="2"
            className="transition-all duration-300"
          />
          <text x="80" y="155" textAnchor="middle" fill="#F5F5F5" fontSize="12" fontWeight="600">
            AVP
          </text>
        </motion.g>

        {/* VTP Layer - Right */}
        <motion.g
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <rect
            x="260"
            y="120"
            width="120"
            height="60"
            rx="8"
            fill={activeLayer === "vtp" ? "rgba(45, 122, 94, 0.3)" : "rgba(45, 122, 94, 0.1)"}
            stroke={activeLayer === "vtp" ? "#2D7A5E" : "#1B4D3E"}
            strokeWidth="2"
            className="transition-all duration-300"
          />
          <text x="320" y="155" textAnchor="middle" fill="#F5F5F5" fontSize="12" fontWeight="600">
            VTP
          </text>
        </motion.g>

        {/* Vault - Center */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <polygon
            points="200,100 280,150 280,230 200,280 120,230 120,150"
            fill={activeLayer === "vault" ? "rgba(212, 175, 55, 0.2)" : "rgba(212, 175, 55, 0.1)"}
            stroke={activeLayer === "vault" ? "#D4AF37" : "#B8960C"}
            strokeWidth="2"
            className="transition-all duration-300"
          />
          <text x="200" y="195" textAnchor="middle" fill="#D4AF37" fontSize="16" fontWeight="700">
            VAULT
          </text>
        </motion.g>

        {/* Flow arrows */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {/* Arrows pointing to vault */}
          <path d="M200 85 L200 95" stroke="#2D7A5E" strokeWidth="2" markerEnd="url(#arrow)" />
          <path d="M145 150 L125 150" stroke="#2D7A5E" strokeWidth="2" markerEnd="url(#arrow)" />
          <path d="M255 150 L275 150" stroke="#2D7A5E" strokeWidth="2" markerEnd="url(#arrow)" />
        </motion.g>

        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#2D7A5E" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export function Protocol() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  return (
    <section
      id="protocol"
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
            The Solution:{" "}
            <span className="gradient-text">Loop Protocol</span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Wealth infrastructure for humans in the age of AI. Your agents
            capture value. Your vault compounds it. You own everything.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Architecture Diagram */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="sticky top-32"
          >
            <ArchitectureDiagram activeLayer={activeLayer} />
          </motion.div>

          {/* Right: Layer Details */}
          <div className="space-y-6">
            {protocolLayers.map((layer, index) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                onMouseEnter={() => setActiveLayer(layer.id)}
                onMouseLeave={() => setActiveLayer(null)}
                className={`group relative p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                  activeLayer === layer.id
                    ? "bg-bg-elevated border-forest"
                    : "bg-bg-surface border-border-subtle hover:border-border-default"
                }`}
              >
                {/* Accent */}
                <div
                  className={`absolute left-0 top-4 bottom-4 w-1 rounded-full transition-all duration-300 ${
                    layer.color === "gold" ? "bg-gold" : "bg-forest"
                  } ${activeLayer === layer.id ? "opacity-100" : "opacity-30"}`}
                />

                <div className="pl-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-xl font-semibold">
                      {layer.name}
                    </h3>
                    <span className="text-sm text-text-muted">
                      {layer.tagline}
                    </span>
                  </div>
                  <p className="text-text-secondary mb-4">{layer.description}</p>

                  {/* Features/Modules */}
                  <div className="flex flex-wrap gap-2">
                    {(layer.modules || layer.features)?.map((item) => (
                      <span
                        key={item}
                        className={`px-3 py-1 text-xs rounded-full ${
                          layer.color === "gold"
                            ? "bg-gold/10 text-gold"
                            : "bg-forest/10 text-forest-light"
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
