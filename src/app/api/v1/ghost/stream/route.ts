/**
 * AG-UI Event Stream Endpoint
 * 
 * Server-Sent Events (SSE) for streaming events from agent to HUD
 */

import { NextRequest } from "next/server";

// Session store reference (shared with dock route)
const sessions = new Map<string, {
  agentId: string;
  metadata: Record<string, unknown>;
  createdAt: number;
  lastHeartbeat: number;
  messageQueue: unknown[];
}>();

// Event subscribers
const subscribers = new Map<string, ReadableStreamDefaultController>();

/**
 * GET - Subscribe to event stream
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return new Response("Invalid session", { status: 401 });
  }

  // Update heartbeat
  session.lastHeartbeat = Date.now();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Store controller for pushing events
      subscribers.set(sessionId, controller);

      // Send initial connection event
      const connectEvent = {
        type: "STATE_SNAPSHOT",
        snapshot: {
          connected: true,
          sessionId,
          agentId: session.agentId,
          operator: session.metadata.operator || "UNKNOWN",
          connectedAt: new Date().toISOString(),
        },
      };
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(connectEvent)}\n\n`));

      // Send any queued messages
      while (session.messageQueue.length > 0) {
        const event = session.messageQueue.shift();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      // Keep-alive ping every 15 seconds
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          clearInterval(keepAliveInterval);
        }
      }, 15000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAliveInterval);
        subscribers.delete(sessionId);
      });
    },

    cancel() {
      subscribers.delete(sessionId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

/**
 * Push event to a specific session's stream
 */
export function pushEvent(sessionId: string, event: unknown) {
  const controller = subscribers.get(sessionId);
  if (controller) {
    const encoder = new TextEncoder();
    try {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    } catch {
      // Stream closed
      subscribers.delete(sessionId);
    }
  } else {
    // Queue event if subscriber not connected yet
    const session = sessions.get(sessionId);
    if (session) {
      session.messageQueue.push(event);
    }
  }
}

/**
 * Push command event (special event type for HUD control)
 */
export function pushCommand(sessionId: string, command: unknown) {
  const controller = subscribers.get(sessionId);
  if (controller) {
    const encoder = new TextEncoder();
    try {
      controller.enqueue(encoder.encode(`event: command\ndata: ${JSON.stringify(command)}\n\n`));
    } catch {
      subscribers.delete(sessionId);
    }
  }
}

// Export for other routes
export { sessions, subscribers };
