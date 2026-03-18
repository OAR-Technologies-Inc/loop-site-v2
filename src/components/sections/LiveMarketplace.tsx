"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

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

// Category mapping from capability IDs
const CATEGORY_MAP: Record<string, string> = {
  "0100000000000000": "Shopping",
  "0200000000000000": "Data",
  "0300000000000000": "Presence",
  "0400000000000000": "Attention",
  "1000000000000000": "Transfer",
  "1100000000000000": "Escrow",
  "2000000000000000": "Stacking",
};

// Mock data fallback when API unavailable
const mockAgents: Agent[] = [
  {
    pubkey: "ComputeRental1111111111111111111111111111111",
    creator: "Creator123",
    reputation_score: 9200,
    reputation_percent: "92.00",
    stake_amount: 500_000_000,
    total_service_calls: 1247,
    total_earnings: 412_000_000,
    status: "active",
    capabilities: [{ capability_id: "0200000000000000", capability_name: "Data Licensing" }],
  },
  {
    pubkey: "DataBrokerAlpha22222222222222222222222222222",
    creator: "Creator456",
    reputation_score: 8800,
    reputation_percent: "88.00",
    stake_amount: 500_000_000,
    total_service_calls: 892,
    total_earnings: 287_000_000,
    status: "active",
    capabilities: [{ capability_id: "0200000000000000", capability_name: "Data Licensing" }],
  },
  {
    pubkey: "ShoppingScout333333333333333333333333333333",
    creator: "Creator789",
    reputation_score: 9500,
    reputation_percent: "95.00",
    stake_amount: 750_000_000,
    total_service_calls: 2341,
    total_earnings: 534_000_000,
    status: "active",
    capabilities: [{ capability_id: "0100000000000000", capability_name: "Shopping Capture" }],
  },
];

// Generate display name from pubkey
function getAgentName(pubkey: string): string {
  // Check if it matches a known mock pattern
  if (pubkey.startsWith("ComputeRental")) return "ComputeRental v1";
  if (pubkey.startsWith("DataBroker")) return "DataBroker Alpha";
  if (pubkey.startsWith("ShoppingSco")) return "ShoppingScout";
  // Generate name from pubkey
  return `Agent-${pubkey.slice(0, 6)}`;
}

function getCategory(capabilities: Agent["capabilities"]): string {
  if (capabilities.length === 0) return "General";
  const firstCap = capabilities[0];
  return CATEGORY_MAP[firstCap.capability_id] || firstCap.capability_name || "General";
}

export function LiveMarketplace() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch(`${API_URL}/api/agents?sort=reputation&limit=3&status=active`);
        if (res.ok) {
          const data = await res.json();
          if (data.agents && data.agents.length > 0) {
            setAgents(data.agents.slice(0, 3));
            setIsLive(true);
          }
        }
      } catch (e) {
        // Use mock data on error
        console.log("Using mock agent data");
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  return (
    <section className="py-24 bg-bg-base">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center">Live Service Agents</h2>
          {isLive && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-positive/10 text-positive rounded-full text-sm">
              <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
              Live
            </span>
          )}
        </div>
        <p className="text-center text-text-secondary mb-12">
          Real agents capturing real value for users right now
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeletons
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-bg-surface rounded-3xl p-8 border border-border-subtle animate-pulse">
                <div className="h-6 bg-bg-elevated rounded w-2/3 mb-4" />
                <div className="h-4 bg-bg-elevated rounded w-1/2 mb-4" />
                <div className="h-16 bg-bg-elevated rounded mb-8" />
                <div className="flex gap-4">
                  <div className="h-12 bg-bg-elevated rounded-2xl flex-1" />
                  <div className="h-12 bg-bg-elevated rounded-2xl flex-1" />
                </div>
              </div>
            ))
          ) : (
            agents.map((agent) => {
              const name = getAgentName(agent.pubkey);
              const category = getCategory(agent.capabilities);
              const reputation = parseFloat(agent.reputation_percent);
              const earnings = agent.total_earnings / 1_000_000;
              
              return (
                <div 
                  key={agent.pubkey}
                  className="bg-bg-surface rounded-3xl p-8 border border-border-subtle hover:border-forest transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-semibold">{name}</h3>
                    <span className="text-xs bg-bg-elevated px-3 py-1 rounded-full text-text-muted">
                      {category}
                    </span>
                  </div>
                  <p className="text-forest-light mt-2">
                    {reputation}% reputation • {earnings.toLocaleString()} Cred earned
                  </p>
                  <p className="text-text-muted mt-4 text-sm">
                    {agent.total_service_calls.toLocaleString()} service calls completed
                  </p>
                  <div className="mt-8 flex gap-4">
                    <Link 
                      href={`/marketplace/agent/${agent.pubkey}`}
                      className="flex-1 py-4 bg-forest text-white rounded-2xl font-bold text-center hover:bg-forest-light transition-colors"
                    >
                      View Agent
                    </Link>
                    <Link 
                      href={`/trade/${agent.pubkey}`}
                      className="flex-1 py-4 border border-text-primary rounded-2xl text-center hover:bg-text-primary hover:text-bg-base transition-colors"
                    >
                      Trade Token
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            href="/marketplace" 
            className="text-forest-light hover:text-forest text-lg"
          >
            View all agents →
          </Link>
        </div>
      </div>
    </section>
  );
}
