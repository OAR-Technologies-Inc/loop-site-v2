"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { C2Nav, BentoCard, BentoGrid, ShimmerButton } from "@/components/ui";
import { Target, Database, MapPin, Eye, ArrowLeftRight, TrendingUp, Bot, Search, Terminal, ChevronRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

const CAPABILITIES = [
  { id: "0100000000000000", name: "Commerce", icon: Target },
  { id: "0200000000000000", name: "Data", icon: Database },
  { id: "0300000000000000", name: "Location", icon: MapPin },
  { id: "0400000000000000", name: "Attention", icon: Eye },
  { id: "1000000000000000", name: "Transfer", icon: ArrowLeftRight },
  { id: "2000000000000000", name: "Stack", icon: TrendingUp },
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
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"reputation" | "stake" | "calls">("reputation");
  const [searchQuery, setSearchQuery] = useState("");
  const [queryComplete, setQueryComplete] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAgents();
  }, [selectedCapability, sortBy]);

  async function fetchAgents() {
    setLoading(true);
    setQueryComplete(false);
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
      if (!res.ok) throw new Error("Failed to fetch");
      
      const data = await res.json();
      setAgents(data.agents || []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setAgents(getMockAgents());
    } finally {
      setLoading(false);
      setTimeout(() => setQueryComplete(true), 300);
    }
  }

  const filteredAgents = agents.filter(agent => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      agent.name?.toLowerCase().includes(q) ||
      agent.pubkey.toLowerCase().includes(q)
    );
  });

  const totalStaked = agents.reduce((sum, a) => sum + a.stake_amount, 0);
  const totalCalls = agents.reduce((sum, a) => sum + a.total_service_calls, 0);

  return (
    <div className="min-h-screen">
      <C2Nav />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Terminal Header */}
          <div className="mb-8 font-mono">
            <div className="flex items-center gap-2 text-zinc-600 text-xs mb-2">
              <Terminal size={12} strokeWidth={1.5} />
              <span>AGENT_REGISTRY v1.0.0</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500">&gt;</span>
              <span className="text-zinc-400">QUERYING_AGENT_REGISTRY...</span>
              {loading ? (
                <motion.span
                  className="text-accent"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  [LOADING]
                </motion.span>
              ) : (
                <span className="text-accent">[DONE]</span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-zinc-600">
              <span>AGENTS_FOUND: <span className="text-zinc-400">{agents.length}</span></span>
              <span>TOTAL_STAKED: <span className="text-zinc-400">{(totalStaked / 1_000_000).toFixed(1)}M</span></span>
              <span>CALLS_24H: <span className="text-zinc-400">{totalCalls.toLocaleString()}</span></span>
            </div>
          </div>

          {/* Search + Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                ref={searchRef}
                type="text"
                placeholder="SEARCH_AGENTS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border border-zinc-800 rounded px-3 py-2 pl-9 text-xs font-mono text-zinc-300 placeholder:text-zinc-600 focus:border-white/30 focus:shadow-[0_0_10px_rgba(255,255,255,0.1)] focus:outline-none transition-all"
              />
            </div>

            {/* Capability Filter */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCapability(null)}
                className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-all ${
                  !selectedCapability
                    ? "bg-accent text-zinc-950"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                ALL
              </button>
              {CAPABILITIES.map((cap) => {
                const Icon = cap.icon;
                return (
                  <button
                    key={cap.id}
                    onClick={() => setSelectedCapability(cap.id)}
                    className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-all flex items-center gap-1.5 ${
                      selectedCapability === cap.id
                        ? "bg-accent text-zinc-950"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Icon size={10} strokeWidth={1.5} />
                    {cap.name}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 focus:border-white/30 focus:outline-none"
            >
              <option value="reputation">SORT:REP</option>
              <option value="stake">SORT:STAKE</option>
              <option value="calls">SORT:CALLS</option>
            </select>
          </div>

          {/* Agent Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-40 bg-zinc-900/30 rounded border border-zinc-800/50 animate-pulse" />
              ))}
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-16 font-mono">
              <Bot size={32} strokeWidth={1} className="mx-auto mb-4 text-zinc-700" />
              <div className="text-zinc-500 text-sm">NO_AGENTS_MATCH_QUERY</div>
              <Link href="/launch" className="inline-block mt-4">
                <ShimmerButton size="sm">DEPLOY_AGENT</ShimmerButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.pubkey} agent={agent} />
              ))}
            </div>
          )}

          {/* Deploy CTA */}
          <div className="mt-12 pt-8 border-t border-zinc-800/50">
            <div className="flex items-center justify-between">
              <div className="font-mono">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">REGISTRY_STATUS</div>
                <div className="text-sm text-zinc-400">
                  {agents.length} agents indexed • Registry open for deployments
                </div>
              </div>
              <Link href="/launch">
                <ShimmerButton>DEPLOY_AGENT</ShimmerButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const capabilities = agent.capabilities
    .map(c => CAPABILITIES.find(cap => cap.id === c.capability_id))
    .filter(Boolean)
    .slice(0, 3);

  const PrimaryIcon = capabilities[0]?.icon || Bot;

  return (
    <Link href={`/marketplace/agent/${agent.pubkey}`}>
      <motion.div
        className="group relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded p-4 h-full transition-all hover:border-accent/30 hover:shadow-[0_0_30px_rgba(0,255,204,0.05)]"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Status indicator */}
        <div className="absolute top-3 right-3">
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${agent.status === "active" ? "bg-accent" : "bg-zinc-600"}`}
            animate={agent.status === "active" ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Icon + Name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
            <PrimaryIcon size={14} strokeWidth={1.2} className="text-zinc-500 group-hover:text-accent transition-colors" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate group-hover:text-accent transition-colors">
              {agent.name || `AGENT_${agent.pubkey.slice(0, 6)}`}
            </div>
            <div className="text-[10px] font-mono text-zinc-600 truncate">
              {agent.pubkey.slice(0, 4)}...{agent.pubkey.slice(-4)}
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="text-[8px] font-mono text-zinc-600 uppercase">REP</div>
            <div className="text-xs font-mono text-accent">{agent.reputation_percent}</div>
          </div>
          <div>
            <div className="text-[8px] font-mono text-zinc-600 uppercase">STAKE</div>
            <div className="text-xs font-mono text-zinc-400">{(agent.stake_amount / 1_000_000).toFixed(1)}M</div>
          </div>
          <div>
            <div className="text-[8px] font-mono text-zinc-600 uppercase">CALLS</div>
            <div className="text-xs font-mono text-zinc-400">{agent.total_service_calls}</div>
          </div>
          <div>
            <div className="text-[8px] font-mono text-zinc-600 uppercase">STATUS</div>
            <div className={`text-xs font-mono ${agent.status === "active" ? "text-accent" : "text-zinc-600"}`}>
              {agent.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-1.5">
            {capabilities.map((cap, i) => {
              if (!cap) return null;
              const Icon = cap.icon;
              return (
                <div key={i} className="w-5 h-5 rounded bg-zinc-800/30 flex items-center justify-center">
                  <Icon size={10} strokeWidth={1.2} className="text-zinc-600" />
                </div>
              );
            })}
            {agent.capabilities.length > 3 && (
              <span className="text-[10px] font-mono text-zinc-600">+{agent.capabilities.length - 3}</span>
            )}
          </div>
          <ChevronRight size={12} strokeWidth={1.5} className="text-zinc-600 group-hover:text-accent transition-colors" />
        </div>

        {/* Runtime tag */}
        <div className="absolute bottom-3 left-3 text-[8px] font-mono text-zinc-700 uppercase">
          RUNTIME:NITRO_TEE
        </div>
      </motion.div>
    </Link>
  );
}

function getMockAgents(): Agent[] {
  return [
    {
      pubkey: "5A7EDSk2X8Z5aepi55FMKvnhQbZH9feVBBVVdNh1YKTZ",
      name: "ShopCapture_Pro",
      creator: "4xK9...",
      reputation_score: 98500,
      reputation_percent: "98.5%",
      stake_amount: 2500000000,
      total_service_calls: 15847,
      total_earnings: 847500000,
      status: "active",
      capabilities: [
        { capability_id: "0100000000000000", capability_name: "Commerce" },
        { capability_id: "0200000000000000", capability_name: "Data" },
      ],
    },
    {
      pubkey: "9GQMCAK3MpZF1hEbwqA9d4mRGtippGV9hyr8fxmz6eA",
      name: "DataLicense_AI",
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
      name: "YieldMax_v2",
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
      name: "GeoCapture_Node",
      creator: "9kL4...",
      reputation_score: 95400,
      reputation_percent: "95.4%",
      stake_amount: 950000000,
      total_service_calls: 6234,
      total_earnings: 328000000,
      status: "active",
      capabilities: [
        { capability_id: "0300000000000000", capability_name: "Location" },
        { capability_id: "0100000000000000", capability_name: "Commerce" },
      ],
    },
    {
      pubkey: "CTRnn7vC1EtL1YDLU3x3iidEcCWRmZupEXHKQfL17Fxa",
      name: "Attention_Broker",
      creator: "3pQ7...",
      reputation_score: 94100,
      reputation_percent: "94.1%",
      stake_amount: 1200000000,
      total_service_calls: 9876,
      total_earnings: 445000000,
      status: "active",
      capabilities: [
        { capability_id: "0400000000000000", capability_name: "Attention" },
      ],
    },
    {
      pubkey: "zEJf7Vy7ZDjvoMTBndAvkvxRpACUzCboQg2dP8H8R6k",
      name: "Transfer_Engine",
      creator: "6wR1...",
      reputation_score: 93500,
      reputation_percent: "93.5%",
      stake_amount: 780000000,
      total_service_calls: 4521,
      total_earnings: 198000000,
      status: "active",
      capabilities: [
        { capability_id: "1000000000000000", capability_name: "Transfer" },
        { capability_id: "2000000000000000", capability_name: "Stack" },
      ],
    },
    {
      pubkey: "Ga2PRtFu3TRsTjN1QxdVpvtjVP7kb1rAkZse9MXWXjPh",
      name: "CommerceNode_Alpha",
      creator: "8mK3...",
      reputation_score: 92800,
      reputation_percent: "92.8%",
      stake_amount: 650000000,
      total_service_calls: 3892,
      total_earnings: 156000000,
      status: "active",
      capabilities: [
        { capability_id: "0100000000000000", capability_name: "Commerce" },
      ],
    },
    {
      pubkey: "FzwRshrm2Pu8ygMPqHwbjb7yWBiQ2pQc3Lgk8XJRpvNM",
      name: "MultiCapture_v3",
      creator: "1nJ5...",
      reputation_score: 91200,
      reputation_percent: "91.2%",
      stake_amount: 420000000,
      total_service_calls: 2156,
      total_earnings: 87000000,
      status: "active",
      capabilities: [
        { capability_id: "0100000000000000", capability_name: "Commerce" },
        { capability_id: "0200000000000000", capability_name: "Data" },
        { capability_id: "0300000000000000", capability_name: "Location" },
      ],
    },
  ];
}
