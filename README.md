# Soul — Agent Identity Wizard

A Telegram Mini App that helps you define your AI agent's identity through an interactive quiz and personality tuner.

Designed for use with [openclaw](https://github.com/openclaw/openclaw), but deployable standalone.

---

## What it does

Soul walks you through a short setup to generate three identity files for your AI agent:

| File | Purpose |
|------|---------|
| `SOUL.md` | Personality, tone, and behavioral boundaries |
| `IDENTITY.md` | Name, appearance, and self-description |
| `USER.md` | Your preferences and how the agent should address you |

The wizard has four steps:
1. **Intro** — welcome screen
2. **About you** — name, language, and a few personal details
3. **Quiz** — a short questionnaire to match your agent to one of four archetypes
4. **Tune** — reveal your archetype and fine-tune with three sliders

---

## Archetypes

| Key | Name | Character |
|-----|------|-----------|
| 先知 | The Oracle | Advisor · analytical · measured |
| 向导 | The Guide | Warm · supportive · boundary-aware |
| 执刃 | The Blade | Direct · decisive · always honest |
| 精灵 | The Sprite | Playful · curious · partner energy |

---

## Getting started

### Deploy the Mini App

```bash
npm install
npm run build        # outputs to dist/
```

Serve the `dist/` folder over HTTPS (Vercel, Netlify, or any static host).
Set the URL as your Telegram Mini App URL via [@BotFather](https://t.me/BotFather) → Edit Bot → Edit Menu Button / Web App.

### Connect to your openclaw bot

Copy `bot-plugin/` into your openclaw extensions directory:

```bash
cp -r bot-plugin/ ~/.openclaw/extensions/avatar/
```

Set the environment variable:

```bash
AVATAR_APP_URL=https://your-deployed-url.vercel.app
```

The plugin registers a `/avatar` command that opens the Mini App.
When the user completes the wizard, the three identity files are written to `~/.openclaw/workspace/`.

---

## Development

```bash
npm install
npm run dev          # local dev server
npx tsc --noEmit     # type check
npx vitest run       # run tests
npm run build        # production build
```

---

## How it fits into openclaw

```
Telegram user
    │  taps /avatar
    ▼
Soul Mini App  ──(web_app_data)──▶  openclaw bot (bot-plugin)
                                         │
                                         ▼
                                 ~/.openclaw/workspace/
                                   ├── SOUL.md
                                   ├── IDENTITY.md
                                   └── USER.md
```

The bot plugin (`bot-plugin/index.ts`) listens for `message:web_app_data`, parses the payload, and writes the files. It merges the `/avatar` command with any existing bot commands rather than overwriting them.

---

## License

MIT
