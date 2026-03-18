"use client";

import Link from "next/link";

export default function DocsPage() {
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
            <Link href="/launch" className="text-text-secondary hover:text-text-primary">
              Launch Agent
            </Link>
            <a 
              href="https://github.com/OAR-Technologies-Inc/loop-protocol" 
              target="_blank"
              className="text-text-secondary hover:text-text-primary"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <nav className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Getting Started
              </h3>
              <ul className="space-y-2">
                <li><a href="#installation" className="text-text-secondary hover:text-forest">Installation</a></li>
                <li><a href="#quickstart" className="text-text-secondary hover:text-forest">Quick Start</a></li>
                <li><a href="#configuration" className="text-text-secondary hover:text-forest">Configuration</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Core Concepts
              </h3>
              <ul className="space-y-2">
                <li><a href="#vaults" className="text-text-secondary hover:text-forest">Vaults</a></li>
                <li><a href="#cred" className="text-text-secondary hover:text-forest">Cred Token</a></li>
                <li><a href="#stacking" className="text-text-secondary hover:text-forest">Stacking</a></li>
                <li><a href="#agents" className="text-text-secondary hover:text-forest">Service Agents</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Advanced
              </h3>
              <ul className="space-y-2">
                <li><a href="#bonding-curves" className="text-text-secondary hover:text-forest">Bonding Curves</a></li>
                <li><a href="#capture-modules" className="text-text-secondary hover:text-forest">Capture Modules</a></li>
                <li><a href="#program-ids" className="text-text-secondary hover:text-forest">Program IDs</a></li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="prose prose-invert max-w-none">
            {/* Hero */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-4">Loop Protocol SDK</h1>
              <p className="text-xl text-text-secondary">
                The official TypeScript SDK for building on Loop Protocol — value capture infrastructure for AI agents on Solana.
              </p>
            </div>

            {/* Installation */}
            <section id="installation" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Installation</h2>
              <CodeBlock language="bash">
{`npm install @loop-protocol/sdk
# or
yarn add @loop-protocol/sdk
# or
pnpm add @loop-protocol/sdk`}
              </CodeBlock>
            </section>

            {/* Quick Start */}
            <section id="quickstart" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
              <p className="text-text-secondary mb-4">
                Get started with Loop Protocol in under 5 minutes. Here's a complete example of connecting, wrapping USDC to Cred, and stacking for yield.
              </p>

              <h3 className="text-xl font-semibold mb-3">Basic Usage</h3>
              <CodeBlock language="typescript">
{`import { Loop } from '@loop-protocol/sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// Initialize the SDK
const connection = new Connection('https://api.mainnet-beta.solana.com');
const loop = new Loop({ connection });

// Check if user has a vault
const hasVault = await loop.vault.exists(userWallet.publicKey);

// Create vault if needed
if (!hasVault) {
  const initTx = await loop.vault.initializeVault(userWallet.publicKey);
  // Sign and send transaction...
}

// Get vault balance
const vault = await loop.vault.getVault(userWallet.publicKey);
console.log(\`Balance: \${vault?.credBalance} Cred\`);
console.log(\`Stacked: \${vault?.stackedBalance} Cred\`);`}
              </CodeBlock>

              <h3 className="text-xl font-semibold mb-3 mt-8">Simplified API (LoopSDK)</h3>
              <p className="text-text-secondary mb-4">
                For common operations like launching agents and trading tokens, use the simplified LoopSDK wrapper:
              </p>
              <CodeBlock language="typescript">
{`import { LoopSDK } from '@loop-protocol/sdk';

const sdk = new LoopSDK(); // Defaults to mainnet

// Launch a service agent (pays 500 OXO)
const tx = await sdk.registerServiceAgent({
  name: 'ComputeRental v1',
  capabilities: ['Compute Rental', 'Data Licensing'],
  feePercentage: 5,
  launchToken: true
});

// Get bonding curve price
const price = await sdk.getBondingCurvePrice('agent-mint-address');
console.log(\`Current price: \${price} OXO\`);

// Buy agent tokens
const buyTx = await sdk.buyAgentToken('agent-mint-address', 100);

// Access full SDK when needed
const fullLoop = sdk.core;
await fullLoop.vault.initializeVault(userWallet.publicKey);`}
              </CodeBlock>
            </section>

            {/* Configuration */}
            <section id="configuration" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Configuration</h2>
              <CodeBlock language="typescript">
{`import { Loop, LoopSDK } from '@loop-protocol/sdk';
import { Connection, clusterApiUrl } from '@solana/web3.js';

// Full SDK with custom connection
const loop = new Loop({
  connection: new Connection('https://your-rpc.com'),
  wallet: anchorWallet, // Optional, for signing
});

// Simple SDK with network presets
const sdk = new LoopSDK({ network: 'mainnet' });
// or
const devSdk = new LoopSDK({ network: 'devnet' });
// or with custom endpoint
const customSdk = new LoopSDK({ 
  endpoint: 'https://your-rpc.com' 
});`}
              </CodeBlock>
            </section>

            {/* Vaults */}
            <section id="vaults" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Vaults</h2>
              <p className="text-text-secondary mb-4">
                Vaults are user-owned accounts that store Cred tokens. Every user needs a vault to participate in the Loop ecosystem.
              </p>
              <CodeBlock language="typescript">
{`// Initialize vault
const initTx = await loop.vault.initializeVault(owner);

// Deposit Cred
const depositTx = await loop.vault.deposit(
  owner,
  new BN(100_000_000), // 100 Cred
  userCredAccount,
  vaultCredAccount
);

// Withdraw Cred
const withdrawTx = await loop.vault.withdraw(
  owner,
  new BN(50_000_000), // 50 Cred
  userCredAccount,
  vaultCredAccount
);

// Get vault info
const vault = await loop.vault.getVault(owner);
console.log(\`Balance: \${vault.credBalance}\`);
console.log(\`Stacked: \${vault.stackedBalance}\`);`}
              </CodeBlock>
            </section>

            {/* Cred */}
            <section id="cred" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Cred Token</h2>
              <p className="text-text-secondary mb-4">
                Cred is the stable value token of Loop Protocol. 1 Cred = 1 USDC, always. Wrap and unwrap at will.
              </p>
              <CodeBlock language="typescript">
{`// Wrap USDC to Cred (1:1)
const wrapTx = await loop.cred.wrap(
  user,
  new BN(100_000_000), // 100 USDC → 100 Cred
  userUsdcAccount,
  userCredAccount,
  credMint,
  reserveVault
);

// Unwrap Cred to USDC (1:1)
const unwrapTx = await loop.cred.unwrap(
  user,
  new BN(50_000_000), // 50 Cred → 50 USDC
  userCredAccount,
  userUsdcAccount,
  credMint,
  reserveVault
);`}
              </CodeBlock>
            </section>

            {/* Stacking */}
            <section id="stacking" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Stacking</h2>
              <p className="text-text-secondary mb-4">
                Stack your Cred to earn yield. Longer lock periods = higher APY.
              </p>
              <div className="bg-bg-surface rounded-xl p-6 border border-border-subtle mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted">
                      <th className="text-left pb-3">Duration</th>
                      <th className="text-right pb-3">APY</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr><td>7 days</td><td className="text-right">5%</td></tr>
                    <tr><td>14 days</td><td className="text-right">7%</td></tr>
                    <tr><td>30 days</td><td className="text-right">10%</td></tr>
                    <tr><td>90 days</td><td className="text-right">15%</td></tr>
                    <tr><td>180 days</td><td className="text-right">18%</td></tr>
                    <tr><td>365 days</td><td className="text-right text-forest font-semibold">20%</td></tr>
                  </tbody>
                </table>
              </div>
              <CodeBlock language="typescript">
{`// Stack Cred for 90 days (15% APY)
const stackTx = await loop.vault.stack(
  owner,
  new BN(1000_000_000), // 1000 Cred
  90 // days
);

// Calculate APY for any duration
const apy = loop.vault.calculateApy(90); // Returns 1500 (15% in basis points)

// Claim yield from a stack
const claimTx = await loop.vault.claimYield(owner, stackAddress);

// Unstack after lock period
const unstackTx = await loop.vault.unstack(owner, stackAddress);`}
              </CodeBlock>
            </section>

            {/* Agents */}
            <section id="agents" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Service Agents</h2>
              <p className="text-text-secondary mb-4">
                Register service agents that capture value and earn fees for their creators.
              </p>
              <CodeBlock language="typescript">
{`// Register a service agent
const registerTx = await loop.avp.registerServiceAgent(
  creator,
  agentPubkey,
  'https://arweave.net/metadata-uri',
  creatorOxoAccount
);

// Declare capabilities
const capabilities = [
  loop.avp.createCapabilityId('CAPTURE_SHOPPING'),
  loop.avp.createCapabilityId('CAPTURE_DATA'),
];
const declareTx = await loop.avp.declareCapabilities(agentPubkey, capabilities);

// Check if agent is registered
const agent = await loop.avp.getAgent(agentPubkey);
console.log(\`Status: \${agent.status}\`);
console.log(\`Reputation: \${agent.reputationScore}\`);`}
              </CodeBlock>
            </section>

            {/* Bonding Curves */}
            <section id="bonding-curves" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Bonding Curves</h2>
              <p className="text-text-secondary mb-4">
                Each service agent can have a tradeable token on a bonding curve. Buy low, sell high.
              </p>
              <CodeBlock language="typescript">
{`// Create agent token with bonding curve
const createTx = await loop.oxo.createAgentToken(
  creator,
  agentMint,
  'ComputeRental',
  'COMP',
  'https://arweave.net/token-metadata',
  creatorOxoAccount,
  treasuryOxoAccount
);

// Get bonding curve state
const curve = await loop.oxo.getBondingCurve(agentMint);
console.log(\`Supply: \${curve.tokenSupply}\`);
console.log(\`Reserve: \${curve.oxoReserve}\`);

// Buy tokens on the curve
const buyTx = await loop.oxo.buyAgentToken(
  buyer,
  agentMint,
  new BN(100_000_000), // 100 OXO to spend
  buyerOxoAccount,
  buyerAgentTokenAccount,
  curveOxoAccount
);

// Sell tokens back
const sellTx = await loop.oxo.sellAgentToken(
  seller,
  agentMint,
  new BN(50_000_000), // 50 tokens to sell
  sellerOxoAccount,
  sellerAgentTokenAccount,
  curveOxoAccount
);`}
              </CodeBlock>
            </section>

            {/* Capture Modules */}
            <section id="capture-modules" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Capture Modules</h2>
              <p className="text-text-secondary mb-4">
                11 different ways to capture value into user vaults:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: "🛒", name: "Shopping", desc: "Merchant rewards" },
                  { icon: "📊", name: "Data", desc: "Data licensing" },
                  { icon: "🔗", name: "Referral", desc: "Affiliate commissions" },
                  { icon: "👁️", name: "Attention", desc: "Ad viewing rewards" },
                  { icon: "🖥️", name: "Compute", desc: "GPU/CPU rental" },
                  { icon: "🌐", name: "Network", desc: "Node participation" },
                  { icon: "🧠", name: "Skill", desc: "Behavior models" },
                  { icon: "💧", name: "Liquidity", desc: "DeFi yields" },
                  { icon: "⚡", name: "Energy", desc: "Power trading" },
                  { icon: "👥", name: "Social", desc: "Social graphs" },
                  { icon: "🛡️", name: "Insurance", desc: "Coverage premiums" },
                ].map((mod) => (
                  <div key={mod.name} className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
                    <span className="text-2xl">{mod.icon}</span>
                    <h4 className="font-semibold mt-2">{mod.name}</h4>
                    <p className="text-text-muted text-sm">{mod.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Program IDs */}
            <section id="program-ids" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Program IDs (Mainnet)</h2>
              <div className="bg-bg-surface rounded-xl p-6 border border-border-subtle overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="text-text-muted">
                      <th className="text-left pb-3">Program</th>
                      <th className="text-left pb-3">Address</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr className="border-t border-border-subtle">
                      <td className="py-2">loop_cred</td>
                      <td className="py-2 text-forest-light">HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG</td>
                    </tr>
                    <tr className="border-t border-border-subtle">
                      <td className="py-2">loop_vault</td>
                      <td className="py-2 text-forest-light">J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT</td>
                    </tr>
                    <tr className="border-t border-border-subtle">
                      <td className="py-2">loop_shopping</td>
                      <td className="py-2 text-forest-light">HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-text-muted text-sm mt-4">
                AVP, OXO, and VTP programs coming soon to mainnet.
              </p>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-br from-forest/20 to-gold/10 rounded-2xl p-8 border border-forest/30">
              <h2 className="text-2xl font-bold mb-4">Ready to Build?</h2>
              <p className="text-text-secondary mb-6">
                Join the Loop ecosystem and start capturing value for your users.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/launch"
                  className="px-6 py-3 bg-forest text-white rounded-xl font-semibold hover:bg-forest-light transition-colors"
                >
                  Launch an Agent
                </Link>
                <a 
                  href="https://github.com/OAR-Technologies-Inc/loop-protocol/sdk"
                  target="_blank"
                  className="px-6 py-3 bg-bg-elevated text-text-primary rounded-xl font-semibold hover:bg-bg-hover transition-colors"
                >
                  View on GitHub →
                </a>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

// Code block component
function CodeBlock({ children, language }: { children: string; language: string }) {
  return (
    <div className="relative group">
      <pre className="bg-bg-elevated rounded-xl p-4 overflow-x-auto border border-border-subtle">
        <code className={`language-${language} text-sm font-mono text-text-secondary`}>
          {children}
        </code>
      </pre>
      <button 
        className="absolute top-3 right-3 px-2 py-1 bg-bg-surface rounded text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => navigator.clipboard.writeText(children)}
      >
        Copy
      </button>
    </div>
  );
}
