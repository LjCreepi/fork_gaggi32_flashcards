import { describe, expect, it } from 'vitest';

import { LEGACY_KEYS, legacyPrefs, studySetFrom } from './prefs';

const from = (stored: Record<string, string>) => (key: string) => stored[key] ?? null;

describe('study choices left in localStorage', () => {
  it('reads each one as the old version did', () => {
    expect(
      legacyPrefs(
        from({
          [LEGACY_KEYS.overlaySet]: '12',
          [LEGACY_KEYS.overlayMode]: 'learn',
          [LEGACY_KEYS.specialKeys]: 'off',
          [LEGACY_KEYS.cardsFirstSide]: 'definition',
        }),
      ),
    ).toEqual({ overlaySet: 12, overlayMode: 'learn', specialKeys: false, cardsFirstSide: 'definition' });
  });

  it('leaves out what is missing or unreadable', () => {
    expect(legacyPrefs(from({}))).toEqual({});
    expect(
      legacyPrefs(
        from({
          [LEGACY_KEYS.overlaySet]: '0',
          [LEGACY_KEYS.overlayMode]: 'sideways',
          [LEGACY_KEYS.cardsFirstSide]: 'back',
        }),
      ),
    ).toEqual({});
    expect(legacyPrefs(from({ [LEGACY_KEYS.overlaySet]: '2.5' }))).toEqual({});
  });

  it('takes the special-keys switch from its 0.1.6 name when the newer one is missing', () => {
    expect(legacyPrefs(from({ [LEGACY_KEYS.specialKeysOld]: 'off' }))).toEqual({ specialKeys: false });
    expect(
      legacyPrefs(from({ [LEGACY_KEYS.specialKeys]: 'on', [LEGACY_KEYS.specialKeysOld]: 'off' })),
    ).toEqual({ specialKeys: true });
  });
});

describe('the set the overlay studies', () => {
  const sets = [{ id: 5 }, { id: 3 }];
  it('is the one picked while it exists, else the first', () => {
    expect(studySetFrom(3, sets)).toBe(3);
    expect(studySetFrom(9, sets)).toBe(5);
    expect(studySetFrom(null, sets)).toBe(5);
    expect(studySetFrom(null, [])).toBeNull();
  });
});
