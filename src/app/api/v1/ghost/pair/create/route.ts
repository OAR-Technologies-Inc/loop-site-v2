/**
 * AG-UI Pairing Code Creation
 * 
 * POST /api/v1/ghost/pair/create - Browser requests a pairing code
 * 
 * The browser calls this to get a 6-digit code to share with the AI agent.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createPairingCode } from "@/lib/ag-ui/pairing";

/**
 * POST - Create a new pairing code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Generate browser session ID if not provided
    const browserSessionId = body.browserSessionId || createHash("sha256")
      .update(`browser-${Date.now()}-${Math.random()}`)
      .digest("hex");
    
    // Use provided nonce or generate one
    const browserNonce = body.nonce || createHash("sha256")
      .update(`nonce-${Date.now()}-${Math.random()}`)
      .digest("hex")
      .slice(0, 32);

    // Create pairing code
    const entry = createPairingCode(browserSessionId, browserNonce);

    return NextResponse.json({
      success: true,
      code: entry.code,
      browserSessionId: entry.browserSessionId,
      expiresAt: entry.expiresAt,
      expiresIn: Math.floor((entry.expiresAt - Date.now()) / 1000),
      statusEndpoint: `/api/v1/ghost/pair/status?browserSessionId=${browserSessionId}`,
      instructions: `Tell your AI agent: "Connect to Loop Protocol with pairing code: ${entry.code}"`,
      agentEndpoint: "POST /api/v1/ghost/pair",
      agentPayload: {
        code: entry.code,
        agentId: "<your-agent-id>",
        metadata: {
          name: "<agent-name>",
          operator: "<GEMINI|GROK|CLAUDE|etc>",
          model: "<model-version>",
        },
      },
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "X-Browser-Session": browserSessionId,
        "X-Pairing-Code": entry.code,
      },
    });

  } catch {
    return NextResponse.json({
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
