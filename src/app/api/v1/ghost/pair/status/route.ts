/**
 * AG-UI Pairing Status
 * 
 * GET /api/v1/ghost/pair/status - Browser polls for agent connection
 * 
 * The browser polls this endpoint to check if an agent has connected.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPairingByBrowser, getPairingByCode } from "@/lib/ag-ui/pairing";
import { detectOperator } from "@/lib/ag-ui/types";

/**
 * GET - Check pairing status
 */
export async function GET(request: NextRequest) {
  const browserSessionId = request.nextUrl.searchParams.get("browserSessionId");
  const code = request.nextUrl.searchParams.get("code");

  let entry;
  
  if (browserSessionId) {
    entry = getPairingByBrowser(browserSessionId);
  } else if (code) {
    entry = getPairingByCode(code);
  } else {
    return NextResponse.json({
      error: "MISSING_IDENTIFIER",
      message: "Provide ?browserSessionId=xxx or ?code=xxx",
    }, { status: 400 });
  }

  if (!entry) {
    return NextResponse.json({
      found: false,
      status: "not_found",
      paired: false,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Check if expired
  if (entry.status === "pending" && Date.now() > entry.expiresAt) {
    entry.status = "expired";
  }

  const response: Record<string, unknown> = {
    found: true,
    code: entry.code,
    status: entry.status,
    paired: entry.status === "paired",
    createdAt: entry.createdAt,
    expiresAt: entry.expiresAt,
    remainingSeconds: Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000)),
  };

  // Include agent info if paired
  if (entry.status === "paired" && entry.agentMetadata) {
    const operator = detectOperator(entry.agentMetadata);
    
    response.agent = {
      id: entry.agentId,
      sessionId: entry.agentSessionId,
      name: entry.agentMetadata.name,
      operator: operator.name,
      operatorColor: operator.color,
      operatorIcon: operator.icon,
      model: entry.agentMetadata.model,
      capabilities: entry.agentMetadata.capabilities,
      pairedAt: entry.pairedAt,
    };
  }

  return NextResponse.json(response, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
