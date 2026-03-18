"use client";

import { useState } from "react";
import { C2Nav, BentoCard, BentoGrid } from "@/components/ui";

const SECTIONS = [
  { id: "installation", label: "Installation" },
  { id: "quickstart", label: "Quick Start" },
  { id: "configuration", label: "Configuration" },
  { id: "vaults", label: "Vaults" },
  { id: "cred", label: "Cred Token" },
  { id: "stacking", label: "Stacking" },
  { id: "agents", label: "Service Agents" },
  { id: "bonding-curves", label: "Bonding Curves" },
  { id: "program-ids", label: "Program IDs" },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("installation");

  return (
    <div className="min-h-screen">
      <C2Nav />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex gap-12">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <span className="label block mb-4">Documentation</span>
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`block px-3 py-2 text-sm font-mono transition-colors rounded ${
                    activeSection === section.id
                      ? "text-accent bg-white/5"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-12">
              <span className="label label-accent mb-4 block">@loop-protocol/sdk</span>
              <h1 className="heading-xl mb-4">SDK Documentation</h1>
              <p className="text-text-secondary text-lg max-w-2xl">
                TypeScript SDK for building on Loop Protocol — value capture infrastructure 
                for AI agents on Solana.
              </p>
            </div>

            {/* Installation */}
            <Section id="installation" title="Installation">
              <CodeBlock language="bash">
{`npm install @loop-protocol/sdk
# or
yarn add @loop-protocol/sdk
# or
pnpm add @loop-protocol/sdk`}
              </CodeBlock>
            </Section>

            {/* Quick Start */}
            <Section id="quickstart" title="Quick Start">
              <p className="text-text-secondary mb-4">
                Get started with Loop Protocol in under 5 minutes. Connect, wrap USDC to Cred, 
                and start stacking for yield.
              </p>

              <CodeBlock language="typescript">
{`import { Loop, Cred, Vault } from "@loop-protocol/sdk";
import { Connection, Keypair } from "@solana/web3.js";

// Initialize
const connection = new Connection("https://api.mainnet-beta.solana.com");
const wallet = Keypair.generate(); // Use your wallet

const loop = new Loop({ connection, wallet });

// Wrap USDC to Cred (1:1)
const wrapTx = await loop.cred.wrap({
  amount: 100_000_000, // 100 USDC (6 decimals)
});
console.log("Wrapped:", wrapTx);

// Stack Cred for yield
const stackTx = await loop.vault.stack({
  amount: 100_000_000, // 100 Cred
  lockPeriod: 30, // 30 days
});
console.log("Stacked:", stackTx);

// Check position
const position = await loop.vault.getPosition(wallet.publicKey);
console.log("APY:", position.currentApy);`}
              </CodeBlock>
            </Section>

            {/* Configuration */}
            <Section id="configuration" title="Configuration">
              <p className="text-text-secondary mb-4">
                Configure the SDK for different environments.
              </p>

              <BentoGrid className="gap-4 mb-6">
                <BentoCard className="col-span-6" spotlight={false}>
                  <span className="label mb-2 block">Mainnet</span>
                  <CodeBlock language="typescript">
{`const loop = new Loop({
  connection,
  wallet,
  cluster: "mainnet-beta",
});`}
                  </CodeBlock>
                </BentoCard>
                <BentoCard className="col-span-6" spotlight={false}>
                  <span className="label mb-2 block">Devnet</span>
                  <CodeBlock language="typescript">
{`const loop = new Loop({
  connection,
  wallet,
  cluster: "devnet",
});`}
                  </CodeBlock>
                </BentoCard>
              </BentoGrid>
            </Section>

            {/* Vaults */}
            <Section id="vaults" title="Vaults">
              <p className="text-text-secondary mb-4">
                Vaults are the core primitive for value custody. Each user has a personal vault 
                managed by their agent within on-chain policy constraints.
              </p>

              <CodeBlock language="typescript">
{`// Initialize a vault
const initTx = await loop.vault.initialize({
  owner: wallet.publicKey,
  agent: agentPublicKey,
  policy: {
    dailyLimit: 1000_000_000, // 1000 Cred
    autoStack: true,
    requireUserAbove: 500_000_000, // Require user sig above 500
  },
});

// Get vault info
const vault = await loop.vault.get(wallet.publicKey);
console.log("Balance:", vault.credBalance);
console.log("Staked:", vault.stakedAmount);
console.log("Agent:", vault.agent);`}
              </CodeBlock>
            </Section>

            {/* Cred Token */}
            <Section id="cred" title="Cred Token">
              <p className="text-text-secondary mb-4">
                Cred is the protocol's stable unit of account, backed 1:1 by USDC. 
                Wrap and unwrap freely.
              </p>

              <CodeBlock language="typescript">
{`// Wrap USDC → Cred
const wrapTx = await loop.cred.wrap({
  amount: 100_000_000, // 100 USDC
  destination: vaultAddress, // Optional: direct to vault
});

// Unwrap Cred → USDC
const unwrapTx = await loop.cred.unwrap({
  amount: 50_000_000, // 50 Cred
});

// Check balance
const balance = await loop.cred.getBalance(wallet.publicKey);`}
              </CodeBlock>
            </Section>

            {/* Stacking */}
            <Section id="stacking" title="Stacking">
              <p className="text-text-secondary mb-4">
                Stack Cred to earn yield from protocol fees. Longer lock periods earn higher APY.
              </p>

              <CodeBlock language="typescript">
{`// Stack with lock period
const stackTx = await loop.vault.stack({
  amount: 1000_000_000, // 1000 Cred
  lockPeriod: 90, // 90 days for bonus APY
});

// Unstake (after lock expires)
const unstakeTx = await loop.vault.unstake({
  amount: 500_000_000,
});

// Claim yield
const claimTx = await loop.vault.claimYield();

// Get staking info
const position = await loop.vault.getPosition(wallet.publicKey);
console.log({
  staked: position.stakedAmount,
  apy: position.currentApy,
  pendingYield: position.pendingYield,
  unlockDate: position.unlockDate,
});`}
              </CodeBlock>
            </Section>

            {/* Service Agents */}
            <Section id="agents" title="Service Agents">
              <p className="text-text-secondary mb-4">
                Register agents with bonding curve tokens. Agent tokens appreciate as adoption grows.
              </p>

              <CodeBlock language="typescript">
{`// Register a new agent
const registerTx = await loop.agents.register({
  name: "ShopCapture Pro",
  capabilities: ["shopping_capture", "data_licensing"],
  feePercentage: 5, // 5% of captured value
  metadata: {
    description: "Captures value from retail purchases",
    website: "https://shopcapture.ai",
  },
});

// Get agent info
const agent = await loop.agents.get(agentPublicKey);
console.log("Token Price:", agent.tokenPrice);
console.log("Subscribers:", agent.subscriberCount);

// Subscribe to an agent
const subscribeTx = await loop.agents.subscribe({
  agent: agentPublicKey,
  vault: vaultAddress,
});`}
              </CodeBlock>
            </Section>

            {/* Bonding Curves */}
            <Section id="bonding-curves" title="Bonding Curves">
              <p className="text-text-secondary mb-4">
                Agent tokens follow a bonding curve — price increases with supply. 
                Early adopters benefit from appreciation.
              </p>

              <CodeBlock language="typescript">
{`// Buy agent tokens
const buyTx = await loop.agents.buyTokens({
  agent: agentPublicKey,
  amount: 100, // Buy 100 tokens
  maxPrice: 1_500_000, // Slippage protection (1.5 USDC max)
});

// Sell agent tokens
const sellTx = await loop.agents.sellTokens({
  agent: agentPublicKey,
  amount: 50,
  minPrice: 1_200_000, // Minimum 1.2 USDC per token
});

// Get price quote
const quote = await loop.agents.getQuote({
  agent: agentPublicKey,
  amount: 100,
  side: "buy",
});
console.log("Price per token:", quote.pricePerToken);
console.log("Total cost:", quote.totalCost);`}
              </CodeBlock>
            </Section>

            {/* Program IDs */}
            <Section id="program-ids" title="Program IDs">
              <p className="text-text-secondary mb-4">
                Deployed program addresses on Solana mainnet.
              </p>

              <div className="bg-black/30 border border-white/10 rounded-lg overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-accent">CRED</td>
                      <td className="font-mono text-xs">HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG</td>
                    </tr>
                    <tr>
                      <td className="text-accent">VAULT</td>
                      <td className="font-mono text-xs">J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT</td>
                    </tr>
                    <tr>
                      <td className="text-accent">SHOPPING</td>
                      <td className="font-mono text-xs">HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ</td>
                    </tr>
                    <tr>
                      <td className="text-accent">Cred Mint</td>
                      <td className="font-mono text-xs">9GQMCAK3MpZF1hEbwqA9d4mRGtippGV9hyr8fxmz6eA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-white/5">
              <BentoGrid className="gap-4">
                <BentoCard className="col-span-6" spotlight={false}>
                  <span className="label mb-2 block">GitHub</span>
                  <a 
                    href="https://github.com/OAR-Technologies-Inc/loop-protocol" 
                    target="_blank"
                    className="text-accent font-mono text-sm hover:underline"
                  >
                    OAR-Technologies-Inc/loop-protocol →
                  </a>
                </BentoCard>
                <BentoCard className="col-span-6" spotlight={false}>
                  <span className="label mb-2 block">Support</span>
                  <a 
                    href="mailto:dev@looplocal.io"
                    className="text-accent font-mono text-sm hover:underline"
                  >
                    dev@looplocal.io →
                  </a>
                </BentoCard>
              </BentoGrid>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <h2 className="heading-lg mb-4">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ children, language = "typescript" }: { children: string; language?: string }) {
  return (
    <div className="relative">
      <span className="absolute top-3 right-3 label text-[9px]">{language}</span>
      <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto">
        <code className="text-sm font-mono text-text-secondary">{children}</code>
      </pre>
    </div>
  );
}
