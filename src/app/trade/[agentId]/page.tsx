"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// API configuration
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
  const router = useRouter();
  const agentId = params.agentId as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [curve, setCurve] = useState<BondingCurve | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const [estimatedOxo, setEstimatedOxo] = useState(0);

  useEffect(() => {
    fetchAgent();
    fetchBondingCurve();
  }, [agentId]);

  useEffect(() => {
    // Recalculate estimates when amount changes
    if (curve && amount) {
      const amountNum = parseFloat(amount);
      if (mode === "buy") {
        // Estimate tokens received for OXO spent
        setEstimatedTokens(calculateTokensForOxo(amountNum, curve));
      } else {
        // Estimate OXO received for tokens sold
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
        // Try to find in list
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
      // Use mock curve
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
    const k = curve.currentPrice / (curve.supply * curve.supply);
    const newReserve = curve.oxoReserve + oxoAmount;
    const newSupply = Math.sqrt(newReserve / k);
    return newSupply - curve.supply;
  }

  function calculateOxoForTokens(tokenAmount: number, curve: BondingCurve): number {
    const k = curve.currentPrice / (curve.supply * curve.supply);
    const newSupply = curve.supply - tokenAmount;
    const newReserve = k * newSupply * newSupply;
    return curve.oxoReserve - newReserve;
  }

  async function executeTrade() {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    // TODO: Connect wallet and execute real transaction
    alert(
      mode === "buy"
        ? `Would buy ~${estimatedTokens.toFixed(2)} tokens for ${amount} OXO`
        : `Would sell ${amount} tokens for ~${estimatedOxo.toFixed(2)} OXO`
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold">Agent not found</h1>
        <Link href="/marketplace" className="text-emerald-400 hover:underline mt-4 block">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/marketplace" className="text-zinc-400 hover:text-white">
            ← Back
          </Link>
          <h1 className="text-xl font-bold flex-1">Trade Agent Token</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Agent Info */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold font-mono">
                {agent.pubkey.slice(0, 12)}...
              </h2>
              <p className="text-zinc-400 text-sm">
                {agent.capabilities.map((c) => c.capability_name || c.capability_id).join(", ")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-semibold">{agent.reputation_percent}%</p>
              <p className="text-zinc-500 text-sm">Reputation</p>
            </div>
          </div>
        </div>

        {/* Bonding Curve Stats */}
        {curve && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <p className="text-zinc-500 text-sm">Price</p>
              <p className="text-xl font-bold">{curve.currentPrice.toFixed(4)} OXO</p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <p className="text-zinc-500 text-sm">Market Cap</p>
              <p className="text-xl font-bold">{curve.marketCap.toLocaleString()} OXO</p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <p className="text-zinc-500 text-sm">Supply</p>
              <p className="text-xl font-bold">{curve.supply.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <p className="text-zinc-500 text-sm">Reserve</p>
              <p className="text-xl font-bold">{curve.oxoReserve.toLocaleString()} OXO</p>
            </div>
          </div>
        )}

        {/* Trading Interface */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-6">
          {/* Buy/Sell Toggle */}
          <div className="flex bg-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setMode("buy")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                mode === "buy"
                  ? "bg-emerald-500 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setMode("sell")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                mode === "sell"
                  ? "bg-red-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Sell
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">
              {mode === "buy" ? "OXO to Spend" : "Tokens to Sell"}
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-xl font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                {mode === "buy" ? "OXO" : "TOKENS"}
              </span>
            </div>
          </div>

          {/* Estimate */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-zinc-800 rounded-xl p-4">
              <p className="text-zinc-400 text-sm">You will receive (estimated)</p>
              <p className="text-2xl font-bold font-mono">
                {mode === "buy"
                  ? `${estimatedTokens.toFixed(4)} TOKENS`
                  : `${estimatedOxo.toFixed(4)} OXO`}
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                Includes 5% protocol fee
              </p>
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={executeTrade}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              mode === "buy"
                ? "bg-emerald-500 hover:bg-emerald-400 text-black disabled:bg-zinc-700 disabled:text-zinc-500"
                : "bg-red-500 hover:bg-red-400 text-white disabled:bg-zinc-700 disabled:text-zinc-500"
            }`}
          >
            {mode === "buy" ? "Buy on Bonding Curve" : "Sell Tokens"}
          </button>

          <p className="text-center text-zinc-500 text-sm">
            {curve?.graduated
              ? "This token has graduated to a DEX liquidity pool"
              : "Token graduates at 50,000 OXO market cap"}
          </p>
        </div>

        {/* Agent Stats */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-lg font-semibold mb-4">Agent Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Service Calls</span>
              <span className="font-mono">{agent.total_service_calls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Earnings</span>
              <span className="font-mono text-emerald-400">
                {(agent.total_earnings / 1_000_000).toFixed(2)} Cred
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Staked</span>
              <span className="font-mono">
                {(agent.stake_amount / 1_000_000).toFixed(0)} OXO
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Status</span>
              <span className="text-emerald-400 capitalize">{agent.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
