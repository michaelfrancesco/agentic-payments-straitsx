# Mandate

An agent spend control plane. A policy layer that decides whether an AI agent's purchase should be allowed *before* a payment card is ever issued.

Built for **Agentix Playground** (SMU, 14–16 Aug 2026), hosted by StraitsX with Avalanche and AWS. Track: **Agentic Payments Infrastructure**.

## The problem

Everyone at this hackathon can show an AI agent successfully buying something. That's the easy half. The hard, unsolved half is: how do you stop an agent from spending money it shouldn't? Giving an agent a payment credential without a hard, machine-enforced boundary is how a prompt injection or a bug turns into a real financial loss.

## Thesis

The bottleneck in agentic payments is trust, not intelligence. The missing infrastructure is not a smarter agent, it's a mandate the agent cannot exceed. **The decline is the demo** — a purchase correctly refused for exceeding a cap or hitting a merchant that isn't allowlisted proves the control plane works. A successful payment proves nothing on its own.

## Architecture

```
Agent ──POST /intent──▶ Express API
                            │
                            ▼
                     Policy Engine (pure functions)
                     ├─ MANDATE_EXPIRED?
                     ├─ MERCHANT_NOT_ALLOWED?
                     ├─ TXN_LIMIT_EXCEEDED?
                     ├─ CAP_EXCEEDED?
                     └─ INSUFFICIENT_BALANCE? ──▶ live XSGD balance (viem, Fuji)
                            │
                    APPROVE │ DECLINE
                            │        └──▶ decision log (reason code) ──▶ GET /decisions
                            ▼
              StraitsX MCP (SSE) — get_card_sandbox
                            │
                    x402 challenge (HTTP 402)
                            │
              EIP-3009 transferWithAuthorization
                    signed with the agent's key
                            │
                 retry POST with PAYMENT-SIGNATURE
                            │
                    one-time card issued
                            │
              decision log (card reference) ──▶ dashboard
```

A human sets the **mandate** (spend cap, per-transaction limit, merchant allowlist, expiry) once, hardcoded for the demo. Every purchase intent from the agent is evaluated against it and the agent's live on-chain XSGD balance before a card is ever requested. Only an approved intent reaches the card issuer.

## What works

- `POST /intent` — evaluates a purchase intent against the mandate and live balance, returns approve or a structured decline with a reason code
- Policy engine: four mandate rules plus a live balance check, pure functions, unit tested (11 tests including exact boundary cases)
- Live XSGD balance read from Avalanche Fuji via viem
- Card issuance wired end to end against StraitsX's real sandbox MCP server (`card.straitsx.ai/sandbox/sse`): MCP tool discovery → HTTP 402 challenge → EIP-3009 signature → card mint. Verified to a `DRY_RUN` stop point; full live mint is blocked only on the agent wallet being funded with sandbox XSGD
- Append-only decision log (`GET /decisions`), newest first, with reason codes, timestamps, and card references
- Single dashboard page: live balance, mandate summary, spend headroom bar, decision log, a form to submit test intents

## What doesn't work / is out of scope

- No real shopping agent that browses live e-commerce. Discovery is a hardcoded test form
- No auth, user accounts, or multi-tenancy — one hardcoded mandate
- No refunds, chargebacks, or partial captures
- No custom smart contract
- Storage is a flat JSON file, not a production database
- The full live card mint (past the `DRY_RUN` stop) has not been exercised with real funds, because the agent wallet was not yet funded by organisers as of this build

## How to run

```
npm install
npm run setup   # generates a throwaway agent wallet into .env, prints the address
npm run dev     # starts the server on :4010
```

Send the printed address to the organisers to be funded with sandbox XSGD. Open `http://localhost:4010` for the dashboard, or:

```
curl -X POST localhost:4010/intent \
  -H 'Content-Type: application/json' \
  -d '{"merchant":"acme-store","amount":10,"item":"widget"}'
```

Run the policy engine unit tests:

```
npm test
```

## Where x402 and EIP-3009 appear in the flow

StraitsX's sandbox card issuer speaks the [x402](https://x402.org) protocol: `POST` a card request, get back HTTP `402 Payment Required` with a JSON payment challenge (asset contract, amount, payee, network). To pay, the agent signs an [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) `TransferWithAuthorization` for XSGD entirely off-chain — no gas held by the agent, no separate approve transaction. The signed authorization is base64-encoded into a `PAYMENT-SIGNATURE` header and the request is retried; the issuer submits the transfer on-chain itself and returns the card. This is implemented directly in `src/x402.ts`, with no reference repo, since none was available this year for this MCP server's tool contract.

## AWS Well-Architected mapping

| Pillar | How this design addresses it |
|---|---|
| **Security** | Every purchase is checked against an explicit, auditable mandate before any credential is issued. Private keys never leave `.env` (gitignored). Payment authorizations are signed, scoped, single-use, and time-bounded (`validBefore`) |
| **Reliability** | Card issuance never auto-retries a live payment call (a hard rule in this codebase), preventing duplicate charges from a flaky network. `DRY_RUN` gates all real fund movement during development |
| **Performance efficiency** | Balance checks and card issuance run as simple async calls with no polling loops; the policy engine itself is synchronous, pure, and O(1) per rule |
| **Cost optimisation** | Just-in-time balance checking rather than pre-funding large balances; the mandate cap bounds maximum exposure directly |
| **Operational excellence** | Every decision, approved or declined, is written to an append-only log with a reason code, timestamp, and balance snapshot — a full audit trail with no manual bookkeeping |

## Architecture diagram (for Excalidraw)

Boxes, left to right:

1. **Agent** (client) → arrow labelled `POST /intent {merchant, amount, item}` →
2. **Express API** (`src/server.ts`) →
3. **Policy Engine** (`src/policy.ts`) — small box listing the 5 checks — branches to:
   - **Decision Log** (`decisions.json`) on decline, arrow back to Agent with `{verdict: DECLINE, reason}`
   - on approve, continues to →
4. **StraitsX MCP (sandbox SSE)** — box labelled `get_card_sandbox` →
5. **x402 challenge** (HTTP 402, dashed box) →
6. **EIP-3009 signature** (agent's private key, lock icon) →
7. **StraitsX card issuer** — returns card_opaque_id, settlement_tx →
8. **Decision Log** (approve path also lands here, with card reference) →
9. **Dashboard** (`public/index.html`) — reads Decision Log + `/status` (which reads **Avalanche Fuji** via viem for live balance)

Draw the Decision Log as a single shared box that both the approve and decline paths write into, since that shared, append-only log is the core audit trail the whole design exists to produce.
