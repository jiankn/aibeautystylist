// Lightweight client-side personalization helpers.
// These are imported by Astro <script> blocks and run in the browser only.

const MY_STYLE_KEY = 'aibeauty_my_style';
const SAVED_LOOKS_KEY = 'aibeauty_saved_looks';

export interface MyStyle {
  slug: string;
  label: string;
  scenario: string;
  lookSlug: string;
  setAt: number;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getMyStyle(): MyStyle | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = safeParse<MyStyle>(localStorage.getItem(MY_STYLE_KEY));
    if (
      parsed &&
      typeof parsed.slug === 'string' &&
      typeof parsed.label === 'string' &&
      typeof parsed.scenario === 'string' &&
      typeof parsed.lookSlug === 'string'
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setMyStyle(style: Omit<MyStyle, 'setAt'>): MyStyle {
  const value: MyStyle = { ...style, setAt: Date.now() };
  try {
    localStorage.setItem(MY_STYLE_KEY, JSON.stringify(value));
  } catch {
    // ignore (private mode etc.)
  }
  return value;
}

export function clearMyStyle(): void {
  try {
    localStorage.removeItem(MY_STYLE_KEY);
  } catch {
    // ignore
  }
}

export function getSavedLooks(): string[] {
  if (typeof window === 'undefined') return [];
  const parsed = safeParse<string[]>(localStorage.getItem(SAVED_LOOKS_KEY));
  return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
}

export function isLookSaved(slug: string): boolean {
  return getSavedLooks().includes(slug);
}

export function toggleSavedLook(slug: string): { saved: boolean; total: number } {
  const current = getSavedLooks();
  const idx = current.indexOf(slug);
  const next = idx === -1 ? [...current, slug] : current.filter((s) => s !== slug);
  try {
    localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return { saved: idx === -1, total: next.length };
}
