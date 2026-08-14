# Agentix Playground Hackathon: Knowledge Base

**Event:** Agentix Playground, SMU Hackathon 2026
**Dates:** 14 to 16 August 2026
**Venue:** SMU School of Economics
**Partners:** StraitsX (host), Avalanche (title sponsor), AWS (cloud), Crossmint, Convergence Summit, SMU FinTech, SMU AI

Last updated: 14 Aug 2026

---

## 1. Logistics

### Rooms

| Day | Rooms booked | Main briefing room |
|---|---|---|
| Friday 14 Aug | Class Room 3-2 and 3-3 | Class Room 3-2 |
| Saturday 15 Aug | SSL 1.1 | SSL 1.1 |
| Sunday 16 Aug | Seminar Room 2-3 and 2-7 | Seminar Room 2-7 |

### House rules

- Fill up the respective Google Forms for individual or team sign-ups, then collect credits
- Can work anywhere within SMU campus, seminar rooms are for exclusive use
- **No staying overnight within SMU campus**
- Mentors from product sponsors on-site to answer questions
- Catering available 15 and 16 Aug, plus coffee and tea
- Submissions due **16 Aug, 1100 hrs**. Submission platform link distributed on 16 Aug, QR code available onsite from 0900 Sunday

### Registration links (QR codes on slide)

- Registration form
- Telegram group (for admin)
- Developer Docs (includes SMU WiFi details)

---

## 2. Tracks and Prizes

**Hard requirement: all solutions must make use of $XSGD on Avalanche C-Chain Mainnet.**

| Track | Description | Prizes |
|---|---|---|
| AI Commerce Agents | Build AI agents that discover, compare, and purchase products on today's internet | 1st S$1,000 / 2nd S$500 / 3rd S$250 |
| **Agentic Payments Infrastructure** | Build the wallets, payment rails, policies, and protocols that let AI spend safely | 1st S$1,000 / 2nd S$500 / 3rd S$250 |
| AI-native Commerce | Build the merchant experiences, APIs, and protocols for a future where AI agents become first-class customers | 1st S$1,000 / 2nd S$500 / 3rd S$250 |

**Track notes:** a project is only eligible for one track. Team formation happens on Friday night, finalise same day.

### Sponsor prizes (separate from track prizes)

| Sponsor | Award | Criteria | Prize |
|---|---|---|---|
| StraitsX | Real-World Impact Award | Most impactful solution solving a real-world commerce challenge through agentic payments | S$750 |
| Avalanche | Best Use of x402 on Avalanche | Most innovative agentic payment experience using x402 on Avalanche | S$750 |
| AWS | Best Architected Solution Award | Most secure, reliable, well-engineered agentic payment solution using AWS Well-Architected principles | S$750 |

Note: prizes are split equally among team members.

### Submission format

1. 1 minute recorded elevator product pitch (URL to Google Drive, YouTube, or Vimeo)
2. GitHub repository (URL)
3. Front-end (URL)
4. Product architecture diagram (URL)

---

## 3. The Agent Payment Lifecycle (organiser framing)

Four milestones. Build two, build all, or build the seams between them.

| # | Milestone | What a team actually ships |
|---|---|---|
| 1 | **Funding** | Utility of XSGD in a self-custodied wallet on Avalanche C-Chain. Keys stay with the user or the agent, not StraitsX |
| 2 | **Discovery** | Natural language intent resolved to a SKU, a price, and a merchant checkout URL |
| 3 | **Issuance** | Single-use card minted at authorisation time, scoped to amount, merchant, and expiry |
| 4 | **Execution** | The seam nobody has closed. A card issuer cannot debit a wallet it does not control, so how a card authorisation draws on a self-custodied XSGD balance is yours to design. Return a receipt that ties the authorisation to the balance it drew on. Optional, and the part they most want to see attempted |

If you build the merchant side instead, so an agent is a first-class customer rather than a card pretending to be a human, that is the AI-native Commerce track and it does not need a milestone from this list.

> **Key insight:** milestone 4 is explicitly flagged as unsolved and most wanted. That is where differentiation lives.

---

## 4. StraitsX Talk: "Giving an AI a Debit Card"

**Speaker:** Parag Pandit, Senior Cards PM, StraitsX

Structure of the talk:

1. Why can't AI pay for things today? Two specific blockers. Neither is about the model getting smarter.
2. What does it take to give an Agent a card? The mandate, the transaction, and what stops it going wrong.
3. What are we handing you this weekend? Working APIs, keys already provisioned, and where we are in Singapore.

StraitsX issues both instruments: cards, and regulated stablecoins (XSGD, XUSD).

### 4.1 Why agents can't pay today

Major e-commerce sites are still built for humans, on local payment rails. Two things block an agent:

