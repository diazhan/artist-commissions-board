// Vercel serverless function. Vercel serves this file at /api/telegram,
// and Telegram sends every new message there (that is the "webhook").

import { timingSafeEqual } from "node:crypto";
import { handleUpdate } from "../lib/bot.js";
import { isNewUpdate } from "../lib/storage.js";

// Checks the secret Telegram attaches to every update, so nobody else can
// pretend to be Telegram by sending requests to this URL.
function isFromTelegram(req) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const received = req.headers["x-telegram-bot-api-secret-token"];
  if (!expected || typeof received !== "string") return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(200).send("Artist Commissions Board bot is running");
    return;
  }
  if (!isFromTelegram(req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  const update = req.body;
  try {
    // Telegram resends an update if it did not get an answer in time;
    // isNewUpdate makes sure each update is handled only once.
    if (typeof update?.update_id === "number" && (await isNewUpdate(update.update_id))) {
      await handleUpdate(update);
    }
  } catch (err) {
    console.error("Failed to handle update:", err);
  }

  // Always answer 200: otherwise Telegram keeps resending the same update.
  res.status(200).send("ok");
}
