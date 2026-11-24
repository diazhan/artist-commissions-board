// Everything the bot must remember lives in Upstash Redis, because a serverless
// function forgets everything between two messages.
//
// Keys:
//   session:<chatId>  where the person is in the conversation, plus the draft profile
//   artist:<userId>   a confirmed artist profile
//   artists           a set with the user ids of all artists (for matching later)
//   lang:<userId>     the language the person chose: kk, ru or en
//   update:<updateId> marks a Telegram update as handled, so a retry is not handled twice

import { Redis } from "@upstash/redis";

const SESSION_TTL = 60 * 60 * 24 * 7; // an unfinished conversation is kept for 7 days
const UPDATE_TTL = 60 * 60; // Telegram retries within minutes, an hour is plenty

let redis;
function db() {
  if (!redis) {
    // Upstash names these UPSTASH_REDIS_*, Vercel's integration names them KV_*.
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (!url || !token) {
      throw new Error("Redis is not configured: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN");
    }
    redis = new Redis({ url, token });
  }
  return redis;
}

export async function getSession(chatId) {
  return (await db().get(`session:${chatId}`)) ?? {};
}

export async function saveSession(chatId, session) {
  await db().set(`session:${chatId}`, session, { ex: SESSION_TTL });
}

export async function clearSession(chatId) {
  await db().del(`session:${chatId}`);
}

export async function saveArtistProfile(userId, profile) {
  await db().set(`artist:${userId}`, profile);
  await db().sadd("artists", String(userId));
}

export async function getLanguage(userId) {
  return db().get(`lang:${userId}`);
}

export async function saveLanguage(userId, lang) {
  await db().set(`lang:${userId}`, lang);
}

// Returns true the first time an update id is seen, false on a repeat.
export async function isNewUpdate(updateId) {
  const result = await db().set(`update:${updateId}`, 1, { nx: true, ex: UPDATE_TTL });
  return result === "OK";
}
