# Claude Code Playbook for the Hackathon

Everything you need to go from empty laptop to running project. Follow it top to bottom.

---

## Part 1: One-time setup (do tonight, 15 minutes)

### 1. Check you have Node.js

Open Terminal and type:

```
node --version
```

If you see a version number of 18 or higher, you are fine. If you see "command not found", install Node from nodejs.org, choose the LTS version, then reopen Terminal.

### 2. Install Claude Code

```
npm install -g @anthropic-ai/claude-code
```

### 3. Make a folder for your project

```
mkdir ~/mandate && cd ~/mandate
```

`mkdir` makes a folder. `cd` moves you into it. `~` means your home folder.

### 4. Start Claude Code

```
claude
```

First run will ask you to log in through the browser. Do that once and it remembers.

### 5. Put CLAUDE.md in place

Save the `CLAUDE.md` file I made into `~/mandate/CLAUDE.md`. Claude Code reads this file automatically every session, so you never have to re-explain the project.

---

## Part 2: The init prompt

Once `claude` is running and `CLAUDE.md` is in the folder, paste this as your very first message.

```
Read CLAUDE.md first, then follow it for the rest of this project.

Before writing any code, do these four things and stop:

1. Tell me back in five bullets what we are building, so I can confirm you understood it.
2. Ask me for the StraitsX reference repo URL. I will paste it. Clone it into a sibling folder called ./reference so we can read their gateway code without modifying it.
3. Read ./reference/docs/PARTICIPANT_GUIDE.md and ./reference/docs/EVENT_DAY.md, then tell me in plain language: how does an agent request a card, what does the request need, and what comes back.
4. Tell me the single riskiest unknown in this build and what one question I should ask a StraitsX mentor to remove it.

Do not scaffold, do not install packages, do not write files until I say go.
```

**Why this shape:** it forces Claude to prove it understood before it burns your time generating code in the wrong direction. It also converts their docs into plain language for you, which is faster than reading them yourself at midnight.

---

## Part 3: The prompts for each build step

Use one prompt per step. Do not batch them.

### Step 1, skeleton

```
Build step 1 from the build order in CLAUDE.md: an Express app in TypeScript with a single POST /intent endpoint that accepts { merchant, amount, item } and returns a hardcoded { verdict: "APPROVE" }.

Set up the project so I can run it with one command. Then tell me the exact command and the exact curl command to test it. Nothing else.
```

### Step 2, policy engine

```
Build step 2: the policy engine. Four rules, in a separate file, pure functions, no side effects. Use the exact reason code strings from CLAUDE.md.

Write unit tests for the rules. Then show me the test command and confirm they pass.

Keep the mandate hardcoded in a config file for now: cap 100 XSGD, per-transaction limit 30, allowlist of two merchants, expiry 48 hours from now.
```

### Step 3, card issuance

```
Build step 3: wire an approved intent to the StraitsX MCP card gateway.

Before writing code, read the reference gateway in ./reference and tell me exactly which endpoint or MCP tool mints a card, what parameters it needs, and what it returns. Then wait for me to confirm before implementing.

Include a DRY_RUN environment flag that logs what would be sent and stops, without making the live call. Default it to true.
```

### Step 4, balance

```
Build step 4: read my live XSGD balance from Avalanche using viem, and include it in the policy decision as an INSUFFICIENT_BALANCE check.

The RPC and my address are in CLAUDE.md. Tell me if either is still blank before you start.
```

### Step 5, decision log

```
Build step 5: persist every decision. Append-only, SQLite or JSON, whichever is faster to set up.

Fields: timestamp, merchant, amount, item, verdict, reason code, card reference if issued, XSGD balance at decision time.

Add GET /decisions returning them newest first.
```

### Step 6, dashboard

```
Build step 6: one page frontend. Plain and readable, no component library.

Top: live XSGD balance, mandate summary, spent vs remaining headroom, with a progress bar.
Below: the decision log as a table. Approves in green, declines in red with the reason code shown.
A form to submit a test intent.

This is going in a demo video, so it needs to be legible in a screen recording. Large text, high contrast.
```

### Step 7, packaging

```
Write the README: problem, thesis, architecture, what works, what does not, how to run it.

Add a short section mapping the design to the AWS Well-Architected pillars, and a section explaining where x402 and EIP-3009 appear in the flow. These target two sponsor prizes.

Then describe the architecture diagram I should draw, box by box, so I can redraw it in Excalidraw.
```

---

## Part 4: Prompts for when things break

**Something errors and you do not understand it**
```
This broke. Give me the single most likely cause first, in plain language, then the fix. Do not list five possibilities.

[paste the error]
```

**You are lost**
```
Stop. Tell me in three sentences: what currently works, what is half-built, and what the next single action is.
```

**You are running out of time**
```
It is [time] and submission is Sunday 1100. Given what works right now, what is the smallest set of changes that makes this demoable? Cut anything else.
```

**Claude drifts out of scope**
```
Check CLAUDE.md scope boundaries. Is what you just suggested in scope?
```

