import { memo, useMemo } from "react";
import Jabber from "jabber";

const jabber = new Jabber();

export const FakeWordList = memo(function FakeWordList({
  count,
  length,
  capitalize,
}: {
  count: number;
  length: [number, number];
  capitalize?: boolean;
}) {
  // Generate words once and memoize to avoid impure function calls during render
  const words = useMemo(() => {
    return [...Array(count)].map(() =>
      jabber.createWord(
        // eslint-disable-next-line react-hooks/purity
        length[0] + Math.floor(Math.random() * (length[1] - length[0])),
        capitalize
      )
    );
  }, [count, length, capitalize]);

  return (
    <>
      {words.map((word, i) => (
        <div key={i}>{word}</div>
      ))}
    </>
  );
});
