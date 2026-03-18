"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Cpu } from "lucide-react";
import { AgentHUD } from "./AgentHUD";

export function C2Nav() {
  const pathname = usePathname();
  const { connected } = useWallet();
  const [uptime, setUptime] = useState({ d: 142, h: 12, m: 4, s: 9 });
  const [latency, setLatency] = useState(24);
  const [timestamp, setTimestamp] = useState("");
  const [agentCount, setAgentCount] = useState(847);
  const [hudOpen, setHudOpen] = useState(false);

  // Live clock and uptime
  useEffect(() => {
    const interval = setInterval(() => {
      // Update timestamp
      const now = new Date();
      setTimestamp(now.toISOString().slice(11, 19));
      
      // Increment uptime
      setUptime(prev => {
        let { d, h, m, s } = prev;
        s++;
        if (s >= 60) { s = 0; m++; }
        if (m >= 60) { m = 0; h++; }
        if (h >= 24) { h = 0; d++; }
        return { d, h, m, s };
      });

      // Fluctuate latency
      setLatency(Math.floor(20 + Math.random() * 15));
      
      // Occasionally update agent count
      if (Math.random() > 0.9) {
        setAgentCount(prev => prev + Math.floor(Math.random() * 3) - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: "/marketplace", label: "Agents" },
    { href: "/docs", label: "SDK" },
    { href: "/security", label: "Security" },
  ];

  const formatUptime = () => {
    const { d, h, m, s } = uptime;
    return `${d}:${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950/70 backdrop-blur-2xl border-b border-white/5 scanlines">
        <nav className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Left: Logo + Telemetry */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
                <span className="text-accent font-mono text-sm font-bold">◎</span>
              </div>
              <span className="font-mono text-sm font-semibold tracking-tight hidden sm:block">
                LOOP<span className="text-text-muted">.PROTOCOL</span>
              </span>
            </Link>

            {/* Telemetry Panel */}
            <div className="hidden lg:flex items-center gap-4 pl-6 border-l border-white/5">
              {/* Network Status */}
              <div className="flex items-center gap-2">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-positive"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                  NET
                </span>
                <span className="text-[10px] font-mono text-positive">
                  {latency}ms
                </span>
              </div>

              {/* Agent Count */}
              <div className="flex items-center gap-2">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-accent"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                  AGENTS
                </span>
                <span className="text-[10px] font-mono text-accent">
                  {agentCount}
                </span>
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-white/10" />

              {/* Timestamp */}
              <span className="text-[10px] font-mono text-text-muted">
                UTC {timestamp}
              </span>

              {/* Uptime */}
              <span className="text-[10px] font-mono text-text-muted">
                SYS_UPTIME: <span className="text-text-secondary">{formatUptime()}</span>
              </span>
            </div>
          </div>

          {/* Center: Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} active={pathname === item.href}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right: Deploy + Connect Agent + Wallet */}
          <div className="flex items-center gap-3">
            <Link href="/launch">
              <motion.span
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary hover:text-accent transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                Deploy
              </motion.span>
            </Link>

            {/* Connect Agent Button */}
            <motion.button
              onClick={() => setHudOpen(true)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded border transition-all ${
                hudOpen 
                  ? "bg-accent/10 border-accent/50 text-accent"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:border-accent/30 hover:text-accent"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Cpu size={14} strokeWidth={1.2} />
              <span className="text-[10px] font-mono uppercase tracking-wider hidden sm:inline">
                Connect Agent
              </span>
              
              {/* Shimmer border when active */}
              {hudOpen && (
                <motion.div
                  className="absolute inset-0 rounded border border-accent/50"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
            
            {/* Wallet Button with Shimmer */}
            <div className={`wallet-btn-wrapper ${connected ? 'wallet-connected' : ''}`}>
              <WalletMultiButton className="wallet-tactical-btn" />
            </div>
          </div>
        </nav>
      </header>

      {/* Agent HUD */}
      <AgentHUD isOpen={hudOpen} onClose={() => setHudOpen(false)} />
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <motion.div
        className="relative px-4 py-2"
        whileHover={{ scale: 1.05, z: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <span className={`text-xs font-mono uppercase tracking-wider transition-colors ${
          active ? "text-accent" : "text-text-muted hover:text-text-primary"
        }`}>
          {children}
        </span>
        
        {/* Glow underline on hover */}
        <motion.div
          className="absolute bottom-0 left-1/2 h-px bg-white/50"
          initial={{ width: 0, x: "-50%", opacity: 0 }}
          whileHover={{ 
            width: "80%", 
            opacity: 1,
            boxShadow: "0 0 20px rgba(255,255,255,0.5)"
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Active indicator */}
        {active && (
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
            layoutId="activeNav"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
}
