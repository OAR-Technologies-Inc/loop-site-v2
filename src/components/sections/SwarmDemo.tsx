"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DemoStep {
  id: number;
  agent: string;
  action: string;
  detail: string;
  value?: string;
  icon: string;
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    agent: "Shopping Agent",
    action: "Capture",
    detail: "Purchase detected at local merchant",
    value: "+2.50 Cred",
    icon: "🛒",
  },
  {
    id: 2,
    agent: "Swarm Coordinator",
    action: "Event Fired",
    detail: "capture_completed → triggering optimizer",
    icon: "⚡",
  },
  {
    id: 3,
    agent: "Wealth Optimizer",
    action: "Auto-Stack",
    detail: "Stacking 80% at optimal yield",
    value: "2.00 Cred → 15% APY",
    icon: "📈",
  },
  {
    id: 4,
    agent: "Vault",
    action: "Updated",
    detail: "Balance compounding automatically",
    value: "0.50 Cred liquid",
    icon: "🔐",
  },
];

export function SwarmDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [stackedBalance, setStackedBalance] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= demoSteps.length) {
          setIsPlaying(false);
          return prev;
        }
        
        // Update balances based on step
        if (next === 1) {
          setVaultBalance(2.5);
        } else if (next === 3) {
          setVaultBalance(0.5);
          setStackedBalance(2.0);
        }
        
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleStart = () => {
    setCurrentStep(0);
    setVaultBalance(0);
    setStackedBalance(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setVaultBalance(0);
    setStackedBalance(0);
    setIsPlaying(false);
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-zinc-950 to-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-emerald-400 font-mono text-sm mb-4 tracking-wider">
            LIVE DEMO
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Watch the Swarm Work
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Two agents coordinating autonomously. Shopping captures value, 
            Wealth Optimizer compounds it. No human intervention.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Demo Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8"
          >
            {/* Agent Status */}
            <div className="flex justify-between mb-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-2xl mb-2 mx-auto">
                  🛒
                </div>
                <p className="text-xs text-zinc-500 font-mono">Shopping</p>
                <motion.div
                  animate={{
                    backgroundColor: currentStep >= 1 ? "#10b981" : "#3f3f46",
                  }}
                  className="w-2 h-2 rounded-full mx-auto mt-2"
                />
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  animate={{
                    opacity: currentStep >= 2 ? 1 : 0.3,
                    scale: currentStep === 2 ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl"
                >
                  ⚡
                </motion.div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-2xl mb-2 mx-auto">
                  📈
                </div>
                <p className="text-xs text-zinc-500 font-mono">Optimizer</p>
                <motion.div
                  animate={{
                    backgroundColor: currentStep >= 3 ? "#f59e0b" : "#3f3f46",
                  }}
                  className="w-2 h-2 rounded-full mx-auto mt-2"
                />
              </div>
            </div>

            {/* Event Log */}
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm h-48 overflow-hidden">
              <AnimatePresence mode="popLayout">
                {demoSteps.slice(0, currentStep + 1).map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-2"
                  >
                    <span className="text-zinc-600">[{step.agent}]</span>{" "}
                    <span className="text-emerald-400">{step.action}</span>
                    <br />
                    <span className="text-zinc-500 text-xs ml-4">
                      {step.detail}
                    </span>
                    {step.value && (
                      <span className="text-amber-400 text-xs ml-2">
                        {step.value}
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {currentStep === 0 && !isPlaying && (
                <div className="text-zinc-600 animate-pulse">
                  Waiting to start...
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleStart}
                disabled={isPlaying}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {isPlaying ? "Running..." : "Run Demo"}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-zinc-700 hover:border-zinc-600 text-zinc-400 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </motion.div>

          {/* Vault Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Vault Card */}
            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  🔐
                </div>
                <div>
                  <h3 className="text-white font-semibold">Your Vault</h3>
                  <p className="text-zinc-500 text-sm">Auto-managed by agents</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-black/30 rounded-lg">
                  <span className="text-zinc-400">Liquid Balance</span>
                  <motion.span
                    key={vaultBalance}
                    initial={{ scale: 1.2, color: "#10b981" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    className="text-2xl font-bold text-white"
                  >
                    {vaultBalance.toFixed(2)} Cred
                  </motion.span>
                </div>

                <div className="flex justify-between items-center p-4 bg-black/30 rounded-lg">
                  <div>
                    <span className="text-zinc-400">Stacked</span>
                    <span className="text-emerald-400 text-xs ml-2">@ 15% APY</span>
                  </div>
                  <motion.span
                    key={stackedBalance}
                    initial={{ scale: 1.2, color: "#f59e0b" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    className="text-2xl font-bold text-white"
                  >
                    {stackedBalance.toFixed(2)} Cred
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-4">
                <p className="text-3xl font-bold text-white mb-1">2</p>
                <p className="text-zinc-500 text-sm">Active Agents</p>
              </div>
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-4">
                <p className="text-3xl font-bold text-emerald-400 mb-1">15%</p>
                <p className="text-zinc-500 text-sm">Current APY</p>
              </div>
            </div>

            {/* Code Preview */}
            <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-4">
              <p className="text-zinc-500 text-xs font-mono mb-2">
                // From our elizaOS plugin
              </p>
              <pre className="text-xs text-zinc-400 font-mono overflow-x-auto">
{`const loopPlugin: Plugin = {
  name: 'loop-protocol',
  actions: [
    LOOP_SHOPPING_CAPTURE,
    LOOP_AUTO_STACK,
    LOOP_VAULT_STATUS
  ]
};`}
              </pre>
            </div>
          </motion.div>
        </div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-zinc-600 text-sm mt-12 font-mono"
        >
          This demo simulates our working elizaOS integration. 
          <a 
            href="https://github.com/OAR-Technologies-Inc/loop-protocol/tree/master/eliza" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500 hover:text-emerald-400 ml-1"
          >
            View source →
          </a>
        </motion.p>
      </div>
    </section>
  );
}