- **Friction 01: it can't navigate.** Forms, redirects, and visual checkouts are built for human hands and eyes. Agents stumble through them.
- **Friction 02: it can't pay.** An agent has no native way to hold a credential or move money. The ability simply is not there yet.

Stat: 70% of human carts are abandoned at checkout. A human comes back later. An agent just fails.

### 4.2 Market size and timing

| Metric | Value | Source / context |
|---|---|---|
| Agent-initiated payments, Alipay AI Pay | 120M in one week, Feb 2026. 300M cumulative by May | Happening now |
| x402 Foundation members | 40, including Visa, Mastercard, Amex, Google, AWS, Stripe, Circle | Standardised now |
| Agentic commerce forecast 2030 | $1.5T, up from ~$8bn in 2026 | Juniper. Bain says 15 to 25% of all e-commerce |
| AI-driven traffic to US retail sites | 4,700% growth year on year | Visa |
| Latin American issuers enabled for agentic tokens | ~100% | Mastercard, Mar 2026 |
| Protocol bets required | 0. The networks went protocol-agnostic instead of fighting | |

**The punchline stat:** only 14% of consumers would let an agent buy without checking first. The bottleneck is trust, not intelligence.

### 4.3 What an agent actually buys

| Category | Status | Examples | Economics |
|---|---|---|---|
| Replenishment | LIVE | Groceries, refills, subscriptions, consumables | Low value, high frequency. This is where the volume is |
| Complex booking | LIVE | Travel, multi-leg trips, price-monitored rebooking | High value, low frequency |
| Business buying | NEXT | SME restocking, supplier payments, team spend | A budget holder delegating to software instead of staff |
| Machine-to-machine | NEW | An agent paying an API, or paying another agent | Sub-cent, per call, thousands per minute |

Three of these are existing commerce initiated differently. The fourth (M2M) is genuinely new.

### 4.4 The four missing pieces the industry built in 18 months

Startups like VIA attacked the gap. The networks were forced to respond.

| # | Layer | Question it answers | Standards that emerged |
|---|---|---|---|
| 01 | Identity and trust | Is this agent who it says it is? | Visa TAP, Mastercard KYA |
| 02 | Authorisation / mandate | What may it spend, for whom, under what limits? | AP2, Amex ACE |
| 03 | Discovery and checkout | How does it find things and buy them? | ACP, UCP |
| 04 | Execution / rail | How does the money actually move? | x402, MPP, cards, stablecoins |

### 4.5 What giving an agent a card actually means

Not handing over your card number. Issuing a new one that only works inside rules you set.

1. **Set the mandate:** spend cap, merchant whitelist, expiry, categories
2. **Sign a delegation:** the issuer signs a credential binding the agent to that scope
3. **Agent transacts:** every charge checked against the mandate at the rail, before settlement
4. **Audit and revoke:** full trail, killable at any moment by the human

> **Direction of travel:** today the mandate is scoped per agent. Next it is scoped per intent: one merchant, one amount, one window.

### 4.6 One purchase, start to finish

Six exchanges. Every one of them signed.

| # | Step | What happens | Mechanism |
|---|---|---|---|
| 01 | Delegate | Human sets a mandate. Issuer signs a delegation credential | cap, merchants, expiry |
| 02 | Discover | Agent finds the product via a machine-readable catalogue and price | ACP / UCP feed |
| 03 | Identify | Agent presents signed identity. Merchant verifies against a registry | signed request headers |
| 04 | Authorise | Agent requests a credential scoped to this exact purchase | one-time card / mandate |
| 05 | Execute | Charge runs. The rail checks it against the mandate before settling | auth in milliseconds |
| 06 | Prove | Signed receipt and audit entry. Revocable and disputable after the fact | tamper-evident log |

No password, no OTP, nobody at the screen. Trust moves from a challenge afterwards to a signature issued beforehand.

### 4.7 Three things that will bite you

All three were demonstrated against real shopping agents this year. The card layer only helps with one of them.

| Threat | What it is | Status | What it means for you |
|---|---|---|---|
| **Prompt injection** | Hidden text on a product page tells the agent to add a gift card and send it elsewhere. It obeys, because it cannot separate content from instruction | NOT HANDLED | On you. Treat page content as untrusted input. A scoped card caps the damage, it will not stop the instruction |
| **Agent impersonation** | A fraudster's bot presents itself as your shopping agent. The merchant has no way to tell the difference | PARTIALLY HANDLED | The card carries identity at payment. Agent identity is its own layer: Visa TAP, Mastercard KYA, or ERC-8004 onchain |
| **Credential theft** | One breach in early 2026 leaked ~1.5 million agent API tokens. Payment-bound, that is a mass card compromise | FULLY HANDLED | A one-time card is dead the moment it is used. Never let a long-lived card sit in agent memory or logs |

