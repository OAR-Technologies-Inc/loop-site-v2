"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

interface Stats {
  agents: {
    total: number;
    active: number;
    total_stake: number;
    total_calls: number;
    total_earnings: number;
    avg_reputation: number;
  };
  tokens: {
    total: number;
    graduated: number;
    pending: number;
    total_oxo_locked: number;
  };
  capabilities: {
    unique: number;
  };
  indexer: {
    last_poll: number | null;
  };
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch(`${API_URL}/api/stats`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(getMockStats());
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Protocol Stats</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-bg-surface rounded-xl p-6 animate-pulse">
              <div className="h-32 bg-bg-elevated rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold">Protocol Stats</h1>
        <p className="text-text-secondary text-sm">
          Real-time marketplace metrics
        </p>
        {stats.indexer.last_poll && (
          <p className="text-xs text-text-muted">
            Updated {new Date(stats.indexer.last_poll).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Active Agents"
          value={stats.agents.active.toString()}
          icon="🤖"
          color="forest"
        />
        <StatCard
          label="Total Stake"
          value={formatOxo(stats.agents.total_stake)}
          icon="🔒"
          color="gold"
        />
        <StatCard
          label="Service Calls"
          value={stats.agents.total_calls.toLocaleString()}
          icon="📞"
          color="info"
        />
        <StatCard
          label="Total Earnings"
          value={formatCred(stats.agents.total_earnings)}
          icon="💰"
          color="positive"
        />
      </div>

      {/* Agent Stats */}
      <div className="bg-bg-surface rounded-xl p-5 space-y-4">
        <h2 className="font-display font-bold flex items-center gap-2">
          <span>🤖</span> Agent Statistics
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{stats.agents.total}</p>
            <p className="text-xs text-text-muted">Total Registered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-positive">{stats.agents.active}</p>
            <p className="text-xs text-text-muted">Currently Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.agents.avg_reputation.toFixed(1)}%</p>
            <p className="text-xs text-text-muted">Avg Reputation</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.capabilities.unique}</p>
            <p className="text-xs text-text-muted">Unique Capabilities</p>
          </div>
        </div>
      </div>

      {/* Token Stats */}
      <div className="bg-bg-surface rounded-xl p-5 space-y-4">
        <h2 className="font-display font-bold flex items-center gap-2">
          <span>🪙</span> Token Statistics
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold">{stats.tokens.total}</p>
            <p className="text-xs text-text-muted">Total Tokens</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gold">{stats.tokens.pending}</p>
            <p className="text-xs text-text-muted">Active Curves</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-positive">{stats.tokens.graduated}</p>
            <p className="text-xs text-text-muted">Graduated</p>
          </div>
        </div>
        
        {/* Graduation Rate */}
        <div className="pt-4 border-t border-border-subtle">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-muted">Graduation Rate</span>
            <span className="text-text-secondary">
              {stats.tokens.total > 0
                ? ((stats.tokens.graduated / stats.tokens.total) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
          <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-forest to-positive rounded-full"
              style={{
                width: `${
                  stats.tokens.total > 0
                    ? (stats.tokens.graduated / stats.tokens.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* OXO Locked */}
        <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
          <span className="text-text-muted">Total OXO Locked</span>
          <span className="text-xl font-bold text-gold">
            {formatOxo(stats.tokens.total_oxo_locked)}
          </span>
        </div>
      </div>

      {/* Activity Chart Placeholder */}
      <div className="bg-bg-surface rounded-xl p-5 space-y-4">
        <h2 className="font-display font-bold flex items-center gap-2">
          <span>📈</span> Activity Trend
        </h2>
        <div className="h-40 flex items-end justify-around gap-2">
          {[35, 52, 45, 68, 72, 85, 78].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-forest to-forest-light rounded-t"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex justify-around text-xs text-text-muted">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: "forest" | "gold" | "positive" | "info";
}) {
  const colors = {
    forest: "from-forest/20 to-forest/5 border-forest/30",
    gold: "from-gold/20 to-gold/5 border-gold/30",
    positive: "from-positive/20 to-positive/5 border-positive/30",
    info: "from-info/20 to-info/5 border-info/30",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function formatOxo(amount: number): string {
  const oxo = amount / 1_000_000;
  if (oxo >= 1_000_000) return `${(oxo / 1_000_000).toFixed(1)}M`;
  if (oxo >= 1_000) return `${(oxo / 1_000).toFixed(1)}K`;
  return oxo.toLocaleString();
}

function formatCred(amount: number): string {
  const cred = amount / 1_000_000;
  if (cred >= 1_000_000) return `$${(cred / 1_000_000).toFixed(1)}M`;
  if (cred >= 1_000) return `$${(cred / 1_000).toFixed(1)}K`;
  return `$${cred.toLocaleString()}`;
}

function getMockStats(): Stats {
  return {
    agents: {
      total: 156,
      active: 142,
      total_stake: 4_500_000_000_000, // 4.5M OXO
      total_calls: 28_450,
      total_earnings: 1_250_000_000_000, // $1.25M
      avg_reputation: 74.5,
    },
    tokens: {
      total: 89,
      graduated: 23,
      pending: 66,
      total_oxo_locked: 2_100_000_000_000, // 2.1M OXO
    },
    capabilities: {
      unique: 7,
    },
    indexer: {
      last_poll: Date.now(),
    },
  };
}
