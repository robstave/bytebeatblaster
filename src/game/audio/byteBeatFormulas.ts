/** A bytebeat expression used by enemies and audio synthesis. */
export type ByteBeatFormula = (t: number) => number;

/**
 * Extend this array to add more bytebeat sound/color patterns.
 */
export const byteBeatFormulas: readonly ByteBeatFormula[] = [
  (t: number): number =>
    (t >> (4 + Number(((-t >> 13) & 7) === 0)) + (2 * Number((t >> 17) === 0))) |
    (((t * t * (t >> (((t >> 12) ^ (t >> 11)) % 3 + 10))) /
      (7 + ((t >> 10) & (t >> 14) & 3))) *
      Number((t & 512) === 0) <<
      (3 + ((t >> 14) & 1))),
  (t: number): number =>
    ((t *
      ((t & 4096) !== 0
        ? t % 65536 < 59392
          ? 7
          : t >> 6
        : 16 + (1 & (t >> 14)))) >>
      (3 & (-t >> ((t & 2048) !== 0 ? 2 : 10)))) |
    (t >> ((t & 16384) !== 0 ? ((t & 4096) !== 0 ? 4 : 3) : 2))
];

/** Wraps a formula index to the available list. */
export function getByteBeatFormula(index: number): ByteBeatFormula {
  const wrapped = ((index % byteBeatFormulas.length) + byteBeatFormulas.length) % byteBeatFormulas.length;
  return byteBeatFormulas[wrapped];
}
