/**
 * AG-UI Disconnect Endpoint
 * 
 * Cleanly terminates a session
 */

import { NextRequest, NextResponse } from "next/server";

// Session store reference
const sessions = new Map<string, {
  agentId: string;
  metadata: Record<string, unknown>;
  createdAt: number;
  lastHeartbeat: number;
  messageQueue: unknown[];
}>();

// Subscriber reference for SSE cleanup
const subscribers = new Map<string, ReadableStreamDefaultController>();

/**
 * POST - Disconnect session
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
    // Session already gone - that's fine
    return NextResponse.json({
      success: true,
      message: "SESSION_ALREADY_TERMINATED",
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Close any active SSE stream
  const controller = subscribers.get(sessionId);
  if (controller) {
    try {
      controller.close();
    } catch {
      // Already closed
    }
    subscribers.delete(sessionId);
  }

  // Remove session
  sessions.delete(sessionId);

  return NextResponse.json({
    success: true,
    message: "SESSION_TERMINATED",
    agentId: session.agentId,
    duration: Date.now() - session.createdAt,
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
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
      "Access-Control-Allow-Headers": "X-Session-Id",
    },
  });
}

export { sessions, subscribers };
