// Tells Telegram where to send messages.
//   npm run webhook -- set https://your-project.vercel.app
//   npm run webhook -- info
//   npm run webhook -- delete
//   npm run webhook -- commands   (the "/" menu in Telegram, in kk / ru / en)

import { COMMANDS } from "../lib/i18n.js";
import { callTelegram } from "../lib/telegram.js";

// Telegram shows each person the menu for their app language; "en" is also the default.
async function setCommands() {
  await callTelegram("setMyCommands", { commands: COMMANDS.en });
  for (const [lang, commands] of Object.entries(COMMANDS)) {
    await callTelegram("setMyCommands", { commands, language_code: lang });
  }
  console.log("Command menu set: /start, /language (kk, ru, en)");
}

const [command, url] = process.argv.slice(2);

if (command === "set") {
  if (!url) throw new Error("Give the Vercel URL: npm run webhook -- set https://your-project.vercel.app");
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) throw new Error("Set TELEGRAM_WEBHOOK_SECRET in .env (the same value as in Vercel)");

  const target = new URL("/api/telegram", url).toString();
  await callTelegram("setWebhook", {
    url: target,
    secret_token: secret,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
  console.log(`Webhook set: ${target}`);
  await setCommands();
} else if (command === "commands") {
  await setCommands();
} else if (command === "delete") {
  await callTelegram("deleteWebhook");
  console.log("Webhook removed. Now you can run the bot locally with: npm run dev");
} else if (command === "info") {
  const info = await callTelegram("getWebhookInfo");
  console.log(info.url ? `Webhook: ${info.url}` : "No webhook set");
  if (info.last_error_message) console.log(`Last error: ${info.last_error_message}`);
  console.log(`Updates waiting: ${info.pending_update_count}`);
} else {
  console.log("Usage: npm run webhook -- set <url> | info | delete | commands");
}
