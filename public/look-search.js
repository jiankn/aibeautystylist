(function (global) {
  const SEARCH_GLOSSARIES = {
    en: [
      ["natural", "clean", "no makeup", "barely there"],
      ["glow", "glowy", "dewy", "luminous", "radiant"],
      ["matte", "soft matte", "velvet", "cloud skin"],
      ["commute", "work", "office", "professional"],
      ["photo", "photogenic", "camera ready", "flash proof"],
      ["date", "romantic", "soft date"],
      ["beginner", "easy", "quick", "five minute"],
      ["smoky", "smokey", "smoke"],
    ],
    zh: [
      ["裸妆", "自然妆", "伪素颜", "清透妆", "clean girl", "nude"],
      ["水光", "水光妆", "光泽", "光感", "亮泽", "玻璃肌", "glowy", "dewy"],
      ["哑光", "雾面", "柔雾", "丝绒", "matte"],
      ["通勤", "上班", "职场", "办公室", "office"],
      ["拍照", "上镜", "摄影", "镜头妆", "photo"],
      ["约会", "浪漫", "氛围感"],
      ["新手", "简单", "快速", "五分钟"],
      ["烟熏", "烟熏妆", "smoky"],
      ["千禧", "千禧风", "y2k"],
    ],
    ja: [
      ["ナチュラル", "自然", "すっぴん風"],
      ["ツヤ", "艶", "ツヤ肌", "水光"],
      ["マット", "ソフトマット", "ベルベット"],
      ["通勤", "仕事", "オフィス"],
      ["写真", "撮影", "写真映え"],
      ["デート", "ロマンチック"],
      ["初心者", "簡単", "時短"],
      ["スモーキー", "煙"],
    ],
    ko: [
      ["내추럴", "자연스러운", "꾸안꾸"],
      ["광채", "물광", "윤광", "글로우"],
      ["매트", "소프트 매트", "벨벳"],
      ["출근", "직장", "오피스"],
      ["사진", "촬영", "포토"],
      ["데이트", "로맨틱"],
      ["초보", "쉬운", "빠른"],
      ["스모키", "스모키 메이크업"],
    ],
    de: [
      ["natürlich", "clean", "no makeup"],
      ["glow", "glowy", "strahlend", "leuchtend"],
      ["matt", "soft matt", "samtig"],
      ["arbeit", "büro", "office", "beruf"],
      ["foto", "fotogen", "kameratauglich"],
      ["date", "romantisch"],
      ["einsteiger", "einfach", "schnell"],
      ["smokey", "smoky", "rauchig"],
    ],
    fr: [
      ["naturel", "clean", "sans maquillage"],
      ["éclat", "lumineux", "glowy", "dewy"],
      ["mat", "mat doux", "velours"],
      ["travail", "bureau", "professionnel"],
      ["photo", "photogénique", "caméra"],
      ["rendez-vous", "romantique", "date"],
      ["débutant", "facile", "rapide"],
      ["charbonneux", "smoky"],
    ],
    es: [
      ["natural", "clean", "sin maquillaje"],
      ["luminoso", "radiante", "glowy", "dewy"],
      ["mate", "mate suave", "terciopelo"],
      ["trabajo", "oficina", "profesional"],
      ["foto", "fotogénico", "cámara"],
      ["cita", "romántico"],
      ["principiante", "fácil", "rápido"],
      ["ahumado", "smoky"],
    ],
    pt: [
      ["natural", "clean", "sem maquiagem"],
      ["luminoso", "radiante", "glowy", "dewy"],
      ["matte", "mate", "aveludado"],
      ["trabalho", "escritório", "profissional"],
      ["foto", "fotogênico", "câmera"],
      ["encontro", "romântico"],
      ["iniciante", "fácil", "rápido"],
      ["esfumado", "smoky"],
    ],
  };
  const ENGLISH_SEARCH_SIGNALS = new Set([
    "beauty",
    "beginner",
    "bronze",
    "clean",
    "commute",
    "date",
    "dewy",
    "evening",
    "glam",
    "glow",
    "glowy",
    "look",
    "makeup",
    "matte",
    "natural",
    "nude",
    "office",
    "photo",
    "radiant",
    "skin",
    "smokey",
    "smoky",
    "velvet",
    "work",
  ]);

  function getLocaleFamily(locale) {
    const value = String(locale || "en").toLowerCase();
    if (value.startsWith("zh")) return "zh";
    if (value.startsWith("ja")) return "ja";
    if (value.startsWith("ko")) return "ko";
    if (value.startsWith("de")) return "de";
    if (value.startsWith("fr")) return "fr";
    if (value.startsWith("es")) return "es";
    if (value.startsWith("pt")) return "pt";
    return "en";
  }

  function normalize(value, locale) {
    return String(value || "")
      .normalize("NFKC")
      .toLocaleLowerCase(locale || undefined)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function tokenize(value) {
    return value.match(/[\p{L}\p{N}]+/gu) || [];
  }

  function addLocaleAliases(text, locale) {
    const glossary = SEARCH_GLOSSARIES[getLocaleFamily(locale)] || [];
    const aliases = [];
    for (const group of glossary) {
      if (group.some((term) => text.includes(normalize(term, locale)))) {
        aliases.push(...group);
      }
    }
    return aliases;
  }

  function createDocument({ title = "", text = "", aliases = [], locale = "en" }) {
    const normalizedTitle = normalize(title, locale);
    const normalizedText = normalize(text, locale);
    const glossaryAliases = addLocaleAliases(normalizedTitle, locale);
    const normalizedAliases = normalize(
      [...aliases, ...glossaryAliases].join(" "),
      locale,
    );
    const combined = [normalizedTitle, normalizedText, normalizedAliases]
      .filter(Boolean)
      .join(" ");

    return {
      locale,
      title: normalizedTitle,
      text: combined,
      compactText: combined.replace(/\s+/g, ""),
      tokens: [...new Set(tokenize(combined))],
    };
  }

  function boundedEditDistance(left, right, maxDistance) {
    if (Math.abs(left.length - right.length) > maxDistance) {
      return maxDistance + 1;
    }
    if (left === right) return 0;
    if (!left.length) return right.length;
    if (!right.length) return left.length;

    let previousPrevious = null;
    let previous = Array.from({ length: right.length + 1 }, (_, index) => index);

    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
      const current = [leftIndex];
      let rowMinimum = current[0];

      for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
        const substitutionCost =
          left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
        let distance = Math.min(
          current[rightIndex - 1] + 1,
          previous[rightIndex] + 1,
          previous[rightIndex - 1] + substitutionCost,
        );

        if (
          previousPrevious &&
          leftIndex > 1 &&
          rightIndex > 1 &&
          left[leftIndex - 1] === right[rightIndex - 2] &&
          left[leftIndex - 2] === right[rightIndex - 1]
        ) {
          distance = Math.min(
            distance,
            previousPrevious[rightIndex - 2] + 1,
          );
        }

        current[rightIndex] = distance;
        rowMinimum = Math.min(rowMinimum, distance);
      }

      if (rowMinimum > maxDistance) return maxDistance + 1;
      previousPrevious = previous;
      previous = current;
    }

    return previous[right.length];
  }

  function allowedDistance(length) {
    if (length < 3) return 0;
    if (length <= 5) return 1;
    if (length <= 9) return 2;
    return 3;
  }

  function scoreToken(queryToken, documentTokens) {
    let best = null;
    for (const token of documentTokens) {
      if (token === queryToken) return 220;
      if (token.startsWith(queryToken) && queryToken.length >= 2) {
        best = Math.max(best || 0, 190);
        continue;
      }
      if (token.includes(queryToken) && queryToken.length >= 2) {
        best = Math.max(best || 0, 160);
        continue;
      }

      const maxDistance = allowedDistance(queryToken.length);
      if (!maxDistance) continue;
      const distance = boundedEditDistance(queryToken, token, maxDistance);
      if (distance <= maxDistance) {
        best = Math.max(best || 0, 135 - distance * 22);
      }
    }
    return best;
  }

  function scoreCjkPhrase(query, document) {
    const compactQuery = query.replace(/\s+/g, "");
    if (compactQuery.length < 3) return null;
    const maxDistance = allowedDistance(compactQuery.length);
    const minLength = Math.max(2, compactQuery.length - maxDistance);
    const maxLength = compactQuery.length + maxDistance;
    let best = null;

    for (let length = minLength; length <= maxLength; length += 1) {
      for (
        let start = 0;
        start + length <= document.compactText.length;
        start += 1
      ) {
        const candidate = document.compactText.slice(start, start + length);
        const distance = boundedEditDistance(
          compactQuery,
          candidate,
          maxDistance,
        );
        if (distance <= maxDistance) {
          best = Math.max(best || 0, 520 - distance * 70);
        }
      }
    }
    return best;
  }

  function score(document, query, locale = document?.locale || "en") {
    if (!document) return null;
    const normalizedQuery = normalize(query, locale);
    if (!normalizedQuery) return 0;

    if (document.title === normalizedQuery) return 1200;
    if (document.title.startsWith(normalizedQuery)) return 1100;
    if (document.title.includes(normalizedQuery)) return 1000;
    if (document.text.includes(normalizedQuery)) return 900;

    if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(normalizedQuery)) {
      return scoreCjkPhrase(normalizedQuery, document);
    }

    const queryTokens = tokenize(normalizedQuery);
    if (!queryTokens.length) return null;
    const tokenScores = queryTokens.map((token) =>
      scoreToken(token, document.tokens),
    );
    if (tokenScores.some((tokenScore) => tokenScore === null)) return null;
    return tokenScores.reduce((sum, tokenScore) => sum + tokenScore, 0);
  }

  function detectAlternativeLocale(query, currentLocale) {
    const value = String(query || "");
    const currentFamily = getLocaleFamily(currentLocale);

    if (/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(value)) {
      return currentFamily === "ja" ? null : "ja-JP";
    }
    if (/\p{Script=Hangul}/u.test(value)) {
      return currentFamily === "ko" ? null : "ko-KR";
    }
    if (/\p{Script=Han}/u.test(value)) {
      return currentFamily === "zh" || currentFamily === "ja" ? null : "zh-CN";
    }
    if (["zh", "ja", "ko"].includes(currentFamily)) {
      const latinTokens = normalize(value, "en").split(" ");
      if (latinTokens.some((token) => ENGLISH_SEARCH_SIGNALS.has(token))) {
        return "en";
      }
    }
    return null;
  }

  global.AbsLookSearch = Object.freeze({
    createDocument,
    detectAlternativeLocale,
    normalize,
    score,
  });
})(globalThis);
