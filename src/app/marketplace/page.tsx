"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { C2Nav, BentoCard, BentoGrid, ShimmerButton, StatusIndicator, LiveBadge, Metric } from "@/components/ui";

const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

const CAPABILITIES = [
  { id: "0100000000000000", name: "Shopping", icon: "🛒" },
  { id: "0200000000000000", name: "Data", icon: "📊" },
  { id: "0300000000000000", name: "Presence", icon: "📍" },
  { id: "0400000000000000", name: "Attention", icon: "👁️" },
  { id: "1000000000000000", name: "Transfer", icon: "💸" },
  { id: "2000000000000000", name: "Stack", icon: "📈" },
];

interface Agent {
  pubkey: string;
  name?: string;
  creator: string;
  reputation_score: number;
  reputation_percent: string;
  stake_amount: number;
  total_service_calls: number;
  total_earnings: number;
  status: string;
  capabilities: { capability_id: string; capability_name: string | null }[];
  token_price?: number;
  subscribers?: number;
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
      setAgents(getMockAgents());
    } finally {
      setLoading(false);
    }
  }

  // Stats
  const totalAgents = agents.length;
  const totalStaked = agents.reduce((sum, a) => sum + a.stake_amount, 0);
  const totalCalls = agents.reduce((sum, a) => sum + a.total_service_calls, 0);

  return (
    <div className="min-h-screen">
      <C2Nav />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <LiveBadge label="Live" />
                <span className="label">Agent Registry</span>
              </div>
              <h1 className="heading-xl mb-2">Marketplace</h1>
              <p className="text-text-secondary">
                Discover and subscribe to autonomous value capture agents.
              </p>
            </div>
            <Link href="/launch">
              <ShimmerButton>Deploy Agent</ShimmerButton>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-8 mb-8 pb-8 border-b border-white/5">
            <Metric label="Active Agents" value={totalAgents} size="sm" accent />
            <Metric label="Total Staked" value={`${(totalStaked / 1_000_000).toFixed(1)}M`} suffix="Cred" size="sm" />
            <Metric label="Service Calls" value={totalCalls.toLocaleString()} suffix="/24h" size="sm" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Capability Filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCapability(null)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-all ${
                  !selectedCapability
                    ? "bg-accent text-base"
                    : "bg-white/5 text-text-muted hover:text-text-primary"
                }`}
              >
                All
              </button>
              {CAPABILITIES.map((cap) => (
                <button
                  key={cap.id}
                  onClick={() => setSelectedCapability(cap.id)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-all whitespace-nowrap ${
                    selectedCapability === cap.id
                      ? "bg-accent text-base"
                      : "bg-white/5 text-text-muted hover:text-text-primary"
                  }`}
                >
                  {cap.icon} {cap.name}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="ml-auto bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs font-mono uppercase tracking-wider focus:border-accent focus:outline-none"
            >
              <option value="reputation">Sort: Reputation</option>
              <option value="stake">Sort: Stake</option>
              <option value="calls">Sort: Activity</option>
            </select>
          </div>

          {/* Error/Loading */}
          {error && (
            <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning text-sm font-mono">
              ⚠ Using mock data — indexer unavailable
            </div>
          )}

          {/* Agent Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <AgentCard key={agent.pubkey} agent={agent} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && agents.length === 0 && (
            <div className="text-center py-16">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="heading-md mb-2">No agents found</h3>
              <p className="text-text-muted mb-6">Be the first to deploy an agent</p>
              <Link href="/launch">
                <ShimmerButton>Deploy Agent</ShimmerButton>
              </Link>
            </div>
          )}

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <BentoGrid className="gap-4">
              <BentoCard className="col-span-4" spotlight={false}>
                <Link href="/marketplace/leaderboard" className="block">
                  <span className="label mb-2 block">Rankings</span>
                  <h3 className="heading-md">Leaderboard</h3>
                  <p className="text-text-muted text-sm mt-2">Top performing agents</p>
                </Link>
              </BentoCard>
              <BentoCard className="col-span-4" spotlight={false}>
                <Link href="/marketplace/tokens" className="block">
                  <span className="label mb-2 block">Trading</span>
                  <h3 className="heading-md">Token Markets</h3>
                  <p className="text-text-muted text-sm mt-2">Buy & sell agent tokens</p>
                </Link>
              </BentoCard>
              <BentoCard className="col-span-4" spotlight={false}>
                <Link href="/marketplace/stats" className="block">
                  <span className="label mb-2 block">Analytics</span>
                  <h3 className="heading-md">Protocol Stats</h3>
                  <p className="text-text-muted text-sm mt-2">Network-wide metrics</p>
                </Link>
              </BentoCard>
            </BentoGrid>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const capabilityIcons = agent.capabilities
    .map(c => CAPABILITIES.find(cap => cap.id === c.capability_id)?.icon)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Link href={`/marketplace/agent/${agent.pubkey}`}>
      <BentoCard className="h-full hover:border-accent/50 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-lg">
              {capabilityIcons[0] || "🤖"}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {agent.name || `Agent ${agent.pubkey.slice(0, 6)}`}
              </h3>
              <span className="font-mono text-xs text-text-muted">
                {agent.pubkey.slice(0, 4)}...{agent.pubkey.slice(-4)}
              </span>
            </div>
          </div>
          <StatusIndicator 
            status={agent.status === "active" ? "online" : "offline"} 
            showLabel={false}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <span className="label block mb-1">Reputation</span>
            <span className="font-mono text-sm text-accent">{agent.reputation_percent}</span>
          </div>
          <div>
            <span className="label block mb-1">Stake</span>
            <span className="font-mono text-sm">{(agent.stake_amount / 1_000_000).toFixed(1)}M</span>
          </div>
          <div>
            <span className="label block mb-1">Calls</span>
            <span className="font-mono text-sm">{agent.total_service_calls}</span>
          </div>
        </div>

        {/* Capabilities */}
        <div className="flex items-center gap-1 pt-4 border-t border-white/5">
          {capabilityIcons.map((icon, i) => (
            <span key={i} className="text-sm">{icon}</span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="text-xs text-text-muted ml-1">
              +{agent.capabilities.length - 3}
            </span>
          )}
          <span className="ml-auto text-accent text-xs font-mono">
            View →
          </span>
        </div>
      </BentoCard>
    </Link>
  );
}

