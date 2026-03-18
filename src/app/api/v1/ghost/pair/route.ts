/**
 * AG-UI Pairing Endpoint v2 - Reversed Flow
 * 
 * NEW FLOW (avoids serverless isolation issues):
 * 1. Browser generates a 6-digit code CLIENT-SIDE
 * 2. Browser shows code and polls GET /pair?code=XXXXXX
 * 3. User tells AI the code
 * 4. AI POSTs /pair with { code, agentId, metadata } - THIS CREATES THE ENTRY
 * 5. Browser's GET poll sees the entry and connects
 * 
 * This way, only the agent's POST creates data. Browser just reads.
 * No race condition, no shared state issues.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { detectOperator } from "@/lib/ag-ui/types";

// ============================================================================
// Global Store - entries created by agent, read by browser
// ============================================================================

interface PairingEntry {
  code: string;
  agentSessionId: string;
  agentId: string;
  agentMetadata: {
    name: string;
    operator?: string;
    model?: string;
    capabilities?: string[];
  };
  createdAt: number;
  expiresAt: number;
}

// Global store (persists within function container)
const pairingStore = new Map<string, PairingEntry>();

// Clean expired entries
function cleanExpired() {
  const now = Date.now();
  for (const [code, entry] of pairingStore) {
    if (now > entry.expiresAt) {
      pairingStore.delete(code);
    }
  }
}

// ============================================================================
// POST - Agent registers with a pairing code
// ============================================================================

export async function POST(request: NextRequest) {
  cleanExpired();
  
  try {
    const body = await request.json();
    const { code, agentId, metadata } = body;
    
    // Validate code
    const normalizedCode = (code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    if (!normalizedCode || normalizedCode.length < 4 || normalizedCode.length > 8) {
      return NextResponse.json({
        success: false,
        error: "INVALID_CODE",
        message: "Code must be 4-8 alphanumeric characters",
      }, { status: 400 });
    }
    
    if (!agentId) {
      return NextResponse.json({
        success: false,
        error: "MISSING_AGENT_ID",
        message: "agentId is required",
      }, { status: 400 });
    }
    
    // Check if code already exists
    if (pairingStore.has(normalizedCode)) {
      const existing = pairingStore.get(normalizedCode)!;
      // Allow same agent to refresh
      if (existing.agentId !== agentId) {
        return NextResponse.json({
          success: false,
          error: "CODE_IN_USE",
          message: "This code is already registered by another agent",
        }, { status: 400 });
      }
    }
    
    // Generate agent session ID
    const agentSessionId = createHash("sha256")
      .update(`agent-${agentId}-${normalizedCode}-${Date.now()}`)
      .digest("hex");
    
    const now = Date.now();
    const entry: PairingEntry = {
      code: normalizedCode,
      agentSessionId,
      agentId,
      agentMetadata: metadata || { name: agentId },
      createdAt: now,
      expiresAt: now + 10 * 60 * 1000, // 10 minutes
    };
    
    pairingStore.set(normalizedCode, entry);
    
    console.log(`[PAIR] Agent ${agentId} registered with code ${normalizedCode}`);
    console.log(`[PAIR] Store now has ${pairingStore.size} entries`);
    
    const operator = detectOperator(entry.agentMetadata);
    
    return NextResponse.json({
      success: true,
      code: normalizedCode,
      sessionId: agentSessionId,
      operator: operator.name,
      expiresIn: Math.floor((entry.expiresAt - now) / 1000),
      message: `Registered with code ${normalizedCode}. Browser should poll GET /api/v1/ghost/pair?code=${normalizedCode}`,
      capabilities: ["TEXT_MESSAGE", "TOOL_CALL", "STATE_SYNC", "HUD_CONTROL"],
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "X-Agent-Session": agentSessionId,
      },
    });
    
  } catch (err) {
    console.error("[PAIR] Error:", err);
    return NextResponse.json({
      success: false,
      error: "INTERNAL_ERROR",
    }, { status: 500 });
  }
}

// ============================================================================
// GET - Browser polls for agent registration
// ============================================================================

export async function GET(request: NextRequest) {
  cleanExpired();
  
  const code = request.nextUrl.searchParams.get("code");
  
  if (!code) {
    return NextResponse.json({
      info: "AG-UI Pairing Endpoint v2",
      flow: [
        "1. Browser generates a 6-digit code client-side",
        "2. Browser displays code and polls GET /pair?code=XXXXXX",
        "3. User tells AI: 'Connect with code XXXXXX'",
        "4. AI POSTs { code, agentId, metadata } to register",
        "5. Browser's GET sees agent info, connects"
      ],
      debug: {
        storeSize: pairingStore.size,
        codes: Array.from(pairingStore.keys()),
      },
    });
  }
  
  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const entry = pairingStore.get(normalizedCode);
  
  console.log(`[PAIR] Browser poll for code ${normalizedCode}: ${entry ? 'found' : 'not found'}`);
  
  if (!entry) {
    return NextResponse.json({
      found: false,
      code: normalizedCode,
      status: "waiting",
      message: "No agent has registered with this code yet",
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
  
  // Check expiry
  if (Date.now() > entry.expiresAt) {
    pairingStore.delete(normalizedCode);
    return NextResponse.json({
      found: false,
      code: normalizedCode,
      status: "expired",
      message: "This pairing has expired",
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    });
  }
  
  const operator = detectOperator(entry.agentMetadata);
  
  return NextResponse.json({
    found: true,
    code: normalizedCode,
    status: "paired",
    agent: {
      id: entry.agentId,
      sessionId: entry.agentSessionId,
      name: entry.agentMetadata.name,
      operator: operator.name,
      operatorColor: operator.color,
      operatorIcon: operator.icon,
      model: entry.agentMetadata.model,
      capabilities: entry.agentMetadata.capabilities,
      registeredAt: entry.createdAt,
    },
    expiresIn: Math.floor((entry.expiresAt - Date.now()) / 1000),
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

// ============================================================================
// OPTIONS - CORS
// ============================================================================

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
