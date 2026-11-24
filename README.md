# Artist Commissions Board

[@ArtistCommissionsBoardBot](https://t.me/ArtistCommissionsBoardBot) is a Telegram bot where artists and clients find each other. Artists post a profile, clients post an order, and an AI assistant suggests matching artists and explains why each one fits.

**The bot never generates images.** It exists to help people who draw by hand find work; AI-generated art is not allowed.

> Status: in development. The roadmap below shows what is planned and what is done.

## How it will work

1. `/start`: choose "I'm an artist" or "I'm looking for an artist".
2. Describe yourself or your order in your own words. Claude turns the text into a profile or order card; you check and confirm it.
3. For an order, the bot narrows down artists with ordinary filters (style, budget, currency, exchange type), then Claude ranks the short list and writes one or two sentences on why each artist fits.
4. If nothing fits, the bot says so instead of suggesting a poor match.

## Stack

- Node.js, Telegram webhook as a Vercel serverless function
- Upstash Redis for profiles, orders and unfinished conversations
- Claude API (`claude-haiku-5-5`) for filling in profiles and matching
- Secrets (`TELEGRAM_BOT_TOKEN`, `ANTHROPIC_API_KEY`) live only in Vercel environment variables

## Project structure

```
api/telegram.js     webhook: Vercel serves it at /api/telegram, Telegram sends updates here
lib/bot.js          conversation logic: steps and buttons
lib/profile.js      Claude: free text -> artist profile, and profile -> message text
lib/storage.js      Upstash Redis: sessions and confirmed profiles
lib/telegram.js     sending messages and buttons through the Telegram Bot API
scripts/dev.js      run the bot on your computer (long polling, no webhook needed)
scripts/webhook.js  turn the webhook on or off after deploying
```

## Running it

You need Node.js 20.6 or newer.

1. `npm install`
2. Fill in `.env` (see `.env.example` for where each value comes from). `.env` is in `.gitignore` and is never committed.
3. Run locally: `npm run dev`, then write to [@ArtistCommissionsBoardBot](https://t.me/ArtistCommissionsBoardBot) in Telegram.

Deploying to Vercel:

1. Import the repository in Vercel and add the same variables from `.env` under Settings → Environment Variables.
2. After the deploy, point Telegram at it: `npm run webhook -- set https://<your-project>.vercel.app`
3. Check it: `npm run webhook -- info`. To go back to local testing: `npm run webhook -- delete`.

## Roadmap

### v1 — the core

- [ ] Artist profile from free text: styles, examples, price range, currency, exchange types
- [ ] Order from free text: what is needed, style, deadline, budget, currency, exchange type
- [ ] AI matching: 2–3 artists for an order, each with a short explanation
- [ ] Deployed on Vercel and answering in Telegram

### v2 — after the core works

- [ ] Currencies KZT / USD / RUB: "show only my currency" or "convert" (converted prices marked `≈`, with the rate date)
- [ ] Exchange types: money, barter (art for art, channel ad for art), free
- [ ] Russian, English and Kazakh, switchable with `/language`
- [ ] Trust and safety: "Report" button, admin moderation; the bot never takes or holds money
- [ ] Event board: giveaways, lotteries, channel ad exchanges
- [ ] Recommendation feed: one card at a time with ❤️ / ⏭ / 🔕 / Open
- [ ] "How to pay" guide: the AI answers only from our guide and adds safety tips

### Later

- [ ] Telegram Mini App for browsing portfolios
- [ ] Payments inside Telegram (Telegram Stars)
