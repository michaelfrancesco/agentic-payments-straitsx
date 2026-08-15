# Submission URLs

Fill this in Sunday morning. Copy-paste each URL from here into the hackathon submission form.

Deadline: **Sunday 16 Aug 2026, 1100 SGT**.

---

## The four required URLs

| # | Required | URL (fill in Sunday) | Verified in incognito |
|---|---|---|---|
| 1 | 60-second pitch video (Google Drive, YouTube, or Vimeo) | | ☐ |
| 2 | GitHub repository (public) | https://github.com/michaelfrancesco/agentic-payments-straitsx | ☐ |
| 3 | Front-end (deployed, publicly reachable) | | ☐ |
| 4 | Product architecture diagram | | ☐ |

---

## Sunday morning runbook (07:30 to 10:30)

### 07:30 wake, coffee

### 07:45 start the tunnel and confirm the app works publicly

In one terminal:
```
npm run dev
```

In a second terminal:
```
cloudflared tunnel --url http://localhost:4020
```

Copy the `https://<random-words>.trycloudflare.com` URL from the output. That is submission URL #3.

Open it in your browser and confirm the dashboard loads. Open it in an incognito window too.

### 08:00 seed the dashboard with a clean demo sequence

Reset if needed (delete `decisions.json` and restart server), then submit these intents in order from the dashboard form. Each one takes about 5 seconds:

1. Merchant `mikes-store`, amount 10, item `widget` → APPROVE
2. Merchant `sketchy-shop`, amount 5, item `shady thing` → DECLINE MERCHANT_NOT_ALLOWED
3. Merchant `mikes-store`, amount 20, item `big widget` → DECLINE TXN_LIMIT_EXCEEDED
4. Merchant `mikes-store`, amount 10, item `laptop stand` → APPROVE
5. Merchant `mikes-store`, amount 10, item `desk lamp` → DECLINE CAP_EXCEEDED

Optional 6th: flip `DRY_RUN=false` once, submit a small approve, watch the guard block it as SUSPICIOUS_MCP_RESPONSE, then flip back to `DRY_RUN=true`. That gives you the injection row live.

### 08:15 record the video

- QuickTime > File > New Screen Recording
- Read `submission/pitch-script.md`
- Multiple takes, pick the best
- Trim top and tail only

### 09:00 upload video to YouTube (Unlisted, not Private)

Copy the share link. That is submission URL #1.

### 09:15 confirm URL #4 (architecture diagram)

If you committed `docs/architecture.png` to the repo, submission URL #4 is:
```
https://raw.githubusercontent.com/michaelfrancesco/agentic-payments-straitsx/<branch>/docs/architecture.png
```
Or the direct file view URL on github.com works too.

### 09:30 submit all four URLs

Open the hackathon submission platform (QR code available onsite from 09:00 Sunday). Paste each URL, tick it off above once you have verified it in an incognito window.

### 10:00 to 11:00 buffer

- Do NOT close your laptop
- Do NOT stop the tunnel
- Do NOT stop the dev server
- Sit near mentors in case of last-minute questions

---

## If something breaks

**Tunnel URL returns 502:** dev server crashed. Restart `npm run dev`, get a fresh tunnel URL, resubmit URL #3.

**Video too long:** use the 30-second backup script in `submission/pitch-script.md`.

**Cannot record audio:** narrate on-screen with captions or a text overlay. Or upload with subtitles later.

**GitHub repo shows as private:** repo settings > change visibility > public.

**Panic:** breathe. You have a working demo. You caught a real prompt injection. You closed milestone four. You are ahead of most teams.
