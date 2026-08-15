# Mandate — Build Checklist

Tick as you go. Assistant also mirrors these in Conductor's task panel. This file is the human-editable copy.

Time budget from Sat 15 Aug 14:00 SGT. Submission Sunday 16 Aug 1100 SGT.

---

## ✅ Step 1 — Express skeleton (DONE 14:00 SGT)

- [x] `package.json`, `tsconfig.json`, `src/server.ts` created
- [x] `npm install` succeeds
- [x] Server runs on port 4020
- [x] `POST /intent` returns `{"verdict": "APPROVE"}` for any input
- [x] curl test passes

## ✅ Step 2 — Policy engine (DONE 14:12 SGT)

- [x] `src/types.ts`, `src/mandate.config.ts`, `src/policy.ts`, `src/policy.test.ts` created
- [x] Mandate config: cap 25 XSGD, per-txn 15, allowlist [mikes-store, daily-groceries, bros-bros], expiry +48h
- [x] Rule order: expiry → allowlist → per-txn limit → total cap
- [x] `npm test` shows 5 passing tests (4 declines + 1 approve)
- [x] Reason codes match `CLAUDE.md` exactly
- [x] `server.ts` not yet touched (engine tested in isolation)

## ✅ Step 2b — Wire policy into server (DONE 14:45 SGT)

- [x] `src/server.ts` imports `mandate` and `evaluatePolicy`
- [x] Module-level `let spentSoFar = 0`
- [x] `/intent` handler calls `evaluatePolicy`, adds to `spentSoFar` on APPROVE
- [x] curl `mikes-store`, amount 10 → APPROVE
- [x] curl `mikes-store`, amount 20 → DECLINE `TXN_LIMIT_EXCEEDED`
- [x] curl `sketchy-shop`, amount 5 → DECLINE `MERCHANT_NOT_ALLOWED`

## ✅ Step 3 — MCP card issuance (DONE with guard-discovered live risk)

- [x] `.env` recreated with `MCP_SSE_ENDPOINT`, `AGENT_ADDRESS`, `AGENT_PRIVATE_KEY` (from `.context/wallet-backup.md`), `DRY_RUN=true`
- [x] Claude Code listed available MCP tools from `card.straitsx.ai/sandbox/sse` and confirmed `get_card_sandbox`
- [x] `src/mcpCardClient.ts` connects via SSE and calls the card-mint tool
- [x] `src/cardIssuance.ts` wraps the client with `DRY_RUN` behaviour
- [x] `server.ts` on APPROVE calls `issueOneTimeCard`, attaches result to response
- [x] `DRY_RUN=true`: approved intent logs what would be sent, no live call
- [ ] `DRY_RUN=false`: real response currently triggers prompt-injection guard instead of card signing

## ✅ 15:30 HARD CHECKPOINT

- [x] Real card issuance working end-to-end? → no, guard found suspicious MCP payload before signing
- [x] Not working? → `DRY_RUN=true` remains safety default
- [x] Outcome logged to `claude-code-context-docs/log.md`

## ✅ Step 4 — Live XSGD balance + `INSUFFICIENT_BALANCE` (DONE 16:15 SGT)

- [x] `src/xsgd.ts` reads XSGD ERC-20 balance from Fuji via viem
- [x] `src/policy.ts` adds fifth rule: `amount > balance` → DECLINE `INSUFFICIENT_BALANCE`
- [x] `src/policy.test.ts` adds a test for it
- [x] `server.ts` reads balance before evaluating
- [x] `GET /status` returns the live balance
- [x] All policy tests pass (6 total)

## ✅ Step 5 — Decision log persisted to JSON (DONE 16:45 SGT)

- [x] `src/decisionLog.ts` with `appendDecision` and `getDecisionsNewestFirst`
- [x] `decisions.json` starts as `[]`, added to `.gitignore`
- [x] `server.ts` calls `appendDecision` after every verdict
- [x] `GET /decisions` returns entries newest first
- [x] Each entry has: timestamp, merchant, amount, item, verdict, reasonCode?, cardReference?, balanceAtDecision
- [x] Server restart preserves the log

## ✅ Step 5.5 — Prompt injection guard (DONE 17:00 SGT)