---

## Part 5: Glossary

### Terminal and shell

| Term | Meaning |
|---|---|
| **Terminal** | The text window where you type commands. On Mac, search "Terminal" in Spotlight |
| **CLI** | Command line interface. A program you run by typing rather than clicking |
| `cd folder` | Change directory. Move into a folder |
| `cd ..` | Move up one folder |
| `ls` | List the files in the current folder |
| `mkdir name` | Make a new folder |
| `pwd` | Print working directory. Shows where you currently are |
| `~` | Your home folder |
| `.` | The current folder |
| **Ctrl+C** | Stop whatever is currently running |

### Node and packages

| Term | Meaning |
|---|---|
| **Node.js** | The program that runs JavaScript outside a browser. Your server runs on it |
| **npm** | Node Package Manager. Installs code libraries other people wrote |
| **package.json** | The file listing your project's dependencies and its runnable commands |
| `npm install` | Download all dependencies listed in package.json |
| `npm install x` | Add a new dependency called x |
| `npm run something` | Run a command defined in package.json's "scripts" section |
| **node_modules** | The folder where downloaded dependencies live. Never edit it, never commit it |
| **TypeScript** | JavaScript with type checking. Catches mistakes before you run the code |

### Git and GitHub

| Term | Meaning |
|---|---|
| **Git** | Version control. Saves snapshots of your code so you can go back |
| **Repository (repo)** | A project folder tracked by git |
| `git clone URL` | Download a copy of someone else's repo |
| `git add .` | Stage all your changes for saving |
| `git commit -m "msg"` | Save a snapshot with a message |
| `git push` | Upload your commits to GitHub |
| **GitHub** | The website where repos are hosted. Your submission needs a public repo URL |

### Environment and config

| Term | Meaning |
|---|---|
| **.env** | A file holding secrets and settings: private keys, API keys, RPC URLs. Never commit it to GitHub |
| **.gitignore** | A file listing what git should ignore. `.env` and `node_modules` must be in it |
| **Environment variable** | A setting read from .env at runtime, so secrets stay out of your code |
| **Port** | The number a server listens on, like :4010. Two programs cannot use the same port |
| **localhost** | Your own machine. `http://localhost:4010` means a server running on your laptop |

### API and web

| Term | Meaning |
|---|---|
| **API** | A way for one program to ask another program to do something |
| **Endpoint** | A specific URL an API responds on, like `/intent` |
| **GET** | An API request that reads data |
| **POST** | An API request that sends data and causes something to happen |
| **JSON** | The text format APIs use to send structured data. Curly braces and key-value pairs |
| **curl** | A terminal command for calling an API by hand, to test it |
| **HTTP 200** | Success |
| **HTTP 402** | Payment Required. The status code x402 is built on |
| **HTTP 4xx** | You made a bad request |
| **HTTP 5xx** | The server broke |
| **Express** | The Node library for building an API server. What you are using |
| **Frontend** | What the user sees in a browser |
| **Backend** | The server doing the logic. Your policy engine |

### Blockchain and payments

| Term | Meaning |
|---|---|
| **EVM address** | Your public wallet identifier. Starts with `0x`, safe to share |
| **Private key** | The secret that controls the wallet. Never share, never commit |
| **RPC** | The server endpoint your code talks to in order to read the blockchain |
| **Chain ID** | The number identifying which network you are on. 43113 Fuji, 43114 Mainnet |
| **Mainnet** | The real network with real money |
| **Testnet (Fuji)** | The practice network with fake money |
| **Gas** | The fee to write to the blockchain. Reading is free |
| **viem** | The JavaScript library for talking to EVM chains. Simpler than the older ethers |
| **XSGD** | StraitsX's regulated Singapore dollar stablecoin. 1 XSGD is 1 SGD |
| **x402** | Payment protocol. Server returns HTTP 402 with a challenge, client signs and pays, then gets the resource |
| **EIP-3009** | Lets you sign a transfer off-chain so someone else submits it and pays the gas |
| **MCP** | Model Context Protocol. How an AI agent connects to a tool. StraitsX exposes card issuance this way |
| **Mandate** | The rules a human sets for what an agent may spend |
| **Authorisation** | Merchant reserves the money. Nothing moved yet |
| **Settlement** | The money actually and finally moves |

### Claude Code specific

| Term | Meaning |
|---|---|
| **CLAUDE.md** | The context file Claude Code reads automatically. Your project's standing instructions |
| **Session** | One run of `claude`. Context resets when you quit |
| `/clear` | Wipe the conversation but keep CLAUDE.md. Use when the session gets confused |
| `/help` | List available commands |
| **Permission prompt** | Claude asks before running commands or editing files. Read what it is about to do |

---

## Part 6: The two rules that matter most

1. **One step at a time.** Get each step running before starting the next. Batching feels faster and is not, because when something breaks you will not know which of five changes caused it.

2. **Commit after every working step.** `git add . && git commit -m "step 3 working"`. When you break something at 11pm, you can go back thirty seconds instead of an hour.
