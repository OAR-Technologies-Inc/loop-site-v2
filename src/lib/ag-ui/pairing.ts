/**
 * AG-UI Pairing System
 * 
 * Links browser HUD sessions to remote AI agents via 6-digit codes.
 * In production, use Redis with TTL. This is in-memory for demo.
 */

export interface PairingEntry {
  code: string;
  
  // Browser side
  browserSessionId: string;
  browserNonce: string;
  createdAt: number;
  expiresAt: number;
  
  // Agent side (filled when agent pairs)
  agentSessionId?: string;
  agentId?: string;
  agentMetadata?: {
    name: string;
    operator?: string;
    model?: string;
    capabilities?: string[];
  };
  pairedAt?: number;
  
  // Connection state
  status: "pending" | "paired" | "expired" | "disconnected";
}

// In-memory store (use Redis in production)
const pairingStore = new Map<string, PairingEntry>();

// Browser session → pairing code lookup
const browserToPairing = new Map<string, string>();

// Agent session → pairing code lookup  
const agentToPairing = new Map<string, string>();

// Clean up expired entries every 30 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [code, entry] of pairingStore) {
      if (now > entry.expiresAt && entry.status === "pending") {
        entry.status = "expired";
        browserToPairing.delete(entry.browserSessionId);
        pairingStore.delete(code);
      }
    }
  }, 30000);
}

/**
 * Generate a 6-digit pairing code
 */
function generateCode(): string {
  // Avoid confusing characters (0/O, 1/I/L)
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Create a new pairing code for a browser session
 */
export function createPairingCode(browserSessionId: string, browserNonce: string): PairingEntry {
  // Remove any existing pairing for this browser session
  const existingCode = browserToPairing.get(browserSessionId);
  if (existingCode) {
    pairingStore.delete(existingCode);
  }
  
  // Generate unique code
  let code = generateCode();
  while (pairingStore.has(code)) {
    code = generateCode();
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
  
  pairingStore.set(code, entry);
  browserToPairing.set(browserSessionId, code);
  
  return entry;
}

/**
 * Agent claims a pairing code
 */
export function claimPairingCode(
  code: string,
  agentSessionId: string,
  agentId: string,
  agentMetadata: PairingEntry["agentMetadata"]
): { success: boolean; entry?: PairingEntry; error?: string } {
  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  
  const entry = pairingStore.get(normalizedCode);
  
  if (!entry) {
    return { success: false, error: "INVALID_CODE" };
  }
  
  if (entry.status === "expired" || Date.now() > entry.expiresAt) {
    entry.status = "expired";
    return { success: false, error: "CODE_EXPIRED" };
  }
  
  if (entry.status === "paired") {
    return { success: false, error: "CODE_ALREADY_USED" };
  }
  
  // Link agent to this pairing
  entry.agentSessionId = agentSessionId;
  entry.agentId = agentId;
  entry.agentMetadata = agentMetadata;
  entry.pairedAt = Date.now();
  entry.status = "paired";
  
  agentToPairing.set(agentSessionId, normalizedCode);
  
  return { success: true, entry };
}

/**
 * Get pairing entry by code
 */
export function getPairingByCode(code: string): PairingEntry | undefined {
  return pairingStore.get(code.toUpperCase());
}

/**
 * Get pairing entry by browser session
 */
export function getPairingByBrowser(browserSessionId: string): PairingEntry | undefined {
  const code = browserToPairing.get(browserSessionId);
  return code ? pairingStore.get(code) : undefined;
}

/**
 * Get pairing entry by agent session
 */
export function getPairingByAgent(agentSessionId: string): PairingEntry | undefined {
  const code = agentToPairing.get(agentSessionId);
  return code ? pairingStore.get(code) : undefined;
}

/**
 * Check if a browser session has a paired agent
 */
export function isPaired(browserSessionId: string): boolean {
  const entry = getPairingByBrowser(browserSessionId);
  return entry?.status === "paired";
}

/**
 * Disconnect a pairing
 */
export function disconnectPairing(code: string): boolean {
  const entry = pairingStore.get(code);
  if (entry) {
    entry.status = "disconnected";
    if (entry.agentSessionId) {
      agentToPairing.delete(entry.agentSessionId);
    }
    browserToPairing.delete(entry.browserSessionId);
    pairingStore.delete(code);
    return true;
  }
  return false;
}

// Export stores for debugging
export { pairingStore, browserToPairing, agentToPairing };
