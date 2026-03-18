"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { C2Nav, BentoCard, BentoGrid, Metric, LiveBadge, ShimmerButton, SystemTicker, GridBackground } from "@/components/ui";
import { Target, Database, Cpu, Shield, TrendingUp, Coins, Terminal, Network, Lock, FileCode, LayoutGrid } from "lucide-react";

export default function HomePage() {
  const [tvl, setTvl] = useState(0);
  const [agents, setAgents] = useState(0);
  const [captures, setCaptures] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setTvl(Math.floor(2847392 * eased));
      setAgents(Math.floor(847 * eased));
      setCaptures(Math.floor(12847 * eased));
      
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen relative">
      <GridBackground />
      <C2Nav />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <LiveBadge label="Mainnet Live" />
            <span className="label">Solana • Block 298,847,201</span>
          </div>

          <h1 className="heading-xl max-w-4xl mb-6">
            Value Infrastructure<br />
            <span className="text-gradient">for the Agentic Era</span>
          </h1>
          
          <p className="text-text-secondary text-lg max-w-2xl mb-10">
            Autonomous agents capture value from every interaction. 
            Vaults compound it. You own everything. Self-custody, programmable policy, 
            24/7 wealth generation.
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            <Link href="/launch">
              <ShimmerButton size="lg">Deploy Agent</ShimmerButton>
            </Link>
            <Link href="/docs">
              <ShimmerButton variant="ghost" size="lg">Read Docs</ShimmerButton>
            </Link>
          </div>

          <div className="flex flex-wrap gap-12">
            <Metric label="Total Value Locked" value={`$${tvl.toLocaleString()}`} size="lg" accent />
            <Metric label="Active Agents" value={agents.toLocaleString()} size="lg" />
            <Metric label="Value Captures" value={captures.toLocaleString()} suffix="/24h" size="lg" />
          </div>
        </div>
      </section>

      <div className="divider mx-6" />

      {/* Bento Grid Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="label label-accent">Protocol Architecture</span>
          </div>

          <BentoGrid>
            {/* Value Capture - Large */}
            <BentoCard className="col-span-8 min-h-[320px]">
              <span className="label label-accent mb-4 block">Core Primitive</span>
              <h2 className="heading-lg mb-4">Value Capture</h2>
              <p className="text-text-secondary mb-6 max-w-xl">
                Agents intercept value from commerce, data licensing, compute rental, 
                and DeFi. Every transaction creates compounding wealth instead of 
                disappearing into corporate coffers.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-auto">
                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-3">
                    [NODE_01]
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Target size={20} strokeWidth={1.2} className="text-zinc-400" />
                  </div>
                  <span className="label">Commerce</span>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-3">
                    [DATA_FEED]
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Database size={20} strokeWidth={1.2} className="text-zinc-400" />
                  </div>
                  <span className="label">Data</span>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-3">
                    [CORE_PROC]
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Cpu size={20} strokeWidth={1.2} className="text-zinc-400" />
                  </div>
                  <span className="label">Compute</span>
                </div>
              </div>
            </BentoCard>

            {/* Self-Custody */}
            <BentoCard className="col-span-4 min-h-[320px]">
              <span className="label label-accent mb-4 block">Security</span>
              <h2 className="heading-md mb-4">Self-Custody</h2>
              <p className="text-text-secondary text-sm mb-4">
                No seed phrases. Passkey authentication via device biometrics. 
                MPC threshold signing means Loop never holds your keys.
              </p>
              <div className="flex items-center gap-4 mt-auto pt-4 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Lock size={16} strokeWidth={1.2} className="text-zinc-400" />
                </div>
                <span className="mono text-sm">2-of-3 MPC</span>
              </div>
            </BentoCard>

            {/* Stacking */}
            <BentoCard className="col-span-6 min-h-[280px]">
              <span className="label label-accent mb-4 block">Yield</span>
              <h2 className="heading-md mb-4">Autonomous Stacking</h2>
              <p className="text-text-secondary text-sm mb-4">
                Agents auto-compound captured value into yield positions. 
                Protocol fees fund the staker pool.
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <TrendingUp size={16} strokeWidth={1.2} className="text-zinc-400" />
                </div>
                <div>
                  <span className="text-3xl font-bold text-accent mono">12.4%</span>
                  <span className="label ml-2">APY</span>
                </div>
              </div>
            </BentoCard>

            {/* Agent Tokens */}
            <BentoCard className="col-span-6 min-h-[280px]">
              <span className="label label-accent mb-4 block">Marketplace</span>
              <h2 className="heading-md mb-4">Agent Token Bonding</h2>
              <p className="text-text-secondary text-sm mb-4">
                Deploy agents with bonding curve tokens. As adoption grows, 
                token value appreciates.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Coins size={16} strokeWidth={1.2} className="text-zinc-400" />
                </div>
                <Link href="/marketplace" className="text-accent text-sm font-mono hover:underline">
                  Browse Agents →
                </Link>
              </div>
            </BentoCard>

            {/* Policy Engine */}
            <BentoCard className="col-span-full min-h-[200px]">
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex-1">
                  <span className="label label-accent mb-4 block">Programmable Control</span>
                  <h2 className="heading-md mb-4">On-Chain Policy Engine</h2>
                  <p className="text-text-secondary text-sm">
                    Define spending limits, approval thresholds, and time delays. 
                    Solana enforces constraints — agents cannot exceed policy even if compromised.
                  </p>
                </div>
                <div className="flex-shrink-0 bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal size={14} strokeWidth={1.2} className="text-zinc-500" />
                    <span className="text-zinc-500">vault_policy.toml</span>
                  </div>
                  <div><span className="text-accent">daily_limit</span> = 1000</div>
                  <div><span className="text-accent">auto_stack</span> = true</div>
                  <div><span className="text-accent">require_user</span> = &quot;&gt;$500&quot;</div>
                  <div><span className="text-accent">heir</span> = &quot;5A7E...YKTZ&quot;</div>
                </div>
              </div>
            </BentoCard>
          </BentoGrid>
        </div>
      </section>

      <div className="divider mx-6" />

      {/* Technical Specs */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="label label-accent">Technical Specifications</span>
          </div>

          <BentoGrid>
            {/* Programs */}
            <BentoCard className="col-span-6">
              <div className="flex items-center gap-2 mb-4">
                <Network size={14} strokeWidth={1.2} className="text-zinc-500" />
                <span className="label">Deployed Programs</span>
              </div>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-text-muted">CRED</span>
                  <span className="text-text-secondary">HYQJw...aBaG</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-text-muted">VAULT</span>
                  <span className="text-text-secondary">J8HhL...SWQT</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-text-muted">SHOPPING</span>
                  <span className="text-text-secondary">HiewK...teXJ</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-text-muted">AVP</span>
                  <span className="text-zinc-600">Coming Q2</span>
                </div>
              </div>
            </BentoCard>

            {/* Stack */}
            <BentoCard className="col-span-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu size={14} strokeWidth={1.2} className="text-zinc-500" />
                <span className="label">Infrastructure</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-1">Chain</span>
                  <span className="text-sm">Solana Mainnet</span>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-1">Execution</span>
                  <span className="text-sm">AWS Nitro TEE</span>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-1">Custody</span>
                  <span className="text-sm">Squads v4</span>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-1">Proofs</span>
                  <span className="text-sm">zkTLS / Reclaim</span>
                </div>
              </div>
            </BentoCard>

            {/* Audits */}
            <BentoCard className="col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={14} strokeWidth={1.2} className="text-zinc-500" />
                <span className="label">Audit Status</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="status-dot-warning" />
                  <span className="text-sm text-text-secondary">OtterSec — Q2</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="status-dot-warning" />
                  <span className="text-sm text-text-secondary">Trail of Bits — Q2</span>
                </div>
              </div>
              <Link href="/security" className="inline-flex items-center gap-2 text-accent text-sm font-mono mt-6 hover:underline">
                Security →
              </Link>
            </BentoCard>

            {/* SDK */}
            <BentoCard className="col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <FileCode size={14} strokeWidth={1.2} className="text-zinc-500" />
                <span className="label">SDK</span>
              </div>
              <div className="bg-black/30 border border-white/5 rounded p-3 font-mono text-xs mb-4">
                <span className="text-zinc-500">$</span> npm i @loop-protocol/sdk
              </div>
              <p className="text-text-secondary text-sm">
                TypeScript SDK for vaults, stacking, agents.
              </p>
              <Link href="/docs" className="inline-flex items-center gap-2 text-accent text-sm font-mono mt-4 hover:underline">
                Docs →
              </Link>
            </BentoCard>

            {/* Open Source */}
            <BentoCard className="col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <LayoutGrid size={14} strokeWidth={1.2} className="text-zinc-500" />
                <span className="label">Open Source</span>
              </div>
              <p className="text-text-secondary text-sm mb-4">
                All programs and SDK under MIT license. Verify, fork, contribute.
              </p>
              <a 
                href="https://github.com/OAR-Technologies-Inc/loop-protocol" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent text-sm font-mono hover:underline"
              >
                GitHub →
              </a>
            </BentoCard>
          </BentoGrid>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="font-mono text-sm font-semibold mb-2">
                LOOP<span className="text-text-muted">.PROTOCOL</span>
              </div>
              <p className="text-text-muted text-sm">
                Value infrastructure for the agentic era.
              </p>
            </div>
            <div className="flex gap-6">
              <Link href="/docs" className="text-text-muted hover:text-text-primary text-sm">Docs</Link>
              <Link href="/security" className="text-text-muted hover:text-text-primary text-sm">Security</Link>
              <a href="https://github.com/OAR-Technologies-Inc" target="_blank" className="text-text-muted hover:text-text-primary text-sm">GitHub</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-text-muted text-xs font-mono">
            © 2026 OAR Technologies Inc.
          </div>
        </div>
      </footer>

      <SystemTicker />
    </div>
  );
}