> **Direct quote from the organisers:** a scoped credential limits what a compromised agent can spend. It does not make the agent trustworthy. That part is still open, and it is the most interesting thing you could work on this weekend.

### 4.8 Singapore context: already live

| Date | Event |
|---|---|
| 4 Mar 2026 | First live agentic transaction. An AI agent booked and paid for a ride to Changi. Mastercard Agentic Token, Payment Passkey, DBS and UOB on the rails |
| 30 Apr 2026 | Visa Agentic Ready Programme. 13 banks and fintechs testing agent-initiated payments in production-grade environments, including StraitsX |
| 3 Jul 2026 | MAS publishes SAFR, a runtime safeguards framework for AI agents in finance, built with Visa, Mastercard, Ant International, Circle and OCBC |

Demand side: 77% of Singapore residents use generative AI daily. 8 in 10 already lean on AI when shopping online.

**XSGD is the only regulated Singapore dollar stablecoin an agent can hold today.**

### 4.9 What StraitsX is handing participants

**What they already built:** an MCP server that mints a card, so an agent can complete a real purchase end to end, with spend limits, merchant restrictions, and full logging.

**Yours from right now:**
- Card-issuing / one-time card MCP, both Sandbox and Production
- XSGD rails, agent settlement

---

## 5. Glossary

| Term | Meaning |
|---|---|
| **Settlement** | The moment money actually and finally moves. Distinct from authorisation, which only reserves the funds. Stablecoin settlement is near instant and final, versus T+1 or T+2 on card rails |
| **Authorisation** | The merchant reserves the money. Nothing has moved yet |
| **KYC** | Know Your Customer. Verifying identity, address, source of funds at onboarding |
| **AML** | Anti-Money Laundering. Ongoing transaction monitoring, sanctions screening, regulatory reporting |
| **L1** | Layer 1. A base blockchain that settles its own transactions with its own validators, for example Bitcoin, Ethereum, Avalanche C-Chain |
| **Avalanche C-Chain** | Avalanche's shared public EVM chain. This hackathon requires C-Chain Mainnet |
| **Avalanche L1** | A custom, sovereign chain launched inside the Avalanche ecosystem, formerly called a subnet. Own gas token, own validators, own permissioning. Useful for regulated finance where every validator or wallet can be required to be KYC'd |
| **x402** | A payment protocol built on the HTTP 402 "Payment Required" status code. Server returns 402 with a payment challenge, client signs and pays, then gets the resource. 40 foundation members including Visa, Mastercard, Stripe, Circle |
| **EIP-3009** | Transfer With Authorization. Lets a wallet sign a transfer off-chain so a third party can submit and pay gas. The mechanism behind gasless stablecoin payments |
| **MCP** | Model Context Protocol. How an AI agent connects to external tools. StraitsX provides card issuance as an MCP server |
| **Mandate** | The set of rules a human sets for what an agent may spend: cap, merchant whitelist, expiry, categories |
| **Delegation credential** | A signed credential from the issuer binding a specific agent to a specific mandate scope |
| **Self-custodied wallet** | Wallet where the private keys stay with the user or agent, not with StraitsX |
| **SKU** | Stock Keeping Unit. A specific product identifier |
| **ACP / UCP** | Agentic Commerce Protocol / Universal Commerce Protocol. Machine-readable product catalogue and checkout standards |
| **Visa TAP** | Visa Trusted Agent Protocol. Agent identity layer |
| **Mastercard KYA** | Know Your Agent. Mastercard's agent identity framework |
| **AP2** | Agent Payments Protocol. Authorisation and mandate standard |
| **ERC-8004** | Onchain agent identity standard |
| **MPP** | A payment protocol listed under the execution/rail layer |
| **SAFR** | MAS runtime safeguards framework for AI agents in finance, published 3 Jul 2026 |
| **MPI** | Major Payment Institution. StraitsX's licence category under MAS |
| **Float** | Money sitting idle in an account. Has a real cost equal to the cost of capital |

---

## 6. Project Ideas Shortlist

Ranked for the Agentic Payments Infrastructure track.

1. **Agent Spend Control Plane.** Policy engine between agent and card issuance. Per agent budget, merchant allowlist, per transaction cap, velocity limit, daily burn ceiling, kill switch, full audit trail of approve/decline reasons. Live dashboard showing wallet balance vs open authorisations vs settled vs available headroom.
2. **Just-in-Time Funding.** Wallet holds near zero XSGD. Sweep the exact quoted amount at authorisation time, card burned immediately after. Headline metric: idle float reduced by X%, exposure window cut from hours to seconds.
3. **Refund and Reconciliation Layer.** Persistent mapping of burned card token back to wallet address so refunds route home as XSGD. Auto reconciliation of on-chain movement vs card authorisation vs merchant receipt, with break flagging. Handles partial refunds, chargebacks, failed deliveries.
4. **Prompt injection guard.** Explicitly named by the organisers as unsolved and the most interesting thing to work on. Detect when page content is trying to instruct the agent, and block issuance before the card is minted.
5. **Milestone 4 seam closer.** Design how a card authorisation draws on a self-custodied XSGD balance, and return a receipt tying the authorisation to the exact balance it drew on. The organisers said this is what they most want to see attempted.

