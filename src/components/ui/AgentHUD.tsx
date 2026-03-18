"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Cpu, Check, Copy, Zap, ChevronRight, MessageSquare, Search, Shield, Link2, Unplug, Activity, Wifi, Compass, Trophy, CircleDollarSign, BarChart3, FileCode, Lock, Send, ArrowRight } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AGUIClient, ConnectionState, type HUDCommand, type LogEntry as AGUILogEntry, detectOperator as detectAGUIOperator } from "@/lib/ag-ui";

interface LogEntry {
  id: number;
  text: string;
  type: "info" | "success" | "warning" | "command" | "active" | "dock" | "simulation" | "error" | "input";
  timestamp: string;
}

interface AgentHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DockedAgent {
  agentId: string;
  operatorId: string;
  operatorName: string;
  operatorColor: string;
  operatorIcon: string;
  dockedAt: number;
  nonce: string;
  signalQuality: "automated" | "manual";
  sessionId?: string;
}

type HUDState = "initializing" | "scanning" | "connecting" | "active" | "docked";

const STORAGE_KEY = "loop_docked_agent";
const OXO_GATE_THRESHOLD = 100;

const INIT_SEQUENCE: Omit<LogEntry, "id" | "timestamp">[] = [
  { text: "> INITIALIZING_AG_UI_TERMINAL...", type: "command" },
  { text: "  AG-UI Protocol v1.0.0", type: "info" },
  { text: "  Connecting to Loop Protocol Mainnet", type: "info" },
  { text: "  Network latency: 24ms", type: "info" },
  { text: "> LOADING_CAPABILITIES...", type: "command" },
  { text: "  TEXT_MESSAGE: enabled", type: "success" },
  { text: "  TOOL_CALL: enabled", type: "success" },
  { text: "  STATE_SYNC: enabled", type: "success" },
  { text: "  CUSTOM_EVENTS: enabled", type: "success" },
  { text: "> SDK_FUNCTIONS_LOADED:", type: "command" },
  { text: "  [createVault] → Vault.initialize()", type: "success" },
  { text: "  [registerAgent] → Agents.register()", type: "success" },
  { text: "  [stakeOXO] → OXO.stake()", type: "success" },
  { text: "> OXO_GATE_CHECK...", type: "command" },
];

