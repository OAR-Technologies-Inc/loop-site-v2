"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { C2Nav, BentoCard, BentoGrid, Metric, LiveBadge, ShimmerButton } from "@/components/ui";

export default function HomePage() {
  const [tvl, setTvl] = useState(0);
  const [agents, setAgents] = useState(0);
  const [captures, setCaptures] = useState(0);

  // Animate counters on load
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
    <div className="min-h-screen">
      <C2Nav />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Protocol Status */}
          <div className="flex items-center gap-4 mb-8">
            <LiveBadge label="Mainnet Live" />
            <span className="label">Solana • Block 298,847,201</span>
          </div>

          {/* Main Headline */}
          <h1 className="heading-xl max-w-4xl mb-6">
            Value Infrastructure<br />
            <span className="text-gradient">for the Agentic Era</span>
          </h1>
          
          <p className="text-text-secondary text-lg max-w-2xl mb-10">
            Autonomous agents capture value from every interaction. 
            Vaults compound it. You own everything. Self-custody, programmable policy, 
            24/7 wealth generation.
          </p>

          {/* CTA Row */}
          <div className="flex flex-wrap gap-4 mb-16">
            <Link href="/launch">
              <ShimmerButton size="lg">Deploy Agent</ShimmerButton>
            </Link>
            <Link href="/docs">
              <ShimmerButton variant="ghost" size="lg">Read Docs</ShimmerButton>
            </Link>
          </div>

          {/* Protocol Metrics */}
          <div className="flex flex-wrap gap-12">
            <Metric 
              label="Total Value Locked" 
              value={`$${tvl.toLocaleString()}`}
              size="lg"
              accent
            />
            <Metric 
              label="Active Agents" 
              value={agents.toLocaleString()}
              size="lg"
            />
            <Metric 
              label="Value Captures" 
              value={captures.toLocaleString()}
              suffix="/24h"
              size="lg"
            />
          </div>
        </div>
      </section>

      {/* Divider */}
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
                Agents intercept value from shopping, data licensing, compute rental, 
                and DeFi. Every dollar you spend creates compounding wealth instead of 
                disappearing into corporate coffers.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-auto">
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-1">🛒</div>
                  <span className="label">Shopping</span>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-1">📊</div>
                  <span className="label">Data</span>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-1">🖥️</div>
                  <span className="label">Compute</span>
                </div>
              </div>
            </BentoCard>

            {/* Self-Custody - Small */}
            <BentoCard className="col-span-4 min-h-[320px]">
              <span className="label label-accent mb-4 block">Security</span>
              <h2 className="heading-md mb-4">Self-Custody</h2>
              <p className="text-text-secondary text-sm mb-4">
                No seed phrases. Passkey authentication via device biometrics. 
                MPC threshold signing means Loop never holds your keys.
              </p>
              <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="status-dot" />
                  <span className="mono text-sm">2-of-3 MPC</span>
                </div>
              </div>
            </BentoCard>

            {/* Stacking - Medium */}
            <BentoCard className="col-span-6 min-h-[280px]">
              <span className="label label-accent mb-4 block">Yield</span>
              <h2 className="heading-md mb-4">Autonomous Stacking</h2>
              <p className="text-text-secondary text-sm mb-4">
                Agents auto-compound captured value into yield positions. 
                Protocol fees fund the staker pool — your wealth grows while you sleep.
              </p>
              <div className="flex items-baseline gap-2 mt-auto">
                <span className="text-4xl font-bold text-accent mono">12.4%</span>
                <span className="label">Current APY</span>
              </div>
            </BentoCard>

            {/* Agent Tokens - Medium */}
            <BentoCard className="col-span-6 min-h-[280px]">
              <span className="label label-accent mb-4 block">Marketplace</span>
              <h2 className="heading-md mb-4">Agent Token Bonding</h2>
              <p className="text-text-secondary text-sm mb-4">
                Deploy agents with bonding curve tokens. As adoption grows, 
                token value appreciates. Capture upside from agents you build or discover.
              </p>
              <Link href="/marketplace" className="inline-flex items-center gap-2 text-accent text-sm font-mono mt-auto hover:underline">
                Browse Agents →
              </Link>
            </BentoCard>

            {/* Policy Engine - Full Width */}
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
                <div className="flex-shrink-0 bg-white/5 rounded-lg p-4 font-mono text-xs">
                  <div className="text-text-muted mb-2"># vault_policy.toml</div>
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

      {/* Divider */}
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
              <span className="label mb-4 block">Deployed Programs</span>
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
                  <span className="text-text-secondary">Coming Q2</span>
                </div>
              </div>
            </BentoCard>

            {/* Stack */}
            <BentoCard className="col-span-6">
              <span className="label mb-4 block">Infrastructure</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded">
                  <span className="label block mb-1">Chain</span>
                  <span className="text-sm">Solana Mainnet</span>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <span className="label block mb-1">Execution</span>
                  <span className="text-sm">AWS Nitro TEE</span>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <span className="label block mb-1">Custody</span>
                  <span className="text-sm">Squads v4</span>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <span className="label block mb-1">Proofs</span>
                  <span className="text-sm">zkTLS / Reclaim</span>
                </div>
              </div>
            </BentoCard>

            {/* Audits */}
            <BentoCard className="col-span-4">
              <span className="label mb-4 block">Audit Status</span>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="status-dot-warning" />
                  <span className="text-sm">OtterSec — Q2 2026</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="status-dot-warning" />
                  <span className="text-sm">Trail of Bits — Q2 2026</span>
                </div>
              </div>
              <Link href="/security" className="inline-flex items-center gap-2 text-accent text-sm font-mono mt-6 hover:underline">
                Security Architecture →
              </Link>
            </BentoCard>

            {/* SDK */}
            <BentoCard className="col-span-4">
              <span className="label mb-4 block">SDK</span>
              <div className="bg-black/30 rounded p-3 font-mono text-xs mb-4">
                <span className="text-text-muted">$</span> npm i @loop-protocol/sdk
              </div>
              <p className="text-text-secondary text-sm">
                TypeScript SDK for vaults, stacking, and agent registration.
              </p>
              <Link href="/docs" className="inline-flex items-center gap-2 text-accent text-sm font-mono mt-4 hover:underline">
                Documentation →
              </Link>
            </BentoCard>

            {/* Open Source */}
            <BentoCard className="col-span-4">
              <span className="label mb-4 block">Open Source</span>
              <p className="text-text-secondary text-sm mb-4">
                All Solana programs and SDK code are MIT licensed. 
                Verify, fork, contribute.
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
      <footer className="border-t border-white/5 py-12 px-6">
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
              <a href="https://twitter.com/loopprotocol" target="_blank" className="text-text-muted hover:text-text-primary text-sm">Twitter</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-text-muted text-xs font-mono">
            © 2026 OAR Technologies Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
