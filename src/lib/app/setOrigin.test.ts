import { describe, expect, it } from 'vitest';

import { backLabel, originOf, setOf } from './setOrigin';

describe('setOf', () => {
  it('knows the set page, its modes and its editor as one set', () => {
    expect(setOf('/flashcards/7')).toBe(7);
    expect(setOf('/flashcards/7/write')).toBe(7);
    expect(setOf('/flashcards/7/edit')).toBe(7);
    expect(setOf('/flashcards/7?x=1')).toBe(7);
    expect(setOf('/flashcards')).toBeNull();
    expect(setOf('/flashcards/new')).toBeNull();
    expect(setOf('/settings')).toBeNull();
  });
});

describe('originOf', () => {
  it('records the page a set was entered from, folder included', () => {
    expect(originOf('/flashcards?folder=Franz', '/flashcards/7')).toEqual({ setId: 7, back: '/flashcards?folder=Franz' });
    expect(originOf('/settings', '/flashcards/7')).toEqual({ setId: 7, back: '/settings' });
    expect(originOf('/flashcards/3/learn', '/flashcards/7')).toEqual({ setId: 7, back: '/flashcards/3/learn' });
  });

  it('leaves it alone while moving inside the set', () => {
    expect(originOf('/flashcards/7', '/flashcards/7/write')).toBeNull();
    expect(originOf('/flashcards/7/write', '/flashcards/7')).toBeNull();
    expect(originOf('/flashcards/7/edit', '/flashcards/7')).toBeNull();
  });

  it('records nothing on the first page, or outside a set', () => {
    expect(originOf(null, '/flashcards/7')).toBeNull();
    expect(originOf('/flashcards/7', '/flashcards')).toBeNull();
  });

  it('sends a new set back to the list it was started from, not to another new set', () => {
    expect(originOf('/flashcards/new', '/flashcards/9')).toEqual({ setId: 9, back: '/flashcards' });
    expect(originOf('/flashcards/new?folder=Franz&generate=1', '/flashcards/9')).toEqual({
      setId: 9,
      back: '/flashcards?folder=Franz',
    });
  });
});

describe('backLabel', () => {
  it('names where back goes', () => {
    expect(backLabel('/flashcards')).toBe('All sets');
    expect(backLabel('/flashcards?folder=Französisch')).toBe('Französisch');
    expect(backLabel('/settings')).toBe('Settings');
    expect(backLabel('/flashcards/3/learn')).toBe('Back');
  });
});
