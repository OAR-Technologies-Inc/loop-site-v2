/**
 * AG-UI Ghost Dock Endpoint
 * 
 * GET  - Request authentication nonce
 * POST - Authenticate and establish session
 */

import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";

// In-memory session store (use Redis in production)
const sessions = new Map<string, {
  agentId: string;
  metadata: Record<string, unknown>;
  createdAt: number;
  lastHeartbeat: number;
  messageQueue: unknown[];
}>();

// Nonce store with 5-minute TTL
const nonceStore = new Map<string, { createdAt: number; used: boolean }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  const NONCE_TTL = 5 * 60 * 1000; // 5 minutes
  const SESSION_TTL = 30 * 60 * 1000; // 30 minutes
  
  for (const [nonce, data] of nonceStore) {
    if (now - data.createdAt > NONCE_TTL) {
      nonceStore.delete(nonce);
    }
  }
  
  for (const [sessionId, data] of sessions) {
    if (now - data.lastHeartbeat > SESSION_TTL) {
      sessions.delete(sessionId);
    }
  }
}, 60000);

/**
 * GET - Request a nonce for authentication
 */
export async function GET(_request: NextRequest) {
  const nonce = randomBytes(32).toString("hex");
  const timestamp = Date.now();
  
  nonceStore.set(nonce, { createdAt: timestamp, used: false });
  
  return NextResponse.json({
    nonce,
    expiresAt: timestamp + 5 * 60 * 1000,
    protocol: "loop-ag-ui",
    version: "1.0.0",
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * POST - Authenticate with signed nonce and establish session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, nonce, signature, agentId, metadata } = body;

    if (action !== "DOCK_REQUEST") {
      return NextResponse.json({
        action: "DOCK_RESPONSE",
        success: false,
        error: "INVALID_ACTION",
      }, { status: 400 });
    }

    // Validate nonce
    if (!nonce || typeof nonce !== "string") {
      return NextResponse.json({
        action: "DOCK_RESPONSE",
        success: false,
        error: "INVALID_NONCE",
      }, { status: 400 });
    }

    const nonceData = nonceStore.get(nonce);
    if (!nonceData) {
      return NextResponse.json({
        action: "DOCK_RESPONSE",
        success: false,
        error: "NONCE_NOT_FOUND",
      }, { status: 400 });
    }

    if (nonceData.used) {
      return NextResponse.json({
        action: "DOCK_RESPONSE",
        success: false,
        error: "NONCE_ALREADY_USED",
      }, { status: 400 });
    }

    if (Date.now() - nonceData.createdAt > 5 * 60 * 1000) {
      nonceStore.delete(nonce);
      return NextResponse.json({
        action: "DOCK_RESPONSE",
        success: false,
        error: "NONCE_EXPIRED",
      }, { status: 400 });
    }

    // Mark nonce as used
    nonceData.used = true;

    // Validate signature (simplified - in production use proper crypto verification)
    if (!signature || signature.length < 8) {
      return NextResponse.json({
        action: "DOCK_RESPONSE",
        success: false,
        error: "INVALID_SIGNATURE",
      }, { status: 400 });
    }

    // Validate agent ID
    if (!agentId || typeof agentId !== "string") {
      return NextResponse.json({
        action: "DOCK_RESPONSE",
        success: false,
        error: "INVALID_AGENT_ID",
      }, { status: 400 });
    }

    // Create session
    const sessionId = createHash("sha256")
      .update(`${agentId}-${nonce}-${Date.now()}`)
      .digest("hex");

    sessions.set(sessionId, {
      agentId,
      metadata: metadata || {},
      createdAt: Date.now(),
      lastHeartbeat: Date.now(),
      messageQueue: [],
    });

    // Determine capabilities based on agent metadata
    const capabilities = [
      "TEXT_MESSAGE",
      "TOOL_CALL",
      "STATE_SYNC",
      "CUSTOM_EVENTS",
    ];

    // Check if agent supports specific features
    if (metadata?.capabilities?.includes("SIMULATION_MODE")) {
      capabilities.push("SIMULATION_MODE");
    }

    return NextResponse.json({
      action: "DOCK_RESPONSE",
      success: true,
      sessionId,
      capabilities,
      protocol: "loop-ag-ui",
      version: "1.0.0",
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "X-Session-Token": sessionId,
      },
    });

  } catch {
    return NextResponse.json({
      action: "DOCK_RESPONSE",
      success: false,
      error: "INTERNAL_ERROR",
    }, { status: 500 });
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Session-Id",
    },
  });
}

// Export session map for other routes
export { sessions };
