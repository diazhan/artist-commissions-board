// All texts the bot shows, in three languages: Russian, Kazakh and English.
// To change a phrase, change it here; the rest of the code only uses the keys.

export const LANGUAGES = ["kk", "ru", "en"];

// Language picker: the same message for everyone, so it is not translated.
export const LANGUAGE_PROMPT = "🌐 Тілді таңда · Выбери язык · Choose a language";
export const LANGUAGE_BUTTONS = [
  [{ text: "🇰🇿 Қазақша", data: "lang:kk" }],
  [{ text: "🇷🇺 Русский", data: "lang:ru" }],
  [{ text: "🇬🇧 English", data: "lang:en" }],
];

const TEXTS = {
  ru: {
    languageSaved: "Язык: русский 🇷🇺 Сменить можно командой /language",
    greeting: "Привет! Здесь художники, которые рисуют руками, находят заказчиков. Кто ты?",
    roleArtist: "🎨 Я художник",
    roleClient: "🔎 Ищу художника",
    askDescription:
      "Расскажи о себе своими словами, одним сообщением:\n" +
      "• в каких стилях рисуешь;\n" +
      "• ссылки на работы или портфолио;\n" +
      "• сколько стоят работы и в какой валюте (₸, ₽, $);\n" +
      "• как готов работать: за деньги, по бартеру или бесплатно.\n\n" +
      "Пример: «Рисую аниме и чиби, портреты по фото. Работы: t.me/myart. " +
      "Скетч от 3000 ₸, полноценный арт до 15000 ₸. Возможен бартер на рекламу.»",
    textOnly: "Пока я понимаю только текст. Напиши, пожалуйста, словами 🙂",
    pressStart: "Чтобы начать, нажми /start",
    clientSoon: "Поиск художников по заказу скоро появится. Загляни чуть позже 🙏",
    saved:
      "Готово, анкета сохранена! ✨ Когда появятся подходящие заказы, я пришлю их сюда.\n" +
      "Чтобы заполнить анкету заново, нажми /start",
    askFix: "Напиши, что поправить или добавить. Например: «цены в рублях» или «добавь стиль реализм».",
    staleButton: "Эта кнопка уже не работает. Чтобы начать заново, нажми /start",
    extractFailed: "Не получилось разобрать текст 😔 Попробуй отправить его ещё раз или напиши немного иначе.",
    isCorrect: "Всё верно?",
    confirm: "✅ Всё верно",
    fix: "✏️ Исправить",
    profile: {
      title: "🎨 Твоя анкета",
      styles: "Стили",
      examples: "Примеры работ",
      prices: "Цены",
      exchange: "Работаю за",
      notSpecified: "не указано",
      from: (x) => `от ${x}`,
      to: (x) => `до ${x}`,
      otherCurrency: "(другая валюта)",
      exchangeTypes: { money: "деньги", barter: "бартер", free: "бесплатно" },
      missing: (list) => `Не хватает: ${list}. Можно дописать через «Исправить».`,
    },
    locale: "ru-RU",
    claudeLanguage: "Russian",
  },

  kk: {
    languageSaved: "Тіл: қазақша 🇰🇿 Ауыстыру үшін /language командасын бас",
    greeting: "Сәлем! Мұнда қолмен сурет салатын суретшілер тапсырыс берушілерді табады. Сен кімсің?",
    roleArtist: "🎨 Мен суретшімін",
    roleClient: "🔎 Суретші іздеймін",
    askDescription:
      "Өзің туралы өз сөзіңмен бір хабарламада жаз:\n" +
      "• қандай стильдерде сурет саласың;\n" +
      "• жұмыстарыңа немесе портфолиоңа сілтемелер;\n" +
      "• жұмыстарың қанша тұрады және қай валютада (₸, ₽, $);\n" +
      "• қалай жұмыс істейсің: ақшаға, бартерге немесе тегін.\n\n" +
      "Мысал: «Аниме мен чиби саламын, фото бойынша портрет жасаймын. Жұмыстарым: t.me/myart. " +
      "Скетч 3000 ₸-ден, толық арт 15000 ₸-ге дейін. Жарнамаға бартер болады.»",
    textOnly: "Әзірге мен тек мәтінді түсінемін. Сөзбен жазшы 🙂",
    pressStart: "Бастау үшін /start бас",
    clientSoon: "Тапсырыс бойынша суретші іздеу жақында қосылады. Сәл кейінірек кір 🙏",
    saved:
      "Дайын, анкетаң сақталды! ✨ Лайықты тапсырыстар пайда болғанда, оларды осында жіберемін.\n" +
      "Анкетаны қайта толтыру үшін /start бас",
    askFix: "Нені түзету немесе қосу керек екенін жаз. Мысалы: «бағалар рубльмен» немесе «реализм стилін қос».",
    staleButton: "Бұл батырма енді жұмыс істемейді. Қайта бастау үшін /start бас",
    extractFailed: "Мәтінді түсіне алмадым 😔 Оны қайта жіберіп көр немесе басқаша жаз.",
    isCorrect: "Бәрі дұрыс па?",
    confirm: "✅ Бәрі дұрыс",
    fix: "✏️ Түзету",
    profile: {
      title: "🎨 Сенің анкетаң",
      styles: "Стильдер",
      examples: "Жұмыс үлгілері",
      prices: "Бағалар",
      exchange: "Төлем түрі",
      notSpecified: "көрсетілмеген",
      // "at least / at most": these words need no case ending that depends on the number.
      from: (x) => `кемінде ${x}`,
      to: (x) => `ең көбі ${x}`,
      otherCurrency: "(басқа валюта)",
      exchangeTypes: { money: "ақша", barter: "бартер", free: "тегін" },
      missing: (list) => `Жетіспейді: ${list}. «Түзету» арқылы толықтыруға болады.`,
    },
    locale: "kk-KZ",
    claudeLanguage: "Kazakh",
  },

  en: {
    languageSaved: "Language: English 🇬🇧 You can change it with /language",
    greeting: "Hi! This is where artists who draw by hand find clients. Who are you?",
    roleArtist: "🎨 I'm an artist",
    roleClient: "🔎 I'm looking for an artist",
    askDescription:
      "Tell me about yourself in your own words, in one message:\n" +
      "• which styles you draw in;\n" +
      "• links to your works or portfolio;\n" +
      "• how much your works cost and in which currency (₸, ₽, $);\n" +
      "• how you work: for money, barter or free.\n\n" +
      "Example: \"I draw anime and chibi, portraits from photos. Works: t.me/myart. " +
      "Sketch from 3000 ₸, full art up to 15000 ₸. Barter for ads is possible.\"",
    textOnly: "For now I only understand text. Please write it in words 🙂",
    pressStart: "To begin, press /start",
    clientSoon: "Finding artists for an order is coming soon. Please check back a bit later 🙏",
    saved:
      "Done, your profile is saved! ✨ When matching orders appear, I'll send them here.\n" +
      "To fill in the profile again, press /start",
    askFix: "Write what to correct or add. For example: \"prices in rubles\" or \"add the realism style\".",
    staleButton: "This button no longer works. To start again, press /start",
    extractFailed: "I couldn't make sense of the text 😔 Try sending it again or phrase it a little differently.",
    isCorrect: "Is everything right?",
    confirm: "✅ All correct",
    fix: "✏️ Fix",
    profile: {
      title: "🎨 Your profile",
      styles: "Styles",
      examples: "Examples of work",
      prices: "Prices",
      exchange: "Works for",
      notSpecified: "not specified",
      from: (x) => `from ${x}`,
      to: (x) => `up to ${x}`,
      otherCurrency: "(other currency)",
      exchangeTypes: { money: "money", barter: "barter", free: "free" },
      missing: (list) => `Missing: ${list}. You can add it with "Fix".`,
    },
    locale: "en-US",
    claudeLanguage: "English",
  },
};

export function t(lang) {
  return TEXTS[lang] ?? TEXTS.ru;
}

// First guess from the language set in the person's Telegram app.
export function detectLanguage(languageCode) {
  const code = (languageCode ?? "").slice(0, 2);
  return LANGUAGES.includes(code) ? code : "ru";
}

// Descriptions for the "/" command menu in Telegram, per app language.
export const COMMANDS = {
  ru: [
    { command: "start", description: "Начать заново" },
    { command: "language", description: "Сменить язык" },
  ],
  kk: [
    { command: "start", description: "Қайта бастау" },
    { command: "language", description: "Тілді ауыстыру" },
  ],
  en: [
    { command: "start", description: "Start over" },
    { command: "language", description: "Change language" },
  ],
};
