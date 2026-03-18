/**
 * AG-UI Pairing Endpoint
 * 
 * POST /api/v1/ghost/pair - Agent claims a pairing code
 * 
 * Flow:
 * 1. User opens HUD, clicks "Connect Agent"
 * 2. HUD calls /pair/create → gets 6-digit code
 * 3. User tells AI the code
 * 4. AI calls this endpoint with the code
 * 5. Backend links AI session to browser HUD
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { claimPairingCode, getPairingByCode } from "@/lib/ag-ui/pairing";
import { detectOperator } from "@/lib/ag-ui/types";

/**
 * POST - Agent claims a pairing code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, agentId, metadata, signature } = body;

    // Validate code
    if (!code || typeof code !== "string" || code.length < 4) {
      return NextResponse.json({
        success: false,
        error: "INVALID_CODE_FORMAT",
        message: "Pairing code must be at least 4 characters",
      }, { status: 400 });
    }

    // Validate agent ID
    if (!agentId || typeof agentId !== "string") {
      return NextResponse.json({
        success: false,
        error: "MISSING_AGENT_ID",
        message: "agentId is required",
      }, { status: 400 });
    }

    // Generate agent session ID
    const agentSessionId = createHash("sha256")
      .update(`agent-${agentId}-${Date.now()}-${Math.random()}`)
      .digest("hex");

    // Attempt to claim the code
    const result = claimPairingCode(
      code,
      agentSessionId,
      agentId,
      metadata || { name: agentId }
    );

    if (!result.success) {
      const errorMessages: Record<string, string> = {
        "INVALID_CODE": "Pairing code not found. Check the code and try again.",
        "CODE_EXPIRED": "Pairing code has expired. Request a new code from the HUD.",
        "CODE_ALREADY_USED": "This code has already been used. Request a new code.",
      };

      return NextResponse.json({
        success: false,
        error: result.error,
        message: errorMessages[result.error || ""] || "Unknown error",
      }, { status: 400 });
    }

    // Detect operator from metadata
    const operator = detectOperator(metadata || { name: agentId });

    return NextResponse.json({
      success: true,
      sessionId: agentSessionId,
      browserSessionId: result.entry?.browserSessionId,
      pairedAt: result.entry?.pairedAt,
      operator: operator.name,
      capabilities: ["TEXT_MESSAGE", "TOOL_CALL", "STATE_SYNC", "HUD_CONTROL"],
      streamEndpoint: `/api/v1/ghost/stream?sessionId=${result.entry?.browserSessionId}`,
      inputEndpoint: `/api/v1/ghost/input`,
      message: `Successfully paired with browser HUD. You can now send events to the terminal.`,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "X-Agent-Session": agentSessionId,
      },
    });

  } catch {
    return NextResponse.json({
      success: false,
      error: "INTERNAL_ERROR",
      message: "Failed to process pairing request",
    }, { status: 500 });
  }
}

/**
 * GET - Check pairing status (for debugging)
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  
  if (!code) {
    return NextResponse.json({
      error: "MISSING_CODE",
      message: "Provide ?code=XXXXXX to check status",
    }, { status: 400 });
  }

  const entry = getPairingByCode(code);
  
  if (!entry) {
    return NextResponse.json({
      found: false,
      status: "not_found",
    });
  }

  return NextResponse.json({
    found: true,
    status: entry.status,
    createdAt: entry.createdAt,
    expiresAt: entry.expiresAt,
    paired: entry.status === "paired",
    agentId: entry.agentId,
    operatorName: entry.agentMetadata?.operator,
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
