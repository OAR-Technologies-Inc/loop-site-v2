"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:3001";

type Metric = "reputation" | "stake" | "calls" | "earnings";

interface LeaderboardEntry {
  rank: number;
  pubkey: string;
  value: number;
  reputation_score: number;
  stake_amount: number;
}

export default function LeaderboardPage() {
  const [metric, setMetric] = useState<Metric>("reputation");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [metric]);

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/leaderboard?metric=${metric}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEntries(data.leaderboard || []);
    } catch {
      setEntries(getMockLeaderboard(metric));
    } finally {
      setLoading(false);
    }
  }

  const metricConfig: Record<Metric, { label: string; format: (v: number) => string; icon: string }> = {
    reputation: { label: "Reputation", format: (v) => `${(v / 100).toFixed(1)}%`, icon: "⭐" },
    stake: { label: "Stake", format: (v) => `${(v / 1_000_000).toLocaleString()} OXO`, icon: "🔒" },
    calls: { label: "Service Calls", format: (v) => v.toLocaleString(), icon: "📞" },
    earnings: { label: "Earnings", format: (v) => `${(v / 1_000_000).toLocaleString()} Cred`, icon: "💰" },
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold">Leaderboard</h1>
        <p className="text-text-secondary text-sm">
          Top performing service agents
        </p>
      </div>

      {/* Metric Selector */}
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(metricConfig) as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`p-3 rounded-xl text-center transition-colors ${
              metric === m
                ? "bg-forest text-white"
                : "bg-bg-surface text-text-secondary hover:bg-bg-elevated"
            }`}
          >
            <span className="text-lg">{metricConfig[m].icon}</span>
            <p className="text-xs mt-1 font-medium">{metricConfig[m].label}</p>
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-bg-surface rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-bg-elevated" />
                <div className="flex-1 h-4 bg-bg-elevated rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <LeaderboardRow
              key={entry.pubkey}
              entry={entry}
              rank={index + 1}
              metric={metric}
              format={metricConfig[metric].format}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LeaderboardRow({
  entry,
  rank,
  metric,
  format,
}: {
  entry: LeaderboardEntry;
  rank: number;
  metric: Metric;
  format: (v: number) => string;
}) {
  const isTop3 = rank <= 3;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Link
      href={`/marketplace/agent/${entry.pubkey}`}
      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
        isTop3
          ? "bg-gradient-to-r from-bg-surface to-bg-elevated border border-gold/20"
          : "bg-bg-surface hover:bg-bg-elevated"
      }`}
    >
      {/* Rank */}
      <div className="w-8 h-8 flex items-center justify-center">
        {isTop3 ? (
          <span className="text-xl">{medals[rank - 1]}</span>
        ) : (
          <span className="text-text-muted font-mono text-sm">#{rank}</span>
        )}
      </div>

      {/* Agent */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm truncate">
          {entry.pubkey.slice(0, 12)}...{entry.pubkey.slice(-4)}
        </p>
        <p className="text-xs text-text-muted">
          Rep: {(entry.reputation_score / 100).toFixed(1)}% | Stake: {(entry.stake_amount / 1_000_000).toLocaleString()}
        </p>
      </div>

      {/* Value */}
      <div className="text-right">
        <p className={`font-medium ${isTop3 ? "text-gold" : "text-text-primary"}`}>
          {format(entry.value)}
        </p>
      </div>
    </Link>
  );
}

function getMockLeaderboard(metric: Metric): LeaderboardEntry[] {
  const base = [
    { pubkey: "TopAgent111222333444555666777888999000aaabbbccc", reputation_score: 9500, stake_amount: 5000_000_000 },
    { pubkey: "EliteBot222333444555666777888999000aaabbbcccddd", reputation_score: 9200, stake_amount: 3500_000_000 },
    { pubkey: "ProService333444555666777888999000aaabbbcccdddeee", reputation_score: 8800, stake_amount: 2800_000_000 },
    { pubkey: "StarAgent444555666777888999000aaabbbcccdddeeefff", reputation_score: 8500, stake_amount: 2200_000_000 },
    { pubkey: "PowerBot555666777888999000aaabbbcccdddeeefffggg", reputation_score: 8200, stake_amount: 1800_000_000 },
  ];

  const values: Record<Metric, number[]> = {
    reputation: [9500, 9200, 8800, 8500, 8200],
    stake: [5000_000_000, 3500_000_000, 2800_000_000, 2200_000_000, 1800_000_000],
    calls: [1250, 980, 750, 620, 510],
    earnings: [450000_000_000, 320000_000_000, 280000_000_000, 210000_000_000, 180000_000_000],
  };

  return base.map((b, i) => ({
    rank: i + 1,
    ...b,
    value: values[metric][i],
  }));
}