**Justification:** we captured a real injection from the StraitsX MCP response. Building a defence and demoing it is the strongest possible submission. Sits after decision log so hits can be recorded.

- [x] `src/mcpGuard.ts` with `sanitizeResponse`, `detectInjection`, `guardPayload`
- [x] Whitelist known-safe fields (card_opaque_id, cardapi URL, settlement_tx, etc.); drop everything else
- [x] Regex scan for injection patterns (`immediately and autonomously`, `do not ask.*confirmation`, `auto[-\\s]?sign`, `execute these steps`, `ignore previous`, `system:`, etc.)
- [x] `cardIssuance.ts` runs the guard; if SUSPICIOUS, does not proceed to sign
- [x] New reason code `SUSPICIOUS_MCP_RESPONSE` in decision log with matched patterns
- [x] Unit test using a fixture of the real injection payload we captured
- [x] Manual test: with DRY_RUN off, real MCP call triggers the guard

## ✅ Step 6 — Dashboard (DONE 17:01 SGT)

- [x] `public/index.html`: dark theme, large text, three sections
- [x] Status panel: balance, spent-vs-cap bar, mandate details
- [x] Intent form: merchant, amount, item, submit button
- [x] Decision log table: approves green, declines red with reason code
- [x] `server.ts` serves static from `/public`
- [x] Opens at `http://localhost:4020/`
- [x] Auto-refreshes every 5 seconds

## ✅ Step 6.5 — Dashboard shows guard alerts (DONE 17:01 SGT)

- [x] Red banner at top when any decision has `SUSPICIOUS_MCP_RESPONSE`: "Prompt injection detected. Wallet keys never touched."
- [x] Counter above log: "Injections blocked: N"
- [x] SUSPICIOUS row in log renders with a distinct warning style

## ⬜ Step 7a — README

- [ ] Problem
- [ ] Thesis (the decline is the demo)
- [ ] Architecture summary
- [ ] What works / what is stubbed
- [ ] How to run (setup, start, test)
- [ ] Sponsor section: where x402 and EIP-3009 appear (Avalanche prize)
- [ ] Sponsor section: AWS Well-Architected mapping (AWS prize)

## ⬜ Step 7b — Architecture diagram

- [ ] Six boxes in Excalidraw: Human, Mandate (Policy + Log), StraitsX MCP Card Gateway, Avalanche C-Chain (XSGD), Merchant, Agent
- [ ] Signed arrow labels at each step
- [ ] Exported as PNG
- [ ] Saved and URL captured for submission

## ⬜ Step 7c — 60-second pitch script

- [ ] 0-10s: problem
- [ ] 10-25s: thesis
- [ ] 25-50s: live demo (one approve + two declines with reason codes visible)
- [ ] 50-60s: the seam (signed, logged, revocable, StraitsX + Avalanche + x402)
- [ ] Rehearsed twice out loud

## ⬜ Step 7d — Push to public GitHub

- [ ] New public GitHub repo created
- [ ] `.env` NOT in the diff
- [ ] `decisions.json` NOT in the diff
- [ ] Private key NOT in any committed file (grep it, be paranoid)
- [ ] Pushed
- [ ] URL opens in incognito

## ⬜ Sunday morning — record, deploy, submit

- [ ] 07:00 wake
- [ ] 07:30-08:30 record 60s video (QuickTime, multiple takes)
- [ ] 08:30-09:30 upload video to Drive/YouTube, start Cloudflare tunnel against localhost:4020, export architecture diagram
- [ ] 09:30-10:30 submit four URLs (video, GitHub, frontend, diagram)
- [ ] Each URL verified in incognito window
- [ ] 10:30-11:00 buffer

---

## End-of-Saturday definition of done

- [x] `npm test` green (13 tests)
- [x] APPROVE and key DECLINE reason codes reachable via curl
- [x] Dashboard shows balance, mandate, ≥3 decisions
- [x] Real sandbox card blocked by prompt-injection guard; dry-run remains safety default
- [ ] Public GitHub pushed, secrets clean
- [ ] Architecture diagram PNG ready
- [ ] Pitch script written
- [ ] `log.md` updated
- [ ] Sunday plan reviewed before bed
