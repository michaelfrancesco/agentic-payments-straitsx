export interface ValidatedIntent {
  merchant: string;
  amount: number;
  item: string;
}

const MAX_AMOUNT = 10000;

export function validateIntent(
  body: unknown
): { ok: true; value: ValidatedIntent } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object" };
  }

  const { merchant, amount, item } = body as Record<string, unknown>;

  if (typeof merchant !== "string" || merchant.trim().length === 0) {
    return { ok: false, error: "merchant must be a non-empty string" };
  }

  if (typeof item !== "string" || item.trim().length === 0) {
    return { ok: false, error: "item must be a non-empty string" };
  }

  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return { ok: false, error: "amount must be a finite number" };
  }

  if (amount <= 0) {
    return { ok: false, error: "amount must be greater than 0" };
  }

  if (amount > MAX_AMOUNT) {
    return { ok: false, error: `amount must not exceed ${MAX_AMOUNT}` };
  }

  return { ok: true, value: { merchant, amount, item } };
}
