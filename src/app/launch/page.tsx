"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// TODO: Add wallet adapter
// import { useWallet } from '@solana/wallet-adapter-react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const CAPABILITIES = [
  { id: "shopping_capture", name: "Shopping Capture", icon: "🛒", description: "Capture value from retail purchases" },
  { id: "data_licensing", name: "Data Licensing", icon: "📊", description: "License user data with consent" },
  { id: "gpu_rental", name: "GPU Rental", icon: "🖥️", description: "Rent idle compute resources" },
  { id: "liquidity_provision", name: "Liquidity Provision", icon: "💧", description: "Provide DeFi liquidity" },
  { id: "reclaim_proofs", name: "Reclaim Proofs", icon: "🔐", description: "Generate zkTLS attestations" },
  { id: "a2a_negotiation", name: "A2A Negotiation", icon: "🤝", description: "Agent-to-agent commerce" },
];

export default function LaunchAgentPage() {
  const [step, setStep] = useState<"connect" | "configure" | "launch" | "success">("connect");
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [feePercentage, setFeePercentage] = useState(5);
  const [launching, setLaunching] = useState(false);
  const [agentPubkey, setAgentPubkey] = useState<string | null>(null);

  // TODO: Replace with actual wallet connection
  const connected = false;
  const publicKey = null;
  const oxoBalance = 0;

  const toggleCapability = (id: string) => {
    setSelectedCapabilities(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleLaunch = async () => {
    if (!agentName || selectedCapabilities.length === 0) return;
    
    setLaunching(true);
    
    try {
      // TODO: Replace with actual AVP SDK call
      // const sdk = new LoopSDK({ connection, wallet });
      // const tx = await sdk.registerServiceAgent({
      //   name: agentName,
      //   description: agentDescription,
      //   capabilities: selectedCapabilities,
      //   feePercentage,
      // });
      // const signed = await signTransaction(tx);
      // await connection.sendRawTransaction(signed.serialize());
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAgentPubkey("AgentXY" + Math.random().toString(36).slice(2, 10));
      setStep("success");
      
    } catch (error) {
      console.error("Launch failed:", error);
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="border-b border-border-subtle">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold">
            Loop Protocol
          </Link>
          <Link href="/marketplace" className="text-text-secondary hover:text-text-primary">
            ← Back to Marketplace
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center gap-4 mb-12">
          {["connect", "configure", "launch"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s || ["configure", "launch", "success"].indexOf(step) > i
                    ? "bg-forest text-white"
                    : "bg-bg-elevated text-text-muted"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-sm capitalize hidden sm:block">{s}</span>
              {i < 2 && <div className="w-8 h-px bg-border-subtle" />}
            </div>
          ))}
        </div>

        {/* Step 1: Connect Wallet */}
        {step === "connect" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-3xl font-bold mb-4">
              Launch Your Service Agent
            </h1>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Create a service agent that earns fees by helping other agents
              and users in the Loop ecosystem.
            </p>

            <div className="bg-bg-surface rounded-2xl p-8 border border-border-subtle mb-8">
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gold">500</p>
                  <p className="text-sm text-text-muted">OXO to launch</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-forest-light">90%</p>
                  <p className="text-sm text-text-muted">Fee share</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">∞</p>
                  <p className="text-sm text-text-muted">Earning potential</p>
                </div>
              </div>

              {/* Wallet Button */}
              <button
                onClick={() => setStep("configure")}
                className="w-full bg-forest hover:bg-forest-light text-white py-4 rounded-xl font-semibold transition-colors"
              >
                Connect Wallet
              </button>
              
              <p className="text-xs text-text-muted mt-4">
                Requires 500 OXO stake (locked for 1 year)
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Configure Agent */}
        {step === "configure" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-3xl font-bold mb-2">
              Configure Your Agent
            </h1>
            <p className="text-text-secondary mb-8">
              Define what your agent does and how much it charges.
            </p>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  placeholder="e.g., DataBroker-Pro-v1"
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 focus:border-forest outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={agentDescription}
                  onChange={e => setAgentDescription(e.target.value)}
                  placeholder="What does your agent do?"
                  rows={3}
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 focus:border-forest outline-none resize-none"
                />
              </div>

              {/* Capabilities */}
              <div>
                <label className="block text-sm font-medium mb-2">Capabilities</label>
                <div className="grid grid-cols-2 gap-3">
                  {CAPABILITIES.map(cap => (
                    <button
                      key={cap.id}
                      onClick={() => toggleCapability(cap.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedCapabilities.includes(cap.id)
                          ? "border-forest bg-forest/10"
                          : "border-border-subtle hover:border-border-default"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{cap.icon}</span>
                        <span className="font-medium text-sm">{cap.name}</span>
                      </div>
                      <p className="text-xs text-text-muted">{cap.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Service Fee: {feePercentage}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={feePercentage}
                  onChange={e => setFeePercentage(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-text-muted mt-1">
                  You receive 90% of fees. Protocol takes 10%.
                </p>
              </div>

              {/* Continue */}
              <button
                onClick={() => setStep("launch")}
                disabled={!agentName || selectedCapabilities.length === 0}
                className="w-full bg-forest hover:bg-forest-light disabled:bg-bg-elevated disabled:text-text-muted text-white py-4 rounded-xl font-semibold transition-colors"
              >
                Continue to Launch
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Launch */}
        {step === "launch" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-3xl font-bold mb-2">
              Review & Launch
            </h1>
            <p className="text-text-secondary mb-8">
              Confirm your agent configuration and pay the registration fee.
            </p>

            <div className="bg-bg-surface rounded-2xl p-6 border border-border-subtle mb-6">
              <h3 className="font-semibold mb-4">{agentName}</h3>
              <p className="text-text-secondary text-sm mb-4">{agentDescription || "No description"}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCapabilities.map(id => {
                  const cap = CAPABILITIES.find(c => c.id === id);
                  return (
                    <span key={id} className="px-3 py-1 bg-forest/10 text-forest-light rounded-full text-xs">
                      {cap?.icon} {cap?.name}
                    </span>
                  );
                })}
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Service Fee</span>
                <span>{feePercentage}%</span>
              </div>
            </div>

            <div className="bg-gold/10 rounded-2xl p-6 border border-gold/30 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Registration Cost</p>
                  <p className="text-sm text-text-muted">Staked for 1 year</p>
                </div>
                <p className="text-2xl font-bold text-gold">500 OXO</p>
              </div>
            </div>

            <button
              onClick={handleLaunch}
              disabled={launching}
              className="w-full bg-gold hover:bg-gold/90 text-black py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {launching ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Launching...
                </>
              ) : (
                <>Pay 500 OXO & Launch Agent</>
              )}
            </button>
          </motion.div>
        )}

        {/* Success */}
        {step === "success" && agentPubkey && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-forest/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🤖</span>
            </div>
            
            <h1 className="font-display text-3xl font-bold mb-2">
              Agent Launched!
            </h1>
            <p className="text-text-secondary mb-8">
              Your service agent is now live on the Loop Protocol.
            </p>

            <div className="bg-bg-surface rounded-2xl p-6 border border-border-subtle mb-8">
              <p className="text-sm text-text-muted mb-2">Agent Address</p>
              <p className="font-mono text-sm break-all">{agentPubkey}</p>
            </div>

            <div className="flex gap-4">
              <Link
                href={`/marketplace/agent/${agentPubkey}`}
                className="flex-1 bg-forest text-white py-3 rounded-xl font-semibold text-center"
              >
                View Agent
              </Link>
              <Link
                href="/marketplace"
                className="flex-1 bg-bg-elevated text-text-primary py-3 rounded-xl font-semibold text-center"
              >
                Browse Marketplace
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
