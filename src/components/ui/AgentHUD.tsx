"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Cpu, Send, Loader2, Compass, Trophy, CircleDollarSign, BarChart3, FileCode, Lock, Zap, Activity, AlertCircle } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname, useRouter } from "next/navigation";

interface AgentHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

// Format message content for terminal display
function formatTerminalOutput(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "[$1]")
    .replace(/###\s*/g, "> ")
    .replace(/##\s*/g, "> ")
    .replace(/#\s*/g, "> ");
}

export function AgentHUD({ isOpen, onClose }: AgentHUDProps) {
  const { connected, publicKey } = useWallet();
  const pathname = usePathname();
  const router = useRouter();
  const [simulationMode, setSimulationMode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use Vercel AI SDK's useChat hook (v3 API)
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit,
    isLoading,
    error,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      context: {
        walletConnected: connected,
        walletAddress: publicKey?.toString(),
        currentPage: pathname,
        simulationMode,
      },
    },
    onResponse: (response) => {
      const model = response.headers.get("X-Model-Name");
      if (model) setModelUsed(model);
    },
    onToolCall: async ({ toolCall }) => {
      // Handle navigation tool
      if (toolCall.toolName === "navigate") {
        const args = toolCall.args as { page: string; reason: string };
        router.push(args.page);
        return { navigated: true, to: args.page };
      }
      // showDocument just returns content, handled in message display
      return undefined;
    },
  });

  // Handle Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }, [handleSubmit]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && isInitializing) {
      const timer = setTimeout(() => {
        setMessages([
          {
            id: "init-1",
            role: "assistant",
            content: `> LOOP_REP ONLINE

Welcome to the Loop Protocol Ghost Window.

I'm your embedded AI guide to the value capture infrastructure.

**Context:**
${connected ? `• Wallet: ${publicKey?.toString().slice(0, 8)}...` : "• Wallet: Not connected"}
• Page: ${pathname}
• Mode: ${simulationMode ? "SIMULATION" : "LIVE"}

**Quick Commands:**
• "Explain Loop Protocol"
• "How do vaults work?"
• "Calculate staking yields"
• "Show me top agents"`,
          },
        ]);
        setIsInitializing(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isInitializing, connected, publicKey, pathname, simulationMode, setMessages]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setIsInitializing(true);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (isOpen && !isInitializing) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isInitializing]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* HUD Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-96 bg-zinc-950/95 backdrop-blur-3xl border-l border-white/5 z-50 flex flex-col scanlines overflow-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={simulationMode ? { filter: "sepia(0.15) saturate(1.3) hue-rotate(-20deg)" } : undefined}
          >
            {/* Simulation Overlay */}
            <AnimatePresence>
              {simulationMode && (
                <motion.div
                  className="absolute inset-0 pointer-events-none z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-amber-500/[0.03]" />
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                    <Cpu size={16} strokeWidth={1.5} className="text-accent" />
                  </div>
                  <motion.div 
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h2 className="text-xs font-mono font-semibold text-white">LOOP_REP</h2>
                  <p className="text-[9px] font-mono text-zinc-500">
                    {modelUsed || "Native Agent"} • {isLoading ? "typing..." : "ready"}
                  </p>
                </div>
              </div>
              
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Simulation Toggle */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-900/20">
              <div className="flex items-center gap-2">
                <Activity size={12} strokeWidth={1.5} className={simulationMode ? "text-amber-400" : "text-zinc-500"} />
                <span className="text-[9px] font-mono text-zinc-400">
                  {simulationMode ? "SIMULATION_MODE" : "LIVE_MODE"}
                </span>
              </div>
              <button
                onClick={() => setSimulationMode(!simulationMode)}
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  simulationMode ? "bg-amber-500/30 border border-amber-500/50" : "bg-zinc-800 border border-zinc-700"
                }`}
              >
                <motion.div
                  className={`absolute top-0.5 w-4 h-4 rounded-full ${simulationMode ? "bg-amber-400" : "bg-zinc-500"}`}
                  animate={{ left: simulationMode ? "calc(100% - 18px)" : "2px" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* OS Navigation */}
            <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/20">
              <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mb-2">[OS_NAV]</div>
              <div className="flex items-center gap-1">
                {[
                  { href: "/marketplace", label: "DISCOVER", icon: Compass },
                  { href: "/marketplace/leaderboard", label: "RANKINGS", icon: Trophy },
                  { href: "/marketplace/tokens", label: "TOKENS", icon: CircleDollarSign },
                  { href: "/marketplace/stats", label: "METRICS", icon: BarChart3 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <a key={item.label} href={item.href} className="flex-1 flex flex-col items-center gap-1 px-2 py-1.5 rounded border border-transparent hover:border-accent/30 hover:bg-accent/5 transition-all group">
                      <Icon size={12} strokeWidth={1.2} className="text-zinc-500 group-hover:text-accent transition-colors" />
                      <span className="text-[7px] font-mono text-zinc-600 group-hover:text-accent transition-colors">{item.label}</span>
                    </a>
                  );
                })}
              </div>
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5">
                {[
                  { href: "/docs", label: "SDK", icon: FileCode },
                  { href: "/security", label: "SECURITY", icon: Lock },
                  { href: "/launch", label: "DEPLOY", icon: Zap },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <a key={item.label} href={item.href} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded border border-white/5 bg-white/[0.02] hover:border-accent/30 hover:bg-accent/5 transition-all group">
                      <Icon size={10} strokeWidth={1.2} className="text-zinc-500 group-hover:text-accent transition-colors" />
                      <span className="text-[8px] font-mono text-zinc-500 group-hover:text-accent transition-colors">{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded bg-red-500/10 border border-red-500/30">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs font-mono text-red-400">{error.message || "Error"}</div>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={message.role === "user" ? "pl-8" : ""}
                >
                  {message.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 max-w-[85%]">
                        <p className="text-xs font-mono text-accent whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[8px] font-mono text-zinc-500">
                        <Terminal size={10} />
                        <span>LOOP_REP</span>
                      </div>
                      <div className="text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {formatTerminalOutput(message.content)}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                  <Loader2 size={12} className="animate-spin text-accent" />
                  <span>Processing...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-white/5 bg-zinc-900/30">
              <div className="flex items-center gap-2">
                <span className="text-accent font-mono text-xs">{">"}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask LOOP_REP..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white font-mono text-xs placeholder:text-zinc-600 outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-1.5 rounded bg-accent/10 hover:bg-accent/20 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? <Loader2 size={12} className="text-accent animate-spin" /> : <Send size={12} className="text-accent" />}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5 bg-zinc-900/30">
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-600">
                <span>Native Agent • Multi-Engine</span>
                <span>{connected ? `WALLET: ${publicKey?.toString().slice(0, 6)}...` : "NO_WALLET"}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
