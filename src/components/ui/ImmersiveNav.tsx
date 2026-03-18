"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Cpu, Home } from "lucide-react";
import { AgentHUD } from "./AgentHUD";

/**
 * ImmersiveNav - Minimal floating navigation for full-screen terminal experiences
 * Used on /marketplace, /vault, and other immersive AOS pages
 */
export function ImmersiveNav() {
  const { connected } = useWallet();
  const [hudOpen, setHudOpen] = useState(false);
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
    <>
      {/* Floating Control Bar */}
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

        {/* Right: HUD + Wallet */}
        <div className="flex items-center gap-2">
          {/* Connect Agent Button */}
          <motion.button
            onClick={() => setHudOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-xl border transition-all ${
              hudOpen 
                ? "bg-accent/20 border-accent/50 text-accent"
                : "bg-zinc-950/80 border-white/5 text-zinc-400 hover:border-accent/30 hover:text-accent"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Cpu size={14} strokeWidth={1.2} />
            <span className="text-[10px] font-mono uppercase tracking-wider hidden sm:inline">
              {hudOpen ? "HUD_ACTIVE" : "OPEN_HUD"}
            </span>
            
            {hudOpen && (
              <motion.div
                className="absolute inset-0 rounded-lg border border-accent/50"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
          
          {/* Wallet Button */}
          <div className={`wallet-btn-wrapper rounded-lg overflow-hidden ${connected ? 'wallet-connected' : ''}`}>
            <WalletMultiButton className="wallet-tactical-btn !rounded-lg !py-2 !px-3 !h-auto !text-[10px]" />
          </div>
        </div>
      </motion.header>

      {/* Agent HUD */}
      <AgentHUD isOpen={hudOpen} onClose={() => setHudOpen(false)} />
    </>
  );
}