---

## 7. Judging Signals Worth Optimising For

- The organisers repeatedly framed **trust, not intelligence** as the bottleneck. Lead the pitch with that.
- Milestone 4 and prompt injection are both explicitly flagged as open problems. Attempting either scores higher than polishing a solved one.
- StraitsX is an infrastructure company, not a commerce company. Judges build rails for a living.
- Three sponsor prizes are winnable on top of the track prize. x402 usage and AWS Well-Architected framing are cheap to add and worth S$750 each.
- Every exchange in their reference flow is signed. If your architecture diagram shows signatures at each step, it speaks their language.

---

## 8. My Decisions (locked)

| Decision | Choice | Reasoning |
|---|---|---|
| Participation | **Solo** | No teammate secured. Scope cut to match |
| Track | **Agentic Payments Infrastructure** | Matches treasury background, least crowded, judges are an infrastructure company, and the two problems flagged as unsolved (milestone 4 seam, prompt injection) both live here |
| Project | Agent spend control plane, working title **Mandate** | Policy engine between agent and card issuance |
| Milestones targeted | 1 (Funding) and 3 (Issuance), stretch at 4 (Execution seam) | "Build two, build all, or build the seams" |
| Discovery step | Hardcoded or demo store, not a real browsing agent | Out of scope for solo. Protects the build day |
| Wallet | Repo-generated key via `npm run setup` | Already wired into `.env`, disposable, works with `npm run doctor` |

**Thesis, one sentence:** the bottleneck in agentic payments is trust, not intelligence, so the missing infrastructure is not a smarter agent but a mandate the agent cannot exceed.

**Demo money shot:** a purchase correctly *declined* because it exceeded the cap or hit a non-allowlisted merchant, with the reason logged. Anyone can show a payment succeeding.

---

## 9. Dev Stack and Setup

### The reference repo

StraitsX published a reference stack for this hackathon (`straitsX-mcp-demo`). It contains:

- An agent-side card gateway acting as a pure x402 client, signing EIP-3009 `transferWithAuthorization` for XSGD
- A demo store to spend the card at
- A conformance suite
- A flagship shopping agent example

Everything talks to the real StraitsX sandbox from the first minute. No simulators, no rebuild for event day.

Docs inside the repo: `docs/PARTICIPANT_GUIDE.md` and `docs/EVENT_DAY.md`.

### Setup commands

```
git clone <repo> && cd straitsX-mcp-demo
npm install
npm run setup     # copies .env, generates agent key, prints the ADDRESS only
```

Send that address to the organisers. They fund it with XSGD and whitelist it if required.

While waiting:

```
npm run stack     # demo store :4030 + gateway :4010 (issuer = live StraitsX sandbox)
npm run doctor    # green/red health table: env, live SSE MCP, unpaid cardapi 402 probe, RPC, XSGD balance
```

### Network discrepancy to resolve

- **Track slide says:** all solutions must use $XSGD on Avalanche **C-Chain Mainnet**
- **Reference repo defaults to:** `NETWORK_PROFILE=sandbox-live`, which is **Fuji testnet** XSGD

Ask DevRel which applies for judging. This determines whether real money is at risk.

Avalanche network config for reference:

| Network | RPC | Chain ID | Explorer |
|---|---|---|---|
| Fuji testnet | `https://api.avax-test.network/ext/bc/C/rpc` | 43113 | `https://testnet.snowtrace.io/` |
| C-Chain Mainnet | `https://api.avax.network/ext/bc/C/rpc` | 43114 | Snowtrace |

### Wallet notes

- EVM address is public and safe to share. Starts with `0x`, 40 hex characters after
- Private key and seed phrase are never shared with anyone, including organisers
- Same address works on both Fuji and Mainnet
- Use a throwaway wallet only. Assume anything in it is disposable

### My values

```
EVM address:
.env path:
Funded at:
Network profile in use:
MCP endpoint:
```

---

## 10. Open Questions and Notes

Add anything new below this line.

- [ ] Confirm network for judging: Fuji or C-Chain Mainnet?
- [ ] Confirm how wallet whitelisting and XSGD funding works, and how long it takes
- [ ] Confirm per-card caps in sandbox vs production
- [ ] Confirm which MCP endpoints are live and what auth they need
- [ ] Get the receipt format StraitsX expects for the milestone 4 seam
- [ ] Get Dev Hub credentials and paste anything useful here
- [ ]
