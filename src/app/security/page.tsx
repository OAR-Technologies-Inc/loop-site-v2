"use client";

import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="border-b border-border-subtle sticky top-0 bg-bg-base/80 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold">
            Loop Protocol
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/marketplace" className="text-text-secondary hover:text-text-primary">
              Marketplace
            </Link>
            <Link href="/docs" className="text-text-secondary hover:text-text-primary">
              Docs
            </Link>
            <Link href="/launch" className="text-text-secondary hover:text-text-primary">
              Launch Agent
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <p className="text-forest-light text-sm font-medium mb-2">Loop Protocol v1.0 • March 2026</p>
          <h1 className="text-4xl font-bold mb-4">Security Architecture</h1>
          <p className="text-xl text-text-secondary">
            How Loop enables autonomous agent operation without sacrificing user custody.
          </p>
        </div>

        {/* Overview */}
        <Section title="Overview">
          <p>
            Loop Protocol enables AI agents to transact on behalf of users. This creates a core tension: 
            agents need signing authority, but users must retain custody. Our architecture resolves this 
            through threshold cryptography, hardware isolation, and on-chain policy enforcement.
          </p>
          <p className="mt-4 font-medium">Design principles:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-text-secondary">
            <li>Loop (the company) never holds keys</li>
            <li>Users can always exit without permission</li>
            <li>Agents operate within verifiable constraints</li>
            <li>Recovery paths exist for device loss and death</li>
          </ol>
        </Section>

        {/* Threat Model */}
        <Section title="Threat Model">
          <h4 className="font-semibold mb-2">In Scope</h4>
          <ul className="list-disc list-inside text-text-secondary space-y-1 mb-4">
            <li>Loop infrastructure compromise</li>
            <li>Malicious or buggy agent behavior</li>
            <li>User device loss or theft</li>
            <li>User incapacitation or death</li>
            <li>Fraudulent value capture claims</li>
            <li>Phishing and social engineering</li>
          </ul>
          <h4 className="font-semibold mb-2">Trust Assumptions</h4>
          <p className="text-text-secondary">
            We assume hardware secure elements (Apple SE, Google Titan), AWS Nitro attestation, 
            Solana validator consensus, and standard cryptographic primitives are sound. 
            We do not assume Loop's servers are trustworthy.
          </p>
        </Section>

        {/* Architecture Diagram */}
        <Section title="Architecture">
          <div className="bg-bg-subtle border border-border-subtle rounded-lg p-6 font-mono text-sm overflow-x-auto">
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
          <h4 className="font-semibold mb-2">No Seed Phrases</h4>
          <p className="text-text-secondary mb-4">
            Users authenticate with device biometrics via WebAuthn. The device secure element generates 
            a P-256 keypair that never leaves hardware. This passkey authorizes MPC signing operations—users 
            never see or manage cryptographic material.
          </p>

          <h4 className="font-semibold mb-2">Threshold Signing</h4>
          <p className="text-text-secondary mb-3">Keys are split 2-of-3:</p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-2 pr-4 font-semibold">Share</th>
                  <th className="text-left py-2 pr-4 font-semibold">Location</th>
                  <th className="text-left py-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">User</td>
                  <td className="py-2 pr-4">Device secure element</td>
                  <td className="py-2">Human authorization</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Agent</td>
                  <td className="py-2 pr-4">Nitro Enclave</td>
                  <td className="py-2">Autonomous operations</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Backup</td>
                  <td className="py-2 pr-4">Guardian network or cloud HSM</td>
                  <td className="py-2">Recovery</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-text-secondary mb-4">
            Daily agent operations (captures, small transfers) use the agent share alone, constrained by 
            on-chain policy. High-value operations require the user share. Recovery requires any two shares.
          </p>
          <p className="text-text-secondary">
            The full private key is never reconstructed—shares produce signatures via MPC protocol 
            (GG18/FROST) without combining.
          </p>

          <h4 className="font-semibold mt-6 mb-2">Session Keys</h4>
          <p className="text-text-secondary mb-2">
            Agents don't hold the user's key share. Instead, they receive scoped session keys with:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-1">
            <li>Expiration (24-48 hours)</li>
            <li>Instruction whitelist</li>
            <li>Spending caps</li>
            <li>Rate limits</li>
          </ul>
          <p className="text-text-secondary mt-2">
            Session keys are derived on-device and transmitted to the enclave over an attested channel.
          </p>
        </Section>

        {/* Trusted Execution */}
        <Section title="Trusted Execution">
          <p className="text-text-secondary mb-4">
            Agent code runs in AWS Nitro Enclaves—isolated VMs with no admin access, no persistent storage, 
            and cryptographic attestation.
          </p>
          <h4 className="font-semibold mb-2">Attestation Flow</h4>
          <ol className="list-decimal list-inside text-text-secondary space-y-1 mb-4">
            <li>Enclave image is built and hashed (reproducible build)</li>
            <li>Hash is published to chain and audit reports</li>
            <li>On boot, Nitro provides a signed attestation document</li>
            <li>AWS KMS only releases key shares if attestation matches expected hash</li>
            <li>Users/auditors can verify: the running code matches the audited code</li>
          </ol>
          <p className="text-text-secondary">
            An attacker who compromises Loop's servers cannot modify enclave behavior—any code change 
            produces a different hash, which fails attestation.
          </p>
        </Section>

        {/* Policy Enforcement */}
        <Section title="Policy Enforcement">
          <p className="text-text-secondary mb-4">
            Squads Protocol v4 provides programmable custody. Each vault has an associated policy account defining:
          </p>
          
          <h4 className="font-semibold mb-2">Thresholds</h4>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-2 pr-4 font-semibold">Operation</th>
                  <th className="text-left py-2 font-semibold">Required Signers</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Capture rewards</td>
                  <td className="py-2">Agent alone</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Stack &lt; $1,000</td>
                  <td className="py-2">Agent alone</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Stack &gt; $1,000</td>
                  <td className="py-2">Agent + User</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Internal transfer</td>
                  <td className="py-2">Agent (within daily limit)</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">External transfer</td>
                  <td className="py-2">Agent + User</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Fiat extraction</td>
                  <td className="py-2">Agent + User + 24h delay</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Settings change</td>
                  <td className="py-2">User + 48h delay</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className="font-semibold mb-2">Limits</h4>
          <CodeBlock>{`daily_transfer_limit: 1,000 Cred
single_tx_limit: 500 Cred  
auto_approve_stacking: 1,000 Cred`}</CodeBlock>
          <p className="text-text-secondary mt-4">
            Policies are enforced on-chain. The agent cannot exceed them even if compromised—Solana 
            rejects non-conforming transactions.
          </p>
        </Section>

        {/* Capture Verification */}
        <Section title="Capture Verification">
          <p className="text-text-secondary mb-4">
            Value captures are the core of Loop's value proposition. We cannot rely on agents self-reporting purchases.
          </p>
          <p className="text-text-secondary mb-2">
            <span className="font-semibold text-text-primary">Current approach (Phase 1):</span> Merchant-signed 
            receipts via OAuth integrations. Square, Stripe, and Clover provide cryptographic proof of transaction.
          </p>
          <p className="text-text-secondary">
            <span className="font-semibold text-text-primary">Future approach (Phase 2):</span> Zero-knowledge 
            attestation of web activity via Reclaim Protocol / TLSNotary. User's browser proves a purchase 
            occurred without revealing transaction details. The on-chain program verifies the ZK proof before minting Cred.
          </p>
          <p className="text-text-secondary mt-4">
            This eliminates trust in Loop's infrastructure for capture verification.
          </p>
        </Section>

        {/* Recovery */}
        <Section title="Recovery">
          <h4 className="font-semibold mb-2">Device Loss</h4>
          <p className="text-text-secondary mb-4">
            Passkeys sync across user devices via platform keychain (iCloud, Google). Users with multiple 
            devices recover automatically.
          </p>

          <h4 className="font-semibold mb-2">Account Recovery</h4>
          <p className="text-text-secondary mb-2">
            Users designate 3-5 guardians (friends, family, hardware wallets). Recovery requires:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-1 mb-4">
            <li>3-of-5 guardian signatures</li>
            <li>7-day timelock (prevents guardian collusion)</li>
            <li>Notification to all registered contacts</li>
          </ul>

          <h4 className="font-semibold mb-2">Inheritance</h4>
          <p className="text-text-secondary mb-2">
            The vault tracks user activity via transaction timestamps. If no user-signed transaction occurs for 90 days:
          </p>
          <ol className="list-decimal list-inside text-text-secondary space-y-1 mb-4">
            <li>Day 90: Heartbeat check fails, notifications sent</li>
            <li>Day 180: Second warning, guardian notification</li>
            <li>Day 270: <code className="bg-bg-subtle px-1 rounded">claim_inheritance()</code> becomes callable</li>
            <li>Designated heir receives vault contents</li>
          </ol>
          <p className="text-text-secondary">
            Users can configure the inactivity threshold (90-365 days) and update heirs at any time (with 48-hour delay).
          </p>
        </Section>

        {/* What Loop Cannot Do */}
        <Section title="What Loop Cannot Do">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-2 pr-4 font-semibold">Action</th>
                  <th className="text-left py-2 font-semibold">Why</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Access user funds</td>
                  <td className="py-2">We hold zero key shares</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Move user Cred</td>
                  <td className="py-2">Requires user passkey or guardian threshold</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Forge captures</td>
                  <td className="py-2">ZK proofs are cryptographically verified</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Block withdrawals</td>
                  <td className="py-2">No veto authority; user can always exit</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Access enclave memory</td>
                  <td className="py-2">TEE isolation; no admin access</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Silently update agents</td>
                  <td className="py-2">Attestation hash changes are publicly visible</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* What Users Can Always Do */}
        <Section title="What Users Can Always Do">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-2 pr-4 font-semibold">Action</th>
                  <th className="text-left py-2 font-semibold">Requirement</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">View balance</td>
                  <td className="py-2">Public chain data</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Pause agent</td>
                  <td className="py-2">Single signature, immediate</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Revoke agent</td>
                  <td className="py-2">Single signature, immediate</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Withdraw all funds</td>
                  <td className="py-2">Single signature + 24h delay</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Change heir</td>
                  <td className="py-2">Single signature + 48h delay</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Recover via guardians</td>
                  <td className="py-2">3-of-5 signatures + 7 day delay</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Verify agent code</td>
                  <td className="py-2">Compare attestation hash to published audit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Audit Status */}
        <Section title="Audit Status">
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-2 pr-4 font-semibold">Component</th>
                  <th className="text-left py-2 pr-4 font-semibold">Auditor</th>
                  <th className="text-left py-2 font-semibold">Timeline</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Solana programs</td>
                  <td className="py-2 pr-4">OtterSec</td>
                  <td className="py-2">Q2 2026</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">MPC integration</td>
                  <td className="py-2 pr-4">Trail of Bits</td>
                  <td className="py-2">Q2 2026</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 pr-4">Enclave code</td>
                  <td className="py-2 pr-4">NCC Group</td>
                  <td className="py-2">Q2 2026</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">ZK circuits</td>
                  <td className="py-2 pr-4">Veridise</td>
                  <td className="py-2">Q3 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-text-secondary">
            All Solana programs and SDK code are open source under MIT license. Enclave code and 
            attestation hashes are published for independent verification.
          </p>
        </Section>

        {/* Summary */}
        <Section title="Summary">
          <p className="text-text-secondary mb-4">
            Loop achieves autonomous agent operation without sacrificing user custody through:
          </p>
          <ul className="space-y-2 text-text-secondary">
            <li><span className="font-semibold text-text-primary">MPC key splitting</span> — No single point of failure or trust</li>
            <li><span className="font-semibold text-text-primary">TEE isolation</span> — Verifiable agent execution</li>
            <li><span className="font-semibold text-text-primary">On-chain policy</span> — Immutable spending constraints</li>
            <li><span className="font-semibold text-text-primary">ZK verification</span> — Trustless capture validation</li>
            <li><span className="font-semibold text-text-primary">Social recovery</span> — No permanent fund loss</li>
          </ul>
          <p className="text-text-secondary mt-4">
            The result: agents that operate 24/7 within user-defined boundaries, with cryptographic 
            guarantees that Loop cannot access or misappropriate funds.
          </p>
        </Section>

        {/* Contact */}
        <div className="mt-12 pt-8 border-t border-border-subtle text-center text-text-muted">
          <p>Loop Protocol Security Team</p>
          <a href="mailto:security@looplocal.io" className="text-forest-light hover:text-forest">
            security@looplocal.io
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="text-text-primary leading-relaxed">{children}</div>
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-bg-subtle border border-border-subtle rounded-lg p-4 overflow-x-auto">
      <code className="text-sm text-text-secondary">{children}</code>
    </pre>
  );
}
