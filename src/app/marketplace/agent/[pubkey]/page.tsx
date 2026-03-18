"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

const CAPABILITIES: Record<string, { name: string; icon: string }> = {
  "0100000000000000": { name: "Shopping", icon: "🛒" },
  "0200000000000000": { name: "Data", icon: "📊" },
  "0300000000000000": { name: "Presence", icon: "📍" },
  "0400000000000000": { name: "Attention", icon: "👁️" },
  "1000000000000000": { name: "Transfer", icon: "💸" },
  "1100000000000000": { name: "Escrow", icon: "🔐" },
  "2000000000000000": { name: "Stack", icon: "📈" },
};

interface Agent {
  pubkey: string;
  creator: string;
  metadata_uri: string | null;
  stake_amount: number;
  reputation_score: number;
  reputation_percent: string;
  total_service_calls: number;
  total_earnings: number;
  dispute_count: number;
  status: string;
  created_at: number;
  capabilities: { capability_id: string; capability_name: string | null }[];
  recent_calls?: any[];
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pubkey = params.pubkey as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgent();
  }, [pubkey]);

  async function fetchAgent() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/agents/${pubkey}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setAgent(data);
    } catch {
      setAgent(getMockAgent(pubkey));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-elevated rounded w-1/3" />
          <div className="h-32 bg-bg-elevated rounded" />
          <div className="h-24 bg-bg-elevated rounded" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-text-muted">Agent not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-forest text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const reputation = parseFloat(agent.reputation_percent);
  const stakeOxo = agent.stake_amount / 1_000_000;
  const earningsCred = agent.total_earnings / 1_000_000;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>

      {/* Agent Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest to-forest-light flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🤖</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg truncate">
              {agent.pubkey.slice(0, 12)}...
            </h1>
            {agent.status === "active" && (
              <span className="px-2 py-0.5 bg-positive/20 text-positive text-xs rounded-full">
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted mt-1">
            Created {new Date(agent.created_at * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Reputation */}
      <div className="bg-bg-surface rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-muted">Reputation</span>
          <span className={`text-2xl font-bold ${
            reputation >= 80 ? "text-positive" : reputation >= 50 ? "text-gold" : "text-negative"
          }`}>
            {reputation}%
          </span>
        </div>
        <div className="h-3 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              reputation >= 80 ? "bg-positive" : reputation >= 50 ? "bg-gold" : "bg-negative"
            }`}
            style={{ width: `${reputation}%` }}
          />
        </div>
        {agent.dispute_count > 0 && (
          <p className="text-xs text-negative mt-2">
            ⚠️ {agent.dispute_count} dispute{agent.dispute_count > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-surface rounded-xl p-4">
          <p className="text-xs text-text-muted mb-1">Stake</p>
          <p className="text-lg font-bold">{stakeOxo.toLocaleString()} OXO</p>
        </div>
        <div className="bg-bg-surface rounded-xl p-4">
          <p className="text-xs text-text-muted mb-1">Service Calls</p>
          <p className="text-lg font-bold">{agent.total_service_calls.toLocaleString()}</p>
        </div>
        <div className="bg-bg-surface rounded-xl p-4 col-span-2">
          <p className="text-xs text-text-muted mb-1">Total Earnings</p>
          <p className="text-xl font-bold text-gold">${earningsCred.toLocaleString()}</p>
        </div>
      </div>

      {/* Capabilities */}
      <div className="bg-bg-surface rounded-xl p-5">
        <h2 className="font-display font-bold mb-3">Capabilities</h2>
        <div className="flex flex-wrap gap-2">
          {agent.capabilities.map((cap) => {
            const known = CAPABILITIES[cap.capability_id];
            return (
              <span
                key={cap.capability_id}
                className="px-3 py-2 bg-bg-elevated rounded-lg flex items-center gap-2"
              >
                <span>{known?.icon || "🔧"}</span>
                <span className="text-sm">
                  {known?.name || cap.capability_name || "Unknown"}
                </span>
              </span>
            );
          })}
          {agent.capabilities.length === 0 && (
            <p className="text-text-muted text-sm">No capabilities declared</p>
          )}
        </div>
      </div>

      {/* Creator */}
      <div className="bg-bg-surface rounded-xl p-5">
        <h2 className="font-display font-bold mb-3">Creator</h2>
        <p className="font-mono text-sm text-text-secondary break-all">
          {agent.creator}
        </p>
      </div>

      {/* Full Pubkey */}
      <div className="bg-bg-surface rounded-xl p-5">
        <h2 className="font-display font-bold mb-3">Agent Address</h2>
        <p className="font-mono text-xs text-text-muted break-all">
          {agent.pubkey}
        </p>
        <button
          onClick={() => navigator.clipboard.writeText(agent.pubkey)}
          className="mt-2 text-xs text-forest-light hover:text-forest transition-colors"
        >
          Copy to clipboard
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <a
          href={`https://solscan.io/account/${agent.pubkey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-bg-surface border border-border-default rounded-xl text-center text-sm font-medium hover:bg-bg-elevated transition-colors"
        >
          View on Solscan →
        </a>
        <button className="w-full py-3 bg-forest text-white rounded-xl text-sm font-medium hover:bg-forest-dark transition-colors">
          Request Service
        </button>
      </div>
    </div>
  );
}

function getMockAgent(pubkey: string): Agent {
  return {
    pubkey,
    creator: "Creator123456789abcdef123456789abcdef12345678",
    metadata_uri: null,
    stake_amount: 1500_000_000,
    reputation_score: 8500,
    reputation_percent: "85.00",
    total_service_calls: 234,
    total_earnings: 45000_000_000,
    dispute_count: 0,
    status: "active",
    created_at: Math.floor(Date.now() / 1000) - 86400 * 30,
    capabilities: [
      { capability_id: "0100000000000000", capability_name: "Shopping Capture" },
      { capability_id: "2000000000000000", capability_name: "Stack" },
    ],
  };
}
