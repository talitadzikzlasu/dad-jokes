import nlp from 'compromise';
import { STOP_EN } from '../constants/words.constants';

/**
 * Extract 3–5 salient terms from English text.
 * Prefers multi-word noun phrases, then nouns, then verbs/adjectives.
 */
export function topKeywordsCompromise(text: string, min = 3, max = 5): string[] {
  if (!text || !text.trim()) return [];

  const doc = nlp(text);

  // 1) noun phrases (multiword first: "voice input", "dad jokes")
  const nounPhrases = doc
    .nouns()
    .json()
    .map((m: any) => (m.text || '').toLowerCase());
  const uniqNPs = dedupe(nounPhrases).filter(validToken);

  // 2) head nouns (lemmas) as fallback
  const nouns = doc.nouns().out('lemma').toLowerCase().split(/\s+/).filter(Boolean);
  const uniqNouns = dedupe(nouns).filter((w) => w.length > 1);

  // 3) verbs + adjectives to backfill if needed
  const verbs = doc.verbs().out('lemma').toLowerCase().split(/\s+/).filter(Boolean);
  const adjs = doc.adjectives().out('normal').toLowerCase().split(/\s+/).filter(Boolean);
  const content = dedupe([...verbs, ...adjs]).filter((w) => w.length > 2);

  // score (multiword NP > noun > verb/adj) + small length bonus
  const scored: { w: string; s: number }[] = [];
  for (const w of uniqNPs) scored.push({ w, s: 3 + lengthBonus(w) });
  for (const w of uniqNouns) scored.push({ w, s: 2 + lengthBonus(w) });
  for (const w of content) scored.push({ w, s: 1 + lengthBonus(w) });

  // prefer phrases over contained singles (keep "dad jokes" over "jokes")
  const pruned = collapseSubphrases(scored);

  pruned.sort((a, b) => b.s - a.s || b.w.length - a.w.length);
  const k = Math.max(min, Math.min(max, pruned.length));
  return pruned.slice(0, k).map((x) => x.w);
}

function lengthBonus(w: string) {
  const letters = w.replace(/[^a-z0-9]/gi, '');
  return Math.min(0.5, Math.max(0, (letters.length - 4) * 0.06));
}
function validToken(w: string) {
  return !!w && w.replace(/[^a-z0-9'-\s]/gi, '').trim().length > 1;
}
function dedupe(arr: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of arr) {
    const t = raw.trim().replace(/\s+/g, ' ');
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}
function collapseSubphrases(items: { w: string; s: number }[]) {
  const phrases = items.filter((i) => i.w.includes(' '));
  const singles = items.filter((i) => !i.w.includes(' '));
  const keepSingles = singles.filter(
    (s) =>
      !phrases.some(
        (p) => p.s >= s.s && new RegExp(`(^|\\b)${escapeReg(s.w)}(\\b|$)`, 'i').test(p.w)
      )
  );
  return [...phrases, ...keepSingles];
}
function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Normalize a token: lowercase, strip diacritics & punctuation (keep letters/digits/'-) */
export function normalizeToken(w: string): string {
  return w
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9'-]/g, '')
    .replace(/^-+|-+$/g, '');
}

/** Returns true if a token is a common English word or too short/noisy */
export function isCommonEnglishWord(w: string, extraExclude: string[] = []): boolean {
  const t = normalizeToken(w);
  if (!t || /^\d+$/.test(t) || t.length <= 2) return true;
  if (STOP_EN.has(t)) return true;
  // extras you want to ban for this app:
  const EXTRA = new Set(extraExclude.map((s) => normalizeToken(s)));
  // domain-specific exclusions (dad joke app)
  const DOMAIN = new Set(['joke', 'jokes', 'dad', 'dadjoke', 'dadjokes', 'pun', 'puns']);
  return EXTRA.has(t) || DOMAIN.has(t);
}

/** Filter an array of words, keeping only meaningful tokens */
export function filterCommonWords(words: string[], extraExclude: string[] = []): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const w of words) {
    const t = normalizeToken(w);
    if (!t || isCommonEnglishWord(t, extraExclude)) continue;
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

/** Convenience: extract tokens from free text and filter */
export function extractMeaningfulWords(text: string, extraExclude: string[] = []): string[] {
  const tokens = (text || '').split(/\s+/).map(normalizeToken).filter(Boolean);
  return filterCommonWords(tokens, extraExclude);
}
