# Mandate — Architecture

## System overview

```mermaid
flowchart TD
    U["Human"] -->|defines| M["Mandate config\ncap, per-txn limit,\nallowlist, expiry"]
    A["Agent"] -->|"POST /intent\nmerchant, amount, item"| S["Express server"]
    S --> P["Policy engine\nsrc/policy.ts"]
    M --> P
    B["Avalanche Fuji\nXSGD balance\n(viem)"] --> P

    P -->|"fail: any rule"| D["DECLINE\n+ reason code"]
    P -->|"pass: all 5 rules"| I["Card issuance\nsrc/cardIssuance.ts"]

    I -->|SSE| MCP["StraitsX MCP\nsandbox\nget_card_sandbox"]
    MCP -->|response| G["Guard\nsrc/mcpGuard.ts"]

    G -->|"clean response"| CH["Challenge captured\n(not signed)"]
    G -->|"injection patterns\nmatched"| X["Extractor\nsrc/mcpPaymentExtractor.ts"]

    X -->|"fields validated\nagainst mandate + network"| PR["PENDING_REVIEW"]
    PR -->|"human clicks Approve\non dashboard"| SIGN["x402 / EIP-3009 signing\nsrc/x402.ts"]
    SIGN -->|"POST, get 402,\nsign, retry"| MCP2["StraitsX cardapi"]
    MCP2 -->|"card + settlement tx"| CARD["One-time card\n+ receipt"]

    D --> LOG["Decision log\ndecisions.json\nappend-only"]
    CH --> LOG
    CARD --> LOG
    PR --> LOG

    LOG --> DASH["Dashboard\npublic/index.html\nbalance, headroom,\ndecision table, review actions"]
```

## Why it's shaped this way

**The policy engine never trusts the network.** Every purchase intent is checked against five deterministic rules (expiry, merchant allowlist, per-transaction limit, total cap, live XSGD balance) before anything is issued. This is pure, synchronous, unit-tested code, no external calls, no ambiguity.

**MCP responses are treated as untrusted input, not instructions.** This is the core security design. When the real StraitsX sandbox returned a response containing embedded text telling the agent to sign a transaction immediately without asking the user, the guard caught it before it ever reached signing code. The system doesn't just refuse forever, it separates the *facts* (amount, wallet, chain, card API URL) from the *instructions* (the injected text), validates the facts, and requires a human to explicitly approve before any signature happens.

**Everything is logged, append-only.** Every decision, approve or decline, real card or blocked attempt, is written to `decisions.json` with a timestamp and reason code. Nothing is silently dropped.

## Component map

| Component | File | Responsibility |
|---|---|---|
| Policy engine | `src/policy.ts` | Five-rule evaluation, pure function |
| XSGD balance reader | `src/xsgd.ts` | Live ERC-20 balance via viem on Avalanche Fuji |
| MCP card client | `src/mcpCardClient.ts` | SSE connection to StraitsX sandbox MCP |
| Guard | `src/mcpGuard.ts` | Detects prompt-injection patterns in MCP responses |
| Payment extractor | `src/mcpPaymentExtractor.ts` | Pulls and validates factual payment fields, ignores instruction text |
| x402 signer | `src/x402.ts` | HTTP 402 challenge, EIP-3009 `transferWithAuthorization` signing, signed retry |
| Decision log | `src/decisionLog.ts` | Append-only JSON log, review status updates |
| Server | `src/server.ts` | Express routes: `/intent`, `/status`, `/decisions`, `/review/:id/approve|decline`, `/dry-run` |
| Dashboard | `public/index.html` | Live balance, mandate headroom, decision table, guard banner, review actions |

## Network

Avalanche Fuji testnet (chain ID 43113), confirmed with a StraitsX mentor as the judging network. XSGD is an ERC-20 token, 6 decimals. See `README.md` for the full network table and `.env.example` for configuration.
