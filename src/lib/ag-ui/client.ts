/**
 * AG-UI Client
 * Manages bidirectional communication between the Ghost Window and remote agents
 */

import { 
  AGUIEvent, 
  DockRequest, 
  DockResponse, 
  AgentMetadata,
  UserInputEvent,
  UserActionEvent,
  HUDCommand,
  LogEntry,
  detectOperator,
  AG_UI_VERSION,
} from "./types";

export type ConnectionState = "disconnected" | "connecting" | "authenticating" | "connected" | "error";

export interface AGUIClientOptions {
  baseUrl?: string;
  onStateChange?: (state: ConnectionState) => void;
  onEvent?: (event: AGUIEvent) => void;
  onCommand?: (command: HUDCommand) => void;
  onLog?: (entry: LogEntry) => void;
  onError?: (error: Error) => void;
  onOperatorIdentified?: (operator: { name: string; color: string; icon: string }) => void;
}

export class AGUIClient {
  private baseUrl: string;
  private state: ConnectionState = "disconnected";
  private sessionId: string | null = null;
  private eventSource: EventSource | null = null;
  private agentMetadata: AgentMetadata | null = null;
  private messageBuffer: Map<string, string> = new Map();
  private options: AGUIClientOptions;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(options: AGUIClientOptions = {}) {
    this.baseUrl = options.baseUrl || "";
    this.options = options;
  }

  get connectionState(): ConnectionState {
    return this.state;
  }

  get currentSession(): string | null {
    return this.sessionId;
  }

  get agent(): AgentMetadata | null {
    return this.agentMetadata;
  }

  private setState(newState: ConnectionState) {
    this.state = newState;
    this.options.onStateChange?.(newState);
  }

  private log(entry: LogEntry) {
    const timestamp = entry.timestamp || new Date().toISOString().slice(11, 19);
    this.options.onLog?.({ ...entry, timestamp });
  }

  /**
   * Request a nonce for authentication
   */
  async requestNonce(): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/v1/ghost/dock`, {
      method: "GET",
    });
    
    if (!res.ok) {
      throw new Error(`Failed to get nonce: ${res.status}`);
    }
    
    const data = await res.json();
    return data.nonce;
  }

  /**
   * Authenticate with signed nonce
   */
  async dock(request: DockRequest): Promise<DockResponse> {
    this.setState("authenticating");
    
    this.log({
      text: "> DOCK_REQUEST_RECEIVED",
      type: "command",
    });
    
    this.log({
      text: `  Agent: ${request.agentId}`,
      type: "info",
    });

    const res = await fetch(`${this.baseUrl}/api/v1/ghost/dock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    const response: DockResponse = await res.json();

    if (response.success && response.sessionId) {
      this.sessionId = response.sessionId;
      this.agentMetadata = request.metadata;
      
      // Detect operator from metadata
      const operator = detectOperator(request.metadata);
      this.options.onOperatorIdentified?.(operator);
      
      this.log({
        text: `  OPERATOR: ${operator.name}`,
        type: "info",
      });
      
      this.log({
        text: `[DOCK_SUCCESS]: AGENT_ID_IDENTIFIED`,
        type: "dock",
      });
      
      this.log({
        text: `  Session: ${response.sessionId.slice(0, 12)}...`,
        type: "success",
      });
      
      // Connect to event stream
      await this.connectEventStream();
      
      this.setState("connected");
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      
    } else {
      this.log({
        text: `[DOCK_FAILED]: ${response.error || "Unknown error"}`,
        type: "error",
      });
      this.setState("error");
    }

