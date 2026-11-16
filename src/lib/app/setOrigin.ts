// Where a set's back link leads: the page you were on before you went into
// the set, not always the sets list.
//
// The set page, its three study modes and its editor are one place: moving
// between them ("Back to set" from Write, then back again) never changes where
// the set's back link goes. Entering that place from anywhere else (a folder
// of the sets list, Settings, another set, the overlay) records the page you
// came from, so back returns there, folder and all. With nothing recorded —
// the window opened straight on the set — it falls back to the sets list.

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

const IN_SET = /^\/flashcards\/(\d+)(?:\/(?:cards|write|learn|edit))?$/;

/** The set a path belongs to, or null for a page outside every set. */
export function setOf(path: string): number | null {
  const m = IN_SET.exec(path.split(/[?#]/)[0]);
  return m ? Number(m[1]) : null;
}

/**
 * What going from `prev` to `here` records, if anything: the set entered and
 * the page to come back to. A new set's editor is not a page to come back to
 * (it would start another new set), so it stands for the sets list it was
 * opened from, in its folder.
 */
export function originOf(prev: string | null, here: string): { setId: number; back: string } | null {
  const setId = setOf(here);
  if (setId === null || prev === null || setOf(prev) === setId) return null;
  const [path, query = ''] = prev.split('?');
  if (path === '/flashcards/new') {
    const folder = new URLSearchParams(query).get('folder');
    return { setId, back: folder ? `/flashcards?${new URLSearchParams({ folder })}` : '/flashcards' };
  }
  return { setId, back: prev };
}

/** How the back link names the page it goes to. */
export function backLabel(back: string): string {
  const [path, query = ''] = back.split('?');
  if (path === '/flashcards') return new URLSearchParams(query).get('folder') ?? 'All sets';
  if (path === '/settings') return 'Settings';
  return 'Back';
}

const origins = new Map<number, string>();

/** Mounted once inside the router: notes where each set was entered from. */
export function useSetOrigins(): void {
  const { pathname, search } = useLocation();
  const prev = useRef<string | null>(null);
  useEffect(() => {
    const here = pathname + search;
    const entered = originOf(prev.current, here);
    if (entered) origins.set(entered.setId, entered.back);
    prev.current = here;
  }, [pathname, search]);
}

/** The set page's back link: where it goes and what it says. */
export function backFromSet(setId: number): { href: string; label: string } {
  const href = origins.get(setId) ?? '/flashcards';
  return { href, label: backLabel(href) };
}
