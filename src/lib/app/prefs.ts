// Study choices the overlay and the main window share: which set the overlay
// studies, the overlay's mode, the special-keys switch and the side
// Flashcards shows first. They live in settings.json with the other
// settings; the study screens change them one at a time (set_study_pref,
// which the overlay may call too), and the `settings-changed` event Rust
// emits keeps both windows in step.
//
// Up to 0.1.14 they were kept in the webview's localStorage, which drops its
// newest writes when the webview is killed rather than closed (a restart with
// the app in the tray). The main window hands what is still there to Rust on
// its first start with this version, then removes it.

import { useCallback } from 'react';

import { adoptLocalPrefs as adopt, type OverlayMode, type StudyPrefs } from './native';
import { useSettings } from './settings';

export type { OverlayMode };

/** What the screens show until the settings have arrived (Rust's defaults). */
const DEFAULTS: StudyPrefs = { overlaySet: null, overlayMode: 'cards', specialKeys: true, cardsFirstSide: 'term' };

/** A shared study choice, kept in step across both windows. */
export function usePref<K extends keyof StudyPrefs>(key: K): [StudyPrefs[K], (v: StudyPrefs[K]) => void] {
  const { settings, setPref } = useSettings();
  const set = useCallback((v: StudyPrefs[K]) => setPref(key, v), [key, setPref]);
  return [settings ? settings[key] : DEFAULTS[key], set];
}

/**
 * The set the overlay studies: the one picked, or — when none is picked yet
 * or it has been deleted — the first of `sets` (the newest, as listed).
 */
export function studySetFrom<S extends { id: number }>(picked: number | null, sets: S[]): number | null {
  if (picked !== null && sets.some((s) => s.id === picked)) return picked;
  return sets[0]?.id ?? null;
}

// --- carry-over from localStorage ---

/** The localStorage keys versions up to 0.1.14 kept these choices under. */
export const LEGACY_KEYS = {
  overlaySet: 'flashcards.overlay-set',
  overlayMode: 'flashcards.overlay-mode',
  specialKeys: 'flashcards:special-key-shortcuts',
  /** The special-keys switch under the name versions up to 0.1.6 used. */
  specialKeysOld: '404canvas:flashcards:special-key-shortcuts',
  cardsFirstSide: 'fc-first-side',
} as const;

/** The choices an older version left, read as it read them; anything unreadable is left out. */
export function legacyPrefs(get: (key: string) => string | null): Partial<StudyPrefs> {
  const found: Partial<StudyPrefs> = {};
  const set = get(LEGACY_KEYS.overlaySet);
  const id = Number(set);
  if (set && Number.isInteger(id) && id > 0) found.overlaySet = id;
  const mode = get(LEGACY_KEYS.overlayMode);
  if (mode === 'cards' || mode === 'write' || mode === 'learn') found.overlayMode = mode;
  const keys = get(LEGACY_KEYS.specialKeys) ?? get(LEGACY_KEYS.specialKeysOld);
  if (keys !== null) found.specialKeys = keys === 'on';
  const side = get(LEGACY_KEYS.cardsFirstSide);
  if (side === 'term' || side === 'definition') found.cardsFirstSide = side;
  return found;
}

/**
 * Hands over what an older version left in localStorage, then removes it.
 * Rust takes it once and never over a choice settings.json already has
 * (Settings::adopt), so running this again is harmless.
 */
export async function adoptLocalPrefs(): Promise<void> {
  let present: string[];
  let found: Partial<StudyPrefs>;
  try {
    present = Object.values(LEGACY_KEYS).filter((key) => localStorage.getItem(key) !== null);
    found = legacyPrefs((key) => localStorage.getItem(key));
  } catch {
    return; // no storage: nothing to carry over
  }
  if (present.length === 0) return;
  await adopt(found);
  try {
    for (const key of present) localStorage.removeItem(key);
  } catch {
    /* removed next time */
  }
}