    return response;
  }

  /**
   * Connect to Server-Sent Events stream for receiving agent events
   */
  private async connectEventStream() {
    if (!this.sessionId) return;

    this.eventSource = new EventSource(
      `${this.baseUrl}/api/v1/ghost/stream?sessionId=${this.sessionId}`
    );

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleIncomingEvent(data);
      } catch (e) {
        console.error("Failed to parse event:", e);
      }
    };

    this.eventSource.onerror = () => {
      if (this.state === "connected") {
        this.log({
          text: "> CONNECTION_INTERRUPTED",
          type: "warning",
        });
        this.attemptReconnect();
      }
    };

    this.eventSource.addEventListener("command", (event) => {
      try {
        const command: HUDCommand = JSON.parse(event.data);
        this.options.onCommand?.(command);
      } catch (e) {
        console.error("Failed to parse command:", e);
      }
    });
  }

  /**
   * Handle incoming AG-UI events
   */
  private handleIncomingEvent(event: AGUIEvent) {
    this.options.onEvent?.(event);

    switch (event.type) {
      case "TEXT_MESSAGE_START":
        this.messageBuffer.set(event.messageId, "");
        this.log({
          text: `> [${event.role.toUpperCase()}] Starting...`,
          type: "command",
        });
        break;

      case "TEXT_MESSAGE_CONTENT":
        const current = this.messageBuffer.get(event.messageId) || "";
        this.messageBuffer.set(event.messageId, current + event.delta);
        // Stream token to log
        this.log({
          text: event.delta,
          type: "info",
        });
        break;

      case "TEXT_MESSAGE_END":
        this.messageBuffer.delete(event.messageId);
        this.log({
          text: `[MESSAGE_COMPLETE]`,
          type: "success",
        });
        break;

      case "TOOL_CALL_START":
        this.log({
          text: `> TOOL_CALL: ${event.toolCallName}`,
          type: "active",
        });
        break;

      case "TOOL_CALL_END":
        this.log({
          text: `[TOOL_COMPLETE]: ${event.toolCallId.slice(0, 8)}`,
          type: "success",
        });
        break;

      case "RUN_STARTED":
        this.log({
          text: `> RUN_STARTED: ${event.runId.slice(0, 12)}`,
          type: "command",
        });
        break;

      case "RUN_FINISHED":
        this.log({
          text: `[RUN_COMPLETE]`,
          type: "success",
        });
        break;

      case "RUN_ERROR":
        this.log({
          text: `[RUN_ERROR]: ${event.message}`,
          type: "error",
        });
        break;

      case "CUSTOM":
        this.log({
          text: `> CUSTOM_EVENT: ${event.name}`,
          type: "info",
        });
        break;
    }
  }

  /**
   * Send user input to the connected agent
   */
  async sendInput(text: string, inputId?: string): Promise<boolean> {
    if (this.state !== "connected" || !this.sessionId) {
      this.log({
        text: "[ERROR]: Not connected to agent",
        type: "error",
      });
      return false;
    }

    const event: UserInputEvent = {
      action: "USER_INPUT",
      inputId,
      text,
      timestamp: new Date().toISOString(),
    };

    this.log({
      text: `> ${text}`,
      type: "command",
    });

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/ghost/input`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Session-Id": this.sessionId,
        },
        body: JSON.stringify(event),
      });

      return res.ok;
    } catch (e) {
      this.log({
        text: `[SEND_ERROR]: ${e instanceof Error ? e.message : "Unknown"}`,
        type: "error",
      });
      return false;
    }
  }

  /**
   * Send user action to the connected agent
   */
  async sendAction(actionType: string, payload?: unknown): Promise<boolean> {
    if (this.state !== "connected" || !this.sessionId) {
      return false;
    }

    const event: UserActionEvent = {
      action: "USER_ACTION",
      actionType,
      payload,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/ghost/input`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Session-Id": this.sessionId,
        },
        body: JSON.stringify(event),
      });

      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Attempt to reconnect after connection loss
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log({
        text: "[RECONNECT_FAILED]: Max attempts reached",
        type: "error",
      });
      this.setState("error");
      return;
    }

    this.reconnectAttempts++;
    this.setState("connecting");
    
    this.log({
      text: `> RECONNECTING... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      type: "warning",
    });

    setTimeout(() => {
      this.connectEventStream();
    }, Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000));
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      if (this.state === "connected" && this.sessionId) {
        try {
          await fetch(`${this.baseUrl}/api/v1/ghost/heartbeat`, {
            method: "POST",
            headers: { "X-Session-Id": this.sessionId },
          });
        } catch {
          // Heartbeat failed - will trigger reconnect via SSE error
        }
      }
    }, 30000);
  }

  /**
   * Disconnect from the agent
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.sessionId) {
      // Notify server of disconnect (fire and forget)
      fetch(`${this.baseUrl}/api/v1/ghost/disconnect`, {
        method: "POST",
        headers: { "X-Session-Id": this.sessionId },
      }).catch(() => {});
    }

    this.sessionId = null;
    this.agentMetadata = null;
    this.messageBuffer.clear();
    this.setState("disconnected");

    this.log({
      text: "> DISCONNECTED",
      type: "warning",
    });
  }

  /**
   * Get protocol version
   */
  static get version(): string {
    return AG_UI_VERSION;
  }
}

/**
 * Create a singleton instance
 */
let clientInstance: AGUIClient | null = null;

export function getAGUIClient(options?: AGUIClientOptions): AGUIClient {
  if (!clientInstance) {
    clientInstance = new AGUIClient(options);
  }
  return clientInstance;
}

export function resetAGUIClient(): void {
  if (clientInstance) {
    clientInstance.disconnect();
    clientInstance = null;
  }
}
