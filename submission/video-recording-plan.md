# Video Recording Plan — Mandate 60s Pitch

Every item on your checklist mapped to a spoken line, a screen action, and a timestamp. Total: 60 seconds exactly.

---

## Before you hit record

**Setup once:**

1. Server running: `npm run dev`
2. Cloudflare tunnel running in a second terminal (Sunday morning). Copy the public URL.
3. Open the tunnel URL in a clean Chrome/Safari window. Full screen, no other tabs visible.
4. Zoom the browser to 110% or 125% so text is legible in the recording.
5. Close every other app that could ding, notify, or steal focus. Airplane mode is fine.

**Seed the dashboard in this exact order** so the log looks right when you start recording:

Reset the log first if you want a clean slate:
```
rm decisions.json && curl -X POST http://localhost:4020/dry-run -H "Content-Type: application/json" -d '{"dryRun":true}'
```

Then click through these five intents from the dashboard form:

| # | merchant | amount | item | expected verdict |
|---|---|---|---|---|
| 1 | mikes-store | 10 | widget | APPROVE |
| 2 | sketchy-shop | 5 | shady thing | DECLINE MERCHANT_NOT_ALLOWED |
| 3 | mikes-store | 20 | big widget | DECLINE TXN_LIMIT_EXCEEDED |
| 4 | mikes-store | 10 | laptop stand | APPROVE |
| 5 | mikes-store | 10 | desk lamp | DECLINE CAP_EXCEEDED |

The SUSPICIOUS_MCP_RESPONSE row from your earlier live test should already be in the log from the prior session, plus the successful `01KASWWW...` real sandbox card row. If not, do one live guard cycle now: flip DRY_RUN off, submit one intent, flip back on.

**Take three practice runs before recording.** You will speak faster and cleaner on take three.

---

## The script, second by second

Read the **spoken line** aloud. Do the **screen action** with your mouse. Each row is one beat.

| Time | Spoken line | Screen action |
|---|---|---|
| 0-6s | "AI agents can spend money. Nothing stops them spending yours. The bottleneck in agentic payments is trust, not intelligence." | Dashboard visible, mouse still |
| 6-12s | "This is Mandate. A permission slip an AI cannot exceed. Cap. Per-transaction limit. Merchant allowlist. Expiry. Live balance." | Point mouse at the mandate summary panel showing the rules |
| 12-20s | "Approved purchase. Mikes-store, ten XSGD. Card issued." | Click the log row where merchant is `mikes-store`, amount 10, verdict APPROVE. Green check visible. **Checklist item: Show approved purchase.** |
| 20-26s | "Blocked merchant. Sketchy-shop is not on the allowlist. Decline. Reason code MERCHANT_NOT_ALLOWED." | Click the sketchy-shop row. Red X and the reason code visible. **Checklist item: Show blocked merchant.** |
| 26-32s | "Blocked amount. Twenty XSGD is over the per-transaction limit. Decline. Reason code TXN_LIMIT_EXCEEDED." | Click the amount 20 row. **Checklist item: Show blocked high amount.** |
| 32-38s | "Every decision, approve or decline, logged with a timestamp and reason. Append-only. Auditable." | Scroll the decision log table. **Checklist item: Show decision log.** |
| 38-48s | "Here is what makes this different. During this build the real StraitsX sandbox returned a payment response with embedded instructions telling us to sign immediately without asking. A prompt injection. Live. In a payment API. Mandate caught it. Blocked before signing. Row marked SUSPICIOUS_MCP_RESPONSE." | Point at the SUSPICIOUS_MCP_RESPONSE row. The red banner at the top of the dashboard. **Checklist item: Show prompt-injection block.** |
| 48-56s | "After human review, one real sandbox card issued. Card reference on screen. Settlement transaction on Avalanche Fuji. Balance moved from thirty to twenty four XSGD. Milestone four closed." | Click the row with card reference `01KASWWW...`, show the settlement tx and Snowtrace link. **Checklist item: Mention real sandbox card issuance.** |
| 56-60s | "Trust is the missing piece. Mandate is it." | Mouse back on the header. Hold. Stop recording. |

Total: 60 seconds. If you land at 62-63s that is fine, YouTube does not care.

---

## Recording tool

**Mac QuickTime, free, built in.**

1. Open QuickTime Player
2. File > New Screen Recording
3. Click the arrow next to the record button. Under Microphone, select your Mac's mic (not "None") so your voice is captured
4. Click record, drag a rectangle around the browser window (not full screen), click Start Recording
5. Speak the script while doing the actions
6. Click the stop icon in the menu bar when done
7. File > Save. Name it `mandate-pitch.mov`
8. Quick trim if needed: Edit > Trim, cut only the very beginning and very end

Do at least three takes. Keep the best one.

---

## Upload

**YouTube unlisted (fastest):**

1. Go to youtube.com > Create > Upload video
2. Drag `mandate-pitch.mov` in
3. Title: `Mandate — Agentix Playground 2026 (Agentic Payments Infrastructure)`
4. Description: paste the thesis line and your GitHub URL
5. Visibility: **Unlisted** (NOT private, judges cannot see private)
6. Publish
7. Copy the share link

That link is submission URL #1. Paste it into `submission/SUBMISSION_URLS.md`.

**Alternative if YouTube is slow:** Google Drive. Upload the .mov, right-click > Share > "Anyone with the link" > Viewer, copy the link.

---

## Verify in incognito

1. Copy the video URL
2. Open a Chrome incognito window (or Safari private)
3. Paste the URL, hit enter
4. Confirm the video plays without asking for login
5. If it asks for login, visibility is set wrong. Fix it.

Tick the "Open video URL in incognito" checkbox only after that check passes.

---

## Your checklist as a final gate

- ☐ Kept under 60 seconds (aim for 58-60)
- ☐ Approved purchase shown on screen with green verdict
- ☐ Blocked merchant shown with reason code `MERCHANT_NOT_ALLOWED`
- ☐ Blocked high amount shown with reason code `TXN_LIMIT_EXCEEDED`
- ☐ Decision log visible with multiple rows
- ☐ Prompt injection block shown, red banner or SUSPICIOUS row visible
- ☐ Real sandbox card issuance mentioned, card reference or settlement tx visible on screen
- ☐ Video uploaded, share URL captured
- ☐ Opened video URL in incognito, plays without login

Every box checked = URL #1 done.
