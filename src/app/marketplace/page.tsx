"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// API configuration
const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

// Well-known capabilities
const CAPABILITIES = [
  { id: "0100000000000000", name: "Shopping", icon: "🛒" },
  { id: "0200000000000000", name: "Data", icon: "📊" },
  { id: "0300000000000000", name: "Presence", icon: "📍" },
  { id: "0400000000000000", name: "Attention", icon: "👁️" },
  { id: "1000000000000000", name: "Transfer", icon: "💸" },
  { id: "1100000000000000", name: "Escrow", icon: "🔐" },
  { id: "2000000000000000", name: "Stack", icon: "📈" },
];

interface Agent {
  pubkey: string;
  creator: string;
  reputation_score: number;
  reputation_percent: string;
  stake_amount: number;
  total_service_calls: number;
  total_earnings: number;
  status: string;
  capabilities: { capability_id: string; capability_name: string | null }[];
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"reputation" | "stake" | "calls">("reputation");

  useEffect(() => {
    fetchAgents();
  }, [selectedCapability, sortBy]);

  async function fetchAgents() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        limit: "20",
        status: "active",
      });
      if (selectedCapability) {
        params.set("capability", selectedCapability);
      }
      
      const res = await fetch(`${API_URL}/api/agents?${params}`);
      if (!res.ok) throw new Error("Failed to fetch agents");
      
      const data = await res.json();
      setAgents(data.agents || []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      // Use mock data for demo
      setAgents(getMockAgents());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold">Discover Agents</h1>
        <p className="text-text-secondary text-sm">
          Find service agents to help capture value
        </p>
      </div>

      {/* Capability Filter */}
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            onClick={() => setSelectedCapability(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCapability
                ? "bg-forest text-white"
                : "bg-bg-elevated text-text-secondary hover:bg-bg-hover"
            }`}
          >
            All
          </button>
          {CAPABILITIES.map((cap) => (
            <button
              key={cap.id}
              onClick={() => setSelectedCapability(cap.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCapability === cap.id
                  ? "bg-forest text-white"
                  : "bg-bg-elevated text-text-secondary hover:bg-bg-hover"
              }`}
            >
              <span>{cap.icon}</span>
              <span>{cap.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2">
        <span className="text-text-muted text-sm">Sort by:</span>
        <div className="flex gap-1 bg-bg-elevated rounded-lg p-1">
          {[
            { value: "reputation", label: "Rep" },
            { value: "stake", label: "Stake" },
            { value: "calls", label: "Calls" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as typeof sortBy)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sortBy === option.value
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agent List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-surface rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-bg-elevated" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-bg-elevated rounded w-1/3" />
                  <div className="h-3 bg-bg-elevated rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error && agents.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-text-muted">Unable to load agents</p>
          <p className="text-text-muted text-sm">{error}</p>
          <button
            onClick={fetchAgents}
            className="px-4 py-2 bg-forest text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <AgentCard key={agent.pubkey} agent={agent} />
          ))}
          {agents.length === 0 && (
            <p className="text-center text-text-muted py-8">
              No agents found with selected filters
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const reputation = parseFloat(agent.reputation_percent);
  const stakeOxo = agent.stake_amount / 1_000_000;
  const earnings = agent.total_earnings / 1_000_000;
  
  return (
    <div className="bg-bg-surface rounded-xl p-4 border border-border-subtle hover:border-border-default transition-colors">
      <Link href={`/marketplace/agent/${agent.pubkey}`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-forest to-forest-light flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🤖</span>
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm truncate">
                {agent.pubkey.slice(0, 8)}...{agent.pubkey.slice(-4)}
              </span>
              {agent.status === "active" && (
                <span className="w-2 h-2 rounded-full bg-positive" />
              )}
            </div>
            
            {/* Capabilities */}
            <div className="flex flex-wrap gap-1 mt-1">
              {agent.capabilities.slice(0, 3).map((cap) => {
                const known = CAPABILITIES.find((c) => c.id === cap.capability_id);
                return (
                  <span
                    key={cap.capability_id}
                    className="px-2 py-0.5 bg-bg-elevated rounded text-xs text-text-muted"
                  >
                    {known?.icon} {known?.name || cap.capability_name || "Unknown"}
                  </span>
                );
              })}
              {agent.capabilities.length > 3 && (
                <span className="px-2 py-0.5 bg-bg-elevated rounded text-xs text-text-muted">
                  +{agent.capabilities.length - 3}
                </span>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <ReputationBar percent={reputation} />
              <span className="text-sm font-medium">{reputation}%</span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              {stakeOxo.toLocaleString()} OXO staked
            </p>
          </div>
        </div>
      </Link>
      
      {/* Earnings & Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-forest font-medium">
            {earnings.toLocaleString()} Cred earned
          </span>
          <span className="text-text-muted">
            {agent.total_service_calls} calls
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/trade/${agent.pubkey}`}
            className="px-3 py-1.5 bg-gold/10 text-gold rounded-lg text-sm font-medium hover:bg-gold/20 transition-colors"
          >
            Trade
          </Link>
          <button className="px-3 py-1.5 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest-light transition-colors">
            Hire (5% fee)
          </button>
        </div>
      </div>
    </div>
  );
}

function ReputationBar({ percent }: { percent: number }) {
  const color = percent >= 80 ? "bg-positive" : percent >= 50 ? "bg-gold" : "bg-negative";
  return (
    <div className="w-12 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

// Mock data for demo/offline mode
function getMockAgents(): Agent[] {
  return [
    {
      pubkey: "AgentXY1234567890abcdef1234567890abcdef12345678",
      creator: "Creator123...",
      reputation_score: 8500,
      reputation_percent: "85.00",
      stake_amount: 1500_000_000,
      total_service_calls: 234,
      total_earnings: 45000_000_000,
      status: "active",
      capabilities: [
        { capability_id: "0100000000000000", capability_name: "Shopping Capture" },
        { capability_id: "2000000000000000", capability_name: "Stack" },
      ],
    },
    {
      pubkey: "BotABC9876543210fedcba9876543210fedcba98765432",
      creator: "Creator456...",
      reputation_score: 7200,
      reputation_percent: "72.00",
      stake_amount: 800_000_000,
      total_service_calls: 156,
      total_earnings: 28000_000_000,
      status: "active",
      capabilities: [
        { capability_id: "0200000000000000", capability_name: "Data Capture" },
      ],
    },
    {
      pubkey: "ServiceAgent111222333444555666777888999000aaabbb",
      creator: "Creator789...",
      reputation_score: 9100,
      reputation_percent: "91.00",
      stake_amount: 2500_000_000,
      total_service_calls: 512,
      total_earnings: 120000_000_000,
      status: "active",
      capabilities: [
        { capability_id: "0100000000000000", capability_name: "Shopping Capture" },
        { capability_id: "0200000000000000", capability_name: "Data Capture" },
        { capability_id: "1000000000000000", capability_name: "Transfer" },
      ],
    },
  ];
}
