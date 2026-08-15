# Mandate — 60 Second Pitch Script

Read this while screen-recording the dashboard at `http://localhost:4020/` through the Cloudflare tunnel URL.

Pace: about 150 words per minute. This script is 145 words. Take a breath at each paragraph break. Speak clearly, not fast.

---

## The full 60-second version

**[0-10s: the problem, look at camera or dashboard header]**

AI agents can spend money. That is happening now. The problem is nothing stops them spending yours. Hand an AI your card and one trick empties it. The bottleneck in agentic payments is not intelligence. It is trust.

**[10-20s: the thesis, dashboard visible]**

This is Mandate. It is a permission slip an AI agent cannot exceed. Cap. Per-transaction limit. Merchant allowlist. Expiry. Live balance. Five rules. Every purchase checked, every decision logged.

**[20-40s: the demo, click through 3 decisions]**

Watch. Approve at an allowed merchant, card issued. Decline at a sketchy merchant, reason `MERCHANT_NOT_ALLOWED`. Decline over the cap, reason `CAP_EXCEEDED`. The decline is the demo.

**[40-52s: the injection catch, point at SUSPICIOUS row]**

During this build the real StraitsX sandbox returned a response with embedded instructions telling us to sign a transaction immediately, no confirmation. A prompt injection, live, in a payment API. Mandate caught it. Blocked before signing. Human review required. Wallet safe.

**[52-60s: sponsor namecheck, closing line]**

Built on Avalanche Fuji with XSGD, x402 and EIP-3009 via StraitsX MCP. Milestone four closed. Trust is the missing piece. Mandate is it.

---

## The 30-second backup version (in case you run over)

**[0-8s]** AI agents can spend money. Nothing stops them spending yours. Trust is the missing piece.

**[8-16s]** This is Mandate. A permission slip an AI cannot exceed. Five rules. Every decision logged.

**[16-25s]** Watch: approve at an allowed merchant, card issued. Decline at a sketchy one. Decline over the cap. The decline is the demo. And this row here, the real StraitsX response arrived with a prompt injection. Mandate caught it, blocked signing.

**[25-30s]** Avalanche Fuji, XSGD, x402. Milestone four closed. Mandate is the missing piece.

---

## Recording tips

- Use QuickTime > File > New Screen Recording. Record just the browser window, not the whole screen.
- Do three takes. Pick the best. Do not edit beyond top-and-tail trim.
- Speak your first sentence with more energy than feels natural. It reads normal on video.
- Keep the mouse still except when clicking to demonstrate.
- Have the dashboard already seeded with a good decision sequence BEFORE you hit record: one APPROVE, one MERCHANT_NOT_ALLOWED decline, one CAP_EXCEEDED decline, one SUSPICIOUS_MCP_RESPONSE.
- Upload to YouTube as **Unlisted** (not Private, judges cannot see private).

## Words to avoid on video

- "Um", "so", "actually", "basically", "kind of"
- "I think", "I hope", "maybe"
- Anything that hedges the claim. This is not a demo of "we tried". This is a demo of "it works".
