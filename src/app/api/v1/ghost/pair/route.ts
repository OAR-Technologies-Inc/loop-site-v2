/**
 * AG-UI Pairing Endpoint (Consolidated)
 * 
 * All pairing operations in ONE endpoint to share in-memory state
 * within a single serverless function invocation context.
 * 
 * POST body.action:
 *   - "create"  → Browser requests a pairing code
 *   - "claim"   → Agent claims a pairing code
 *   - "status"  → Check pairing status
 * 
 * For production, use Redis/Vercel KV instead of in-memory.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { detectOperator } from "@/lib/ag-ui/types";

// ============================================================================
// In-Memory Store (shared within this function's container)
// For production: Use Vercel KV, Upstash Redis, or a database
// ============================================================================

interface PairingEntry {
  code: string;
  browserSessionId: string;
  browserNonce: string;
  createdAt: number;
  expiresAt: number;
  status: "pending" | "paired" | "expired";
  
  // Filled when agent pairs
  agentSessionId?: string;
  agentId?: string;
  agentMetadata?: {
    name: string;
    operator?: string;
    model?: string;
    capabilities?: string[];
  };
  pairedAt?: number;
}

// Global stores (persist across requests in same container)
const pairingByCode = new Map<string, PairingEntry>();
const pairingByBrowser = new Map<string, string>(); // browserSessionId -> code

// Generate 6-char code avoiding confusing characters
function generateCode(): string {
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Clean expired entries
function cleanExpired() {
  const now = Date.now();
  for (const [code, entry] of pairingByCode) {
    if (entry.status === "pending" && now > entry.expiresAt) {
      entry.status = "expired";
      pairingByBrowser.delete(entry.browserSessionId);
      pairingByCode.delete(code);
    }
  }
}

// ============================================================================
// POST Handler - All operations
// ============================================================================

export async function POST(request: NextRequest) {
  cleanExpired();
  
  try {
    const body = await request.json();
    const action = body.action || "claim"; // Default to claim for backward compat
    
    // ========================================================================
    // ACTION: CREATE - Browser requests a pairing code
    // ========================================================================
    if (action === "create") {
      // Generate browser session if not provided
      const browserSessionId = body.browserSessionId || createHash("sha256")
        .update(`browser-${Date.now()}-${Math.random()}`)
        .digest("hex");
      
      const browserNonce = body.nonce || createHash("sha256")
        .update(`nonce-${Date.now()}-${Math.random()}`)
        .digest("hex")
        .slice(0, 32);
      
      // Remove existing pairing for this browser
      const existingCode = pairingByBrowser.get(browserSessionId);
      if (existingCode) {
        pairingByCode.delete(existingCode);
        pairingByBrowser.delete(browserSessionId);
      }
      
      // Generate unique code
      let code = generateCode();
      let attempts = 0;
      while (pairingByCode.has(code) && attempts < 10) {
        code = generateCode();
        attempts++;
      }
      
      const now = Date.now();
      const entry: PairingEntry = {
        code,
        browserSessionId,
        browserNonce,
        createdAt: now,
        expiresAt: now + 5 * 60 * 1000, // 5 minutes
        status: "pending",
      };
      
      pairingByCode.set(code, entry);
      pairingByBrowser.set(browserSessionId, code);
      
      // Debug log
      console.log(`[PAIR] Created code ${code} for browser ${browserSessionId.slice(0, 8)}...`);
      console.log(`[PAIR] Store size: ${pairingByCode.size} codes`);
      
      return NextResponse.json({
        success: true,
        code: entry.code,
        browserSessionId: entry.browserSessionId,
        expiresAt: entry.expiresAt,
        expiresIn: Math.floor((entry.expiresAt - now) / 1000),
        statusEndpoint: `/api/v1/ghost/pair`,
        instructions: `Tell your AI agent: "Connect to Loop Protocol with pairing code: ${entry.code}"`,
      }, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "X-Browser-Session": browserSessionId,
          "X-Pairing-Code": entry.code,
        },
      });
    }
    
    // ========================================================================
    // ACTION: STATUS - Check pairing status
    // ========================================================================
    if (action === "status") {
      const browserSessionId = body.browserSessionId;
      const code = body.code;
      
      let entry: PairingEntry | undefined;
      
      if (browserSessionId) {
        const foundCode = pairingByBrowser.get(browserSessionId);
        if (foundCode) {
          entry = pairingByCode.get(foundCode);
        }
      } else if (code) {
        entry = pairingByCode.get(code.toUpperCase());
      }
      
      // Debug log
      console.log(`[PAIR] Status check: browser=${browserSessionId?.slice(0, 8)}... code=${code}`);
      console.log(`[PAIR] Found entry: ${entry ? entry.status : 'not found'}`);
      console.log(`[PAIR] Store size: ${pairingByCode.size} codes`);
      
      if (!entry) {
        return NextResponse.json({
          found: false,
          status: "not_found",
          paired: false,
          debug: {
            storeSize: pairingByCode.size,
            browserSessionId: browserSessionId?.slice(0, 8),
          },
        }, {
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }
      
      // Check expiry
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
    
    // ========================================================================
    // ACTION: CLAIM (default) - Agent claims a pairing code
    // ========================================================================
    const code = (body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const agentId = body.agentId;
    const metadata = body.metadata || { name: agentId };
    
    // Debug log
    console.log(`[PAIR] Claim attempt: code=${code} agentId=${agentId}`);
    console.log(`[PAIR] Store size: ${pairingByCode.size} codes`);
    console.log(`[PAIR] Available codes: ${Array.from(pairingByCode.keys()).join(", ")}`);
    
    if (!code || code.length < 4) {
      return NextResponse.json({
        success: false,
        error: "INVALID_CODE_FORMAT",
        message: "Pairing code must be at least 4 characters",
      }, { status: 400 });
    }
    
    if (!agentId) {
      return NextResponse.json({
        success: false,
        error: "MISSING_AGENT_ID",
        message: "agentId is required",
      }, { status: 400 });
    }
    
    const entry = pairingByCode.get(code);
    
    if (!entry) {
      return NextResponse.json({
        success: false,
        error: "INVALID_CODE",
        message: `Pairing code '${code}' not found. Available: ${pairingByCode.size} codes.`,
        debug: { storeSize: pairingByCode.size },
      }, { status: 400 });
    }
    
    if (entry.status === "expired" || Date.now() > entry.expiresAt) {
      entry.status = "expired";
      return NextResponse.json({
        success: false,
        error: "CODE_EXPIRED",
        message: "Pairing code has expired. Request a new code.",
      }, { status: 400 });
    }
    
    if (entry.status === "paired") {
      return NextResponse.json({
        success: false,
        error: "CODE_ALREADY_USED",
        message: "This code has already been used.",
      }, { status: 400 });
    }
    
    // Generate agent session
    const agentSessionId = createHash("sha256")
      .update(`agent-${agentId}-${Date.now()}-${Math.random()}`)
      .digest("hex");
    
    // Update entry
    entry.agentSessionId = agentSessionId;
    entry.agentId = agentId;
    entry.agentMetadata = metadata;
    entry.pairedAt = Date.now();
    entry.status = "paired";
    
    console.log(`[PAIR] Success! Code ${code} paired with agent ${agentId}`);
    
    const operator = detectOperator(metadata);
    
    return NextResponse.json({
      success: true,
      sessionId: agentSessionId,
      browserSessionId: entry.browserSessionId,
      pairedAt: entry.pairedAt,
      operator: operator.name,
      capabilities: ["TEXT_MESSAGE", "TOOL_CALL", "STATE_SYNC", "HUD_CONTROL"],
      streamEndpoint: `/api/v1/ghost/stream?sessionId=${entry.browserSessionId}`,
      inputEndpoint: `/api/v1/ghost/input`,
      message: `Successfully paired with browser HUD. You can now send events to the terminal.`,
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
      message: "Failed to process request",
    }, { status: 500 });
  }
}

// ============================================================================
// GET Handler - Quick status check (backward compat)
// ============================================================================

export async function GET(request: NextRequest) {
  cleanExpired();
  
  const code = request.nextUrl.searchParams.get("code");
  const browserSessionId = request.nextUrl.searchParams.get("browserSessionId");
  
  // Debug info
  if (!code && !browserSessionId) {
    return NextResponse.json({
      info: "AG-UI Pairing Endpoint",
      usage: {
        create: "POST { action: 'create' }",
        claim: "POST { code: 'XXXXXX', agentId: '...', metadata: {...} }",
        status: "POST { action: 'status', browserSessionId: '...' } or GET ?browserSessionId=...",
      },
      debug: {
        storeSize: pairingByCode.size,
        codes: Array.from(pairingByCode.keys()),
      },
    });
  }
  
  let entry: PairingEntry | undefined;
  
  if (browserSessionId) {
    const foundCode = pairingByBrowser.get(browserSessionId);
    if (foundCode) {
      entry = pairingByCode.get(foundCode);
    }
  } else if (code) {
    entry = pairingByCode.get(code.toUpperCase());
  }
  
  if (!entry) {
    return NextResponse.json({
      found: false,
      status: "not_found",
      paired: false,
    }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
  
  // Check expiry
  if (entry.status === "pending" && Date.now() > entry.expiresAt) {
    entry.status = "expired";
  }
  
  const response: Record<string, unknown> = {
    found: true,
    code: entry.code,
    status: entry.status,
    paired: entry.status === "paired",
    remainingSeconds: Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000)),
  };
  
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
