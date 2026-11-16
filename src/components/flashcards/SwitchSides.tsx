import { useEffect } from 'react';

import type { AnswerWith } from '@/lib/flashcards/write';
import { keepFocus } from './SpecialKeys';

const NAME: Record<AnswerWith, string> = { term: 'term', definition: 'definition' };

/**
 * "⇄ answer with definition": switches the side mid-round, also with Ctrl+S
 * (⌘S), so the overlay can do it without the mouse. Like the reset next to
 * it, it stays out of the Tab round and never takes the focus, so the answer
 * box keeps the caret.
 */
export function SwitchSides({
  answerWith,
  enabled,
  onSwitch,
}: {
  answerWith: AnswerWith;
  /** Only while a card is being asked. */
  enabled: boolean;
  onSwitch: () => void;
}) {
  useSwitchKey(enabled, onSwitch);
  const other = answerWith === 'term' ? 'definition' : 'term';
  return (
    <button
      type="button"
      tabIndex={-1}
      className="rt-linkbtn fc-writebar__stat"
      title={`Answer with the ${NAME[other]} instead, from this card on (Ctrl+S)`}
      disabled={!enabled}
      onMouseDown={keepFocus}
      onClick={onSwitch}
    >
      ⇄ answer with {NAME[other]}
    </button>
  );
}

/** Ctrl+S / ⌘S switches sides. Always taken, so WebView2 never opens "save page". */
export function useSwitchKey(enabled: boolean, onSwitch: () => void) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 's') return;
      e.preventDefault();
      if (enabled && !e.repeat) onSwitch();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onSwitch]);
}
