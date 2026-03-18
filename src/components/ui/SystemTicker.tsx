"use client";

import { useEffect, useState } from "react";

const MOCK_LOGS = [
  { type: "capture", agent: "ShopCapture", amount: "12.4", hash: "5xK9m...7dPq" },
  { type: "stake", agent: "YieldMax", amount: "500", hash: "8bR2n...4wFs" },
  { type: "tx", agent: "DataLicense", amount: "8.2", hash: "3mP7L...6tXc" },
  { type: "register", agent: "NewAgent", amount: "—", hash: "9gKR...1pYv" },
  { type: "capture", agent: "GeoCapture", amount: "3.7", hash: "2nQ4k...8rWz" },
  { type: "stake", agent: "ShopCapture", amount: "1,200", hash: "6jH3m...5sFt" },
  { type: "tx", agent: "YieldMax", amount: "45.8", hash: "4pL9n...2dQm" },
  { type: "capture", agent: "DataLicense", amount: "22.1", hash: "7wK2p...9vBn" },
];

const TYPE_COLORS: Record<string, string> = {
  capture: "text-positive",
  stake: "text-accent",
  tx: "text-text-secondary",
  register: "text-warning",
};

const TYPE_LABELS: Record<string, string> = {
  capture: "CAPTURE",
  stake: "STACK",
  tx: "TRANSFER",
  register: "REGISTER",
};

export function SystemTicker() {
  const [logs, setLogs] = useState(MOCK_LOGS);

  // Simulate new logs coming in
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = {
          type: ["capture", "stake", "tx", "capture"][Math.floor(Math.random() * 4)],
          agent: ["ShopCapture", "YieldMax", "DataLicense", "GeoCapture"][Math.floor(Math.random() * 4)],
          amount: (Math.random() * 100).toFixed(1),
          hash: Math.random().toString(36).slice(2, 6) + "..." + Math.random().toString(36).slice(2, 6),
        };
        return [...prev.slice(1), newLog];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ticker-container overflow-hidden bg-base/80 border-t border-white/5 backdrop-blur-sm">
      <div className="flex items-center h-8">
        {/* Label */}
        <div className="flex-shrink-0 px-4 border-r border-white/5 h-full flex items-center gap-2">
          <span className="status-dot" style={{ width: 6, height: 6 }} />
          <span className="label text-[9px]">System Log</span>
        </div>
        
        {/* Scrolling content */}
        <div className="flex-1 overflow-hidden">
          <div className="ticker-scroll flex items-center gap-8 whitespace-nowrap animate-ticker">
            {[...logs, ...logs].map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-[10px] font-mono">
                <span className={`${TYPE_COLORS[log.type]} font-semibold`}>
                  {TYPE_LABELS[log.type]}
                </span>
                <span className="text-text-muted">{log.agent}</span>
                {log.amount !== "—" && (
                  <span className="text-text-secondary">+{log.amount} Cred</span>
                )}
                <span className="text-text-muted/50">{log.hash}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
