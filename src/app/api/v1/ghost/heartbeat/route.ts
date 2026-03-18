/**
 * AG-UI Heartbeat Endpoint
 * 
 * Keeps session alive and returns connection status
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

/**
 * POST - Send heartbeat
 */
export async function POST(request: NextRequest) {
  const sessionId = request.headers.get("X-Session-Id");

  if (!sessionId) {
    return NextResponse.json({
      alive: false,
      error: "MISSING_SESSION_ID",
    }, { status: 400 });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({
      alive: false,
      error: "SESSION_NOT_FOUND",
    }, { status: 404 });
  }

  // Update heartbeat timestamp
  session.lastHeartbeat = Date.now();

  return NextResponse.json({
    alive: true,
    sessionId,
    agentId: session.agentId,
    uptime: Date.now() - session.createdAt,
    timestamp: new Date().toISOString(),
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

export { sessions };
