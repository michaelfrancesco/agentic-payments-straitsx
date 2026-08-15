# Pre-Submission Test Plan

Run through this once on `localhost`, then once again on the deployed URL, before submitting. Check each box as you go. If anything fails, stop and fix it, don't submit with a known-broken checklist item.

Start clean:

```bash
npm run reset-demo
npm run dev
```

## 1. Happy path

- [ ] Approve: `mikes-store`, amount within cap/per-txn/balance → `APPROVE`, dry-run card object, decision logged.
- [ ] Decline `MERCHANT_NOT_ALLOWED`: merchant not on the allowlist.
- [ ] Decline `TXN_LIMIT_EXCEEDED`: amount over the per-transaction limit (15 XSGD by default).
- [ ] Decline `CAP_EXCEEDED`: needs some prior spend first (per-txn limit is lower than the cap, so this can't be hit in a single call), approve a couple of times, then one more that pushes total spend over 25.
- [ ] Decline `INSUFFICIENT_BALANCE`: amount above the live XSGD balance but under the per-transaction limit.
- [ ] Decline `MANDATE_EXPIRED`: temporarily set `expiresAt` in `mandate.json` to a past timestamp, confirm decline, restore via `npm run reset-demo`.

## 2. Input validation (the fixed bug)

- [ ] `POST /intent` with missing `amount` → `400`, not a silent approve.
- [ ] `amount` as a string (`"10"`) → `400`.
- [ ] Negative or zero `amount` → `400`.
- [ ] `amount` over 10000 → `400`.
- [ ] Missing or empty-string `merchant` → `400`.
- [ ] Missing or non-string `item` → `400`.
- [ ] Malformed JSON body → `400` (not `500`), server stays up.

## 3. Resilience

- [ ] Temporarily point `MCP_SSE_ENDPOINT` in `.env` at an invalid URL, set `DRY_RUN=false`, restart, submit an approved intent → clean `5xx`, not a crash. Confirm `GET /status` still responds right after. Restore `.env` and restart.
- [ ] Send 11+ rapid `POST /intent` requests → the 11th+ return `429` within the same minute, and normal requests succeed again after the window passes.
- [ ] Check the server log for `[unhandledRejection]` / `[uncaughtException]` entries if either fires during testing, the process should keep running either way.

## 4. Review / guard flow (live sandbox, careful, single run)

- [ ] Set `DRY_RUN=false`, submit an approved intent → `DECLINE`, `SUSPICIOUS_MCP_RESPONSE`, `PENDING_REVIEW`.
- [ ] Open **Details** on that row: confirm the neutralized-instructions section lists the actual excerpts, Formatted/Raw tabs both work.
- [ ] Click **Approve review**: confirm the loading spinner appears, then either `CARD_ISSUED` (with a real settlement tx and Snowtrace link) or `APPROVED_NO_SIGNING` if signing is disabled in dry-run.
- [ ] On a separate pending decision, click **Decline**: confirm it moves to `DECLINED` and can't be approved or declined again (`409` on retry).
- [ ] Set `DRY_RUN` back to `true` immediately after.

## 5. Allowlist CRUD

- [ ] Add a merchant via the Allowlist modal, confirm it appears and a new intent against it works.
- [ ] Edit (rename) a merchant, confirm the old name no longer matches and the new one does.
- [ ] Remove a merchant, confirm intents against it now decline `MERCHANT_NOT_ALLOWED`.
- [ ] Try adding a duplicate or empty name, confirm the error shows in the modal, not just the console.

## 6. Dashboard

- [ ] Balance, spend cap, headroom, and dry-run badge all reflect live values on load.
- [ ] Decision table renders with no mid-word text cuts or overlapping columns.
- [ ] Guard banner appears when a suspicious response exists, has a working dismiss (✕) button, and reappears if the blocked count increases again after dismissal.
- [ ] Purchase Intent panel's Formatted/Raw tabs both render correctly after a submission.

## 7. Reset script

- [ ] Run `npm run reset-demo`, confirm `decisions.json` is `[]` and `mandate.json` has the default allowlist with a fresh (non-expired) `expiresAt` on dashboard reload.

## 8. End-to-end timing

- [ ] Full demo script — one approve, two declines, decision log visible, live balance visible — timed under 60 seconds. Run it twice back to back to catch any state leaking between runs.

## 9. Automated checks

```bash
npm test          # expect 53 tests passing
npm run typecheck # expect no output
```

- [ ] Both pass clean immediately before submission.
