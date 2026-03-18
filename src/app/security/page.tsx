"use client";

import { C2Nav, BentoCard, BentoGrid } from "@/components/ui";

export default function SecurityPage() {
  return (
    <div className="min-h-screen">
      <C2Nav />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <span className="label label-accent mb-4 block">Loop Protocol v1.0 • March 2026</span>
            <h1 className="heading-xl mb-4">Security Architecture</h1>
            <p className="text-text-secondary text-lg max-w-2xl">
              How Loop enables autonomous agent operation without sacrificing user custody.
            </p>
          </div>

          {/* Overview */}
          <Section title="Overview">
            <p className="text-text-secondary mb-4">
              Loop Protocol enables AI agents to transact on behalf of users. This creates a core tension: 
              agents need signing authority, but users must retain custody. Our architecture resolves this 
              through threshold cryptography, hardware isolation, and on-chain policy enforcement.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                "Loop never holds keys",
                "Users can always exit",
                "Verifiable constraints",
                "Recovery paths exist",
              ].map((principle, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-accent mono text-xs font-bold">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-sm mt-2">{principle}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Architecture Diagram */}
          <Section title="Architecture">
            <div className="bg-black/30 border border-white/10 rounded-lg p-6 font-mono text-xs overflow-x-auto">
              <pre className="text-text-secondary">{`USER DEVICE                    LOOP INFRASTRUCTURE              SOLANA
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
          </Section>

          {/* Key Management */}
          <Section title="Key Management">
            <BentoGrid className="gap-4">
              <BentoCard className="col-span-6" spotlight={false}>
                <span className="label mb-3 block">No Seed Phrases</span>
                <p className="text-text-secondary text-sm">
                  Users authenticate with device biometrics via WebAuthn. The device secure element 
                  generates a P-256 keypair that never leaves hardware. Users never see or manage 
                  cryptographic material.
                </p>
              </BentoCard>
              <BentoCard className="col-span-6" spotlight={false}>
                <span className="label mb-3 block">Session Keys</span>
                <p className="text-text-secondary text-sm">
                  Agents receive scoped session keys with expiration (24-48h), instruction whitelist, 
                  spending caps, and rate limits. Derived on-device and transmitted over attested channels.
                </p>
              </BentoCard>
            </BentoGrid>

            <div className="mt-6">
              <span className="label mb-3 block">Threshold Signing (2-of-3)</span>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Share</th>
                    <th>Location</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-accent">User</td>
                    <td>Device secure element</td>
                    <td>Human authorization</td>
                  </tr>
                  <tr>
                    <td className="text-accent">Agent</td>
                    <td>Nitro Enclave</td>
                    <td>Autonomous operations</td>
                  </tr>
                  <tr>
                    <td className="text-accent">Backup</td>
                    <td>Guardian network / HSM</td>
                    <td>Recovery</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-text-muted text-sm mt-4">
                The full private key is never reconstructed — shares produce signatures via MPC protocol 
                (GG18/FROST) without combining.
              </p>
            </div>
          </Section>

          {/* Trusted Execution */}
          <Section title="Trusted Execution">
            <p className="text-text-secondary mb-4">
              Agent code runs in AWS Nitro Enclaves — isolated VMs with no admin access, 
              no persistent storage, and cryptographic attestation.
            </p>
            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <span className="label label-accent mb-3 block">Attestation Flow</span>
              <ol className="text-text-secondary text-sm space-y-2">
                <li><span className="text-accent mono mr-2">1.</span> Enclave image is built and hashed (reproducible build)</li>
                <li><span className="text-accent mono mr-2">2.</span> Hash is published to chain and audit reports</li>
                <li><span className="text-accent mono mr-2">3.</span> On boot, Nitro provides a signed attestation document</li>
                <li><span className="text-accent mono mr-2">4.</span> AWS KMS only releases key shares if attestation matches</li>
                <li><span className="text-accent mono mr-2">5.</span> Users/auditors verify: running code matches audited code</li>
              </ol>
            </div>
            <p className="text-text-muted text-sm mt-4">
              An attacker who compromises Loop's servers cannot modify enclave behavior — 
              any code change produces a different hash, which fails attestation.
            </p>
          </Section>

          {/* Policy Enforcement */}
          <Section title="Policy Enforcement">
            <p className="text-text-secondary mb-4">
              Squads Protocol v4 provides programmable custody. Each vault has an associated 
              policy account defining thresholds and limits enforced on-chain.
            </p>
            
            <BentoGrid className="gap-4">
              <BentoCard className="col-span-6" spotlight={false}>
                <span className="label mb-3 block">Operation Thresholds</span>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Operation</th>
                      <th>Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Capture rewards</td><td>Agent alone</td></tr>
                    <tr><td>Stack &lt; $1,000</td><td>Agent alone</td></tr>
                    <tr><td>Stack &gt; $1,000</td><td>Agent + User</td></tr>
                    <tr><td>External transfer</td><td>Agent + User</td></tr>
                    <tr><td>Fiat extraction</td><td>Agent + User + 24h</td></tr>
                    <tr><td>Settings change</td><td>User + 48h</td></tr>
                  </tbody>
                </table>
              </BentoCard>
              <BentoCard className="col-span-6" spotlight={false}>
                <span className="label mb-3 block">Default Limits</span>
                <div className="bg-black/30 rounded p-4 font-mono text-sm">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-text-muted">daily_transfer_limit</span>
                    <span className="text-accent">1,000 Cred</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-text-muted">single_tx_limit</span>
                    <span className="text-accent">500 Cred</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-text-muted">auto_approve_stacking</span>
                    <span className="text-accent">1,000 Cred</span>
                  </div>
                </div>
                <p className="text-text-muted text-sm mt-4">
                  The agent cannot exceed policy even if compromised — Solana rejects non-conforming transactions.
                </p>
              </BentoCard>
            </BentoGrid>
          </Section>

          {/* Capture Verification */}
          <Section title="Capture Verification">
            <p className="text-text-secondary mb-4">
              Value captures are the core of Loop's value proposition. We cannot rely on agents self-reporting purchases.
            </p>
            <BentoGrid className="gap-4">
              <BentoCard className="col-span-6" spotlight={false}>
                <span className="label mb-2 block">Phase 1 — Current</span>
                <h4 className="text-lg font-semibold mb-2">Merchant Receipts</h4>
                <p className="text-text-secondary text-sm">
                  OAuth integrations with Square, Stripe, and Clover provide 
                  cryptographic proof of transaction.
                </p>
              </BentoCard>
              <BentoCard className="col-span-6" spotlight={false}>
                <span className="label mb-2 block">Phase 2 — Roadmap</span>
                <h4 className="text-lg font-semibold mb-2">Zero-Knowledge Proofs</h4>
                <p className="text-text-secondary text-sm">
                  zkTLS attestation via Reclaim Protocol. Browser proves purchase 
                  occurred without revealing details. On-chain verification.
                </p>
              </BentoCard>
            </BentoGrid>
          </Section>

          {/* Recovery */}
          <Section title="Recovery">
            <BentoGrid className="gap-4">
              <BentoCard className="col-span-4" spotlight={false}>
                <span className="label mb-3 block">Device Loss</span>
                <p className="text-text-secondary text-sm">
                  Passkeys sync across devices via platform keychain (iCloud, Google). 
                  Multiple devices = automatic recovery.
                </p>
              </BentoCard>
              <BentoCard className="col-span-4" spotlight={false}>
                <span className="label mb-3 block">Account Recovery</span>
                <p className="text-text-secondary text-sm">
                  3-5 guardians (friends, family, hardware wallets). 
                  3-of-5 signatures + 7-day timelock prevents collusion.
                </p>
              </BentoCard>
              <BentoCard className="col-span-4" spotlight={false}>
                <span className="label mb-3 block">Inheritance</span>
                <p className="text-text-secondary text-sm">
                  90-day inactivity triggers heartbeat checks. Day 270: 
                  designated heir can claim vault contents.
                </p>
              </BentoCard>
            </BentoGrid>
          </Section>

          {/* What Loop Cannot Do */}
          <Section title="What Loop Cannot Do">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Access user funds</td><td>We hold zero key shares</td></tr>
                <tr><td>Move user Cred</td><td>Requires user passkey or guardian threshold</td></tr>
                <tr><td>Forge captures</td><td>ZK proofs are cryptographically verified</td></tr>
                <tr><td>Block withdrawals</td><td>No veto authority; user can always exit</td></tr>
                <tr><td>Access enclave memory</td><td>TEE isolation; no admin access</td></tr>
                <tr><td>Silently update agents</td><td>Attestation hash changes are publicly visible</td></tr>
              </tbody>
            </table>
          </Section>

          {/* What Users Can Always Do */}
          <Section title="What Users Can Always Do">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Requirement</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>View balance</td><td>Public chain data</td></tr>
                <tr><td>Pause agent</td><td>Single signature, immediate</td></tr>
                <tr><td>Revoke agent</td><td>Single signature, immediate</td></tr>
                <tr><td>Withdraw all funds</td><td>Single signature + 24h delay</td></tr>
                <tr><td>Change heir</td><td>Single signature + 48h delay</td></tr>
                <tr><td>Recover via guardians</td><td>3-of-5 signatures + 7 day delay</td></tr>
                <tr><td>Verify agent code</td><td>Compare attestation hash to published audit</td></tr>
              </tbody>
            </table>
          </Section>

          {/* Audit Status */}
          <Section title="Audit Status">
            <BentoGrid className="gap-4 mb-6">
              {[
                { component: "Solana Programs", auditor: "OtterSec", timeline: "Q2 2026" },
                { component: "MPC Integration", auditor: "Trail of Bits", timeline: "Q2 2026" },
                { component: "Enclave Code", auditor: "NCC Group", timeline: "Q2 2026" },
                { component: "ZK Circuits", auditor: "Veridise", timeline: "Q3 2026" },
              ].map((audit, i) => (
                <BentoCard key={i} className="col-span-3" spotlight={false}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="status-dot-warning" />
                    <span className="label">{audit.timeline}</span>
                  </div>
                  <h4 className="font-semibold mb-1">{audit.component}</h4>
                  <span className="text-text-muted text-sm">{audit.auditor}</span>
                </BentoCard>
              ))}
            </BentoGrid>
            <p className="text-text-secondary text-sm">
              All Solana programs and SDK code are open source under MIT license. 
              Enclave code and attestation hashes are published for independent verification.
            </p>
          </Section>

          {/* Summary */}
          <Section title="Summary">
            <p className="text-text-secondary mb-6">
              Loop achieves autonomous agent operation without sacrificing user custody through:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { title: "MPC Key Splitting", desc: "No single point of failure" },
                { title: "TEE Isolation", desc: "Verifiable execution" },
                { title: "On-Chain Policy", desc: "Immutable constraints" },
                { title: "ZK Verification", desc: "Trustless validation" },
                { title: "Social Recovery", desc: "No permanent loss" },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                  <h4 className="font-semibold text-accent text-sm mb-1">{item.title}</h4>
                  <p className="text-text-muted text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-text-secondary mt-6">
              The result: agents that operate 24/7 within user-defined boundaries, with cryptographic 
              guarantees that Loop cannot access or misappropriate funds.
            </p>
          </Section>

          {/* Contact */}
          <div className="mt-16 pt-8 border-t border-white/5 text-center">
            <span className="label block mb-2">Loop Protocol Security Team</span>
            <a href="mailto:security@looplocal.io" className="text-accent font-mono hover:underline">
              security@looplocal.io
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="heading-lg mb-6">{title}</h2>
      {children}
    </section>
  );
}
