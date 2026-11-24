// The conversation logic. One function, handleUpdate, gets every update from
// Telegram (a text message or a button press) and decides what to answer.
//
// Where the person is in the conversation is kept in session.step:
//   (none)          nothing started, or finished
//   artist_describe waiting for the artist to describe themselves
//   artist_review   the draft profile is shown, waiting for "Всё верно" / "Исправить"
//   artist_fix      waiting for what to correct in the draft

import { extractArtistProfile, formatProfile } from "./profile.js";
import { clearSession, getSession, saveArtistProfile, saveSession } from "./storage.js";
import { answerButton, removeButtons, sendMessage, sendTyping } from "./telegram.js";

// Longer descriptions are cut, so one message cannot cost a lot.
const MAX_INPUT = 3000;

const ROLE_BUTTONS = [
  [{ text: "🎨 Я художник", data: "role:artist" }],
  [{ text: "🔎 Ищу художника", data: "role:client" }],
];

const REVIEW_BUTTONS = [
  [
    { text: "✅ Всё верно", data: "profile:confirm" },
    { text: "✏️ Исправить", data: "profile:edit" },
  ],
];

const ASK_DESCRIPTION =
  "Расскажи о себе своими словами, одним сообщением:\n" +
  "• в каких стилях рисуешь;\n" +
  "• ссылки на работы или портфолио;\n" +
  "• сколько стоят работы и в какой валюте (₸, ₽, $);\n" +
  "• как готов работать: за деньги, по бартеру или бесплатно.\n\n" +
  "Пример: «Рисую аниме и чиби, портреты по фото. Работы: t.me/myart. " +
  "Скетч от 3000 ₸, полноценный арт до 15000 ₸. Возможен бартер на рекламу.»";

export async function handleUpdate(update) {
  if (update.callback_query) return handleButton(update.callback_query);

  const msg = update.message;
  if (!msg || msg.chat.type !== "private") return; // the bot works only in private chats

  const chatId = msg.chat.id;
  if (!msg.text) {
    await sendMessage(chatId, "Пока я понимаю только текст. Напиши, пожалуйста, словами 🙂");
    return;
  }

  const text = msg.text.trim();
  if (text.startsWith("/start")) {
    await clearSession(chatId);
    await sendMessage(
      chatId,
      "Привет! Здесь художники, которые рисуют руками, находят заказчиков. Кто ты?",
      ROLE_BUTTONS,
    );
    return;
  }

  const session = await getSession(chatId);
  switch (session.step) {
    case "artist_describe":
      return buildDraft(chatId, session, text);
    case "artist_review": // typed instead of pressing a button: treat it as a correction
    case "artist_fix":
      return buildDraft(chatId, session, text, session.draft);
    default:
      await sendMessage(chatId, "Чтобы начать, нажми /start");
  }
}

async function handleButton(query) {
  const chatId = query.message?.chat.id;
  await answerButton(query.id);
  if (!chatId) return;

  const session = await getSession(chatId);

  switch (query.data) {
    case "role:artist":
      await removeButtons(chatId, query.message.message_id);
      await saveSession(chatId, { step: "artist_describe" });
      await sendMessage(chatId, ASK_DESCRIPTION);
      return;

    case "role:client":
      await removeButtons(chatId, query.message.message_id);
      await clearSession(chatId);
      await sendMessage(chatId, "Поиск художников по заказу скоро появится. Загляни чуть позже 🙏");
      return;

    case "profile:confirm":
      if (!isCurrentReview(session, query)) return staleButton(chatId);
      await removeButtons(chatId, query.message.message_id);
      await saveArtistProfile(query.from.id, {
        ...session.draft,
        user_id: query.from.id,
        username: query.from.username ?? null,
        name: [query.from.first_name, query.from.last_name].filter(Boolean).join(" "),
        description: session.description,
        updated_at: new Date().toISOString(),
      });
      await clearSession(chatId);
      await sendMessage(
        chatId,
        "Готово, анкета сохранена! ✨ Когда появятся подходящие заказы, я пришлю их сюда.\n" +
          "Чтобы заполнить анкету заново, нажми /start",
      );
      return;

    case "profile:edit":
      if (!isCurrentReview(session, query)) return staleButton(chatId);
      await removeButtons(chatId, query.message.message_id);
      await saveSession(chatId, { ...session, step: "artist_fix" });
      await sendMessage(chatId, "Напиши, что поправить или добавить. Например: «цены в рублях» или «добавь стиль реализм».");
      return;

    default:
      return staleButton(chatId);
  }
}

// The buttons count only under the latest draft, not under an older one.
function isCurrentReview(session, query) {
  return session.step === "artist_review" && session.draft && session.reviewMessageId === query.message.message_id;
}

// The button belongs to an old message, e.g. a profile that was already confirmed.
function staleButton(chatId) {
  return sendMessage(chatId, "Эта кнопка уже не работает. Чтобы начать заново, нажми /start");
}

// Sends the text to Claude, saves the draft and shows it with the two buttons.
// previous is set when the artist is correcting an existing draft.
async function buildDraft(chatId, session, text, previous) {
  const input = text.slice(0, MAX_INPUT);
  await sendTyping(chatId);

  let draft;
  try {
    draft = await extractArtistProfile(input, previous);
  } catch (err) {
    console.error("Profile extraction failed:", err);
    // The step stays the same, so the artist can simply send the text again.
    await sendMessage(chatId, "Не получилось разобрать текст 😔 Попробуй отправить его ещё раз или напиши немного иначе.");
    return;
  }

  // The previous draft's buttons are no longer valid.
  if (session.reviewMessageId) await removeButtons(chatId, session.reviewMessageId);

  const sent = await sendMessage(chatId, `${formatProfile(draft)}\n\nВсё верно?`, REVIEW_BUTTONS);
  await saveSession(chatId, {
    step: "artist_review",
    draft,
    reviewMessageId: sent.message_id,
    // Keep the artist's own words too: they will help with matching later.
    description: previous ? `${session.description ?? ""}\n\nИсправление: ${input}`.trim() : input,
  });
}
