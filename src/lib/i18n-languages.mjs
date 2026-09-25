/**
 * Scheduled translation languages. Codes, English names, and native names come
 * from content-automation/config/languages.json. Script, direction, hreflang,
 * font, and quality tier are fixed annotations for those codes.
 *
 * hreflang is the language code as written in that file (not a region tag).
 * Urdu, Kashmiri, and Sindhi are rtl. Every other scheduled language is ltr.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const RTL_CODES = new Set(['ur', 'ks', 'sd']);

const STRONG_CODES = new Set(['hi', 'bn', 'ta', 'te', 'mr', 'ur', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ne']);

const WEAK_CODES = new Set(['sat', 'sa', 'ks', 'brx', 'mni', 'sd', 'doi', 'kok', 'mai']);

const SCRIPT_BY_CODE = {
  hi: 'Devanagari',
  mr: 'Devanagari',
  ne: 'Devanagari',
  sa: 'Devanagari',
  brx: 'Devanagari',
  doi: 'Devanagari',
  kok: 'Devanagari',
  mai: 'Devanagari',
  bn: 'Bengali',
  as: 'Bengali',
  mni: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Gurmukhi',
  or: 'Oriya',
  ur: 'Nastaliq Urdu',
  ks: 'Nastaliq Urdu',
  sd: 'Nastaliq Urdu',
  sat: 'Ol Chiki',
};

const SCRIPT_FONTS = {
  Devanagari: {
    families: ['Noto Sans Devanagari', 'Noto Serif Devanagari'],
    stylesheet:
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Serif+Devanagari:wght@600;700&display=swap',
  },
  Bengali: {
    families: ['Noto Sans Bengali', 'Noto Serif Bengali'],
    stylesheet:
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&family=Noto+Serif+Bengali:wght@600;700&display=swap',
  },
  Tamil: {
    families: ['Noto Sans Tamil', 'Noto Serif Tamil'],
    stylesheet:
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Serif+Tamil:wght@600;700&display=swap',
  },
  Telugu: {
    families: ['Noto Sans Telugu', 'Noto Serif Telugu'],
    stylesheet:
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;600;700&family=Noto+Serif+Telugu:wght@600;700&display=swap',
  },
  Gujarati: {
    families: ['Noto Sans Gujarati', 'Noto Serif Gujarati'],
    stylesheet:
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;600;700&family=Noto+Serif+Gujarati:wght@600;700&display=swap',
  },
  Kannada: {
    families: ['Noto Sans Kannada', 'Noto Serif Kannada'],
    stylesheet:
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;600;700&family=Noto+Serif+Kannada:wght@600;700&display=swap',
  },
  Malayalam: {
    families: ['Noto Sans Malayalam', 'Noto Serif Malayalam'],
    stylesheet:
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600;700&family=Noto+Serif+Malayalam:wght@600;700&display=swap',
  },
  Gurmukhi: {
    families: ['Noto Sans Gurmukhi', 'Noto Serif Gurmukhi'],
    stylesheet:
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;600;700&family=Noto+Serif+Gurmukhi:wght@600;700&display=swap',
  },
  Oriya: {
    families: ['Noto Sans Oriya', 'Noto Serif Oriya'],
    stylesheet:
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Oriya:wght@400;600;700&family=Noto+Serif+Oriya:wght@600;700&display=swap',
  },
  'Nastaliq Urdu': {
    families: ['Noto Nastaliq Urdu', 'Noto Naskh Arabic'],
    stylesheet:
      'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap',
  },
  'Ol Chiki': {
    families: ['Noto Sans Ol Chiki'],
    stylesheet: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Ol+Chiki:wght@400;600;700&display=swap',
  },
};

export function defaultLanguageConfigPath(root = process.cwd()) {
  return path.join(root, 'content-automation', 'config', 'languages.json');
}

export function annotateLanguages(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('languages.json must list the scheduled translation languages.');
  }

  const seen = new Set();
  const languages = entries.map((entry) => {
    const code = entry?.code;
    if (typeof code !== 'string' || !/^[a-z]{2,3}$/.test(code)) {
      throw new Error('languages.json has an invalid language code.');
    }
    if (seen.has(code)) {
      throw new Error(`languages.json lists "${code}" more than once.`);
    }
    seen.add(code);

    if (typeof entry.name !== 'string' || entry.name.trim() === '') {
      throw new Error(`languages.json entry "${code}" needs an English name.`);
    }
    if (typeof entry.nativeName !== 'string' || entry.nativeName.trim() === '') {
      throw new Error(`languages.json entry "${code}" needs a native name.`);
    }

    const script = SCRIPT_BY_CODE[code];
    const fonts = SCRIPT_FONTS[script];
    if (!script || !fonts) {
      throw new Error(`No script or Noto font is registered for language "${code}".`);
    }

    const strong = STRONG_CODES.has(code);
    const weak = WEAK_CODES.has(code);
    if (strong === weak) {
      throw new Error(`Language "${code}" must be exactly one of strong or weak.`);
    }

    return {
      code,
      name: entry.name,
      nativeName: entry.nativeName,
      script,
      dir: RTL_CODES.has(code) ? 'rtl' : 'ltr',
      hreflang: code,
      fontFamilies: fonts.families,
      fontStylesheet: fonts.stylesheet,
      quality: strong ? 'strong' : 'weak',
    };
  });

  const annotated = new Set(Object.keys(SCRIPT_BY_CODE));
  for (const code of annotated) {
    if (!seen.has(code)) {
      throw new Error(`Script map includes "${code}", which is not in languages.json.`);
    }
  }

  return languages;
}

export function loadScheduledLanguages(configPath = defaultLanguageConfigPath()) {
  const entries = JSON.parse(readFileSync(configPath, 'utf8'));
  return annotateLanguages(entries);
}

let cachedLanguages = null;

export function scheduledLanguages() {
  if (!cachedLanguages) {
    cachedLanguages = loadScheduledLanguages(defaultLanguageConfigPath());
  }
  return cachedLanguages;
}

export function scheduledLanguageCodes() {
  return scheduledLanguages().map((language) => language.code);
}

export function languageByCode(code) {
  return scheduledLanguages().find((language) => language.code === code) ?? null;
}

export function isScheduledLanguage(code) {
  return languageByCode(code) !== null;
}

const ENGLISH_PAGE_LANGUAGE = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  script: 'Latin',
  dir: 'ltr',
  hreflang: 'en',
  fontFamilies: [],
  fontStylesheet: null,
  quality: 'strong',
};

export function pageLanguage(code) {
  if (code === 'en') {
    return ENGLISH_PAGE_LANGUAGE;
  }

  const language = languageByCode(code);
  if (!language) {
    throw new Error(`Unknown language code "${code ?? ''}".`);
  }
  return language;
}
