/**
 * AG-UI Input Endpoint
 * 
 * Receives user input from HUD and routes to connected agent
 */

import { NextRequest, NextResponse } from "next/server";

// Session store reference
const sessions = new Map<string, {
  agentId: string;
  metadata: Record<string, unknown>;
  createdAt: number;
  lastHeartbeat: number;
  messageQueue: unknown[];
  inputCallbacks?: ((input: UserInput) => void)[];
}>();

interface UserInput {
  action: "USER_INPUT" | "USER_ACTION";
  inputId?: string;
  actionType?: string;
  text?: string;
  payload?: unknown;
  timestamp: string;
}

// Input event listeners (for external agents to subscribe)
const inputListeners = new Map<string, ((input: UserInput) => void)[]>();

/**
 * POST - Send user input to agent
 */
export async function POST(request: NextRequest) {
  const sessionId = request.headers.get("X-Session-Id");

  if (!sessionId) {
    return NextResponse.json({
      success: false,
      error: "MISSING_SESSION_ID",
    }, { status: 400 });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({
      success: false,
      error: "INVALID_SESSION",
    }, { status: 401 });
  }

  // Update heartbeat
  session.lastHeartbeat = Date.now();

  try {
    const input: UserInput = await request.json();

    // Validate input
    if (!input.action || !["USER_INPUT", "USER_ACTION"].includes(input.action)) {
      return NextResponse.json({
        success: false,
        error: "INVALID_INPUT_ACTION",
      }, { status: 400 });
    }

    if (input.action === "USER_INPUT" && !input.text) {
      return NextResponse.json({
        success: false,
        error: "MISSING_INPUT_TEXT",
      }, { status: 400 });
    }

    // Notify any registered listeners
    const listeners = inputListeners.get(sessionId) || [];
    for (const listener of listeners) {
      try {
        listener(input);
      } catch (e) {
        console.error("Input listener error:", e);
      }
    }

    // Also check session-level callbacks
    if (session.inputCallbacks) {
      for (const callback of session.inputCallbacks) {
        try {
          callback(input);
        } catch (e) {
          console.error("Session callback error:", e);
        }
      }
    }

    // In a real implementation, this would forward to the connected agent
    // For now, we acknowledge receipt and let external systems poll/subscribe

    return NextResponse.json({
      success: true,
      received: true,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch {
    return NextResponse.json({
      success: false,
      error: "INVALID_JSON",
    }, { status: 400 });
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    },
  });
}

/**
 * Register an input listener for a session
 */
export function onInput(sessionId: string, callback: (input: UserInput) => void) {
  if (!inputListeners.has(sessionId)) {
    inputListeners.set(sessionId, []);
  }
  inputListeners.get(sessionId)!.push(callback);

  // Return cleanup function
  return () => {
    const listeners = inputListeners.get(sessionId);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
}

// Export for external use
export { sessions, inputListeners };
