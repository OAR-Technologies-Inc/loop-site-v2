"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { C2Nav, BentoCard, ShimmerButton, StatusIndicator } from "@/components/ui";

// Import LoopSDK - uncomment when SDK is published to npm
// import { LoopSDK } from "@loop-protocol/sdk";

const CAPABILITIES = [
  { id: "shopping_capture", name: "Shopping Capture", icon: "🛒", desc: "Retail purchases" },
  { id: "data_licensing", name: "Data Licensing", icon: "📊", desc: "User data monetization" },
  { id: "gpu_rental", name: "GPU Rental", icon: "🖥️", desc: "Compute resources" },
  { id: "liquidity_provision", name: "Liquidity", icon: "💧", desc: "DeFi yields" },
  { id: "reclaim_proofs", name: "zkTLS Proofs", icon: "🔐", desc: "Web attestations" },
  { id: "a2a_negotiation", name: "A2A Commerce", icon: "🤝", desc: "Agent-to-agent" },
];

export default function LaunchAgentPage() {
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction } = useWallet();
  
  const [step, setStep] = useState<"connect" | "configure" | "launch" | "success">("connect");
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [feePercentage, setFeePercentage] = useState(5);
  const [launching, setLaunching] = useState(false);
  const [agentPubkey, setAgentPubkey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);

  // Fetch SOL balance when connected
  useEffect(() => {
    async function fetchBalance() {
      if (publicKey && connection) {
        try {
          const balance = await connection.getBalance(publicKey);
          setSolBalance(balance / LAMPORTS_PER_SOL);
        } catch (e) {
          console.error("Failed to fetch balance:", e);
        }
      }
    }
    fetchBalance();
  }, [publicKey, connection]);

  // Auto-advance to configure when wallet connects
  useEffect(() => {
    if (connected && step === "connect") {
      setStep("configure");
    }
  }, [connected, step]);

  const toggleCapability = (id: string) => {
    setSelectedCapabilities(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleLaunch = async () => {
    if (!agentName || selectedCapabilities.length === 0) return;
    if (!publicKey || !signTransaction) {
      setError("Please connect your wallet first");
      return;
    }
    
    setLaunching(true);
    setError(null);
    
    try {
      // TODO: Uncomment when SDK is npm-linked
      // const sdk = new LoopSDK({ connection });
      // const tx = await sdk.registerServiceAgent({
      //   name: agentName,
      //   capabilities: selectedCapabilities.map(id => CAPABILITY_MAP[id] || id),
      //   feePercentage,
      // });
      // const preparedTx = await sdk.prepareTransaction(tx, publicKey);
      // const signedTx = await signTransaction(preparedTx);
      // const signature = await sdk.sendRaw(signedTx);
      
      // Simulate for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAgentPubkey("Agent" + publicKey.toString().slice(0, 8) + Math.random().toString(36).slice(2, 6));
      setStep("success");
      
    } catch (err) {
      console.error("Launch failed:", err);
      setError(err instanceof Error ? err.message : "Failed to launch agent");
    } finally {
      setLaunching(false);
    }
  };

  const canProceed = agentName.length >= 3 && selectedCapabilities.length > 0;

  return (
    <div className="min-h-screen">
      <C2Nav />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <span className="label label-accent mb-4 block">Agent Deployment</span>
            <h1 className="heading-lg mb-4">Launch Service Agent</h1>
            <p className="text-text-secondary">
              Deploy an autonomous agent with bonding curve token economics.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8 font-mono text-xs">
            {["connect", "configure", "launch"].map((s, i) => {
              const isActive = step === s;
              const isComplete = ["configure", "launch", "success"].indexOf(step) > i;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`
                    w-7 h-7 rounded flex items-center justify-center
                    ${isActive ? 'bg-accent text-base' : isComplete ? 'bg-accent/20 text-accent' : 'bg-white/5 text-text-muted'}
                  `}>
                    {isComplete ? '✓' : i + 1}
                  </div>
                  <span className={`hidden sm:block uppercase tracking-wider ${isActive ? 'text-accent' : 'text-text-muted'}`}>
                    {s}
                  </span>
                  {i < 2 && <div className="w-8 h-px bg-white/10 mx-2" />}
                </div>
              );
            })}
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-negative/10 border border-negative/30 rounded-lg text-negative text-sm font-mono"
            >
              {error}
            </motion.div>
          )}

          {/* Step 1: Connect Wallet */}
          {step === "connect" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BentoCard className="text-center py-16">
                <div className="w-16 h-16 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🔗</span>
                </div>
                <h2 className="heading-md mb-4">Connect Wallet</h2>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                  Connect your Solana wallet to deploy agents and manage bonding curve tokens.
                </p>
                <WalletMultiButton className="!bg-accent hover:!bg-accent/80 !text-base !font-mono !text-xs !uppercase !tracking-wider !rounded-lg !h-12 !px-8" />
              </BentoCard>
            </motion.div>
          )}

          {/* Step 2: Configure Agent */}
          {step === "configure" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Wallet Status */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <StatusIndicator status="online" label="Connected" />
                  <span className="font-mono text-sm text-text-secondary">
                    {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                  </span>
                </div>
                <span className="font-mono text-sm text-accent">
                  {solBalance !== null ? `${solBalance.toFixed(2)} SOL` : "..."}
                </span>
              </div>

              {/* Agent Name */}
              <BentoCard>
                <span className="label mb-3 block">Agent Identity</span>
                <input
                  type="text"
                  placeholder="Agent name (e.g., ShopCapture Pro)"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono focus:border-accent focus:outline-none"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  rows={2}
                  className="w-full mt-3 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono focus:border-accent focus:outline-none resize-none"
                />
              </BentoCard>

              {/* Capabilities */}
              <BentoCard>
                <span className="label mb-3 block">Capture Modules</span>
                <p className="text-text-muted text-sm mb-4">Select value capture capabilities</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CAPABILITIES.map((cap) => {
                    const selected = selectedCapabilities.includes(cap.id);
                    return (
                      <button
                        key={cap.id}
                        onClick={() => toggleCapability(cap.id)}
                        className={`
                          p-4 rounded-lg border text-left transition-all
                          ${selected 
                            ? 'bg-accent/10 border-accent/50' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        <div className="text-xl mb-2">{cap.icon}</div>
                        <div className="text-sm font-medium">{cap.name}</div>
                        <div className="text-xs text-text-muted">{cap.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </BentoCard>

              {/* Fee Configuration */}
              <BentoCard>
                <span className="label mb-3 block">Economics</span>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Protocol Fee</p>
                    <p className="text-text-muted text-xs">Percentage of captured value</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={feePercentage}
                      onChange={(e) => setFeePercentage(Number(e.target.value))}
                      className="w-24 accent-accent"
                    />
                    <span className="font-mono text-accent w-12 text-right">{feePercentage}%</span>
                  </div>
                </div>
              </BentoCard>

              {/* Actions */}
              <div className="flex gap-4">
                <ShimmerButton
                  onClick={() => setStep("launch")}
                  disabled={!canProceed}
                  size="lg"
                  className="flex-1"
                >
                  Continue to Launch
                </ShimmerButton>
              </div>
            </motion.div>
          )}

          {/* Step 3: Launch Confirmation */}
          {step === "launch" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BentoCard>
                <span className="label label-accent mb-6 block">Review & Deploy</span>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-text-muted">Agent Name</span>
                    <span className="font-mono">{agentName}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-text-muted">Capabilities</span>
                    <span className="font-mono">{selectedCapabilities.length} modules</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-text-muted">Fee</span>
                    <span className="font-mono text-accent">{feePercentage}%</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-text-muted">Network Fee</span>
                    <span className="font-mono">~0.01 SOL</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-text-muted">Deployer</span>
                    <span className="font-mono text-xs">
                      {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <ShimmerButton
                    variant="ghost"
                    onClick={() => setStep("configure")}
                    className="flex-1"
                  >
                    Back
                  </ShimmerButton>
                  <ShimmerButton
                    onClick={handleLaunch}
                    disabled={launching}
                    className="flex-1"
                  >
                    {launching ? "Deploying..." : "Deploy Agent"}
                  </ShimmerButton>
                </div>
              </BentoCard>
            </motion.div>
          )}

          {/* Success */}
          {step === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <BentoCard className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">✓</span>
                </div>
                <h2 className="heading-md mb-4 text-accent">Agent Deployed</h2>
                <p className="text-text-secondary mb-6">
                  {agentName} is now live on Solana mainnet.
                </p>
                
                {agentPubkey && (
                  <div className="bg-black/30 rounded-lg p-4 mb-8 max-w-md mx-auto">
                    <span className="label block mb-2">Agent Address</span>
                    <code className="text-xs font-mono text-accent break-all">{agentPubkey}</code>
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <Link href="/marketplace">
                    <ShimmerButton variant="ghost">View Marketplace</ShimmerButton>
                  </Link>
                  <Link href={`/trade/${agentPubkey}`}>
                    <ShimmerButton>Trade Token</ShimmerButton>
                  </Link>
                </div>
              </BentoCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
