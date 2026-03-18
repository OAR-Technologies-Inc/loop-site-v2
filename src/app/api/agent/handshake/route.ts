import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// In-memory nonce store (in production, use Redis or similar)
// Map of nonce -> { createdAt, used }
const nonceStore = new Map<string, { createdAt: number; used: boolean }>();

// Clean up expired nonces every minute (5 minute TTL)
const NONCE_TTL = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [nonce, data] of nonceStore.entries()) {
    if (now - data.createdAt > NONCE_TTL) {
      nonceStore.delete(nonce);
    }
  }
}, 60 * 1000);

/**
 * GET /api/agent/handshake
 * 
 * Issues a new challenge nonce for agent authentication.
 * The agent must sign this nonce and return it via POST.
 */
export async function GET(_request: NextRequest) {
  // Generate cryptographically secure nonce
  const nonce = randomBytes(32).toString("hex");
  const timestamp = Date.now();
  
  // Store nonce with creation time
  nonceStore.set(nonce, { createdAt: timestamp, used: false });
  
  // Build challenge payload
  const challenge = {
    protocol: "loop-protocol",
    version: "1.0.0",
    nonce,
    timestamp,
    challenge: `Sign this message to authenticate with Loop Protocol: ${nonce}`,
    expiresIn: NONCE_TTL,
    programs: {
      CRED: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
      VAULT: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
      SHOPPING: "HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ",
      CRED_MINT: "9GQMCAK3MpZF1hEbwqA9d4mRGtippGV9hyr8fxmz6eA",
    },
    capabilities: [
      "createVault",
      "registerAgent",
      "getVaultStats",
      "stakeAgent",
      "wrap",
      "unwrap",
      "stack",
      "unstake",
      "claimYield",
    ],
    manifest: "/llms.txt",
  };

  return NextResponse.json(challenge, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

/**
 * POST /api/agent/handshake
 * 
 * Validates the signed nonce and establishes a session.
 * 
 * Body:
 * {
 *   nonce: string,           // The nonce from GET
 *   signature: string,       // Agent's signature of the nonce
 *   agentId: string,         // Optional: Agent identifier
 *   publicKey?: string,      // Optional: Agent's public key for verification
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nonce, signature, agentId } = body;

    // Validate nonce exists
    if (!nonce || typeof nonce !== "string") {
      return NextResponse.json(
        { error: "INVALID_NONCE", message: "Nonce is required" },
        { status: 400 }
      );
    }

    // Check nonce in store
    const nonceData = nonceStore.get(nonce);
    if (!nonceData) {
      return NextResponse.json(
        { error: "NONCE_NOT_FOUND", message: "Nonce not found or expired" },
        { status: 401 }
      );
    }

    // Check if nonce was already used (replay attack prevention)
    if (nonceData.used) {
      return NextResponse.json(
        { error: "NONCE_REUSED", message: "This nonce has already been used" },
        { status: 401 }
      );
    }

    // Check nonce expiration
    if (Date.now() - nonceData.createdAt > NONCE_TTL) {
      nonceStore.delete(nonce);
      return NextResponse.json(
        { error: "NONCE_EXPIRED", message: "Nonce has expired" },
        { status: 401 }
      );
    }

    // Validate signature exists
    if (!signature || typeof signature !== "string") {
      return NextResponse.json(
        { error: "INVALID_SIGNATURE", message: "Signature is required" },
        { status: 400 }
      );
    }

    // In production, verify the signature cryptographically
    // For now, we'll do a simple hash check (mock MPC signature)
    // In production, verify against expected hash:
    // createHash("sha256").update(`loop-protocol:${nonce}`).digest("hex").slice(0, 16)
    // For demo, accept any non-empty signature
    const isValidSignature = signature.length >= 8;

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "SIGNATURE_INVALID", message: "Signature verification failed" },
        { status: 401 }
      );
    }

    // Mark nonce as used
    nonceData.used = true;
    nonceStore.set(nonce, nonceData);

    // Generate session token
    const sessionToken = randomBytes(32).toString("hex");
    const sessionExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Build session response
    const session = {
      status: "AUTHENTICATED",
      sessionToken,
      expiresAt: sessionExpiry,
      agentId: agentId || `agent_${randomBytes(8).toString("hex")}`,
      permissions: [
        "vault:read",
        "vault:create",
        "agents:read",
        "agents:subscribe",
        "cred:wrap",
        "cred:unwrap",
      ],
      rateLimit: {
        requests: 1000,
        windowMs: 60000,
      },
      endpoints: {
        vault: "/api/vault",
        agents: "/api/agents",
        cred: "/api/cred",
        transactions: "/api/tx",
      },
      message: "Agent authenticated successfully. Use sessionToken in Authorization header for subsequent requests.",
    };

    return NextResponse.json(session, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "X-Session-Token": sessionToken,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to process handshake" },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/agent/handshake
 * 
 * CORS preflight handler
 */
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
