"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Cpu, Check, Copy, Zap, ChevronRight, Radio, MessageSquare, Search, Shield } from "lucide-react";

interface LogEntry {
  id: number;
  text: string;
  type: "info" | "success" | "warning" | "command" | "active";
  timestamp: string;
}

interface AgentHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

type HUDState = "initializing" | "scanning" | "active";

const INIT_SEQUENCE: Omit<LogEntry, "id" | "timestamp">[] = [
  { text: "> INITIALIZING_HANDSHAKE...", type: "command" },
  { text: "  Connecting to Loop Protocol Mainnet", type: "info" },
  { text: "  Network latency: 24ms", type: "info" },
  { text: "> READING_LLMS_TXT...", type: "command" },
  { text: "  Fetching /llms.txt manifest", type: "info" },
  { text: "  Protocol version: 1.0.0", type: "info" },
  { text: "  Parsing SDK interface specifications", type: "info" },
  { text: "> SDK_FUNCTIONS_LOADED:", type: "command" },
  { text: "  [createVault] → Vault.initialize()", type: "success" },
  { text: "  [registerAgent] → Agents.register()", type: "success" },
  { text: "  [getVaultStats] → Vault.get()", type: "success" },
  { text: "  [stakeAgent] → Agents.subscribe()", type: "success" },
  { text: "> PROGRAM_ADDRESSES_VERIFIED:", type: "command" },
  { text: "  CRED: HYQJwCJ5wH9o4sb9sVP...aBaG", type: "info" },
  { text: "  VAULT: J8HhLeRv5iQaSyYQBXJ...SWQT", type: "info" },
  { text: "  SHOPPING: HiewKEBy6YVn3Xi5xd...teXJ", type: "info" },
  { text: "> STATUS: SCANNING_FOR_AGENT...", type: "warning" },
];

const ACTIVATION_SEQUENCE: Omit<LogEntry, "id" | "timestamp">[] = [
  { text: "> EXTERNAL_AGENT_TIMEOUT", type: "info" },
  { text: "  No external agent detected", type: "info" },
  { text: "> ACTIVATING_LOOP_GENESIS_REP...", type: "command" },
  { text: "  Loading system intelligence", type: "info" },
  { text: "  Capabilities: Protocol Guide, Market Scan, Security Audit", type: "success" },
  { text: "> ACTIVE_SESSION: LOOP_GENESIS_REP", type: "active" },
];

const SUGGESTED_ACTIONS = [
  { id: "01", label: "Explain Loop Protocol", icon: MessageSquare, description: "Learn how value capture works" },
  { id: "02", label: "Scan Marketplace for Alpha", icon: Search, description: "Find high-performing agents" },
  { id: "03", label: "Check Vault Security", icon: Shield, description: "Audit your vault policy" },
];

