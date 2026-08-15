# Mandate Submission and Judging Checklist

Use this as the final judge-readiness checklist.

## Submission Format

Required by the hackathon:

- [ ] 1 minute recorded pitch video URL
- [ ] Public GitHub repository URL
- [ ] Public frontend URL
- [ ] Product architecture diagram URL

Current status:

- [ ] Video not done
- [ ] GitHub public repo not pushed after rebuild
- [ ] Public frontend not deployed or tunneled
- [ ] Architecture diagram not exported

## Demo Must Show

- [x] Live XSGD balance on Fuji
- [x] Mandate rules: cap, per-transaction limit, merchant allowlist, expiry
- [x] One approved purchase intent in dry-run mode
- [x] One declined merchant not allowed
- [x] One declined transaction limit exceeded
- [x] Decision log with reason codes
- [x] Prompt-injection guard entry: `SUSPICIOUS_MCP_RESPONSE`
- [x] Dashboard banner showing prompt injection was blocked
- [ ] Final video recording showing the story clearly in under 60 seconds

## Technical Readiness

- [x] `npm test` passes, 16 tests
- [x] `npm run typecheck` passes
- [x] Server runs on port 4020
- [x] `/status` returns live 30 XSGD balance
- [x] `/intent` approves or declines based on mandate
- [x] `/decisions` returns newest-first audit log
- [x] Dashboard served from `public/index.html`
- [x] `DRY_RUN=true` safety default
- [x] `.env` ignored by git
- [x] `decisions.json` ignored by git
- [ ] README rebuilt after reset
- [ ] Secrets scan before push
- [ ] Commit current working state

## Judging Fit

### Agentic Payments Infrastructure Track

- [x] Builds payment safety infrastructure, not a shopping agent
- [x] Uses wallet, policy, balance, card gateway, and audit log
- [x] Shows why an agent should not receive unrestricted payment credentials
- [x] Directly supports the thesis: trust is the bottleneck

### StraitsX Real-World Impact Award

- [x] Real problem: AI agents can be tricked into unsafe spending
- [x] Real control: mandate checks before card issuance
- [x] Stronger story: real suspicious MCP response was blocked before signing
- [ ] Needs clearer README and pitch language for non-technical judges

### Avalanche Best Use of x402 on Avalanche

- [x] Reads XSGD balance on Avalanche Fuji
- [x] Uses StraitsX MCP card flow connected to x402-style card issuance
- [x] Explains why signing must be guarded before EIP-3009 authorization
- [ ] Needs README section explaining x402 and EIP-3009 in simple words
- [ ] Full successful live card mint is not the demo path because guard blocks suspicious response

### AWS Best Architected Solution Award

- [x] Security: dry-run default, no auto-retry, guard before signing, private key in `.env`
- [x] Reliability: deterministic policy engine and tests
- [x] Operational excellence: append-only decision log with reason codes
- [x] Cost control: mandate cap and per-transaction limit bound exposure
- [ ] Needs README mapping to AWS Well-Architected pillars

## Panelist Risk List

- [ ] README is missing after rebuild
- [ ] Uncommitted changes are large
- [ ] Public submission URLs are not ready
- [ ] Need a clean explanation that the guard block is the feature, not a failure
- [ ] Need avoid saying "real card mint failed" in the pitch
- [ ] Need say "Mandate blocked unsafe signing" instead

## Top 3 Assessment

Current technical idea: strong.

Current submission readiness: incomplete.

Top 3 chance if submitted as-is: low, because packaging is incomplete.

Top 3 chance if README, diagram, video, and demo story are finished: medium to high, because the live prompt-injection discovery is a strong differentiator.

Most likely sponsor target:

1. StraitsX Real-World Impact Award
2. AWS Best Architected Solution Award
3. Avalanche x402 prize, only if x402 and EIP-3009 are explained clearly

## Two-Hour Improvement Plan

Do these in order:

1. Rebuild `README.md`
2. Write 60-second pitch script
3. Draw architecture diagram
4. Run tests and typecheck
5. Review git diff for secrets
6. Commit and push public GitHub
7. Start public frontend tunnel or deploy
8. Record video

## Recommended Demo Story

Say this:

Mandate is a spend control plane for AI agents. A human gives the agent a mandate: allowed merchants, max amount, expiry, and total cap. The agent asks to buy something. Mandate checks the rules and the live XSGD balance before any payment credential is issued.

Show this:

1. Balance is 30 XSGD
2. Approved purchase at `mikes-store`
3. Decline for `MERCHANT_NOT_ALLOWED`
4. Decline for `TXN_LIMIT_EXCEEDED`
5. Prompt-injection guard row: `SUSPICIOUS_MCP_RESPONSE`

Close with this:

The most important thing is not that an AI can spend. The important thing is that it can be stopped before it signs.

