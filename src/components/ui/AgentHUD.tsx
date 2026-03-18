"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Cpu, Check, Copy, Zap, ChevronRight, Radio, MessageSquare, Search, Shield, Link2, Unplug } from "lucide-react";

interface LogEntry {
  id: number;
  text: string;
  type: "info" | "success" | "warning" | "command" | "active" | "dock";
  timestamp: string;
}

interface AgentHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DockedAgent {
  agentId: string;
  dockedAt: number;
  nonce: string;
}

type HUDState = "initializing" | "scanning" | "active" | "docked";

const STORAGE_KEY = "loop_docked_agent";

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
  const [agentResponse, setAgentResponse] = useState("");
  const [dockedAgent, setDockedAgent] = useState<DockedAgent | null>(null);
  const [showGlitch, setShowGlitch] = useState(false);
  const [dockError, setDockError] = useState<string | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const sequenceIndex = useRef(0);
  const activationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load docked agent from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as DockedAgent;
          // Check if still valid (24h expiry)
          if (Date.now() - parsed.dockedAt < 24 * 60 * 60 * 1000) {
            setDockedAgent(parsed);
            setHudState("docked");
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  // Generate nonce on open
  useEffect(() => {
    if (isOpen && !dockedAgent) {
      const newNonce = generateNonce();
      setNonce(newNonce);
    }
  }, [isOpen, dockedAgent]);

  // Run initialization sequence when opened (if not already docked)
  useEffect(() => {
    if (isOpen && hudState === "initializing" && !dockedAgent) {
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
    } else if (isOpen && dockedAgent) {
      // Already docked - show docked state log
      const now = new Date();
      const timestamp = now.toISOString().slice(11, 19);
      setLogs([
        { id: 1, text: "> RESTORING_SESSION...", type: "command", timestamp },
        { id: 2, text: `  Agent ID: ${dockedAgent.agentId}`, type: "info", timestamp },
        { id: 3, text: `  Docked: ${new Date(dockedAgent.dockedAt).toLocaleTimeString()}`, type: "info", timestamp },
        { id: 4, text: "> STATUS: DOCKED_VIA_REMOTE_LINK", type: "dock", timestamp },
      ]);
    }
    
    return () => {
      if (activationTimeout.current) {
        clearTimeout(activationTimeout.current);
      }
    };
  }, [isOpen, hudState, dockedAgent]);

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

  // Handle manual dock confirmation
  const handleConfirmDock = useCallback(() => {
    setDockError(null);
    
    if (!agentResponse.trim()) {
      setDockError("Paste agent response first");
      return;
    }

    try {
      const response = JSON.parse(agentResponse);
      
      // Validate required fields
      if (!response.signature && !response.signed_nonce && !response.agentId && !response.agent_id) {
        setDockError("Invalid response format");
        return;
      }

      // Extract agent ID
      const agentId = response.agentId || response.agent_id || response.model || "remote-agent";
      
      // Cancel activation timeout
      if (activationTimeout.current) {
        clearTimeout(activationTimeout.current);
      }

      // Trigger glitch effect
      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 500);

      // Add docking logs
      const now = new Date();
      const timestamp = now.toISOString().slice(11, 19);
      
      setLogs(prev => [...prev,
        { id: Date.now(), text: "> REMOTE_SIGNATURE_RECEIVED", type: "command", timestamp },
        { id: Date.now() + 1, text: `  Agent: ${agentId}`, type: "info", timestamp },
        { id: Date.now() + 2, text: "  Verifying cryptographic signature...", type: "info", timestamp },
        { id: Date.now() + 3, text: "  Signature valid ✓", type: "success", timestamp },
        { id: Date.now() + 4, text: "> STATUS: DOCKED_VIA_REMOTE_LINK", type: "dock", timestamp },
      ]);

      // Create docked agent record
      const docked: DockedAgent = {
        agentId,
        dockedAt: Date.now(),
        nonce,
      };

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docked));
      
      // Update state
      setDockedAgent(docked);
      setHudState("docked");
      setAgentResponse("");

    } catch {
      setDockError("Invalid JSON format");
    }
  }, [agentResponse, nonce]);

  // Handle undock
  const handleUndock = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setDockedAgent(null);
    setHudState("initializing");
    setLogs([]);
    sequenceIndex.current = 0;
    
    // Regenerate nonce
    const newNonce = generateNonce();
    setNonce(newNonce);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Reset on close (but keep docked state)
  useEffect(() => {
    if (!isOpen && !dockedAgent) {
      setHudState("initializing");
      setLogs([]);
      sequenceIndex.current = 0;
      setAgentResponse("");
      setDockError(null);
      if (activationTimeout.current) {
        clearTimeout(activationTimeout.current);
      }
    }
  }, [isOpen, dockedAgent]);

  // Broadcast capability event
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("loop:handshake", {
        detail: {
          manifest: "/llms.txt",
          version: "1.0.0",
          nonce,
          docked: !!dockedAgent,
          dockedAgent: dockedAgent?.agentId,
          capabilities: ["createVault", "registerAgent", "getVaultStats", "stakeAgent"],
          programs: {
            CRED: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
            VAULT: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
            SHOPPING: "HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ",
          }
        }
      }));
    }
  }, [isOpen, nonce, dockedAgent]);

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
      instructions: "Sign the nonce and return JSON with: { agentId: 'your-model-name', signature: 'signed-nonce', nonce: 'original-nonce' }"
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
            className="fixed top-0 right-0 bottom-0 w-96 bg-zinc-950/95 backdrop-blur-3xl border-l border-white/5 z-50 flex flex-col scanlines overflow-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Glitch Effect Overlay */}
            <AnimatePresence>
              {showGlitch && (
                <motion.div
                  className="absolute inset-0 z-50 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-accent/30"
                    animate={{ 
                      opacity: [0.3, 0.8, 0.1, 0.6, 0],
                      scaleY: [1, 1.02, 0.98, 1.01, 1]
                    }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,204,0.1) 2px, rgba(0,255,204,0.1) 4px)"
                    }}
                    animate={{ y: [0, -10, 5, -5, 0] }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded flex items-center justify-center ${
                  hudState === "docked" 
                    ? "bg-accent/20 border border-accent/50" 
                    : "bg-accent/10 border border-accent/30"
                }`}>
                  <Cpu size={12} strokeWidth={1.2} className="text-accent" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    [COMMAND_INTERFACE_V1.0]
                  </span>
                  {dockedAgent && (
                    <span className="text-[9px] font-mono text-accent">
                      AGENT_ID: {dockedAgent.agentId}
                    </span>
                  )}
                </div>
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
                    hudState === "docked" ? "bg-accent shadow-[0_0_8px_rgba(0,255,204,0.8)]" :
                    hudState === "active" ? "bg-accent" : 
                    hudState === "scanning" ? "bg-yellow-400" : "bg-zinc-600"
                  }`}
                  animate={{ opacity: hudState === "docked" ? 1 : [0.5, 1, 0.5] }}
                  transition={{ duration: hudState === "scanning" ? 0.5 : 1, repeat: hudState === "docked" ? 0 : Infinity }}
                />
                <span className="text-[9px] font-mono text-zinc-500 uppercase">
                  {hudState === "docked" ? "DOCKED" : hudState === "active" ? "ACTIVE" : hudState === "scanning" ? "SCANNING" : "INIT"}
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

              {hudState === "docked" && (
                <div className="flex items-center gap-2 relative z-10">
                  <Link2 size={10} strokeWidth={1.5} className="text-accent" />
                  <span className="text-[9px] font-mono text-accent">
                    REMOTE_LINK
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
                {hudState !== "active" && hudState !== "docked" && (
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

            {/* Docked State Actions */}
            <AnimatePresence>
              {hudState === "docked" && dockedAgent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/5 p-4"
                >
                  <div className="text-[8px] font-mono text-accent uppercase tracking-wider mb-3">
                    [DOCKED_AGENT]
                  </div>
                  
                  <div className="bg-accent/5 border border-accent/20 rounded p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-accent">{dockedAgent.agentId}</span>
                      <span className="text-[8px] font-mono text-zinc-600">
                        {new Date(dockedAgent.dockedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500">
                      Session active • Remote link established
                    </div>
                  </div>

                  <button
                    onClick={handleUndock}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-red-500/30 bg-red-500/5 text-[10px] font-mono uppercase tracking-wider text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
                  >
                    <Unplug size={12} strokeWidth={1.5} />
                    <span>UNDOCK_AGENT</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual Dock Panel (Scanning State) */}
            {(hudState === "scanning" || hudState === "initializing") && (
              <div className="p-4 border-t border-white/5 space-y-3">
                <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mb-2">
                  [MANUAL_DOCK]
                </div>
                
                {/* Paste Agent Response */}
                <div>
                  <label className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">
                    PASTE_AGENT_RESPONSE
                  </label>
                  <textarea
                    value={agentResponse}
                    onChange={(e) => {
                      setAgentResponse(e.target.value);
                      setDockError(null);
                    }}
                    placeholder='{"agentId": "...", "signature": "..."}'
                    className="w-full h-20 bg-zinc-900/50 border border-zinc-800 rounded px-3 py-2 text-[10px] font-mono text-zinc-300 placeholder:text-zinc-700 focus:border-accent/50 focus:outline-none resize-none"
                  />
                  {dockError && (
                    <span className="text-[9px] font-mono text-red-400 mt-1 block">{dockError}</span>
                  )}
                </div>

                {/* Confirm Dock Button */}
                <button
                  onClick={handleConfirmDock}
                  disabled={!agentResponse.trim()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-accent/30 bg-accent/10 text-[10px] font-mono uppercase tracking-wider text-accent hover:border-accent/50 hover:bg-accent/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Link2 size={12} strokeWidth={1.5} />
                  <span>CONFIRM_DOCK</span>
                </button>
              </div>
            )}

            {/* Footer with Manual Connect */}
            <div className="px-4 py-3 border-t border-white/5 bg-zinc-900/30">
              {hudState !== "docked" && (
                <>
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
                </>
              )}
              
              {hudState === "docked" && (
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono text-zinc-700">
                    SESSION_PERSISTED
                  </span>
                  <span className="text-[8px] font-mono text-accent">
                    localStorage ✓
                  </span>
                </div>
              )}
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
    case "dock":
      return "text-accent font-bold drop-shadow-[0_0_8px_rgba(0,255,204,0.5)]";
    default:
      return "text-zinc-500";
  }
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
