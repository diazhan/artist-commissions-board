// Small wrapper around the Telegram Bot API.
// Every Telegram method is a POST to https://api.telegram.org/bot<TOKEN>/<method>.

export async function callTelegram(method, params = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  // The error text never includes the token, so it is safe to log.
  if (!data.ok) throw new Error(`Telegram ${method} failed: ${data.description}`);
  return data.result;
}

// Telegram refuses messages longer than 4096 characters.
const MAX_TEXT = 4000;

// buttons: rows of [{ text, data }], e.g. [[{ text: "Yes", data: "yes" }]]
export function sendMessage(chatId, text, buttons) {
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text: text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) + "…" : text,
    link_preview_options: { is_disabled: true },
    reply_markup: buttons
      ? {
          inline_keyboard: buttons.map((row) =>
            row.map((b) => ({ text: b.text, callback_data: b.data })),
          ),
        }
      : undefined,
  });
}

// Shows "typing…" under the bot's name while Claude is working.
export function sendTyping(chatId) {
  return callTelegram("sendChatAction", { chat_id: chatId, action: "typing" });
}

// Must be called for every button press, otherwise the button keeps spinning.
export function answerButton(callbackQueryId, text) {
  return callTelegram("answerCallbackQuery", { callback_query_id: callbackQueryId, text });
}

// Removes the buttons from an old message so they cannot be pressed twice.
// Failing here is harmless (e.g. the buttons are already gone), so errors are only logged.
export async function removeButtons(chatId, messageId) {
  try {
    await callTelegram("editMessageReplyMarkup", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: [] },
    });
  } catch (err) {
    console.warn(err.message);
  }
}