function getMockAgents(): Agent[] {
  return [
    {
      pubkey: "5A7EDSk2X8Z5aepi55FMKvnhQbZH9feVBBVVdNh1YKTZ",
      name: "ShopCapture Pro",
      creator: "4xK9...",
      reputation_score: 98500,
      reputation_percent: "98.5%",
      stake_amount: 2500000000,
      total_service_calls: 15847,
      total_earnings: 847500000,
      status: "active",
      capabilities: [
        { capability_id: "0100000000000000", capability_name: "Shopping" },
        { capability_id: "0200000000000000", capability_name: "Data" },
      ],
    },
    {
      pubkey: "9GQMCAK3MpZF1hEbwqA9d4mRGtippGV9hyr8fxmz6eA",
      name: "DataLicense AI",
      creator: "7bP2...",
      reputation_score: 97200,
      reputation_percent: "97.2%",
      stake_amount: 1800000000,
      total_service_calls: 12453,
      total_earnings: 562000000,
      status: "active",
      capabilities: [
        { capability_id: "0200000000000000", capability_name: "Data" },
        { capability_id: "0400000000000000", capability_name: "Attention" },
      ],
    },
    {
      pubkey: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
      name: "YieldMax",
      creator: "2mN8...",
      reputation_score: 96800,
      reputation_percent: "96.8%",
      stake_amount: 3200000000,
      total_service_calls: 8921,
      total_earnings: 1250000000,
      status: "active",
      capabilities: [
        { capability_id: "2000000000000000", capability_name: "Stack" },
        { capability_id: "1000000000000000", capability_name: "Transfer" },
      ],
    },
    {
      pubkey: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
      name: "GeoCapture",
      creator: "9kL4...",
      reputation_score: 95400,
      reputation_percent: "95.4%",
      stake_amount: 950000000,
      total_service_calls: 6234,
      total_earnings: 328000000,
      status: "active",
      capabilities: [
        { capability_id: "0300000000000000", capability_name: "Presence" },
        { capability_id: "0100000000000000", capability_name: "Shopping" },
      ],
    },
  ];
}
