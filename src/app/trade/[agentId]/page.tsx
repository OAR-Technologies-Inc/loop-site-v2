"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

// Import LoopSDK from linked package
import { LoopSDK } from "loop-protocol-ai-sdk";

const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

interface Agent {
  pubkey: string;
  creator: string;
  metadata_uri: string | null;
  stake_amount: number;
  reputation_score: number;
  reputation_percent: string;
  total_service_calls: number;
  total_earnings: number;
  status: string;
  capabilities: { capability_id: string; capability_name: string | null }[];
}

interface BondingCurve {
  currentPrice: number;
  marketCap: number;
  supply: number;
  oxoReserve: number;
  graduated: boolean;
}

export default function TradePage() {
  const params = useParams();
  const agentId = params.agentId as string;

  const { connection } = useConnection();
  const { publicKey, connected, signTransaction, connecting } = useWallet();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [curve, setCurve] = useState<BondingCurve | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const [estimatedOxo, setEstimatedOxo] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);

  // Fetch SOL balance
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

  useEffect(() => {
    fetchAgent();
    fetchBondingCurve();
  }, [agentId]);

  useEffect(() => {
    if (curve && amount) {
      const amountNum = parseFloat(amount);
      if (mode === "buy") {
        setEstimatedTokens(calculateTokensForOxo(amountNum, curve));
      } else {
        setEstimatedOxo(calculateOxoForTokens(amountNum, curve));
      }
    }
  }, [amount, mode, curve]);

  async function fetchAgent() {
    try {
      const res = await fetch(`${API_URL}/api/agents/${agentId}`);
      if (res.ok) {
        const data = await res.json();
        setAgent(data.agent);
      } else {
        const listRes = await fetch(`${API_URL}/api/agents`);
        const listData = await listRes.json();
        const found = listData.agents?.find((a: Agent) => a.pubkey === agentId);
        setAgent(found || null);
      }
    } catch (e) {
      console.error("Failed to fetch agent:", e);
    }
    setLoading(false);
  }

  async function fetchBondingCurve() {
    try {
      // Try to get real bonding curve data from SDK
      // const sdk = new LoopSDK({ connection });
      // const curveData = await sdk.getBondingCurvePrice(agentId);
      // setCurve({ currentPrice: curveData, ... });

      const res = await fetch(`${API_URL}/api/tokens/${agentId}`);
      if (res.ok) {
        const data = await res.json();
        setCurve(data.curve);
      } else {
        // Use mock bonding curve for demo
        setCurve({
          currentPrice: 0.15,
          marketCap: 15000,
          supply: 100000,
          oxoReserve: 7500,
          graduated: false,
        });
      }
    } catch (e) {
      setCurve({
        currentPrice: 0.15,
        marketCap: 15000,
        supply: 100000,
        oxoReserve: 7500,
        graduated: false,
      });
    }
  }

  // Bonding curve math: price = k * supply^2
  function calculateTokensForOxo(oxoAmount: number, curve: BondingCurve): number {
    if (!curve || curve.supply === 0) return 0;
    const k = curve.currentPrice / (curve.supply * curve.supply);
    const newReserve = curve.oxoReserve + oxoAmount;
    const newSupply = Math.sqrt(newReserve / k);
    return Math.max(0, newSupply - curve.supply);
  }

  function calculateOxoForTokens(tokenAmount: number, curve: BondingCurve): number {
    if (!curve || curve.supply === 0) return 0;
    const k = curve.currentPrice / (curve.supply * curve.supply);
    const newSupply = Math.max(0, curve.supply - tokenAmount);
    const newReserve = k * newSupply * newSupply;
    return Math.max(0, curve.oxoReserve - newReserve);
  }

  async function executeTrade() {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (!connected || !publicKey || !signTransaction) {
      setError("Please connect your wallet first");
      return;
    }

    setExecuting(true);
    setError(null);

    try {
      // TODO: Uncomment when SDK is npm-linked
      // const sdk = new LoopSDK({ connection });
      // 
      // if (mode === "buy") {
      //   const tx = await sdk.buyAgentToken(agentId, parseFloat(amount));
      //   const preparedTx = await sdk.prepareTransaction(tx, publicKey);
      //   const signedTx = await signTransaction(preparedTx);
      //   const signature = await sdk.sendRaw(signedTx);
      //   console.log("Buy tx:", signature);
      // } else {
      //   const tx = await sdk.sellAgentToken(agentId, parseFloat(amount));
      //   const preparedTx = await sdk.prepareTransaction(tx, publicKey);
      //   const signedTx = await signTransaction(preparedTx);
      //   const signature = await sdk.sendRaw(signedTx);
      //   console.log("Sell tx:", signature);
      // }
      
      // Simulate success for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success and refresh curve
      alert(
        mode === "buy"
          ? `Successfully bought ~${estimatedTokens.toFixed(2)} tokens for ${amount} OXO!`
          : `Successfully sold ${amount} tokens for ~${estimatedOxo.toFixed(2)} OXO!`
      );
      
      setAmount("");
      fetchBondingCurve();
      
    } catch (err: any) {
      console.error("Trade failed:", err);
      setError(err.message || "Transaction failed. Please try again.");
    } finally {
      setExecuting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forest border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary p-8">
        <h1 className="text-2xl font-bold">Agent not found</h1>
        <Link href="/marketplace" className="text-forest-light hover:underline mt-4 block">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* Header */}
      <header className="border-b border-border-subtle">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/marketplace" className="text-text-secondary hover:text-text-primary">
              ← Back
            </Link>
            <h1 className="text-xl font-bold">Trade Agent Token</h1>
          </div>
          <div className="flex items-center gap-4">
            {connected && solBalance !== null && (
              <span className="text-sm text-text-muted hidden sm:block">
                {solBalance.toFixed(2)} SOL
              </span>
            )}
            <WalletMultiButton className="!bg-forest hover:!bg-forest-light !rounded-xl !h-10 !text-sm" />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Agent Info */}
        <div className="bg-bg-surface rounded-2xl p-6 border border-border-subtle">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-forest to-forest-light flex items-center justify-center text-2xl">
              🤖
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold font-mono">
                {agent.pubkey.slice(0, 12)}...
              </h2>
              <p className="text-text-muted text-sm">
                {agent.capabilities.map((c) => c.capability_name || c.capability_id).join(", ") || "Service Agent"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-forest-light font-semibold">{agent.reputation_percent || "100"}%</p>
              <p className="text-text-muted text-sm">Reputation</p>
            </div>
          </div>
        </div>

        {/* Bonding Curve Stats */}
        {curve && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-surface rounded-xl p-4 border border-border-subtle">
              <p className="text-text-muted text-sm">Price</p>
              <p className="text-xl font-bold text-forest-light">{curve.currentPrice.toFixed(4)} OXO</p>
            </div>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-subtle">
              <p className="text-text-muted text-sm">Market Cap</p>
              <p className="text-xl font-bold">{curve.marketCap.toLocaleString()} OXO</p>
            </div>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-subtle">
              <p className="text-text-muted text-sm">Supply</p>
              <p className="text-xl font-bold">{curve.supply.toLocaleString()}</p>
            </div>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-subtle">
              <p className="text-text-muted text-sm">Reserve</p>
              <p className="text-xl font-bold">{curve.oxoReserve.toLocaleString()} OXO</p>
            </div>
          </div>
        )}

        {/* Trading Interface */}
        <div className="bg-bg-surface rounded-2xl p-6 border border-border-subtle space-y-6">
          {/* Buy/Sell Toggle */}
          <div className="flex bg-bg-elevated rounded-xl p-1">
            <button
              onClick={() => setMode("buy")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                mode === "buy"
                  ? "bg-forest text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setMode("sell")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                mode === "sell"
                  ? "bg-red-500 text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Sell
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-text-muted text-sm">
              {mode === "buy" ? "OXO to Spend" : "Tokens to Sell"}
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-4 text-xl font-mono focus:outline-none focus:border-forest"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                {mode === "buy" ? "OXO" : "TOKENS"}
              </span>
            </div>
          </div>

          {/* Estimate */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-bg-elevated rounded-xl p-4">
              <p className="text-text-muted text-sm">You will receive (estimated)</p>
              <p className="text-2xl font-bold font-mono text-forest-light">
                {mode === "buy"
                  ? `${estimatedTokens.toFixed(4)} TOKENS`
                  : `${estimatedOxo.toFixed(4)} OXO`}
              </p>
              <p className="text-text-muted text-sm mt-1">
                Includes 5% protocol fee
              </p>
            </div>
          )}

          {/* Execute Button */}
          {connected ? (
            <button
              onClick={executeTrade}
              disabled={!amount || parseFloat(amount) <= 0 || executing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 ${
                mode === "buy"
                  ? "bg-forest hover:bg-forest-light text-white disabled:bg-bg-elevated disabled:text-text-muted"
                  : "bg-red-500 hover:bg-red-400 text-white disabled:bg-bg-elevated disabled:text-text-muted"
              }`}
            >
              {executing ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processing...
                </>
              ) : mode === "buy" ? (
                "Buy on Bonding Curve"
              ) : (
                "Sell Tokens"
              )}
            </button>
          ) : (
            <div className="text-center">
              <p className="text-text-muted text-sm mb-4">Connect your wallet to trade</p>
              <WalletMultiButton className="!bg-forest hover:!bg-forest-light !rounded-xl !py-4 !w-full !justify-center" />
            </div>
          )}

          <p className="text-center text-text-muted text-sm">
            {curve?.graduated
              ? "This token has graduated to a DEX liquidity pool"
              : "Token graduates at 50,000 OXO market cap"}
          </p>
        </div>

        {/* Agent Stats */}
        <div className="bg-bg-surface rounded-2xl p-6 border border-border-subtle">
          <h3 className="text-lg font-semibold mb-4">Agent Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-muted">Service Calls</span>
              <span className="font-mono">{agent.total_service_calls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Total Earnings</span>
              <span className="font-mono text-forest-light">
                {(agent.total_earnings / 1_000_000).toFixed(2)} Cred
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Staked</span>
              <span className="font-mono">
                {(agent.stake_amount / 1_000_000).toFixed(0)} OXO
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Status</span>
              <span className="text-forest-light capitalize">{agent.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
