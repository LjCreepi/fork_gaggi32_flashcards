import type { AnswerWith } from '@/lib/flashcards/write';
import { keepFocus } from './SpecialKeys';

const NAME: Record<AnswerWith, string> = { term: 'term', definition: 'definition' };

/**
 * "⇄ answer with definition": switches the side mid-round. Like the reset
 * next to it, it stays out of the Tab round and never takes the focus, so the
 * answer box keeps the caret.
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
  const other = answerWith === 'term' ? 'definition' : 'term';
  return (
    <button
      type="button"
      tabIndex={-1}
      className="rt-linkbtn fc-writebar__stat"
      title={`Answer with the ${NAME[other]} instead, from this card on`}
      disabled={!enabled}
      onMouseDown={keepFocus}
      onClick={onSwitch}
    >
      ⇄ answer with {NAME[other]}
    </button>
  );
}
