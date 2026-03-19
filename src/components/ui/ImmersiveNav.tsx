"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

/**
 * ImmersiveNav - Minimal floating navigation for full-screen terminal experiences
 * Used on /marketplace, /vault, and other immersive AOS pages
 * Agent widget is now global (in layout.tsx)
 */
export function ImmersiveNav() {
  const { connected } = useWallet();
  const [latency, setLatency] = useState(24);
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTimestamp(now.toISOString().slice(11, 19));
      setLatency(Math.floor(20 + Math.random() * 15));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header 
      className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Left: Logo + Status */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-950/80 backdrop-blur-xl border border-white/5 hover:border-accent/30 transition-all">
          <div className="w-6 h-6 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
            <span className="text-accent font-mono text-xs font-bold">◎</span>
          </div>
          <span className="font-mono text-xs font-semibold tracking-tight">
            LOOP<span className="text-zinc-500">.OS</span>
          </span>
        </Link>

        {/* Live Telemetry Pill */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-950/80 backdrop-blur-xl border border-white/5">
          <div className="flex items-center gap-1.5">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[9px] font-mono text-green-400">{latency}ms</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <span className="text-[9px] font-mono text-zinc-500">UTC {timestamp}</span>
        </div>
      </div>

      {/* Right: Wallet */}
      <div className="flex items-center gap-2">
        <div className={`wallet-btn-wrapper rounded-lg overflow-hidden ${connected ? 'wallet-connected' : ''}`}>
          <WalletMultiButton className="wallet-tactical-btn !rounded-lg !py-2 !px-3 !h-auto !text-[10px]" />
        </div>
      </div>
    </motion.header>
  );
}
