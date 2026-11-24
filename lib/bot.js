// The conversation logic. One function, handleUpdate, gets every update from
// Telegram (a text message or a button press) and decides what to answer.
//
// Where the person is in the conversation is kept in session.step:
//   (none)          nothing started, or finished
//   artist_describe waiting for the artist to describe themselves
//   artist_review   the draft profile is shown, waiting for "correct" / "fix"
//   artist_fix      waiting for what to correct in the draft
//
// The person's language (kk, ru or en) is stored separately and kept forever;
// every text comes from lib/i18n.js in that language.

import { detectLanguage, LANGUAGE_BUTTONS, LANGUAGE_PROMPT, LANGUAGES, t } from "./i18n.js";
import { extractArtistProfile, formatProfile } from "./profile.js";
import {
  clearSession,
  getLanguage,
  getSession,
  saveArtistProfile,
  saveLanguage,
  saveSession,
} from "./storage.js";
import { answerButton, removeButtons, sendMessage, sendTyping } from "./telegram.js";

// Longer descriptions are cut, so one message cannot cost a lot.
const MAX_INPUT = 3000;

function roleButtons(lang) {
  return [
    [{ text: t(lang).roleArtist, data: "role:artist" }],
    [{ text: t(lang).roleClient, data: "role:client" }],
  ];
}

function reviewButtons(lang) {
  return [
    [
      { text: t(lang).confirm, data: "profile:confirm" },
      { text: t(lang).fix, data: "profile:edit" },
    ],
  ];
}

export async function handleUpdate(update) {
  if (update.callback_query) return handleButton(update.callback_query);

  const msg = update.message;
  if (!msg || msg.chat.type !== "private") return; // the bot works only in private chats

  const chatId = msg.chat.id;
  const savedLang = await getLanguage(msg.from.id);
  const lang = savedLang ?? detectLanguage(msg.from.language_code);

  if (!msg.text) {
    await sendMessage(chatId, t(lang).textOnly);
    return;
  }

  const text = msg.text.trim();

  if (text.startsWith("/start")) {
    await clearSession(chatId);
    // The first time, ask for the language; after that, go straight to the roles.
    if (!savedLang) {
      await sendMessage(chatId, LANGUAGE_PROMPT, LANGUAGE_BUTTONS);
    } else {
      await sendMessage(chatId, t(lang).greeting, roleButtons(lang));
    }
    return;
  }

  if (text.startsWith("/language")) {
    await sendMessage(chatId, LANGUAGE_PROMPT, LANGUAGE_BUTTONS);
    return;
  }

  const session = await getSession(chatId);
  switch (session.step) {
    case "artist_describe":
      return buildDraft(chatId, session, text, lang);
    case "artist_review": // typed instead of pressing a button: treat it as a correction
    case "artist_fix":
      return buildDraft(chatId, session, text, lang, session.draft);
    default:
      await sendMessage(chatId, t(lang).pressStart);
  }
}

async function handleButton(query) {
  const chatId = query.message?.chat.id;
  await answerButton(query.id);
  if (!chatId) return;

  const session = await getSession(chatId);

  // Language buttons: "lang:kk", "lang:ru", "lang:en"
  if (query.data?.startsWith("lang:")) {
    const chosen = query.data.slice(5);
    if (!LANGUAGES.includes(chosen)) return;
    await removeButtons(chatId, query.message.message_id);
    await saveLanguage(query.from.id, chosen);
    await sendMessage(chatId, t(chosen).languageSaved);
    // Nothing in progress: continue with the role choice. In the middle of a
    // profile the conversation simply goes on in the new language.
    if (!session.step) await sendMessage(chatId, t(chosen).greeting, roleButtons(chosen));
    return;
  }

  const lang = (await getLanguage(query.from.id)) ?? detectLanguage(query.from.language_code);

  switch (query.data) {
    case "role:artist":
      await removeButtons(chatId, query.message.message_id);
      await saveSession(chatId, { step: "artist_describe" });
      await sendMessage(chatId, t(lang).askDescription);
      return;

    case "role:client":
      await removeButtons(chatId, query.message.message_id);
      await clearSession(chatId);
      await sendMessage(chatId, t(lang).clientSoon);
      return;

    case "profile:confirm":
      if (!isCurrentReview(session, query)) return sendMessage(chatId, t(lang).staleButton);
      await removeButtons(chatId, query.message.message_id);
      await saveArtistProfile(query.from.id, {
        ...session.draft,
        user_id: query.from.id,
        username: query.from.username ?? null,
        name: [query.from.first_name, query.from.last_name].filter(Boolean).join(" "),
        language: lang,
        description: session.description,
        updated_at: new Date().toISOString(),
      });
      await clearSession(chatId);
      await sendMessage(chatId, t(lang).saved);
      return;

    case "profile:edit":
      if (!isCurrentReview(session, query)) return sendMessage(chatId, t(lang).staleButton);
      await removeButtons(chatId, query.message.message_id);
      await saveSession(chatId, { ...session, step: "artist_fix" });
      await sendMessage(chatId, t(lang).askFix);
      return;

    default:
      // The button belongs to an old message, e.g. a profile that was already confirmed.
      return sendMessage(chatId, t(lang).staleButton);
  }
}

// The buttons count only under the latest draft, not under an older one.
function isCurrentReview(session, query) {
  return session.step === "artist_review" && session.draft && session.reviewMessageId === query.message.message_id;
}

// Sends the text to Claude, saves the draft and shows it with the two buttons.
// previous is set when the artist is correcting an existing draft.
async function buildDraft(chatId, session, text, lang, previous) {
  const input = text.slice(0, MAX_INPUT);
  await sendTyping(chatId);

  let draft;
  try {
    draft = await extractArtistProfile(input, lang, previous);
  } catch (err) {
    console.error("Profile extraction failed:", err);
    // The step stays the same, so the artist can simply send the text again.
    await sendMessage(chatId, t(lang).extractFailed);
    return;
  }

  // The previous draft's buttons are no longer valid.
  if (session.reviewMessageId) await removeButtons(chatId, session.reviewMessageId);

  const sent = await sendMessage(chatId, `${formatProfile(draft, lang)}\n\n${t(lang).isCorrect}`, reviewButtons(lang));
  await saveSession(chatId, {
    step: "artist_review",
    draft,
    reviewMessageId: sent.message_id,
    // Keep the artist's own words too: they will help with matching later.
    description: previous ? `${session.description ?? ""}\n\nCorrection: ${input}`.trim() : input,
  });
}
