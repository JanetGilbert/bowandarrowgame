export const MAX_NAME_LENGTH = 20;

// Common filter-evasion substitutions, mapped back to the letter they imitate.
const LEET: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '3': 'e',
  '4': 'a',
  '@': 'a',
  '5': 's',
  '$': 's',
  '7': 't',
  '+': 't',
  '8': 'b',
  '6': 'g',
  '9': 'g',
};

// Masked wherever they appear, even inside longer words.
const BANNED_ANYWHERE = [
  'fuck',
  'shit',
  'cunt',
  'bitch',
  'whore',
  'slut',
  'wank',
  'jizz',
  'piss',
  'penis',
  'vagina',
  'dildo',
  'blowjob',
  'handjob',
  'rimjob',
  'boner',
  'porn',
  'nigger',
  'nigga',
  'faggot',
  'kike',
  'wetback',
  'tranny',
  'retard',
  'beaner',
  'dickhead',
  'jerkoff',
  'cumshot',
  'hitler',
];

// Masked only as a whole word, so names like "Class", "Cassidy" or
// "Pakistan_fan" survive.
const BANNED_WORDS = new Set([
  'ass',
  'arse',
  'anal',
  'anus',
  'cum',
  'tit',
  'tits',
  'boob',
  'boobs',
  'hoe',
  'fag',
  'fags',
  'homo',
  'dyke',
  'spic',
  'coon',
  'chink',
  'paki',
  'gook',
  'kys',
  'dick',
  'cock',
  'sex',
  'nazi',
  'rape',
  'rapist',
  'twat',
  'semen',
]);

// Lowercase, undo leet substitutions, and drop everything but letters.
// Returns the normalized string plus a map from each normalized char back to
// its index in the input.
function normalize(text: string): { norm: string; map: number[] } {
  const chars: string[] = [];
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = LEET[text[i]!] ?? text[i]!.toLowerCase();
    if (c < 'a' || c > 'z') continue;
    chars.push(c);
    map.push(i);
  }
  return { norm: chars.join(''), map };
}

// "fuck" -> /f+u+c+k+/g, so stretched spellings like "fuuuck" still match
// while words needing double letters (e.g. "ass") never match single ones.
function repeatTolerant(word: string, anchored: boolean): RegExp {
  const body = word
    .split('')
    .map((c) => `${c}+`)
    .join('');
  return anchored ? new RegExp(`^${body}$`) : new RegExp(body, 'g');
}

const BANNED_ANYWHERE_PATTERNS = BANNED_ANYWHERE.map((w) => repeatTolerant(w, false));
const BANNED_WORD_PATTERNS = [...BANNED_WORDS].map((w) => repeatTolerant(w, true));

/**
 * Trims and truncates a display name to MAX_NAME_LENGTH characters and masks
 * profanity/slurs (including leetspeak variants) with asterisks. Returns ''
 * if nothing displayable remains.
 */
export function sanitizeName(raw: string): string {
  // Remove control and zero-width characters, then cap the length.
  const name = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028\u2029\u2060\ufeff]/g, '')
    .trim()
    .slice(0, MAX_NAME_LENGTH)
    .trim();
  if (!name) return '';

  const masked: boolean[] = new Array(name.length).fill(false);
  const maskSpan = (from: number, to: number): void => {
    for (let i = from; i <= to; i++) masked[i] = true;
  };

  const { norm, map } = normalize(name);
  for (const pattern of BANNED_ANYWHERE_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(norm)) !== null) {
      maskSpan(map[match.index]!, map[match.index + match[0].length - 1]!);
    }
  }

  // Candidate "words" to check against the whole-word list: each separated
  // token, plus its camelCase segments ("BigDick" -> "Big", "Dick") and
  // digit-stripped variants ("dick69" -> "dick").
  const candidates: { start: number; text: string }[] = [];
  const tokenPattern = /[a-zA-Z0-9@$!|+]+/g;
  let token: RegExpExecArray | null;
  while ((token = tokenPattern.exec(name)) !== null) {
    candidates.push({ start: token.index, text: token[0] });
    const segmentPattern = /[A-Z]+[^A-Z]*|[^A-Z]+/g;
    let segment: RegExpExecArray | null;
    while ((segment = segmentPattern.exec(token[0])) !== null) {
      if (segment[0].length < token[0].length) {
        candidates.push({ start: token.index + segment.index, text: segment[0] });
      }
    }
  }
  for (const { start, text } of [...candidates]) {
    const leading = /^[0-9]+/.exec(text)?.[0].length ?? 0;
    const stripped = text.slice(leading).replace(/[0-9]+$/, '');
    if (stripped && stripped.length < text.length) {
      candidates.push({ start: start + leading, text: stripped });
    }
  }
  for (const { start, text } of candidates) {
    const { norm } = normalize(text);
    if (norm && BANNED_WORD_PATTERNS.some((p) => p.test(norm))) {
      maskSpan(start, start + text.length - 1);
    }
  }

  return name
    .split('')
    .map((c, i) => (masked[i] ? '*' : c))
    .join('');
}
