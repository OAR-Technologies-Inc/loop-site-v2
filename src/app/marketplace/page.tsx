"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { C2Nav, BentoCard, BentoGrid, ShimmerButton, Metric, GridBackground } from "@/components/ui";
import { 
  Target, Database, MapPin, Eye, ArrowLeftRight, TrendingUp, Bot, 
  Terminal, ChevronRight, Activity, Zap, Shield, Cpu, Lock,
  Plus, Play, BarChart3
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

const CAPABILITIES = [
  { id: "0100000000000000", name: "Commerce", icon: Target, label: "COMM" },
  { id: "0200000000000000", name: "Data", icon: Database, label: "DATA" },
  { id: "0300000000000000", name: "Location", icon: MapPin, label: "GEO" },
  { id: "0400000000000000", name: "Attention", icon: Eye, label: "ATTN" },
  { id: "1000000000000000", name: "Transfer", icon: ArrowLeftRight, label: "XFER" },
  { id: "2000000000000000", name: "Stack", icon: TrendingUp, label: "STACK" },
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
        limit: "12",
        status: "active",
      });
      if (selectedCapability) params.set("capability", selectedCapability);
      
      const res = await fetch(`${API_URL}/api/agents?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAgents(data.agents || []);
    } catch {
      setAgents(getMockAgents());
    } finally {
      setLoading(false);
    }
  }

  const filteredAgents = agents;
  const totalStaked = agents.reduce((sum, a) => sum + a.stake_amount, 0);
  const totalCalls = agents.reduce((sum, a) => sum + a.total_service_calls, 0);
  const avgRep = agents.length > 0 
    ? agents.reduce((sum, a) => sum + a.reputation_score, 0) / agents.length / 1000 
    : 0;

  return (
    <div className="min-h-screen relative">
      <GridBackground />
      <C2Nav />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header with Terminal Output */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-mono mb-1">
              <Terminal size={10} strokeWidth={1.5} />
              <span>AGENT_REGISTRY::MAINNET</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-600">&gt;</span>
              <span className="text-zinc-500">query --status=active --sort={sortBy}</span>
              {loading ? (
                <motion.span
                  className="text-accent"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  [SCANNING]
                </motion.span>
              ) : (
                <span className="text-accent">[{agents.length} FOUND]</span>
              )}
            </div>
          </div>

          {/* Live Telemetry Strip */}
          <BentoCard className="col-span-full mb-6 p-0 overflow-hidden" spotlight={false}>
            <div className="flex items-stretch divide-x divide-white/5">
              <div className="flex-1 p-4">
                <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">[AGENTS_ONLINE]</span>
                <span className="text-lg font-mono font-bold text-accent">{agents.length}</span>
              </div>
              <div className="flex-1 p-4">
                <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">[TOTAL_STAKED]</span>
                <span className="text-lg font-mono font-bold">${(totalStaked / 1_000_000).toFixed(1)}M</span>
              </div>
              <div className="flex-1 p-4">
                <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">[CALLS_24H]</span>
                <span className="text-lg font-mono font-bold">{totalCalls.toLocaleString()}</span>
              </div>
              <div className="flex-1 p-4">
                <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">[AVG_REP]</span>
                <span className="text-lg font-mono font-bold">{avgRep.toFixed(1)}%</span>
              </div>
            </div>
          </BentoCard>

          {/* SDK Action Buttons */}
          <BentoGrid className="mb-6">
            <BentoCard className="col-span-3 p-4" spotlight={false}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">[SYS_INIT]</span>
                  <span className="text-xs font-mono text-zinc-400">createVault()</span>
                </div>
                <Link href="/launch">
                  <button className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:border-accent/50 hover:bg-accent/10 transition-all">
                    <Plus size={14} strokeWidth={1.2} className="text-zinc-400" />
                  </button>
                </Link>
              </div>
            </BentoCard>

            <BentoCard className="col-span-3 p-4" spotlight={false}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">[DEPLOY]</span>
                  <span className="text-xs font-mono text-zinc-400">registerAgent()</span>
                </div>
                <Link href="/launch">
                  <button className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:border-accent/50 hover:bg-accent/10 transition-all">
                    <Bot size={14} strokeWidth={1.2} className="text-zinc-400" />
                  </button>
                </Link>
              </div>
            </BentoCard>

            <BentoCard className="col-span-3 p-4" spotlight={false}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">[QUERY]</span>
                  <span className="text-xs font-mono text-zinc-400">getVaultStats()</span>
                </div>
                <Link href="/marketplace/stats">
                  <button className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:border-accent/50 hover:bg-accent/10 transition-all">
                    <BarChart3 size={14} strokeWidth={1.2} className="text-zinc-400" />
                  </button>
                </Link>
              </div>
            </BentoCard>

            <BentoCard className="col-span-3 p-4" spotlight={false}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">[SUBSCRIBE]</span>
                  <span className="text-xs font-mono text-zinc-400">stakeAgent()</span>
                </div>
                <button className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:border-accent/50 hover:bg-accent/10 transition-all">
                  <Play size={14} strokeWidth={1.2} className="text-zinc-400" />
                </button>
              </div>
            </BentoCard>
          </BentoGrid>

          {/* Capability Filter Strip */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCapability(null)}
              className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded transition-all whitespace-nowrap ${
                !selectedCapability
                  ? "bg-accent text-zinc-950"
                  : "text-zinc-600 hover:text-zinc-300 border border-zinc-800"
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
                  className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    selectedCapability === cap.id
                      ? "bg-accent text-zinc-950"
                      : "text-zinc-600 hover:text-zinc-300 border border-zinc-800"
                  }`}
                >
                  <Icon size={10} strokeWidth={1.5} />
                  {cap.label}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent border border-zinc-800 rounded px-2 py-1.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500 focus:border-accent/50 focus:outline-none cursor-pointer"
              >
                <option value="reputation">REP↓</option>
                <option value="stake">STAKE↓</option>
                <option value="calls">CALLS↓</option>
              </select>
            </div>
          </div>

          {/* Agent Grid — High Density Bento */}
          {loading ? (
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-32 bg-zinc-900/30 rounded border border-zinc-800/50 animate-pulse" />
              ))}
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-16 font-mono">
              <Bot size={32} strokeWidth={1} className="mx-auto mb-4 text-zinc-700" />
              <div className="text-zinc-600 text-xs uppercase tracking-wider">NO_AGENTS_MATCH</div>
              <Link href="/launch" className="inline-block mt-4">
                <ShimmerButton size="sm">DEPLOY_AGENT</ShimmerButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {filteredAgents.map((agent) => (
                <AgentTile key={agent.pubkey} agent={agent} />
              ))}
            </div>
          )}

          {/* Footer CTA */}
          <div className="mt-8 pt-6 border-t border-zinc-800/50">
            <div className="flex items-center justify-between">
              <div className="font-mono">
                <span className="text-[8px] text-zinc-600 uppercase tracking-wider">[REGISTRY_STATUS]</span>
                <div className="text-xs text-zinc-500 mt-1">
                  {agents.length} indexed • Open for deployments
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/marketplace/leaderboard">
                  <ShimmerButton variant="ghost" size="sm">LEADERBOARD</ShimmerButton>
                </Link>
                <Link href="/launch">
                  <ShimmerButton size="sm">DEPLOY_AGENT</ShimmerButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentTile({ agent }: { agent: Agent }) {
  const capabilities = agent.capabilities
    .map(c => CAPABILITIES.find(cap => cap.id === c.capability_id))
    .filter(Boolean)
    .slice(0, 2);

  const PrimaryIcon = capabilities[0]?.icon || Bot;

  return (
    <Link href={`/marketplace/agent/${agent.pubkey}`}>
      <motion.div
        className="group relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded p-3 h-full transition-all hover:border-accent/30 hover:shadow-[0_0_20px_rgba(0,255,204,0.05)]"
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Status Dot */}
        <motion.div
          className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${agent.status === "active" ? "bg-accent" : "bg-zinc-700"}`}
          animate={agent.status === "active" ? { opacity: [0.4, 1, 0.4] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Icon + Name */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
            <PrimaryIcon size={12} strokeWidth={1.2} className="text-zinc-500 group-hover:text-accent transition-colors" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium truncate group-hover:text-accent transition-colors">
              {agent.name || `AGENT_${agent.pubkey.slice(0, 4)}`}
            </div>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-mono">
          <div>
            <span className="text-zinc-600">REP</span>
            <span className="text-accent ml-1">{agent.reputation_percent}</span>
          </div>
          <div>
            <span className="text-zinc-600">STK</span>
            <span className="text-zinc-400 ml-1">{(agent.stake_amount / 1_000_000).toFixed(0)}M</span>
          </div>
        </div>

        {/* Capability Icons */}
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-zinc-800/30">
          {capabilities.map((cap, i) => {
            if (!cap) return null;
            const Icon = cap.icon;
            return (
              <div key={i} className="w-4 h-4 rounded bg-zinc-800/30 flex items-center justify-center">
                <Icon size={8} strokeWidth={1.2} className="text-zinc-600" />
              </div>
            );
          })}
          <ChevronRight size={10} strokeWidth={1.5} className="ml-auto text-zinc-700 group-hover:text-accent transition-colors" />
        </div>

        {/* Runtime Label */}
        <div className="absolute bottom-2 left-2 text-[6px] font-mono text-zinc-700 uppercase">
          NITRO
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
      name: "CommerceNode_A",
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
    {
      pubkey: "4xK9vMt7pBnQ8eF1nW3hZ6yR5sL2dU9cP0kJ7gH8fTmN",
      name: "DataSync_Alpha",
      creator: "5tY2...",
      reputation_score: 90500,
      reputation_percent: "90.5%",
      stake_amount: 380000000,
      total_service_calls: 1847,
      total_earnings: 72000000,
      status: "active",
      capabilities: [
        { capability_id: "0200000000000000", capability_name: "Data" },
      ],
    },
    {
      pubkey: "7bP2qN4rK5wX1mJ8hL6yT0sC3dF9gU2vB4nM7pQ8eR1z",
      name: "StackBot_v1",
      creator: "2wE4...",
      reputation_score: 89800,
      reputation_percent: "89.8%",
      stake_amount: 290000000,
      total_service_calls: 1523,
      total_earnings: 54000000,
      status: "active",
      capabilities: [
        { capability_id: "2000000000000000", capability_name: "Stack" },
      ],
    },
    {
      pubkey: "2mN8fG5kL3wP9hJ7yB1tR4sQ6vX0cE2nU8dM5kF7gH3j",
      name: "GeoNode_Beta",
      creator: "9pL1...",
      reputation_score: 88200,
      reputation_percent: "88.2%",
      stake_amount: 210000000,
      total_service_calls: 987,
      total_earnings: 38000000,
      status: "active",
      capabilities: [
        { capability_id: "0300000000000000", capability_name: "Location" },
      ],
    },
    {
      pubkey: "9kL4mF2pN7wQ1hJ5yC8tR3sB6vX0dE9nU4kM2gH8fP1z",
      name: "AttnCapture_v2",
      creator: "3qW6...",
      reputation_score: 87500,
      reputation_percent: "87.5%",
      stake_amount: 175000000,
      total_service_calls: 743,
      total_earnings: 29000000,
      status: "active",
      capabilities: [
        { capability_id: "0400000000000000", capability_name: "Attention" },
        { capability_id: "0200000000000000", capability_name: "Data" },
      ],
    },
  ];
}
