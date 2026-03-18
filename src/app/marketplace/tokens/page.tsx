"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

interface AgentToken {
  mint: string;
  creator: string;
  oxo_reserve: number;
  token_supply: number;
  graduated: number;
  graduated_at: number | null;
  created_at: number;
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<AgentToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "graduated">("all");

  useEffect(() => {
    fetchTokens();
  }, [filter]);

  async function fetchTokens() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20", sort: "reserve", order: "desc" });
      if (filter !== "all") {
        params.set("graduated", filter === "graduated" ? "true" : "false");
      }
      
      const res = await fetch(`${API_URL}/api/tokens?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTokens(data.tokens || []);
    } catch {
      setTokens(getMockTokens());
    } finally {
      setLoading(false);
    }
  }

  const GRADUATION_THRESHOLD = 25_000 * 1_000_000; // 25k OXO

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold">Agent Tokens</h1>
        <p className="text-text-secondary text-sm">
          Bonding curves powering service agents
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg-surface rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gold">{tokens.length}</p>
          <p className="text-xs text-text-muted">Total Tokens</p>
        </div>
        <div className="bg-bg-surface rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-forest-light">
            {tokens.filter((t) => !t.graduated).length}
          </p>
          <p className="text-xs text-text-muted">Active Curves</p>
        </div>
        <div className="bg-bg-surface rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-positive">
            {tokens.filter((t) => t.graduated).length}
          </p>
          <p className="text-xs text-text-muted">Graduated</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "graduated", label: "Graduated" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === opt.value
                ? "bg-forest text-white"
                : "bg-bg-elevated text-text-secondary hover:bg-bg-hover"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Token List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-surface rounded-xl p-4 animate-pulse">
              <div className="h-20 bg-bg-elevated rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <TokenCard
              key={token.mint}
              token={token}
              graduationThreshold={GRADUATION_THRESHOLD}
            />
          ))}
          {tokens.length === 0 && (
            <p className="text-center text-text-muted py-8">
              No tokens found
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TokenCard({
  token,
  graduationThreshold,
}: {
  token: AgentToken;
  graduationThreshold: number;
}) {
  const reserveOxo = token.oxo_reserve / 1_000_000;
  const thresholdOxo = graduationThreshold / 1_000_000;
  const progress = Math.min(100, (token.oxo_reserve / graduationThreshold) * 100);
  const isGraduated = token.graduated === 1;

  return (
    <Link
      href={`/marketplace/token/${token.mint}`}
      className="block bg-bg-surface rounded-xl p-4 border border-border-subtle hover:border-border-default transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{isGraduated ? "🎓" : "🚀"}</span>
            <span className="font-mono text-sm">
              {token.mint.slice(0, 8)}...{token.mint.slice(-4)}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Created {new Date(token.created_at * 1000).toLocaleDateString()}
          </p>
        </div>
        {isGraduated ? (
          <span className="px-2 py-1 bg-positive/20 text-positive rounded text-xs font-medium">
            Graduated
          </span>
        ) : (
          <span className="px-2 py-1 bg-gold/20 text-gold rounded text-xs font-medium">
            Active
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {!isGraduated && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-muted">Graduation Progress</span>
            <span className="text-text-secondary">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-forest to-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1 text-right">
            {reserveOxo.toLocaleString()} / {thresholdOxo.toLocaleString()} OXO
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-text-muted">Reserve</p>
          <p className="font-medium">{reserveOxo.toLocaleString()} OXO</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Supply</p>
          <p className="font-medium">{(token.token_supply / 1_000_000).toLocaleString()}</p>
        </div>
      </div>

      {/* LP Lock info for graduated tokens */}
      {isGraduated && token.graduated_at && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>🔒</span>
            <span>LP locked until {new Date(token.graduated_at * 1000 + 315360000 * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </Link>
  );
}

function getMockTokens(): AgentToken[] {
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      mint: "TokenMint111222333444555666777888999000aaabbbccc",
      creator: "Creator111...",
      oxo_reserve: 18_500_000_000, // 18.5k OXO
      token_supply: 12_000_000_000,
      graduated: 0,
      graduated_at: null,
      created_at: now - 86400 * 14, // 14 days ago
    },
    {
      mint: "GradToken222333444555666777888999000aaabbbcccdd",
      creator: "Creator222...",
      oxo_reserve: 25_000_000_000, // 25k OXO
      token_supply: 15_000_000_000,
      graduated: 1,
      graduated_at: now - 86400 * 7, // graduated 7 days ago
      created_at: now - 86400 * 30, // created 30 days ago
    },
    {
      mint: "NewToken333444555666777888999000aaabbbcccdddee",
      creator: "Creator333...",
      oxo_reserve: 5_200_000_000, // 5.2k OXO
      token_supply: 4_000_000_000,
      graduated: 0,
      graduated_at: null,
      created_at: now - 86400 * 3, // 3 days ago
    },
  ];
}
