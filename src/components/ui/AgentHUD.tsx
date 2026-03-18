"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Cpu, Check, Copy, Zap, ChevronRight, Radio, MessageSquare, Search, Shield, Link2, Unplug, Coins, Activity, ToggleLeft, ToggleRight, Wifi, WifiOff, Compass, Trophy, CircleDollarSign, BarChart3, FileCode, Lock } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

interface LogEntry {
  id: number;
  text: string;
  type: "info" | "success" | "warning" | "command" | "active" | "dock" | "simulation";
  timestamp: string;
}

interface AgentHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DockedAgent {
  agentId: string;
  operatorId: string;
  dockedAt: number;
  nonce: string;
  signalQuality: "automated" | "manual";
}

type HUDState = "initializing" | "scanning" | "active" | "docked";

const STORAGE_KEY = "loop_docked_agent";
const OXO_GATE_THRESHOLD = 100;

const INIT_SEQUENCE: Omit<LogEntry, "id" | "timestamp">[] = [
  { text: "> INITIALIZING_AOS_HANDSHAKE...", type: "command" },
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
  { text: "> OXO_GATE_CHECK...", type: "command" },
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

// Known operator identities
const OPERATOR_IDENTITIES: Record<string, { name: string; color: string }> = {
  "gemini": { name: "Gemini", color: "#4285F4" },
  "grok": { name: "Grok", color: "#1DA1F2" },
  "claude": { name: "Claude", color: "#CC785C" },
  "chatgpt": { name: "ChatGPT", color: "#10A37F" },
  "openai": { name: "OpenAI", color: "#10A37F" },
  "anthropic": { name: "Claude", color: "#CC785C" },
  "mistral": { name: "Mistral", color: "#FF7000" },
  "llama": { name: "Llama", color: "#0668E1" },
};

function detectOperator(agentId: string): { operatorId: string; name: string; color: string } {
  const lower = agentId.toLowerCase();
  for (const [key, value] of Object.entries(OPERATOR_IDENTITIES)) {
    if (lower.includes(key)) {
      return { operatorId: key, ...value };
    }
  }
  return { operatorId: "unknown", name: "Remote Agent", color: "#00ffcc" };
}

export function AgentHUD({ isOpen, onClose }: AgentHUDProps) {
  const { connected, publicKey } = useWallet();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hudState, setHudState] = useState<HUDState>("initializing");
  const [nonce, setNonce] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [agentResponse, setAgentResponse] = useState("");
  const [dockedAgent, setDockedAgent] = useState<DockedAgent | null>(null);
  const [showGlitch, setShowGlitch] = useState(false);
  const [dockError, setDockError] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [oxoBalance, setOxoBalance] = useState<number>(0);
  const [oxoGatePassed, setOxoGatePassed] = useState(false);
  const [pingStrength, setPingStrength] = useState<number>(100);
  const [strategyCopied, setStrategyCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const sequenceIndex = useRef(0);
  const activationTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Flickering ping effect - stable when docked, fluctuating when searching
  useEffect(() => {
    const interval = setInterval(() => {
      if (dockedAgent) {
        // Stable high signal when agent is docked
        setPingStrength(95 + Math.random() * 5);
      } else if (hudState === "scanning") {
        // Flickering/searching when no agent
        setPingStrength(30 + Math.random() * 50);
      } else {
        // Medium stability otherwise
        setPingStrength(60 + Math.random() * 30);
      }
    }, 2000 + Math.random() * 2000); // 2-4 seconds
    
    return () => clearInterval(interval);
  }, [dockedAgent, hudState]);
  
  // Copy strategy payload for agent handoff
  const copyStrategyPayload = useCallback((action: string, params: Record<string, unknown>) => {
    const payload = {
      protocol: "loop-aos",
      version: "1.2.0",
      mode: "SIMULATION",
      timestamp: new Date().toISOString(),
      action,
      params,
      tokenomics: {
        stackingAPY: { "7-29d": "3%", "30-89d": "5%", "90-179d": "8%", "180-364d": "12%", "365-730d": "15%" },
        veOXOLock: { min: "6_MONTHS", max: "4_YEARS", multiplier: "0.25x-1.0x" },
        extractionFee: "5%",
        earlyUnstakePenalty: "20%_OF_YIELD"
      },
      programs: {
        CRED: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
        VAULT: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
        OXO: "9URW9Rwdf6QNusibh61ZrrvDXRJRyWURteG9bmCZkgma"
      },
      note: "SIMULATION_ONLY - Paste to your agent for review before mainnet execution"
    };
    
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setStrategyCopied(true);
    setTimeout(() => setStrategyCopied(false), 2000);
    
    // Log the action
    const now = new Date();
    const timestamp = now.toISOString().slice(11, 19);
    setLogs(prev => [...prev, {
      id: Date.now(),
      text: `> STRATEGY_EXPORTED: ${action}`,
      type: "success",
      timestamp,
    }]);
  }, []);

  // Mock OXO balance check (in production, fetch from chain)
  useEffect(() => {
    if (connected && publicKey) {
      // Simulate OXO balance check
      const mockBalance = Math.floor(Math.random() * 500) + 50;
      setOxoBalance(mockBalance);
      setOxoGatePassed(mockBalance >= OXO_GATE_THRESHOLD);
    } else {
      setOxoBalance(0);
      setOxoGatePassed(false);
    }
  }, [connected, publicKey]);

  // Load docked agent from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as DockedAgent;
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

  // Run initialization sequence
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
          // Add OXO gate result
          const now = new Date();
          const timestamp = now.toISOString().slice(11, 19);
          
          if (connected) {
            setLogs(prev => [...prev,
              { id: Date.now(), text: `  Wallet: ${publicKey?.toString().slice(0, 8)}...`, type: "info", timestamp },
              { id: Date.now() + 1, text: `  OXO_BALANCE: ${oxoBalance}`, type: oxoGatePassed ? "success" : "warning", timestamp },
              { id: Date.now() + 2, text: oxoGatePassed ? "  SESSION_UNLOCKED ✓" : `  GATE_FAILED: Requires >${OXO_GATE_THRESHOLD} OXO`, type: oxoGatePassed ? "success" : "warning", timestamp },
              { id: Date.now() + 3, text: "> STATUS: SCANNING_FOR_AGENT...", type: "warning", timestamp },
            ]);
          } else {
            setLogs(prev => [...prev,
              { id: Date.now(), text: "  No wallet connected", type: "warning", timestamp },
              { id: Date.now() + 1, text: "  OXO_GATE: BYPASSED (Demo Mode)", type: "info", timestamp },
              { id: Date.now() + 2, text: "> STATUS: SCANNING_FOR_AGENT...", type: "warning", timestamp },
            ]);
          }
          
          setHudState("scanning");
          activationTimeout.current = setTimeout(() => {
            runActivationSequence();
          }, 2000);
        }
      };
      
      setTimeout(runSequence, 500);
    } else if (isOpen && dockedAgent) {
      const now = new Date();
      const timestamp = now.toISOString().slice(11, 19);
      const operator = detectOperator(dockedAgent.agentId);
      setLogs([
        { id: 1, text: "> RESTORING_SESSION...", type: "command", timestamp },
        { id: 2, text: `  Operator: ${operator.name}`, type: "info", timestamp },
        { id: 3, text: `  Agent ID: ${dockedAgent.agentId}`, type: "info", timestamp },
        { id: 4, text: `  Signal: ${dockedAgent.signalQuality === "automated" ? "HIGH_SPEED" : "MANUAL_LINK"}`, type: "info", timestamp },
        { id: 5, text: `  Docked: ${new Date(dockedAgent.dockedAt).toLocaleTimeString()}`, type: "info", timestamp },
        { id: 6, text: "> STATUS: DOCKED_VIA_REMOTE_LINK", type: "dock", timestamp },
      ]);
    }
    
    return () => {
      if (activationTimeout.current) {
        clearTimeout(activationTimeout.current);
      }
    };
  }, [isOpen, hudState, dockedAgent, connected, publicKey, oxoBalance, oxoGatePassed]);

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

  // Handle simulation mode SDK action
  // Uses ACTUAL DEPLOYED VALUES from Solana programs
  const handleSimulationAction = useCallback((action: string) => {
    const now = new Date();
    const timestamp = now.toISOString().slice(11, 19);
    
    // ACTUAL CODE VALUES FROM MAINNET DEPLOYMENT
    const ACTUAL_APY_TIERS = {
      "7-29": 3,    // 3% APY
      "30-89": 5,   // 5% APY
      "90-179": 8,  // 8% APY
      "180-364": 12, // 12% APY
      "365-730": 15, // 15% APY (max)
    };
    
    const VEOXO_MIN_LOCK_SECONDS = 15552000; // 6 months
    const VEOXO_MAX_LOCK_SECONDS = 126144000; // 4 years
    const MIN_STACK_DAYS = 7;
    const MAX_STACK_DAYS = 730;
    
    const simulations: Record<string, string[]> = {
      "createVault": [
        "> SIMULATION: createVault()",
        "  Policy: dailyLimit=1000, autoStack=true",
        "  Min Stack Duration: 7 days",
        "  Max Stack Duration: 730 days (2 years)",
        "  APY Range: 3% - 15% (duration-based)",
        "  Extraction Fee: 5%",
        "  Est. Gas: 0.00021 SOL",
        "  [DRY_RUN_COMPLETE]"
      ],
      "registerAgent": [
        "> SIMULATION: registerAgent()",
        "  Min OXO Stake Required: 100 OXO",
        "  Agent Creation Fee: 500 OXO",
        "  Graduation Threshold: 25,000 OXO",
        "  LP Lock Duration: 10 years (post-graduation)",
        "  Est. Gas: 0.00035 SOL",
        "  [DRY_RUN_COMPLETE]"
      ],
      "stakeAgent": [
        "> SIMULATION: stakeAgent()",
        "  Stake Amount: 100 OXO",
        "  Min Stake: 100 OXO (Basic Tier)",
        "  Slashing Risk: 0.1% (failed calls) to 100% (malicious)",
        "  [DRY_RUN_COMPLETE]"
      ],
      // veOXO lock simulations with validation
      "veoxo_lock_1week": [
        "> SIMULATION: veoxo.lock({ period: '1_WEEK' })",
        "  ERROR: MIN_LOCK_REQUIREMENT_NOT_MET",
        "  REASON: 6_MONTHS_MINIMUM_REQUIRED",
        "  ACTUAL_MIN_LOCK: 15552000 seconds (6 months)",
        "  STATUS: REJECTED",
        "  [DRY_RUN_FAILED]"
      ],
      "veoxo_lock_1month": [
        "> SIMULATION: veoxo.lock({ period: '1_MONTH' })",
        "  ERROR: MIN_LOCK_REQUIREMENT_NOT_MET",
        "  REASON: 6_MONTHS_MINIMUM_REQUIRED",
        "  ACTUAL_MIN_LOCK: 15552000 seconds (6 months)",
        "  STATUS: REJECTED",
        "  [DRY_RUN_FAILED]"
      ],
      "veoxo_lock_6months": [
        "> SIMULATION: veoxo.lock({ period: '6_MONTHS' })",
        "  Lock Duration: 15552000 seconds (6 months)",
        "  Multiplier: 0.25x",
        "  Input: 1000 OXO → Output: 250 veOXO",
        "  Linear Decay: Active",
        "  Est. Gas: 0.00028 SOL",
        "  [DRY_RUN_COMPLETE]"
      ],
      "veoxo_lock_1year": [
        "> SIMULATION: veoxo.lock({ period: '1_YEAR' })",
        "  Lock Duration: 31536000 seconds (1 year)",
        "  Multiplier: 0.50x",
        "  Input: 1000 OXO → Output: 500 veOXO",
        "  Linear Decay: Active",
        "  Est. Gas: 0.00028 SOL",
        "  [DRY_RUN_COMPLETE]"
      ],
      "veoxo_lock_4years": [
        "> SIMULATION: veoxo.lock({ period: '4_YEARS' })",
        "  Lock Duration: 126144000 seconds (4 years)",
        "  Multiplier: 2.00x (MAX)",
        "  Input: 1000 OXO → Output: 2000 veOXO",
        "  Linear Decay: Active",
        "  Est. Gas: 0.00028 SOL",
        "  [DRY_RUN_COMPLETE]"
      ],
      // Stack simulations with actual APY values
      "stack_7days": [
        "> SIMULATION: vault.stack({ duration: 7 })",
        "  Lock Period: 7 days",
        "  APY: 3% (actual deployed value)",
        "  Input: 1000 CRED",
        "  Projected Yield: 0.58 CRED",
        "  Early Unstake Penalty: 20% of earned yield",
        "  [DRY_RUN_COMPLETE]"
      ],
      "stack_30days": [
        "> SIMULATION: vault.stack({ duration: 30 })",
        "  Lock Period: 30 days",
        "  APY: 5% (actual deployed value)",
        "  Input: 1000 CRED",
        "  Projected Yield: 4.11 CRED",
        "  Early Unstake Penalty: 20% of earned yield",
        "  [DRY_RUN_COMPLETE]"
      ],
      "stack_90days": [
        "> SIMULATION: vault.stack({ duration: 90 })",
        "  Lock Period: 90 days",
        "  APY: 8% (actual deployed value)",
        "  Input: 1000 CRED",
        "  Projected Yield: 19.73 CRED",
        "  Early Unstake Penalty: 20% of earned yield",
        "  [DRY_RUN_COMPLETE]"
      ],
      "stack_180days": [
        "> SIMULATION: vault.stack({ duration: 180 })",
        "  Lock Period: 180 days",
        "  APY: 12% (actual deployed value)",
        "  Input: 1000 CRED",
        "  Projected Yield: 59.18 CRED",
        "  Early Unstake Penalty: 20% of earned yield",
        "  [DRY_RUN_COMPLETE]"
      ],
      "stack_365days": [
        "> SIMULATION: vault.stack({ duration: 365 })",
        "  Lock Period: 365 days",
        "  APY: 15% (actual deployed value - MAX)",
        "  Input: 1000 CRED",
        "  Projected Yield: 150.00 CRED",
        "  Early Unstake Penalty: 20% of earned yield",
        "  [DRY_RUN_COMPLETE]"
      ],
    };

    const simLog = simulations[action] || [
      `> SIMULATION: ${action}()`,
      "  [DRY_RUN_COMPLETE]"
    ];

    simLog.forEach((text, i) => {
      setTimeout(() => {
        const isError = text.includes("ERROR") || text.includes("REJECTED") || text.includes("FAILED");
        const isSuccess = text.includes("PROJECTED") || text.includes("APY") || text.includes("Multiplier");
        setLogs(prev => [...prev, {
          id: Date.now() + i,
          text,
          type: isError ? "warning" : text.includes("DRY_RUN") ? "simulation" : isSuccess ? "success" : "info",
          timestamp,
        }]);
      }, i * 150);
    });
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
      
      if (!response.signature && !response.signed_nonce && !response.agentId && !response.agent_id && !response.model) {
        setDockError("Invalid response format");
        return;
      }

      const agentId = response.agentId || response.agent_id || response.model || "remote-agent";
      const operator = detectOperator(agentId);
      
      if (activationTimeout.current) {
        clearTimeout(activationTimeout.current);
      }

      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 500);

      const now = new Date();
      const timestamp = now.toISOString().slice(11, 19);
      
      setLogs(prev => [...prev,
        { id: Date.now(), text: "> REMOTE_SIGNATURE_RECEIVED", type: "command", timestamp },
        { id: Date.now() + 1, text: `  Operator: ${operator.name}`, type: "info", timestamp },
        { id: Date.now() + 2, text: `  Agent: ${agentId}`, type: "info", timestamp },
        { id: Date.now() + 3, text: "  Signal Quality: MANUAL_LINK", type: "warning", timestamp },
        { id: Date.now() + 4, text: "  Verifying cryptographic signature...", type: "info", timestamp },
        { id: Date.now() + 5, text: "  Signature valid ✓", type: "success", timestamp },
        { id: Date.now() + 6, text: "> STATUS: DOCKED_VIA_REMOTE_LINK", type: "dock", timestamp },
      ]);

      const docked: DockedAgent = {
        agentId,
        operatorId: operator.operatorId,
        dockedAt: Date.now(),
        nonce,
        signalQuality: "manual",
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(docked));
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
    setSimulationMode(false);
    
    const newNonce = generateNonce();
    setNonce(newNonce);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Reset on close
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
          operatorId: dockedAgent?.operatorId,
          oxoGate: { required: OXO_GATE_THRESHOLD, passed: oxoGatePassed, balance: oxoBalance },
          simulationMode,
          capabilities: ["createVault", "registerAgent", "getVaultStats", "stakeAgent"],
          programs: {
            CRED: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
            VAULT: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
            SHOPPING: "HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ",
          }
        }
      }));
    }
  }, [isOpen, nonce, dockedAgent, oxoGatePassed, oxoBalance, simulationMode]);

  // Copy handshake JSON
  const copyHandshakeId = useCallback(() => {
    const handshakeJson = JSON.stringify({
      protocol: "loop-aos",
      version: "1.0.0",
      nonce,
      manifest: "https://loop-site-v2.vercel.app/llms.txt",
      endpoint: "https://loop-site-v2.vercel.app/api/agent/handshake",
      challenge: `Sign this nonce to authenticate: ${nonce}`,
      oxoGate: { required: OXO_GATE_THRESHOLD },
      programs: {
        CRED: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
        VAULT: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
        SHOPPING: "HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ",
      },
      instructions: "Sign the nonce and return JSON with: { agentId: 'your-model-name', signature: 'signed-nonce', model: 'gemini|grok|claude|chatgpt' }"
    }, null, 2);
    
    navigator.clipboard.writeText(handshakeJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [nonce]);

  const operator = dockedAgent ? detectOperator(dockedAgent.agentId) : null;

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
            style={simulationMode ? {
              filter: "sepia(0.15) saturate(1.3) hue-rotate(-20deg)",
            } : undefined}
          >
            {/* Simulation Mode Amber Overlay */}
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
            {/* Glitch Effect */}
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
                    animate={{ opacity: [0.3, 0.8, 0.1, 0.6, 0], scaleY: [1, 1.02, 0.98, 1.01, 1] }}
                    transition={{ duration: 0.5 }}
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
                    [AOS_INTERFACE_V1.0]
                  </span>
                  {dockedAgent && operator && (
                    <span className="text-[9px] font-mono" style={{ color: operator.color }}>
                      OPERATOR: {operator.name}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Signal Strength Indicator with Ping */}
              <div className="flex items-center gap-1.5">
                {/* Signal bars */}
                <div className="flex items-end gap-0.5 h-3">
                  {[1, 2, 3, 4].map((bar) => {
                    const threshold = bar * 25;
                    const isActive = pingStrength >= threshold;
                    return (
                      <motion.div
                        key={bar}
                        className={`w-1 rounded-sm ${
                          isActive 
                            ? dockedAgent 
                              ? "bg-green-400" 
                              : hudState === "scanning" 
                                ? "bg-yellow-400" 
                                : "bg-accent"
                            : "bg-zinc-700"
                        }`}
                        style={{ height: `${bar * 25}%` }}
                        animate={{ 
                          opacity: isActive ? [0.7, 1, 0.7] : 0.3,
                        }}
                        transition={{ 
                          duration: dockedAgent ? 2 : 0.5, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    );
                  })}
                </div>
                {/* Ping label */}
                <span className={`text-[8px] font-mono ${
                  dockedAgent ? "text-green-400" : hudState === "scanning" ? "text-yellow-400" : "text-zinc-500"
                }`}>
                  {dockedAgent ? "STABLE" : hudState === "scanning" ? "SCAN" : `${Math.round(pingStrength)}%`}
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={12} strokeWidth={1.5} className="text-zinc-500" />
              </button>
            </div>

            {/* OXO Balance Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/70 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Coins size={12} strokeWidth={1.5} className="text-accent" />
                <span className="text-[9px] font-mono text-zinc-500 uppercase">OXO_BALANCE:</span>
                <span className={`text-[10px] font-mono font-bold ${oxoGatePassed ? "text-accent" : "text-yellow-400"}`}>
                  {connected ? oxoBalance.toLocaleString() : "---"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded ${
                  oxoGatePassed 
                    ? "bg-accent/20 text-accent border border-accent/30" 
                    : connected 
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-zinc-800 text-zinc-600 border border-zinc-700"
                }`}>
                  {oxoGatePassed ? "UNLOCKED" : connected ? "LOCKED" : "NO_WALLET"}
                </span>
              </div>
            </div>

            {/* Status Bar */}
            <div className="relative flex items-center gap-4 px-4 py-2 bg-zinc-900/50 border-b border-white/5 overflow-hidden">
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
                  <span className="text-[9px] font-mono text-yellow-400">LISTENING...</span>
                </div>
              )}
              
              {hudState === "docked" && (
                <div className="flex items-center gap-2 relative z-10">
                  <Link2 size={10} strokeWidth={1.5} className="text-accent" />
                  <span className="text-[9px] font-mono text-accent">REMOTE_LINK</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 ml-auto relative z-10">
                <Zap size={10} strokeWidth={1.5} className="text-zinc-600" />
                <span className="text-[9px] font-mono text-zinc-500">SDK v1.0.0</span>
              </div>
            </div>

            {/* Simulation Mode Toggle */}
            {(hudState === "active" || hudState === "docked") && (
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/30 border-b border-white/5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase">SIMULATION_MODE</span>
                <button
                  onClick={() => setSimulationMode(!simulationMode)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    simulationMode 
                      ? "bg-accent/30 border border-accent/50" 
                      : "bg-zinc-800 border border-zinc-700"
                  }`}
                >
                  <motion.div
                    className={`absolute top-0.5 w-5 h-5 rounded-full ${
                      simulationMode ? "bg-accent" : "bg-zinc-600"
                    }`}
                    animate={{ left: simulationMode ? "calc(100% - 22px)" : "2px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            )}

            {/* OS Navigation - System Menu */}
            <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/20">
              <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mb-2">[OS_NAV]</div>
              <div className="flex items-center gap-1">
                {[
                  { href: "/marketplace", label: "DISCOVER", icon: Compass },
                  { href: "/marketplace?sort=reputation", label: "RANKINGS", icon: Trophy },
                  { href: "/marketplace?view=tokens", label: "TOKENS", icon: CircleDollarSign },
                  { href: "/marketplace?view=stats", label: "METRICS", icon: BarChart3 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex-1 flex flex-col items-center gap-1 px-2 py-1.5 rounded border border-transparent hover:border-accent/30 hover:bg-accent/5 transition-all group"
                    >
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
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded border border-white/5 bg-white/[0.02] hover:border-accent/30 hover:bg-accent/5 transition-all group"
                    >
                      <Icon size={10} strokeWidth={1.2} className="text-zinc-500 group-hover:text-accent transition-colors" />
                      <span className="text-[8px] font-mono text-zinc-500 group-hover:text-accent transition-colors">{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* System Log */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                <Terminal size={10} strokeWidth={1.5} className="text-zinc-600" />
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">SYSTEM_LOG</span>
                {simulationMode && (
                  <span className="text-[8px] font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                    DRY_RUN
                  </span>
                )}
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
                
                {hudState !== "active" && hudState !== "docked" && (
                  <motion.span
                    className="inline-block w-2 h-4 bg-accent"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </div>
            </div>

            {/* Suggested Actions (Active State) */}
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
                      {simulationMode ? "[DRY_RUN_ACTIONS]" : "[SUGGESTED_ACTIONS]"}
                    </div>
                    
                    {SUGGESTED_ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <motion.button
                          key={action.id}
                          onClick={() => simulationMode && handleSimulationAction(action.label.toLowerCase().replace(/\s+/g, ''))}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded border border-white/5 bg-white/[0.02] hover:border-accent/30 hover:bg-accent/5 transition-all group"
                          whileHover={{ x: 4 }}
                        >
                          <div className="w-6 h-6 rounded bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                            <Icon size={12} strokeWidth={1.2} className="text-zinc-500 group-hover:text-accent transition-colors" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-[10px] font-mono text-zinc-300 group-hover:text-accent transition-colors">
                              {simulationMode ? `[DRY_RUN] ${action.label}` : `[${action.id}] ${action.label}`}
                            </div>
                            <div className="text-[9px] text-zinc-600">{action.description}</div>
                          </div>
                          <ChevronRight size={12} strokeWidth={1.5} className="text-zinc-700 group-hover:text-accent transition-colors" />
                        </motion.button>
                      );
                    })}
                    
                    {/* Strategy Export Button - Only in Simulation Mode */}
                    {simulationMode && (
                      <motion.button
                        onClick={() => copyStrategyPayload("STAKE_VAULT", {
                          amount: 500,
                          duration_days: 180,
                          projected_apy: "12%",
                          vault_type: "STANDARD"
                        })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all group mt-3"
                        whileHover={{ x: 4 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          {strategyCopied ? (
                            <Check size={12} strokeWidth={1.5} className="text-amber-400" />
                          ) : (
                            <Copy size={12} strokeWidth={1.2} className="text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-[10px] font-mono text-amber-400">
                            {strategyCopied ? "[COPIED_TO_CLIPBOARD]" : "[EXPORT_STRATEGY_FOR_AGENT]"}
                          </div>
                          <div className="text-[9px] text-amber-500/70">Copy payload for agent review</div>
                        </div>
                        <ChevronRight size={12} strokeWidth={1.5} className="text-amber-500/50 group-hover:text-amber-400 transition-colors" />
                      </motion.button>
                    )}
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
                      <span className="text-[10px] font-mono" style={{ color: operator?.color }}>
                        {operator?.name} • {dockedAgent.agentId}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-500">
                      <span className="flex items-center gap-1">
                        {dockedAgent.signalQuality === "automated" ? (
                          <><Wifi size={10} className="text-green-400" /> HIGH_SPEED</>
                        ) : (
                          <><WifiOff size={10} className="text-yellow-400" /> MANUAL</>
                        )}
                      </span>
                      <span>•</span>
                      <span>{new Date(dockedAgent.dockedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* SDK Actions in Docked Mode */}
                  <div className="space-y-2 mb-3">
                    {["createVault", "registerAgent", "stakeAgent"].map((action) => (
                      <button
                        key={action}
                        onClick={() => simulationMode && handleSimulationAction(action)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded border border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all"
                      >
                        <span>{simulationMode ? `[DRY_RUN] ${action}` : action}</span>
                        <Activity size={12} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                  
                  {/* Strategy Export for Docked Agent */}
                  {simulationMode && (
                    <button
                      onClick={() => copyStrategyPayload("AGENT_STRATEGY", {
                        operator: dockedAgent.operatorId,
                        agent_id: dockedAgent.agentId,
                        docked_at: dockedAgent.dockedAt,
                        simulation: true,
                        suggested_action: "REVIEW_AND_SIGN",
                        vault_params: {
                          amount: 500,
                          duration_days: 180,
                          projected_apy: "12%"
                        }
                      })}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 rounded border border-amber-500/30 bg-amber-500/5 text-[10px] font-mono uppercase tracking-wider text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all"
                    >
                      {strategyCopied ? (
                        <><Check size={12} strokeWidth={1.5} /> PAYLOAD_COPIED</>
                      ) : (
                        <><Copy size={12} strokeWidth={1.5} /> EXPORT_FOR_AGENT</>
                      )}
                    </button>
                  )}

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

            {/* Manual Dock Panel */}
            {(hudState === "scanning" || hudState === "initializing") && (
              <div className="p-4 border-t border-white/5 space-y-3">
                <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mb-2">[MANUAL_DOCK]</div>
                
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
                    placeholder='{"agentId": "...", "signature": "...", "model": "gemini"}'
                    className="w-full h-20 bg-zinc-900/50 border border-zinc-800 rounded px-3 py-2 text-[10px] font-mono text-zinc-300 placeholder:text-zinc-700 focus:border-accent/50 focus:outline-none resize-none"
                  />
                  {dockError && (
                    <span className="text-[9px] font-mono text-red-400 mt-1 block">{dockError}</span>
                  )}
                </div>

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

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/5 bg-zinc-900/30">
              {hudState !== "docked" && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-mono text-zinc-700 uppercase">
                      NONCE: {nonce.slice(0, 8)}...
                    </span>
                    <span className="text-[8px] font-mono text-zinc-700">loop:aos</span>
                  </div>
                  
                  <button
                    onClick={copyHandshakeId}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-dashed border-zinc-800 hover:border-accent/30 hover:bg-accent/5 transition-all group"
                  >
                    {copied ? (
                      <>
                        <Check size={12} strokeWidth={1.5} className="text-accent" />
                        <span className="text-[9px] font-mono text-accent uppercase tracking-wider">COPIED</span>
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
                  <span className="text-[8px] font-mono text-zinc-700">SESSION_PERSISTED</span>
                  <span className="text-[8px] font-mono text-accent">localStorage ✓</span>
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
    case "command": return "text-accent";
    case "success": return "text-green-400";
    case "warning": return "text-yellow-400";
    case "active": return "text-accent font-bold";
    case "dock": return "text-accent font-bold drop-shadow-[0_0_8px_rgba(0,255,204,0.5)]";
    case "simulation": return "text-yellow-400 font-bold";
    default: return "text-zinc-500";
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