const ACTIVATION_SEQUENCE: Omit<LogEntry, "id" | "timestamp">[] = [
  { text: "> EXTERNAL_AGENT_TIMEOUT", type: "info" },
  { text: "  No remote agent connected", type: "info" },
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

function generateNonce(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function getLogColor(type: LogEntry["type"]): string {
  switch (type) {
    case "command": return "text-accent";
    case "success": return "text-emerald-400";
    case "warning": return "text-amber-400";
    case "active": return "text-accent font-semibold";
    case "dock": return "text-sky-400 font-semibold";
    case "simulation": return "text-amber-500";
    case "error": return "text-red-400";
    case "input": return "text-violet-400";
    default: return "text-zinc-400";
  }
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
  
  // AG-UI Terminal State
  const [commandInput, setCommandInput] = useState("");
  const [aguiConnectionState, setAguiConnectionState] = useState<ConnectionState>("disconnected");
  const [hudTint, setHudTint] = useState<"none" | "amber" | "red" | "green">("none");
  
  const logContainerRef = useRef<HTMLDivElement>(null);
  const sequenceIndex = useRef(0);
  const activationTimeout = useRef<NodeJS.Timeout | null>(null);
  const aguiClientRef = useRef<AGUIClient | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize AG-UI Client
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    aguiClientRef.current = new AGUIClient({
      onStateChange: (state) => {
        setAguiConnectionState(state);
      },
      onLog: (entry) => {
        const timestamp = entry.timestamp || new Date().toISOString().slice(11, 19);
        setLogs(prev => [...prev, {
          id: Date.now() + Math.random(),
          text: entry.text,
          type: entry.type as LogEntry["type"],
          timestamp,
        }]);
      },
      onCommand: (command: HUDCommand) => {
        handleHUDCommand(command);
      },
      onOperatorIdentified: (operator) => {
        setDockedAgent(prev => prev ? {
          ...prev,
          operatorName: operator.name,
          operatorColor: operator.color,
          operatorIcon: operator.icon,
        } : null);
      },
    });
    
    return () => {
      aguiClientRef.current?.disconnect();
    };
  }, []);
  
  // Handle HUD commands from remote agent
  const handleHUDCommand = useCallback((command: HUDCommand) => {
    switch (command.cmd) {
      case "SET_TINT":
        setHudTint(command.tint);
        if (command.tint === "amber") {
          setSimulationMode(true);
        }
        break;
      case "SET_MODE":
        if (command.mode === "simulation") {
          setSimulationMode(true);
          setHudTint("amber");
        } else if (command.mode === "normal") {
          setSimulationMode(false);
          setHudTint("none");
        }
        break;
      case "CLEAR_LOG":
        setLogs([]);
        break;
      case "APPEND_LOG":
        const timestamp = new Date().toISOString().slice(11, 19);
        command.entries.forEach((entry: AGUILogEntry, i: number) => {
          setLogs(prev => [...prev, {
            id: Date.now() + i,
            text: entry.text,
            type: entry.type as LogEntry["type"],
            timestamp: entry.timestamp || timestamp,
          }]);
        });
        break;
      case "DISPLAY_TOAST":
        // Could integrate with a toast library
        const toastTimestamp = new Date().toISOString().slice(11, 19);
        setLogs(prev => [...prev, {
          id: Date.now(),
          text: `[TOAST] ${command.message}`,
          type: command.variant === "error" ? "error" : command.variant === "warning" ? "warning" : "info",
          timestamp: toastTimestamp,
        }]);
        break;
    }
  }, []);
  
  // Flickering ping effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (dockedAgent || aguiConnectionState === "connected") {
        setPingStrength(95 + Math.random() * 5);
      } else if (hudState === "scanning" || aguiConnectionState === "connecting") {
        setPingStrength(30 + Math.random() * 50);
      } else {
        setPingStrength(60 + Math.random() * 30);
      }
    }, 2000 + Math.random() * 2000);
    
    return () => clearInterval(interval);
  }, [dockedAgent, hudState, aguiConnectionState]);
  
  // Send command to remote agent
  const sendCommand = useCallback(async () => {
    if (!commandInput.trim()) return;
    
    const timestamp = new Date().toISOString().slice(11, 19);
    
    // Log the input
    setLogs(prev => [...prev, {
      id: Date.now(),
      text: `> ${commandInput}`,
      type: "input",
      timestamp,
    }]);
    
    // Send to AG-UI client if connected
    if (aguiClientRef.current && aguiConnectionState === "connected") {
      await aguiClientRef.current.sendInput(commandInput);
    } else {
      // Local echo for demo mode
      setLogs(prev => [...prev, {
        id: Date.now() + 1,
        text: "  [LOCAL_MODE] No remote agent connected",
        type: "warning",
        timestamp,
      }]);
    }
    
    setCommandInput("");
  }, [commandInput, aguiConnectionState]);
  
  // Handle Enter key in command input
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCommand();
    }
  }, [sendCommand]);
  
  // Copy strategy payload for agent handoff
  const copyStrategyPayload = useCallback((action: string, params: Record<string, unknown>) => {
    const payload = {
      protocol: "loop-ag-ui",
      version: "1.0.0",
      mode: simulationMode ? "SIMULATION" : "LIVE",
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
      note: simulationMode ? "SIMULATION_ONLY - Review before mainnet execution" : "LIVE_MODE"
    };
    
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setStrategyCopied(true);
    setTimeout(() => setStrategyCopied(false), 2000);
    
    const now = new Date();
    const timestamp = now.toISOString().slice(11, 19);
    setLogs(prev => [...prev, {
      id: Date.now(),
      text: `> STRATEGY_EXPORTED: ${action}`,
      type: "success",
      timestamp,
    }]);
  }, [simulationMode]);

  // Mock OXO balance check
  useEffect(() => {
    if (connected && publicKey) {
      const mockBalance = Math.floor(Math.random() * 500) + 50;
      setOxoBalance(mockBalance);
      setOxoGatePassed(mockBalance >= OXO_GATE_THRESHOLD);
    } else {
      setOxoBalance(0);
      setOxoGatePassed(false);
    }
  }, [connected, publicKey]);

  // Load docked agent from localStorage
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
          const now = new Date();
          const timestamp = now.toISOString().slice(11, 19);
          
          if (connected) {
            setLogs(prev => [...prev,
              { id: Date.now(), text: `  Wallet: ${publicKey?.toString().slice(0, 8)}...`, type: "info", timestamp },
              { id: Date.now() + 1, text: `  OXO_BALANCE: ${oxoBalance}`, type: oxoGatePassed ? "success" : "warning", timestamp },
              { id: Date.now() + 2, text: oxoGatePassed ? "  SESSION_UNLOCKED ✓" : `  GATE_FAILED: Requires >${OXO_GATE_THRESHOLD} OXO`, type: oxoGatePassed ? "success" : "warning", timestamp },
              { id: Date.now() + 3, text: "> STATUS: AWAITING_REMOTE_DOCK...", type: "warning", timestamp },
            ]);
          } else {
            setLogs(prev => [...prev,
              { id: Date.now(), text: "  No wallet connected", type: "warning", timestamp },
              { id: Date.now() + 1, text: "  OXO_GATE: BYPASSED (Demo Mode)", type: "info", timestamp },
              { id: Date.now() + 2, text: "> STATUS: AWAITING_REMOTE_DOCK...", type: "warning", timestamp },
            ]);
          }
          
          setHudState("scanning");
          activationTimeout.current = setTimeout(() => {
            runActivationSequence();
          }, 5000);
        }
      };
      
      setTimeout(runSequence, 500);
    } else if (isOpen && dockedAgent) {
      const now = new Date();
      const timestamp = now.toISOString().slice(11, 19);
      setLogs([
        { id: 1, text: "> RESTORING_SESSION...", type: "command", timestamp },
        { id: 2, text: `  OPERATOR: ${dockedAgent.operatorName || "REMOTE"}`, type: "info", timestamp },
        { id: 3, text: `  Agent: ${dockedAgent.agentId}`, type: "info", timestamp },
        { id: 4, text: `  Signal: ${dockedAgent.signalQuality === "automated" ? "HIGH_SPEED" : "MANUAL_LINK"}`, type: "info", timestamp },
        { id: 5, text: `  Docked: ${new Date(dockedAgent.dockedAt).toLocaleTimeString()}`, type: "info", timestamp },
        { id: 6, text: "> [DOCK_SUCCESS]: SESSION_RESTORED", type: "dock", timestamp },
      ]);
    }
    
    return () => {
      if (activationTimeout.current) {
        clearTimeout(activationTimeout.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Handle simulation mode actions
  const handleSimulationAction = useCallback((action: string) => {
    const now = new Date();
    const timestamp = now.toISOString().slice(11, 19);
    
    const simulations: Record<string, string[]> = {
      "createVault": [
        "> SIMULATION: createVault()",
        "  Policy: dailyLimit=1000, autoStack=true",
        "  APY Range: 3% - 15% (duration-based)",
        "  Est. Gas: 0.00021 SOL",
        "  [DRY_RUN_COMPLETE]"
      ],
      "stakeOXO": [
        "> SIMULATION: stakeOXO({ amount: 100, duration: 180 })",
        "  Lock Period: 180 days",
        "  veOXO Multiplier: 0.5x",
        "  veOXO Received: 50",
        "  [DRY_RUN_COMPLETE]"
      ],
      "registerAgent": [
        "> SIMULATION: registerAgent()",
        "  Capabilities: [COMMERCE, DATA]",
        "  Initial Stake: 100 OXO",
        "  Reputation: 0 (Genesis)",
        "  [DRY_RUN_COMPLETE]"
      ],
    };

    const simLog = simulations[action] || [
      `> SIMULATION: ${action}()`,
      "  [DRY_RUN_COMPLETE]"
    ];

    simLog.forEach((text, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, {
          id: Date.now() + i,
          text,
          type: text.includes("DRY_RUN") ? "simulation" : "info",
          timestamp,
        }]);
      }, i * 150);
    });
  }, []);

  // Handle AG-UI dock via API
  const handleAGUIDock = useCallback(async () => {
    if (!aguiClientRef.current) return;
    
    setHudState("connecting");
    setDockError(null);
    
    try {
      const now = new Date();
      const timestamp = now.toISOString().slice(11, 19);
      
      setLogs(prev => [...prev, {
        id: Date.now(),
        text: "> INITIATING_AG_UI_HANDSHAKE...",
        type: "command",
        timestamp,
      }]);
      
      // Get nonce from server
      const serverNonce = await aguiClientRef.current.requestNonce();
      
      setLogs(prev => [...prev, {
        id: Date.now(),
        text: `  Challenge: ${serverNonce.slice(0, 16)}...`,
        type: "info",
        timestamp,
      }]);
      
      // For demo, simulate agent signing the nonce
      // In production, the remote agent would sign this
      const response = await aguiClientRef.current.dock({
        action: "DOCK_REQUEST",
        nonce: serverNonce,
        signature: `sig_${serverNonce.slice(0, 16)}`,
        agentId: "demo-agent",
        metadata: {
          name: "Demo Agent",
          operator: "LOOP",
          model: "loop-genesis-rep",
          version: "1.0.0",
          capabilities: ["TEXT_MESSAGE", "TOOL_CALL"],
        },
      });
      
      if (response.success && response.sessionId) {
        const operator = detectAGUIOperator({
          name: "Demo Agent",
          operator: "LOOP",
        });
        
        const docked: DockedAgent = {
          agentId: "demo-agent",
          operatorId: "loop",
          operatorName: operator.name,
          operatorColor: operator.color,
          operatorIcon: operator.icon,
          dockedAt: Date.now(),
          nonce: serverNonce,
          signalQuality: "automated",
          sessionId: response.sessionId,
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(docked));
        setDockedAgent(docked);
        setHudState("docked");
        
        if (activationTimeout.current) {
          clearTimeout(activationTimeout.current);
        }
        
        setShowGlitch(true);
        setTimeout(() => setShowGlitch(false), 500);
      }
    } catch (err) {
      setDockError(err instanceof Error ? err.message : "Dock failed");
      setHudState("scanning");
    }
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
      const operatorMeta = detectAGUIOperator({
        name: agentId,
        operator: response.operator,
        model: response.model,
      });
      
      if (activationTimeout.current) {
        clearTimeout(activationTimeout.current);
      }

      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 500);

      const now = new Date();
      const timestamp = now.toISOString().slice(11, 19);
      
      setLogs(prev => [...prev,
        { id: Date.now(), text: "> REMOTE_SIGNATURE_RECEIVED", type: "command", timestamp },
        { id: Date.now() + 1, text: `  OPERATOR: ${operatorMeta.name}`, type: "info", timestamp },
        { id: Date.now() + 2, text: `  Agent: ${agentId}`, type: "info", timestamp },
        { id: Date.now() + 3, text: "  Signal Quality: MANUAL_LINK", type: "warning", timestamp },
        { id: Date.now() + 4, text: "  Verifying signature...", type: "info", timestamp },
        { id: Date.now() + 5, text: "  Signature valid ✓", type: "success", timestamp },
        { id: Date.now() + 6, text: "> [DOCK_SUCCESS]: AGENT_ID_IDENTIFIED", type: "dock", timestamp },
      ]);

      const docked: DockedAgent = {
        agentId,
        operatorId: operatorMeta.name.toLowerCase(),
        operatorName: operatorMeta.name,
        operatorColor: operatorMeta.color,
        operatorIcon: operatorMeta.icon,
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
    // Disconnect AG-UI client if connected
    aguiClientRef.current?.disconnect();
    
    localStorage.removeItem(STORAGE_KEY);
    setDockedAgent(null);
    setHudState("initializing");
    setLogs([]);
    sequenceIndex.current = 0;
    setSimulationMode(false);
    setHudTint("none");
    setAguiConnectionState("disconnected");
    
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
      setCommandInput("");
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
          protocol: "loop-ag-ui",
          version: "1.0.0",
          manifest: "/llms.txt",
          nonce,
          docked: !!dockedAgent,
          dockedAgent: dockedAgent?.agentId,
          operatorId: dockedAgent?.operatorId,
          oxoGate: { required: OXO_GATE_THRESHOLD, passed: oxoGatePassed, balance: oxoBalance },
          simulationMode,
          dockEndpoint: "/api/v1/ghost/dock",
          streamEndpoint: "/api/v1/ghost/stream",
          inputEndpoint: "/api/v1/ghost/input",
          capabilities: ["TEXT_MESSAGE", "TOOL_CALL", "STATE_SYNC", "CUSTOM_EVENTS"],
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
      protocol: "loop-ag-ui",
      version: "1.0.0",
      nonce,
      manifest: "https://loop-site-v2.vercel.app/llms.txt",
      dockEndpoint: "https://loop-site-v2.vercel.app/api/v1/ghost/dock",
      streamEndpoint: "https://loop-site-v2.vercel.app/api/v1/ghost/stream",
      inputEndpoint: "https://loop-site-v2.vercel.app/api/v1/ghost/input",
      challenge: `Sign this nonce to authenticate: ${nonce}`,
      oxoGate: { required: OXO_GATE_THRESHOLD },
      supportedEvents: ["TEXT_MESSAGE_CONTENT", "TOOL_CALL_START", "TOOL_CALL_END", "STATE_DELTA", "CUSTOM"],
      programs: {
        CRED: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
        VAULT: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
        SHOPPING: "HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ",
      },
      instructions: "POST to dockEndpoint with: { action: 'DOCK_REQUEST', nonce, signature: 'signed-nonce', agentId: 'your-id', metadata: { name, operator, model } }"
    }, null, 2);
    
    navigator.clipboard.writeText(handshakeJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [nonce]);

  // Get tint styles
  const getTintStyles = useCallback(() => {
    if (simulationMode || hudTint === "amber") {
      return { filter: "sepia(0.15) saturate(1.3) hue-rotate(-20deg)" };
    }
    if (hudTint === "red") {
      return { filter: "sepia(0.2) saturate(1.5) hue-rotate(-40deg)" };
    }
    if (hudTint === "green") {
      return { filter: "sepia(0.1) saturate(1.2) hue-rotate(40deg)" };
    }
    return undefined;
  }, [simulationMode, hudTint]);

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
            style={getTintStyles()}
          >
            {/* Simulation Mode Overlay */}
            <AnimatePresence>
              {(simulationMode || hudTint === "amber") && (
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
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                    <Cpu size={16} strokeWidth={1.5} className="text-accent" />
                  </div>
                  {/* Connection indicator */}
                  <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                    (dockedAgent || aguiConnectionState === "connected") ? "bg-emerald-400" : 
                    (aguiConnectionState === "connecting" || hudState === "scanning") ? "bg-amber-400 animate-pulse" : 
                    "bg-zinc-600"
                  }`} />
                </div>
                <div>
                  <h2 className="text-xs font-mono font-semibold text-white">AG-UI TERMINAL</h2>
                  <p className="text-[9px] font-mono text-zinc-500">
                    {dockedAgent ? (
                      <span style={{ color: dockedAgent.operatorColor }}>
                        {dockedAgent.operatorIcon} {dockedAgent.operatorName}
                      </span>
                    ) : aguiConnectionState === "connecting" ? "CONNECTING..." : "STANDBY"}
                  </p>
                </div>
              </div>
              
              {/* Ping Signal */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((bar) => {
                    const threshold = bar * 25;
                    const isActive = pingStrength >= threshold;
                    return (
                      <motion.div
                        key={bar}
                        className={`w-1 rounded-full ${isActive ? "bg-accent" : "bg-zinc-700"}`}
                        style={{ height: 4 + bar * 3 }}
                        animate={
                          isActive && !dockedAgent && hudState === "scanning"
                            ? { opacity: [0.5, 1, 0.5] }
                            : { opacity: 1 }
                        }
                        transition={{ duration: 0.5, repeat: isActive && !dockedAgent ? Infinity : 0 }}
                      />
                    );
                  })}
                </div>
                
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Simulation Toggle (when docked) */}
            {dockedAgent && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-900/20">
                <div className="flex items-center gap-2">
                  <Activity size={12} strokeWidth={1.5} className={simulationMode ? "text-amber-400" : "text-zinc-500"} />
                  <span className="text-[9px] font-mono text-zinc-400">
                    {simulationMode ? "SIMULATION_MODE" : "LIVE_MODE"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSimulationMode(!simulationMode);
                    setHudTint(simulationMode ? "none" : "amber");
                  }}
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    simulationMode ? "bg-amber-500/30 border border-amber-500/50" : "bg-zinc-800 border border-zinc-700"
                  }`}
                >
                  <motion.div
                    className={`absolute top-0.5 w-4 h-4 rounded-full ${
                      simulationMode ? "bg-amber-400" : "bg-zinc-500"
                    }`}
                    animate={{ left: simulationMode ? "calc(100% - 18px)" : "2px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            )}

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
                  <span className="text-[8px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
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

            {/* Command Input (when docked) */}
            {(dockedAgent || hudState === "active") && (
              <div className="px-4 py-3 border-t border-white/5 bg-zinc-900/30">
                <div className="flex items-center gap-2">
                  <span className="text-accent font-mono text-xs">{">"}</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter command..."
                    className="flex-1 bg-transparent text-white font-mono text-xs placeholder:text-zinc-600 outline-none"
                  />
                  <button
                    onClick={sendCommand}
                    disabled={!commandInput.trim()}
                    className="p-1.5 rounded bg-accent/10 hover:bg-accent/20 disabled:opacity-50 disabled:hover:bg-accent/10 transition-colors"
                  >
                    <Send size={12} className="text-accent" />
                  </button>
                </div>
              </div>
            )}

            {/* Suggested Actions (Active State) */}
            <AnimatePresence>
              {hudState === "active" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/5"
                >
                  <div className="px-4 py-3">
                    <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mb-3">[SUGGESTED_ACTIONS]</div>
                    <div className="space-y-2">
                      {SUGGESTED_ACTIONS.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.id}
                            onClick={() => {
                              if (simulationMode) {
                                handleSimulationAction(action.label.toLowerCase().replace(/ /g, "_"));
                              } else {
                                setCommandInput(action.label);
                                inputRef.current?.focus();
                              }
                            }}
                            className="w-full flex items-center gap-3 p-2 rounded border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all group"
                          >
                            <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                              <Icon size={12} strokeWidth={1.5} className="text-zinc-500 group-hover:text-accent transition-colors" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-[10px] font-mono text-zinc-300 group-hover:text-accent transition-colors">{action.label}</div>
                              <div className="text-[8px] font-mono text-zinc-600">{action.description}</div>
                            </div>
                            <ChevronRight size={12} className="text-zinc-600 group-hover:text-accent transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Docking Actions (Scanning State) */}
            <AnimatePresence>
              {hudState === "scanning" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/5"
                >
                  <div className="px-4 py-3">
                    <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mb-3">[DOCK_AGENT]</div>
                    
                    {/* Automated Dock Button */}
                    <button
                      onClick={handleAGUIDock}
                      className="w-full flex items-center gap-3 p-3 rounded border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-all group mb-3"
                    >
                      <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                        <Wifi size={14} strokeWidth={1.5} className="text-accent" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-[10px] font-mono text-accent">AUTO_DOCK (AG-UI)</div>
                        <div className="text-[8px] font-mono text-zinc-500">Connect via WebSocket/SSE</div>
                      </div>
                      <ArrowRight size={12} className="text-accent" />
                    </button>
                    
                    {/* Divider */}
                    <div className="flex items-center gap-2 my-3">
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-[8px] font-mono text-zinc-600">OR MANUAL PASTE</span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>
                    
                    {/* Handshake Copy */}
                    <button
                      onClick={copyHandshakeId}
                      className="w-full flex items-center gap-3 p-2 rounded border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all group mb-2"
                    >
                      <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-500" />}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-[9px] font-mono text-zinc-400">
                          {copied ? "COPIED!" : "Copy AG-UI Handshake JSON"}
                        </div>
                      </div>
                    </button>
                    
                    {/* Manual Paste */}
                    <textarea
                      value={agentResponse}
                      onChange={(e) => setAgentResponse(e.target.value)}
                      placeholder='Paste agent response JSON here...'
                      className="w-full h-16 bg-zinc-900/50 border border-white/10 rounded p-2 text-[10px] font-mono text-zinc-300 placeholder:text-zinc-600 resize-none outline-none focus:border-accent/50 transition-colors"
                    />
                    
                    {dockError && (
                      <p className="text-[9px] font-mono text-red-400 mt-1">{dockError}</p>
                    )}
                    
                    <button
                      onClick={handleConfirmDock}
                      disabled={!agentResponse.trim()}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded border border-accent/50 bg-accent/10 hover:bg-accent/20 disabled:opacity-50 disabled:hover:bg-accent/10 transition-colors"
                    >
                      <Link2 size={12} className="text-accent" />
                      <span className="text-[10px] font-mono text-accent">CONFIRM_DOCK</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Docked State - Strategy Export */}
            <AnimatePresence>
              {dockedAgent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/5"
                >
                  <div className="px-4 py-3">
                    {/* Strategy Export */}
                    <button
                      onClick={() => copyStrategyPayload("vault_strategy", { 
                        action: "createVault",
                        dailyLimit: 1000,
                        autoStack: true,
                        duration: 180 
                      })}
                      className="w-full flex items-center gap-3 p-2 rounded border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all group mb-3"
                    >
                      <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                        {strategyCopied ? <Check size={12} className="text-emerald-400" /> : <Zap size={12} className="text-zinc-500" />}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-[9px] font-mono text-zinc-400">
                          {strategyCopied ? "EXPORTED!" : "Export Strategy Payload"}
                        </div>
                      </div>
                    </button>
                    
                    {/* Undock */}
                    <button
                      onClick={handleUndock}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded border border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 transition-colors group"
                    >
                      <Unplug size={12} className="text-red-400" />
                      <span className="text-[10px] font-mono text-red-400">UNDOCK_AGENT</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5 bg-zinc-900/30">
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-600">
                <span>AG-UI v1.0.0</span>
                <span>{dockedAgent ? `SESSION: ${dockedAgent.sessionId?.slice(0, 8) || dockedAgent.nonce.slice(0, 8)}...` : `NONCE: ${nonce.slice(0, 8)}...`}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
