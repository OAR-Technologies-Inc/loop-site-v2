/**
 * AG-UI Standard v1.0.0
 * Agent-Generic User Interface Protocol
 * 
 * This protocol enables any LLM/Agent to connect to and control
 * Loop Protocol's Ghost Window terminal interface.
 */

// =============================================================================
// Core Event Types (AG-UI Standard)
// =============================================================================

export type AGUIEventType = 
  | "TEXT_MESSAGE_START"
  | "TEXT_MESSAGE_CONTENT" 
  | "TEXT_MESSAGE_END"
  | "TOOL_CALL_START"
  | "TOOL_CALL_ARGS"
  | "TOOL_CALL_END"
  | "STATE_SNAPSHOT"
  | "STATE_DELTA"
  | "MESSAGES_SNAPSHOT"
  | "RUN_STARTED"
  | "RUN_FINISHED"
  | "RUN_ERROR"
  | "CUSTOM";

// =============================================================================
// Event Payloads
// =============================================================================

export interface TextMessageStartEvent {
  type: "TEXT_MESSAGE_START";
  messageId: string;
  role: "assistant" | "user" | "system";
}

export interface TextMessageContentEvent {
  type: "TEXT_MESSAGE_CONTENT";
  messageId: string;
  delta: string; // Streaming text token
}

export interface TextMessageEndEvent {
  type: "TEXT_MESSAGE_END";
  messageId: string;
}

export interface ToolCallStartEvent {
  type: "TOOL_CALL_START";
  toolCallId: string;
  toolCallName: string;
}

export interface ToolCallArgsEvent {
  type: "TOOL_CALL_ARGS";
  toolCallId: string;
  delta: string; // Streaming JSON args
}

export interface ToolCallEndEvent {
  type: "TOOL_CALL_END";
  toolCallId: string;
}

export interface StateSnapshotEvent {
  type: "STATE_SNAPSHOT";
  snapshot: Record<string, unknown>;
}

export interface StateDeltaEvent {
  type: "STATE_DELTA";
  delta: Array<{
    op: "add" | "remove" | "replace";
    path: string;
    value?: unknown;
  }>;
}

export interface RunStartedEvent {
  type: "RUN_STARTED";
  runId: string;
  threadId?: string;
}

export interface RunFinishedEvent {
  type: "RUN_FINISHED";
  runId: string;
}

export interface RunErrorEvent {
  type: "RUN_ERROR";
  runId: string;
  message: string;
  code?: string;
}

export interface CustomEvent {
  type: "CUSTOM";
  name: string;
  value: unknown;
}

export type AGUIEvent = 
  | TextMessageStartEvent
  | TextMessageContentEvent
  | TextMessageEndEvent
  | ToolCallStartEvent
  | ToolCallArgsEvent
  | ToolCallEndEvent
  | StateSnapshotEvent
  | StateDeltaEvent
  | RunStartedEvent
  | RunFinishedEvent
  | RunErrorEvent
  | CustomEvent;

// =============================================================================
// Connection & Authentication
// =============================================================================

export interface DockRequest {
  action: "DOCK_REQUEST";
  nonce: string;
  signature: string;
  agentId: string;
  metadata: AgentMetadata;
}

export interface DockResponse {
  action: "DOCK_RESPONSE";
  success: boolean;
  sessionId?: string;
  error?: string;
  capabilities?: string[];
}

export interface AgentMetadata {
  name: string;
  version?: string;
  operator?: string; // e.g., "GEMINI", "GROK", "CLAUDE", "OPENAI"
  capabilities?: string[];
  model?: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// HUD Control Commands (Agent → HUD)
// =============================================================================

export type HUDCommand = 
  | { cmd: "SET_MODE"; mode: "normal" | "simulation" | "alert" }
  | { cmd: "SET_TINT"; tint: "none" | "amber" | "red" | "green" }
  | { cmd: "CLEAR_LOG" }
  | { cmd: "APPEND_LOG"; entries: LogEntry[] }
  | { cmd: "SET_STATUS"; status: string }
  | { cmd: "TRIGGER_ANIMATION"; animation: string }
  | { cmd: "REQUEST_INPUT"; prompt: string; inputId: string }
  | { cmd: "DISPLAY_TOAST"; message: string; variant?: "info" | "success" | "warning" | "error" };

export interface LogEntry {
  text: string;
  type: "info" | "success" | "warning" | "command" | "active" | "dock" | "simulation" | "error";
  timestamp?: string;
}

// =============================================================================
// User Input (HUD → Agent)
// =============================================================================

export interface UserInputEvent {
  action: "USER_INPUT";
  inputId?: string;
  text: string;
  timestamp: string;
}

export interface UserActionEvent {
  action: "USER_ACTION";
  actionType: string;
  payload?: unknown;
  timestamp: string;
}

// =============================================================================
// Operator Detection (Agnostic)
// =============================================================================

export const KNOWN_OPERATORS: Record<string, { name: string; color: string; icon: string }> = {
  // Detection based on metadata patterns - NOT hardcoded behavior
  "gemini": { name: "GEMINI", color: "#4285F4", icon: "✦" },
  "grok": { name: "GROK", color: "#1DA1F2", icon: "𝕏" },
  "claude": { name: "CLAUDE", color: "#CC785C", icon: "◈" },
  "openai": { name: "OPENAI", color: "#10A37F", icon: "◉" },
  "chatgpt": { name: "CHATGPT", color: "#10A37F", icon: "◉" },
  "mistral": { name: "MISTRAL", color: "#FF7000", icon: "▲" },
  "llama": { name: "LLAMA", color: "#A855F7", icon: "🦙" },
  "deepseek": { name: "DEEPSEEK", color: "#2563EB", icon: "◆" },
  "cohere": { name: "COHERE", color: "#D97706", icon: "◇" },
  "anthropic": { name: "ANTHROPIC", color: "#CC785C", icon: "◈" },
};

export function detectOperator(metadata: AgentMetadata): { name: string; color: string; icon: string } {
  // Check explicit operator field first
  if (metadata.operator) {
    const key = metadata.operator.toLowerCase();
    if (KNOWN_OPERATORS[key]) return KNOWN_OPERATORS[key];
  }
  
  // Check agent name
  if (metadata.name) {
    const nameLower = metadata.name.toLowerCase();
    for (const [key, value] of Object.entries(KNOWN_OPERATORS)) {
      if (nameLower.includes(key)) return value;
    }
  }
  
  // Check model field
  if (metadata.model) {
    const modelLower = metadata.model.toLowerCase();
    for (const [key, value] of Object.entries(KNOWN_OPERATORS)) {
      if (modelLower.includes(key)) return value;
    }
  }
  
  // Unknown operator - use generic styling
  return { name: "UNKNOWN", color: "#71717A", icon: "?" };
}

// =============================================================================
// Protocol Version
// =============================================================================

export const AG_UI_VERSION = "1.0.0";
export const AG_UI_PROTOCOL = "loop-ag-ui";
