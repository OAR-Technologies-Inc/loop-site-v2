"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Cpu, Check, AlertCircle, Zap, ChevronRight } from "lucide-react";

interface LogEntry {
  id: number;
  text: string;
  type: "info" | "success" | "warning" | "command";
  timestamp: string;
}

interface AgentHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  { text: "> STATUS: STANDING_BY_FOR_USER_AGENT", type: "warning" },
  { text: "  Awaiting external agent connection...", type: "info" },
];

export function AgentHUD({ isOpen, onClose }: AgentHUDProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const sequenceIndex = useRef(0);

  // Run initialization sequence when opened
  useEffect(() => {
    if (isOpen && !isInitialized) {
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
          
          // Variable delay for dramatic effect
          const delay = entry.type === "command" ? 400 : 
                       entry.type === "success" ? 200 : 150;
          setTimeout(runSequence, delay);
        } else {
          setIsInitialized(true);
        }
      };
      
      setTimeout(runSequence, 500);
    }
  }, [isOpen, isInitialized]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
    }
  }, [isOpen]);

  // Broadcast capability event
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("loop:handshake", {
        detail: {
          manifest: "/llms.txt",
          version: "1.0.0",
          capabilities: ["createVault", "registerAgent", "getVaultStats", "stakeAgent"],
          programs: {
            CRED: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
            VAULT: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
            SHOPPING: "HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ",
          }
        }
      }));
    }
  }, [isOpen]);

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

            {/* Status Bar */}
            <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/50 border-b border-white/5">
              <div className="flex items-center gap-2">
                <motion.span
                  className={`w-1.5 h-1.5 rounded-full ${isInitialized ? "bg-accent" : "bg-warning"}`}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-[9px] font-mono text-zinc-500 uppercase">
                  {isInitialized ? "READY" : "INIT"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={10} strokeWidth={1.5} className="text-zinc-600" />
                <span className="text-[9px] font-mono text-zinc-500">
                  SDK v1.0.0
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[9px] font-mono text-zinc-600">
                  MAINNET
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
                {!isInitialized && (
                  <motion.span
                    className="inline-block w-2 h-4 bg-accent"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </div>
            </div>

            {/* Action Panel */}
            <div className="p-4 border-t border-white/5 space-y-3">
              <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mb-2">
                [AGENT_ACTIONS]
              </div>
              
              <button
                disabled={!isInitialized}
                className="w-full flex items-center justify-between px-3 py-2 rounded border border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>Authorize Agent</span>
                <ChevronRight size={12} strokeWidth={1.5} />
              </button>

              <button
                disabled={!isInitialized}
                className="w-full flex items-center justify-between px-3 py-2 rounded border border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>Execute Transaction</span>
                <ChevronRight size={12} strokeWidth={1.5} />
              </button>

              <button
                disabled={!isInitialized}
                className="w-full flex items-center justify-between px-3 py-2 rounded border border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>Query Protocol State</span>
                <ChevronRight size={12} strokeWidth={1.5} />
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5 bg-zinc-900/30">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-zinc-700">
                  BYOA_INTERFACE
                </span>
                <span className="text-[8px] font-mono text-zinc-700">
                  loop:handshake dispatched
                </span>
              </div>
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
    default:
      return "text-zinc-500";
  }
}
