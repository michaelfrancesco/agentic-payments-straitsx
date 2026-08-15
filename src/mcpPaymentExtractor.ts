const FUJI_CHAIN_ID = 43113;

export interface ExtractedPaymentFields {
  amountSgd?: number;
  walletAddress?: string;
  chainId?: number;
  token?: string;
  cardApiUrl?: string;
  paymentRequirement?: unknown;
}

export interface PaymentValidation {
  status: "VALID" | "INVALID";
  errors: string[];
}

export interface PaymentExtractionResult {
  fields: ExtractedPaymentFields;
  validation: PaymentValidation;
}

interface ExpectedPayment {
  amountSgd: number;
  walletAddress: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numberFrom(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function stringFrom(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function objectAt(payload: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = payload[key];
  return isPlainObject(value) ? value : {};
}

function sameAddress(a?: string, b?: string): boolean {
  return Boolean(a && b && a.toLowerCase() === b.toLowerCase());
}

function validUrl(value?: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function extractPaymentFields(payload: unknown, expected: ExpectedPayment): PaymentExtractionResult {
  if (!isPlainObject(payload)) {
    return {
      fields: {},
      validation: { status: "INVALID", errors: ["MCP response is not an object"] },
    };
  }

  const body = objectAt(payload, "body");
  const environment = objectAt(payload, "environment");

  const fields: ExtractedPaymentFields = {
    amountSgd: numberFrom(payload.amount_sgd) ?? numberFrom(body.amount_sgd),
    walletAddress: stringFrom(payload.wallet_address) ?? stringFrom(body.wallet_address),
    chainId: numberFrom(payload.chain_id) ?? numberFrom(environment.chain_id),
    token: stringFrom(payload.token) ?? stringFrom(environment.token),
    cardApiUrl:
      stringFrom(payload.cardapi_url) ??
      stringFrom(payload.cardapi) ??
      stringFrom(payload.url),
    paymentRequirement: payload.payment_requirements ?? payload["PAYMENT-REQUIRED"],
  };

  const errors: string[] = [];

  if (fields.amountSgd === undefined) {
    errors.push("amount_sgd missing");
  } else if (fields.amountSgd !== expected.amountSgd) {
    errors.push(`amount_sgd ${fields.amountSgd} does not match approved amount ${expected.amountSgd}`);
  }

  if (!fields.walletAddress) {
    errors.push("wallet_address missing");
  } else if (!sameAddress(fields.walletAddress, expected.walletAddress)) {
    errors.push("wallet_address does not match agent wallet");
  }

  if (fields.chainId === undefined) {
    errors.push("chain_id missing");
  } else if (fields.chainId !== FUJI_CHAIN_ID) {
    errors.push(`chain_id ${fields.chainId} is not Fuji ${FUJI_CHAIN_ID}`);
  }

  if (!fields.token?.toUpperCase().includes("XSGD")) {
    errors.push("token is missing or not XSGD");
  }

  if (!validUrl(fields.cardApiUrl)) {
    errors.push("card API URL missing or not HTTPS");
  }

  return {
    fields,
    validation: {
      status: errors.length === 0 ? "VALID" : "INVALID",
      errors,
    },
  };
}