export function AgentHUD({ isOpen, onClose }: AgentHUDProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hudState, setHudState] = useState<HUDState>("initializing");
  const [nonce, setNonce] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const sequenceIndex = useRef(0);
  const activationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Generate nonce on open
  useEffect(() => {
    if (isOpen) {
      const newNonce = generateNonce();
      setNonce(newNonce);
    }
  }, [isOpen]);

  // Run initialization sequence when opened
  useEffect(() => {
    if (isOpen && hudState === "initializing") {
      sequenceIndex.current = 0;
      setLogs([]);
      
      const runSequence = () => {
        if (sequenceIndex.current < INIT_SEQUENCE.length) {
          const entry = INIT_SEQUENCE[sequenceIndex.current];
          const now = new Date();
          const timestamp = now.toISOString().slice(11, 19);
          
          setLogs(prev => [...prev, {
            id: Date.now(),
            text: entry.text,
            type: entry.type,
            timestamp,
          }]);
          
          sequenceIndex.current++;
          
          const delay = entry.type === "command" ? 400 : 
                       entry.type === "success" ? 200 : 150;
          setTimeout(runSequence, delay);
        } else {
          // Move to scanning state
          setHudState("scanning");
          
          // Set timeout for auto-activation
          activationTimeout.current = setTimeout(() => {
            runActivationSequence();
          }, 2000);
        }
      };
      
      setTimeout(runSequence, 500);
    }
    
    return () => {
      if (activationTimeout.current) {
        clearTimeout(activationTimeout.current);
      }
    };
  }, [isOpen, hudState]);

  // Run activation sequence
  const runActivationSequence = useCallback(() => {
    let index = 0;
    
    const runNext = () => {
      if (index < ACTIVATION_SEQUENCE.length) {
        const entry = ACTIVATION_SEQUENCE[index];
        const now = new Date();
        const timestamp = now.toISOString().slice(11, 19);
        
        setLogs(prev => [...prev, {
          id: Date.now() + index,
          text: entry.text,
          type: entry.type,
          timestamp,
        }]);
        
        index++;
        
        const delay = entry.type === "command" ? 400 : 
                     entry.type === "active" ? 500 : 150;
        setTimeout(runNext, delay);
      } else {
        setHudState("active");
      }
    };
    
    runNext();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setHudState("initializing");
      setLogs([]);
      sequenceIndex.current = 0;
      if (activationTimeout.current) {
        clearTimeout(activationTimeout.current);
      }
    }
  }, [isOpen]);

  // Broadcast capability event
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("loop:handshake", {
        detail: {
          manifest: "/llms.txt",
          version: "1.0.0",
          nonce,
          capabilities: ["createVault", "registerAgent", "getVaultStats", "stakeAgent"],
          programs: {
            CRED: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
            VAULT: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
            SHOPPING: "HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ",
          }
        }
      }));
    }
  }, [isOpen, nonce]);

  // Copy handshake JSON
  const copyHandshakeId = useCallback(() => {
    const handshakeJson = JSON.stringify({
      protocol: "loop",
      version: "1.0.0",
      nonce,
      manifest: "https://loop-site-v2.vercel.app/llms.txt",
      endpoint: "https://loop-site-v2.vercel.app/api/agent/handshake",
      challenge: `Sign this nonce to authenticate: ${nonce}`,
      programs: {
        CRED: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
        VAULT: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
        SHOPPING: "HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ",
      },
      instructions: "Paste this into your AI agent to connect to Loop Protocol. The agent should sign the nonce and POST to the endpoint."
    }, null, 2);
    
    navigator.clipboard.writeText(handshakeJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [nonce]);

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
            className="fixed top-0 right-0 bottom-0 w-96 bg-zinc-950/95 backdrop-blur-3xl border-l border-white/5 z-50 flex flex-col scanlines"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <Cpu size={12} strokeWidth={1.2} className="text-accent" />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  [COMMAND_INTERFACE_V1.0]
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={12} strokeWidth={1.5} className="text-zinc-500" />
              </button>
            </div>

            {/* Status Bar with Scanning Animation */}
            <div className="relative flex items-center gap-4 px-4 py-2 bg-zinc-900/50 border-b border-white/5 overflow-hidden">
              {/* Sonar Pulse Animation */}
              {hudState === "scanning" && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
              
              <div className="flex items-center gap-2 relative z-10">
                <motion.span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hudState === "active" ? "bg-accent" : 
                    hudState === "scanning" ? "bg-yellow-400" : "bg-zinc-600"
                  }`}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: hudState === "scanning" ? 0.5 : 1, repeat: Infinity }}
                />
                <span className="text-[9px] font-mono text-zinc-500 uppercase">
                  {hudState === "active" ? "ACTIVE" : hudState === "scanning" ? "SCANNING" : "INIT"}
                </span>
              </div>
              
              {hudState === "scanning" && (
                <div className="flex items-center gap-2 relative z-10">
                  <Radio size={10} strokeWidth={1.5} className="text-yellow-400" />
                  <span className="text-[9px] font-mono text-yellow-400">
                    LISTENING...
                  </span>
                </div>
              )}
              
              {hudState === "active" && (
                <div className="flex items-center gap-2 relative z-10">
                  <span className="text-[9px] font-mono text-accent">
                    LOOP_GENESIS_REP
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2 ml-auto relative z-10">
                <Zap size={10} strokeWidth={1.5} className="text-zinc-600" />
                <span className="text-[9px] font-mono text-zinc-500">
                  SDK v1.0.0
                </span>
              </div>
            </div>

            {/* System Log */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                <Terminal size={10} strokeWidth={1.5} className="text-zinc-600" />
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                  SYSTEM_LOG
                </span>
              </div>

              <div
                ref={logContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-[11px]"
              >
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-zinc-700 flex-shrink-0">{log.timestamp}</span>
                    <span className={getLogColor(log.type)}>{log.text}</span>
                  </motion.div>
                ))}
                
                {/* Cursor */}
                {hudState !== "active" && (
                  <motion.span
                    className="inline-block w-2 h-4 bg-accent"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </div>
            </div>

            {/* Suggested Actions (Active State Only) */}
            <AnimatePresence>
              {hudState === "active" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/5"
                >
                  <div className="p-4 space-y-2">
                    <div className="text-[8px] font-mono text-accent uppercase tracking-wider mb-3">
                      [SUGGESTED_ACTIONS]
                    </div>
                    
                    {SUGGESTED_ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <motion.button
                          key={action.id}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded border border-white/5 bg-white/[0.02] hover:border-accent/30 hover:bg-accent/5 transition-all group"
                          whileHover={{ x: 4 }}
                        >
                          <div className="w-6 h-6 rounded bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                            <Icon size={12} strokeWidth={1.2} className="text-zinc-500 group-hover:text-accent transition-colors" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-[10px] font-mono text-zinc-300 group-hover:text-accent transition-colors">
                              [{action.id}] {action.label}
                            </div>
                            <div className="text-[9px] text-zinc-600">
                              {action.description}
                            </div>
                          </div>
                          <ChevronRight size={12} strokeWidth={1.5} className="text-zinc-700 group-hover:text-accent transition-colors" />
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Panel (Non-Active State) */}
            {hudState !== "active" && (
              <div className="p-4 border-t border-white/5 space-y-3">
                <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mb-2">
                  [AGENT_ACTIONS]
                </div>
                
                <button
                  disabled={hudState !== "scanning"}
                  className="w-full flex items-center justify-between px-3 py-2 rounded border border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span>Authorize Agent</span>
                  <ChevronRight size={12} strokeWidth={1.5} />
                </button>

                <button
                  disabled={hudState !== "scanning"}
                  className="w-full flex items-center justify-between px-3 py-2 rounded border border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span>Execute Transaction</span>
                  <ChevronRight size={12} strokeWidth={1.5} />
                </button>
              </div>
            )}

            {/* Footer with Manual Connect */}
            <div className="px-4 py-3 border-t border-white/5 bg-zinc-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-mono text-zinc-700 uppercase">
                  NONCE: {nonce.slice(0, 8)}...
                </span>
                <span className="text-[8px] font-mono text-zinc-700">
                  loop:handshake
                </span>
              </div>
              
              {/* Copy Handshake ID */}
              <button
                onClick={copyHandshakeId}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-dashed border-zinc-800 hover:border-accent/30 hover:bg-accent/5 transition-all group"
              >
                {copied ? (
                  <>
                    <Check size={12} strokeWidth={1.5} className="text-accent" />
                    <span className="text-[9px] font-mono text-accent uppercase tracking-wider">
                      COPIED_TO_CLIPBOARD
                    </span>
                  </>
                ) : (
                  <>
                    <Copy size={12} strokeWidth={1.5} className="text-zinc-600 group-hover:text-accent transition-colors" />
                    <span className="text-[9px] font-mono text-zinc-600 group-hover:text-accent uppercase tracking-wider transition-colors">
                      COPY_HANDSHAKE_ID
                    </span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function getLogColor(type: LogEntry["type"]): string {
  switch (type) {
    case "command":
      return "text-accent";
    case "success":
      return "text-green-400";
    case "warning":
      return "text-yellow-400";
    case "active":
      return "text-accent font-bold";
    default:
      return "text-zinc-500";
  }
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for SSR
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
