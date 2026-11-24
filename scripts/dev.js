// Runs the bot on your own computer: npm run dev
//
// A webhook needs a public internet address, which a laptop does not have.
// So locally the bot asks Telegram "any new messages?" in a loop (long polling)
// and passes each one to the same handleUpdate the webhook uses.

import { handleUpdate } from "../lib/bot.js";
import { callTelegram } from "../lib/telegram.js";

const webhook = await callTelegram("getWebhookInfo");
if (webhook.url) {
  console.error(
    `The bot has a webhook set (${webhook.url}), so Telegram sends messages there, not here.\n` +
      "To test locally, turn it off first:  npm run webhook -- delete\n" +
      "Turn it back on after testing:       npm run webhook -- set <your Vercel URL>",
  );
  process.exit(1);
}

const EXPECTED_BOT = "ArtistCommissionsBoardBot";
const me = await callTelegram("getMe");
if (me.username !== EXPECTED_BOT) {
  console.warn(`Note: TELEGRAM_BOT_TOKEN belongs to @${me.username}, not @${EXPECTED_BOT}.`);
}
console.log(`Bot @${me.username} is running locally. Write to it in Telegram. Ctrl+C to stop.`);

let offset = 0;
while (true) {
  let updates;
  try {
    updates = await callTelegram("getUpdates", {
      offset,
      timeout: 30,
      allowed_updates: ["message", "callback_query"],
    });
  } catch (err) {
    console.error(err.message);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    continue;
  }

  for (const update of updates) {
    offset = update.update_id + 1;
    try {
      await handleUpdate(update);
    } catch (err) {
      console.error("Failed to handle update:", err);
    }
  }
}
