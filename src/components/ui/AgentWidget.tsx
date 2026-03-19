"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Cpu, Send, Loader2, ChevronDown, Sparkles } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname, useRouter } from "next/navigation";

// Format message content for terminal display
function formatTerminalOutput(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "[$1]")
    .replace(/###\s*/g, "> ")
    .replace(/##\s*/g, "> ")
    .replace(/#\s*/g, "> ");
}

export function AgentWidget() {
  const { connected, publicKey } = useWallet();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use Vercel AI SDK's useChat hook
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
      },
    },
    onResponse: (response) => {
      const model = response.headers.get("X-Model-Name");
      if (model) setModelUsed(model);
    },
    onToolCall: async ({ toolCall }) => {
      // Handle navigation tool
      if (toolCall.toolName === "navigate" || toolCall.toolName === "mapsTo") {
        const args = toolCall.args as { page?: string; path?: string };
        const targetPath = args.page || args.path;
        if (targetPath) {
          router.push(targetPath);
          return { navigated: true, to: targetPath };
        }
      }
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

  // Initialize with welcome message on first open
  useEffect(() => {
    if (isOpen && !isInitialized) {
      setMessages([
        {
          id: "init-1",
          role: "assistant",
          content: `> LOOP_REP online\n\nI can calculate yields, simulate early exits, and navigate you anywhere. What do you need?`,
        },
      ]);
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized, setMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <>
      {/* Collapsed Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-xl bg-zinc-900/95 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black/50 hover:border-accent/50 hover:shadow-accent/20 transition-all group"
          >
            <Cpu size={20} strokeWidth={1.2} className="text-accent group-hover:scale-110 transition-transform" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-80 h-[420px] bg-zinc-950/98 border border-white/10 rounded-xl backdrop-blur-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Cpu size={14} strokeWidth={1.2} className="text-accent" />
                  <motion.div 
                    className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-semibold text-white">LOOP_REP</span>
                  <span className="text-[8px] font-mono text-zinc-500">
                    {modelUsed ? `• ${modelUsed.split(' ')[0]}` : "• ready"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                >
                  <ChevronDown size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {error && (
                <div className="text-[10px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
                  {error.message || "Connection error"}
                </div>
              )}

              {messages.map((message) => {
                const toolInvocations = (message as { toolInvocations?: Array<{ toolName: string; state: string; result?: { formatted?: string; summary?: string } }> }).toolInvocations;
                const toolResult = toolInvocations?.find(t => t.state === "result")?.result;
                const displayContent = message.content || toolResult?.formatted || toolResult?.summary || "";
                
                if (!displayContent && message.role === "assistant") return null;
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {message.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="bg-accent/15 border border-accent/20 rounded-lg px-2.5 py-1.5 max-w-[85%]">
                          <p className="text-[11px] font-mono text-accent">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[8px] font-mono text-zinc-600">
                          <Terminal size={8} />
                          <span>LOOP_REP</span>
                          {toolResult && <Sparkles size={8} className="text-accent" />}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-300 leading-relaxed pl-2 border-l border-zinc-800">
                          {formatTerminalOutput(displayContent)}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                  <Loader2 size={10} className="animate-spin text-accent" />
                  <span>Processing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-3 py-2.5 border-t border-white/5 bg-zinc-900/30">
              <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-2.5 py-1.5 border border-white/5 focus-within:border-accent/30 transition-colors">
                <span className="text-accent font-mono text-[10px]">{">"}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white font-mono text-[11px] placeholder:text-zinc-600 outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-1 rounded hover:bg-white/5 disabled:opacity-30 transition-colors"
                >
                  {isLoading ? (
                    <Loader2 size={12} className="text-accent animate-spin" />
                  ) : (
                    <Send size={12} className="text-accent" />
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="px-3 py-1.5 border-t border-white/5 bg-zinc-900/50">
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-600">
                <span>SDK • Multi-Engine</span>
                <span>{connected ? publicKey?.toString().slice(0, 6) + "..." : "no wallet"}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
