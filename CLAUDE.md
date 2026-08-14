# CLAUDE.md

Read this before doing anything. This file is the project's source of truth.

## What this project is

**Name:** Mandate
**One line:** An agent spend control plane. A policy layer that decides whether an AI agent's purchase should be allowed *before* a payment card is ever issued.

**Context:** This is a hackathon submission for Agentix Playground (SMU, 14 to 16 Aug 2026), hosted by StraitsX with Avalanche and AWS. Track: **Agentic Payments Infrastructure**, defined as "build the wallets, payment rails, policies, and protocols that let AI spend safely."

**Thesis:** The bottleneck in agentic payments is trust, not intelligence. The missing infrastructure is not a smarter agent, it is a mandate the agent cannot exceed.

**Builder:** Solo. Roughly 20 usable hours. Optimise every suggestion for shipping speed over elegance.

## The core loop

1. A human creates a **mandate**: spend cap, merchant allowlist, expiry, per-transaction limit
2. An agent submits a **purchase intent**: merchant, amount, item description
3. The **policy engine** evaluates the intent against the mandate and the live XSGD balance
4. If it passes, call the StraitsX MCP to mint a **one-time card** scoped to that exact amount and merchant
5. If it fails, return a structured **decline with a reason code**
6. Every decision is written to an **append-only log**
7. A **receipt** links the card to the XSGD balance it drew against

## Definition of done

The demo must show, in under 60 seconds:

- One purchase **approved**, minting a real one-time card in the StraitsX sandbox
- One purchase **declined** for exceeding the spend cap
- One purchase **declined** for a merchant not on the allowlist
- A decision log showing all three with reason codes and timestamps
- Live XSGD balance and remaining headroom on screen

**The decline is the demo.** Anyone can show a payment succeeding. Correct refusal is the whole thesis.

## Hard scope boundaries

**In scope**
- Mandate storage and evaluation (a single mandate is fine, hardcoded to start)
- Policy engine with four rules: total cap, per-transaction limit, merchant allowlist, expiry
- Live XSGD balance read from Avalanche
- One-time card issuance via StraitsX MCP
- Append-only decision log with reason codes
- One dashboard page

**Explicitly out of scope. Do not build these, do not suggest them.**
- A real shopping agent that browses live e-commerce sites. Discovery is hardcoded or uses the provided demo store
- Authentication, user accounts, multi-tenancy
- Refunds, chargebacks, partial captures
- Any custom smart contract
- Mobile responsiveness
- Databases requiring setup. Use SQLite or a JSON file
- Docker, Kubernetes, CI pipelines
- Test suites beyond the policy engine unit tests
- Anything that cannot be demoed in 60 seconds

## Tech stack

- **Runtime:** Node.js with TypeScript
- **Server:** Express
- **Chain reads:** viem, against Avalanche
- **Storage:** SQLite via better-sqlite3, or a flat JSON file if that is faster
- **Frontend:** single page, plain React with Vite, or plain HTML if faster. No component library
- **Card issuance:** StraitsX MCP card gateway, connected directly over SSE (no reference repo available this year)

Do not introduce a new dependency without saying why in one sentence.

## The MCP card gateway

There is no cloned reference repo this year. Instead, connect directly to StraitsX's MCP server over SSE:

- Sandbox: `https://card.straitsx.ai/sandbox/sse`
- Production: `https://card.straitsx.ai/production/sse`

**Before implementing card issuance, connect as an MCP client and list the available tools.** Do not assume a tool name or parameter schema. Report what you find, then wait for confirmation before wiring it into the policy engine.

## Network

| Setting | Value |
|---|---|
| Profile in use | sandbox-live (Fuji testnet) |
| MCP SSE endpoint | `https://card.straitsx.ai/sandbox/sse` |
| Fuji RPC | `https://api.avax-test.network/ext/bc/C/rpc` (chain ID 43113) |
| Mainnet RPC | `https://api.avax.network/ext/bc/C/rpc` (chain ID 43114) |
| My EVM address | `0xfc26adF2dBa2357E497C7dD606800FC130c028d9` |

The track rules say C-Chain Mainnet. We are building and demoing against sandbox/Fuji by default: zero real-money risk, and the network choice for judging was unconfirmed with organisers as of writing. Switching to mainnet later is a config change (swap the SSE URL and RPC), not a rebuild. Confirm with organisers if time allows.

**Safety rule: never loop or auto-retry a live payment call. Cap all test amounts in the single digits. Always have a dry-run mode that stops before the real transaction.**

## How I want you to work with me

- I am solo and time-boxed. Prefer the boring solution that ships
- Give me the short answer first, then detail only if I ask
- If I ask for something outside the scope boundaries above, tell me it is out of scope before writing any code
- Never write more than one feature at a time. Get it running, then move on
- When something breaks, give me the single most likely cause first, not five possibilities
- Do not use em dashes in anything you write for me
- Explain any blockchain or payments concept in plain language the first time it comes up. My background is finance and operations, not web3

## Build order

Work in this sequence. Do not jump ahead.

1. Express skeleton with `POST /intent` returning a hardcoded approve
2. Policy engine: four rules, unit tested, returns approve or decline with a reason code
3. Connect to the StraitsX MCP sandbox SSE endpoint, list its tools, then wire an approved intent to mint a real sandbox card
4. Read live XSGD balance and factor it into headroom
5. Decision log persisted with timestamp, verdict, reason, card reference, balance at decision time
6. Dashboard page
7. README and architecture diagram

**Checkpoint:** if step 3 is not working by Saturday 1530, stub the card issuance with a clearly labelled mock and continue. A polished control plane with a stubbed issuer beats a broken end-to-end.

## Reason codes

Use these exact strings in declines:

- `CAP_EXCEEDED` mandate total spend cap would be breached
- `TXN_LIMIT_EXCEEDED` single transaction over the per-transaction limit
- `MERCHANT_NOT_ALLOWED` merchant not on the allowlist
- `MANDATE_EXPIRED` mandate past its expiry
- `INSUFFICIENT_BALANCE` on-chain XSGD balance below the requested amount
- `MANDATE_REVOKED` human killed the mandate

## Submission requirements

Four URLs due Sunday 16 Aug at 1100:

1. 1 minute recorded pitch video
2. GitHub repository, public
3. Front-end, deployed and publicly reachable
4. Product architecture diagram

Remind me of these if we get close to the deadline.
