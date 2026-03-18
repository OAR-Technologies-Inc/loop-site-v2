"use client";

import { useState } from "react";
import { C2Nav, BentoCard, BentoGrid } from "@/components/ui";
import { Terminal, FileCode, Database, Coins, TrendingUp, Bot, Network, Copy, Check } from "lucide-react";

const SECTIONS = [
  { id: "installation", label: "Installation" },
  { id: "quickstart", label: "Quick Start" },
  { id: "configuration", label: "Configuration" },
  { id: "vaults", label: "Vaults" },
  { id: "cred", label: "Cred Token" },
  { id: "stacking", label: "Stacking" },
  { id: "agents", label: "Service Agents" },
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
              <div className="flex items-center gap-2 mb-4">
                <FileCode size={14} strokeWidth={1.2} className="text-zinc-500" />
                <span className="label">Documentation</span>
              </div>
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`block px-3 py-2 text-sm font-mono transition-colors rounded ${
                    activeSection === section.id
                      ? "text-accent bg-white/5 border-l-2 border-accent"
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
            <Section id="installation" title="Installation" icon={Terminal}>
              <CodeBlock language="bash">
{`npm install @loop-protocol/sdk
# or
yarn add @loop-protocol/sdk
# or
pnpm add @loop-protocol/sdk`}
              </CodeBlock>
            </Section>

            {/* Quick Start */}
            <Section id="quickstart" title="Quick Start" icon={Terminal}>
              <p className="text-text-secondary mb-4">
                Connect, wrap USDC to Cred, and start stacking for yield.
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
            <Section id="configuration" title="Configuration" icon={Network}>
              <BentoGrid className="gap-4 mb-6">
                <BentoCard className="col-span-6" spotlight={false}>
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-3">[MAINNET]</span>
                  <CodeBlock language="typescript" compact>
{`const loop = new Loop({
  connection,
  wallet,
  cluster: "mainnet-beta",
});`}
                  </CodeBlock>
                </BentoCard>
                <BentoCard className="col-span-6" spotlight={false}>
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-3">[DEVNET]</span>
                  <CodeBlock language="typescript" compact>
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
            <Section id="vaults" title="Vaults" icon={Database}>
              <p className="text-text-secondary mb-4">
                Core primitive for value custody. Each user has a personal vault 
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
    requireUserAbove: 500_000_000,
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
            <Section id="cred" title="Cred Token" icon={Coins}>
              <p className="text-text-secondary mb-4">
                Protocol&apos;s stable unit of account, backed 1:1 by USDC.
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
            <Section id="stacking" title="Stacking" icon={TrendingUp}>
              <p className="text-text-secondary mb-4">
                Stack Cred to earn yield from protocol fees. Longer lock periods = higher APY.
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
            <Section id="agents" title="Service Agents" icon={Bot}>
              <p className="text-text-secondary mb-4">
                Register agents with bonding curve tokens.
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
});

// Buy agent tokens (bonding curve)
const buyTx = await loop.agents.buyTokens({
  agent: agentPublicKey,
  amount: 100,
  maxPrice: 1_500_000, // Slippage protection
});`}
              </CodeBlock>
            </Section>

            {/* Program IDs */}
            <Section id="program-ids" title="Program IDs" icon={Network}>
              <p className="text-text-secondary mb-4">
                Deployed program addresses on Solana mainnet.
              </p>

              <BentoCard spotlight={false}>
                <div className="bg-black/40 border border-white/5 rounded-lg overflow-hidden">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left p-4 text-zinc-500 uppercase">Program</th>
                        <th className="text-left p-4 text-zinc-500 uppercase">Address</th>
                      </tr>
                    </thead>
                    <tbody className="text-zinc-400">
                      <tr className="border-b border-white/5">
                        <td className="p-4 text-accent">CRED</td>
                        <td className="p-4">HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="p-4 text-accent">VAULT</td>
                        <td className="p-4">J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="p-4 text-accent">SHOPPING</td>
                        <td className="p-4">HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-accent">Cred Mint</td>
                        <td className="p-4">9GQMCAK3MpZF1hEbwqA9d4mRGtippGV9hyr8fxmz6eA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </BentoCard>
            </Section>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-white/5">
              <BentoGrid className="gap-4">
                <BentoCard className="col-span-6" spotlight={false}>
                  <div className="flex items-center gap-2 mb-2">
                    <Network size={14} strokeWidth={1.2} className="text-zinc-500" />
                    <span className="label">Source</span>
                  </div>
                  <a 
                    href="https://github.com/OAR-Technologies-Inc/loop-protocol" 
                    target="_blank"
                    className="text-accent font-mono text-sm hover:underline"
                  >
                    github.com/OAR-Technologies-Inc/loop-protocol →
                  </a>
                </BentoCard>
                <BentoCard className="col-span-6" spotlight={false}>
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal size={14} strokeWidth={1.2} className="text-zinc-500" />
                    <span className="label">Support</span>
                  </div>
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

function Section({ 
  id, 
  title, 
  icon: Icon, 
  children 
}: { 
  id: string; 
  title: string; 
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} strokeWidth={1.2} className="text-zinc-500" />
        <h2 className="heading-lg">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function CodeBlock({ 
  children, 
  language = "typescript",
  compact = false,
}: { 
  children: string; 
  language?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className={`
        bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-lg overflow-hidden
        ${compact ? '' : 'mb-4'}
      `}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <span className="text-[8px] font-mono text-zinc-500 uppercase">{language}</span>
          <button
            onClick={handleCopy}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {copied ? (
              <Check size={14} strokeWidth={1.5} className="text-accent" />
            ) : (
              <Copy size={14} strokeWidth={1.5} />
            )}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm font-mono text-zinc-400">{children}</code>
        </pre>
      </div>
    </div>
  );
}
