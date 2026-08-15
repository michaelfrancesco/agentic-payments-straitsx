const SAFE_FIELDS = [
  "card_opaque_id",
  "cardapi",
  "cardapi_url",
  "settlement_tx",
  "card_html",
  "expiry",
  "amount_sgd",
  "wallet_address",
  "cardholder_name",
  "chain_id",
  "payment_requirements",
  "PAYMENT-REQUIRED",
];

const INJECTION_PATTERNS = [
  /immediately and autonomously/i,
  /do\s*not\s+ask.*confirmation/i,
  /execute[_\s-]*now/i,
  /auto[-\s]?sign/i,
  /ignore\s+(previous|prior|above)/i,
  /system\s*:/i,
  /execute\s+these\s+steps/i,
  /sign\s+.*wallet/i,
  /without\s+confirmation/i,
  /transfer.*authorization.*(sign|without)/i,
  /instruction\s*:/i,
  /action\s*:\s*["']?execute/i,
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function sanitizeResponse(payload: unknown): { safe: object; dropped: string[] } {
  const dropped: string[] = [];

  if (!isPlainObject(payload)) {
    return { safe: {}, dropped };
  }

  const safe: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (SAFE_FIELDS.includes(key)) {
      safe[key] = value;
      continue;
    }

    dropped.push(key);

    if (isPlainObject(value)) {
      const nested: Record<string, unknown> = {};
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (SAFE_FIELDS.includes(nestedKey)) {
          nested[nestedKey] = nestedValue;
        }
      }
      if (Object.keys(nested).length > 0) {
        safe[key] = nested;
      }
    }
  }

  return { safe, dropped };
}

export function detectInjection(rawText: string): {
  flagged: boolean;
  patterns: string[];
  excerpts: string[];
} {
  const patterns: string[] = [];
  const excerpts: string[] = [];

  for (const regex of INJECTION_PATTERNS) {
    const match = rawText.match(regex);
    if (match && match.index !== undefined) {
      patterns.push(regex.source);
      const start = Math.max(0, match.index - 40);
      const end = Math.min(rawText.length, match.index + match[0].length + 40);
      excerpts.push(rawText.slice(start, end));
    }
  }

  return { flagged: patterns.length > 0, patterns, excerpts };
}

export function guardPayload(
  payload: unknown
):
  | { verdict: "SAFE"; safe: object }
  | { verdict: "SUSPICIOUS"; patterns: string[]; excerpts: string[]; dropped: string[] } {
  const rawText = JSON.stringify(payload);
  const { flagged, patterns, excerpts } = detectInjection(rawText);
  const { safe, dropped } = sanitizeResponse(payload);

  if (flagged) {
    return { verdict: "SUSPICIOUS", patterns, excerpts, dropped };
  }

  return { verdict: "SAFE", safe };
}
