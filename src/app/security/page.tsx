"use client";

import { C2Nav, BentoCard, BentoGrid } from "@/components/ui";
import { Shield, Key, Cpu, Lock, Users, Clock, FileCheck, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen">
      <C2Nav />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <span className="label label-accent mb-4 block">Loop Protocol v1.0 • March 2026</span>
            <h1 className="heading-xl mb-4">Security Architecture</h1>
            <p className="text-text-secondary text-lg max-w-2xl">
              Autonomous agent operation without sacrificing user custody.
            </p>
          </div>

          {/* Architecture Diagram */}
          <BentoCard className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={14} strokeWidth={1.2} className="text-zinc-500" />
              <span className="label">System Architecture</span>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-lg p-6 font-mono text-xs overflow-x-auto">
              <pre className="text-zinc-400">{`USER DEVICE                    LOOP INFRASTRUCTURE              SOLANA
─────────────                  ───────────────────              ──────
┌──────────────┐               ┌──────────────────┐             
│ Passkey      │               │ Nitro Enclave    │             ┌─────────┐
│ (Secure      │◄─────────────►│                  │◄───────────►│ Vault   │
│  Element)    │  MPC signing  │ Agent runtime    │  Txs        │ Program │
└──────────────┘               │ + key share      │             └─────────┘
                               └──────────────────┘                  │
       │                              │                              │
       │                              │                              ▼
       │                       ┌──────────────────┐             ┌─────────┐
       │                       │ Squads Policy    │◄───────────►│ Policy  │
       └──────────────────────►│ Engine           │             │ Account │
              User approvals   └──────────────────┘             └─────────┘`}</pre>
            </div>
          </BentoCard>

          {/* Core Security Primitives */}
          <div className="flex items-center gap-2 mb-6">
            <Shield size={14} strokeWidth={1.2} className="text-zinc-500" />
            <span className="label label-accent">Core Primitives</span>
          </div>

          <BentoGrid className="mb-12">
            {/* Key Management */}
            <BentoCard className="col-span-6">
              <div className="flex items-center gap-2 mb-4">
                <Key size={14} strokeWidth={1.2} className="text-zinc-500" />
                <span className="label">Key Management</span>
              </div>
              <h3 className="heading-md mb-3">MPC Threshold Signing</h3>
              <p className="text-text-secondary text-sm mb-4">
                Keys split 2-of-3 via GG18/FROST protocol. Full private key never reconstructed.
              </p>
              <div className="bg-black/30 border border-white/5 rounded-lg overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-3 text-zinc-500 uppercase">Share</th>
                      <th className="text-left p-3 text-zinc-500 uppercase">Location</th>
                      <th className="text-left p-3 text-zinc-500 uppercase">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-400">
                    <tr className="border-b border-white/5">
                      <td className="p-3 text-accent">USER</td>
                      <td className="p-3">Device SE</td>
                      <td className="p-3">Authorization</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-3 text-accent">AGENT</td>
                      <td className="p-3">Nitro Enclave</td>
                      <td className="p-3">Autonomous ops</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-accent">BACKUP</td>
                      <td className="p-3">Guardian/HSM</td>
                      <td className="p-3">Recovery</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </BentoCard>

            {/* TEE */}
            <BentoCard className="col-span-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu size={14} strokeWidth={1.2} className="text-zinc-500" />
                <span className="label">Trusted Execution</span>
              </div>
              <h3 className="heading-md mb-3">AWS Nitro Enclaves</h3>
              <p className="text-text-secondary text-sm mb-4">
                Isolated VMs with no admin access, no persistent storage, cryptographic attestation.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 p-2 bg-white/5 rounded">
                  <span className="text-[8px] font-mono text-zinc-500 w-8">[01]</span>
                  <span className="text-zinc-400">Enclave image hashed (reproducible)</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white/5 rounded">
                  <span className="text-[8px] font-mono text-zinc-500 w-8">[02]</span>
                  <span className="text-zinc-400">Hash published to chain + audits</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white/5 rounded">
                  <span className="text-[8px] font-mono text-zinc-500 w-8">[03]</span>
                  <span className="text-zinc-400">KMS releases keys only if attestation matches</span>
                </div>
              </div>
            </BentoCard>

            {/* Policy Engine */}
            <BentoCard className="col-span-8">
              <div className="flex items-center gap-2 mb-4">
                <Lock size={14} strokeWidth={1.2} className="text-zinc-500" />
                <span className="label">On-Chain Policy</span>
              </div>
              <h3 className="heading-md mb-3">Squads v4 Programmable Custody</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 border border-white/5 rounded-lg overflow-hidden">
                  <div className="p-3 border-b border-white/5">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">Operation Thresholds</span>
                  </div>
                  <div className="p-3 space-y-2 text-xs font-mono">
                    <div className="flex justify-between"><span className="text-zinc-500">capture_rewards</span><span className="text-zinc-400">AGENT</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">stack_lt_1000</span><span className="text-zinc-400">AGENT</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">stack_gt_1000</span><span className="text-zinc-400">AGENT+USER</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">external_transfer</span><span className="text-zinc-400">AGENT+USER</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">fiat_extraction</span><span className="text-accent">AGENT+USER+24H</span></div>
                  </div>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-lg overflow-hidden">
                  <div className="p-3 border-b border-white/5">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">Default Limits</span>
                  </div>
                  <div className="p-3 space-y-2 text-xs font-mono">
                    <div className="flex justify-between"><span className="text-zinc-500">daily_transfer_limit</span><span className="text-accent">1,000 Cred</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">single_tx_limit</span><span className="text-accent">500 Cred</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">auto_approve_stack</span><span className="text-accent">1,000 Cred</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">settings_delay</span><span className="text-accent">48h</span></div>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Recovery */}
            <BentoCard className="col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <Users size={14} strokeWidth={1.2} className="text-zinc-500" />
                <span className="label">Recovery</span>
              </div>
              <h3 className="heading-md mb-3">Social Recovery</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-white/5 rounded border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-1">Guardians</span>
                  <span className="text-zinc-400">3-of-5 + 7d timelock</span>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-1">Inheritance</span>
                  <span className="text-zinc-400">90d inactivity trigger</span>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-1">Device Loss</span>
                  <span className="text-zinc-400">Passkey sync via iCloud/Google</span>
                </div>
              </div>
            </BentoCard>
          </BentoGrid>

          {/* Threat Model */}
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle size={14} strokeWidth={1.2} className="text-zinc-500" />
            <span className="label label-accent">Threat Model</span>
          </div>

          <BentoGrid className="mb-12">
            <BentoCard className="col-span-6">
              <h3 className="heading-md mb-4">In Scope</h3>
              <div className="space-y-2">
                {[
                  "Loop infrastructure compromise",
                  "Malicious or buggy agent behavior",
                  "User device loss or theft",
                  "User incapacitation or death",
                  "Fraudulent value capture claims",
                  "Phishing and social engineering",
                ].map((threat, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded text-sm">
                    <CheckCircle size={14} strokeWidth={1.2} className="text-accent" />
                    <span className="text-zinc-400">{threat}</span>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="col-span-6">
              <h3 className="heading-md mb-4">Trust Assumptions</h3>
              <div className="space-y-2">
                {[
                  "Hardware secure elements (Apple SE, Google Titan)",
                  "AWS Nitro attestation primitives",
                  "Solana validator consensus",
                  "Standard cryptographic primitives",
                ].map((assumption, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded text-sm">
                    <Lock size={14} strokeWidth={1.2} className="text-zinc-500" />
                    <span className="text-zinc-400">{assumption}</span>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded">
                  <span className="text-accent text-sm font-mono">We do not assume Loop's servers are trustworthy.</span>
                </div>
              </div>
            </BentoCard>
          </BentoGrid>

          {/* Capabilities Matrix */}
          <div className="flex items-center gap-2 mb-6">
            <FileCheck size={14} strokeWidth={1.2} className="text-zinc-500" />
            <span className="label label-accent">Capabilities Matrix</span>
          </div>

          <BentoGrid className="mb-12">
            <BentoCard className="col-span-6">
              <h3 className="heading-md mb-4">What Loop Cannot Do</h3>
              <div className="space-y-2">
                {[
                  { action: "Access user funds", reason: "Zero key shares held" },
                  { action: "Move user Cred", reason: "Requires passkey/guardians" },
                  { action: "Forge captures", reason: "ZK proofs verified on-chain" },
                  { action: "Block withdrawals", reason: "No veto authority" },
                  { action: "Access enclave memory", reason: "TEE isolation" },
                  { action: "Silent agent updates", reason: "Hash changes visible" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <XCircle size={14} strokeWidth={1.2} className="text-red-400" />
                      <span className="text-zinc-400">{item.action}</span>
                    </div>
                    <span className="text-zinc-600 text-xs font-mono">{item.reason}</span>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="col-span-6">
              <h3 className="heading-md mb-4">What Users Can Always Do</h3>
              <div className="space-y-2">
                {[
                  { action: "View balance", req: "Public chain data" },
                  { action: "Pause agent", req: "1 sig, immediate" },
                  { action: "Revoke agent", req: "1 sig, immediate" },
                  { action: "Withdraw all", req: "1 sig + 24h" },
                  { action: "Change heir", req: "1 sig + 48h" },
                  { action: "Guardian recovery", req: "3/5 sig + 7d" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} strokeWidth={1.2} className="text-accent" />
                      <span className="text-zinc-400">{item.action}</span>
                    </div>
                    <span className="text-zinc-600 text-xs font-mono">{item.req}</span>
                  </div>
                ))}
              </div>
            </BentoCard>
          </BentoGrid>

          {/* Audits */}
          <div className="flex items-center gap-2 mb-6">
            <Clock size={14} strokeWidth={1.2} className="text-zinc-500" />
            <span className="label label-accent">Audit Schedule</span>
          </div>

          <BentoGrid className="mb-12">
            {[
              { component: "Solana Programs", auditor: "OtterSec", timeline: "Q2 2026", status: "scheduled" },
              { component: "MPC Integration", auditor: "Trail of Bits", timeline: "Q2 2026", status: "scheduled" },
              { component: "Enclave Code", auditor: "NCC Group", timeline: "Q2 2026", status: "scheduled" },
              { component: "ZK Circuits", auditor: "Veridise", timeline: "Q3 2026", status: "planned" },
            ].map((audit, i) => (
              <BentoCard key={i} className="col-span-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="status-dot-warning" />
                  <span className="text-[8px] font-mono text-zinc-500 uppercase">{audit.timeline}</span>
                </div>
                <h4 className="font-semibold mb-1">{audit.component}</h4>
                <span className="text-zinc-500 text-sm">{audit.auditor}</span>
              </BentoCard>
            ))}
          </BentoGrid>

          {/* Contact */}
          <div className="text-center pt-8 border-t border-white/5">
            <span className="label block mb-2">Security Team</span>
            <a href="mailto:security@looplocal.io" className="text-accent font-mono hover:underline">
              security@looplocal.io
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
