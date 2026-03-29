# Editor Round 8 — Edge Cases

## EDGE CASES TESTED

1. **All sources have incentives to distort** — Iran death toll (Al Jazeera tracker ≠ verified count). FIX: require confidence qualifier or source comparison.
2. **Consequence is weeks old** — Cuba 3-month embargo presented as current cause. FIX: temporal separation (old condition vs. today's trigger).
3. **Human group too vague** — "11 million without power" needs geographic boundary. FIX: reject mass impact claims without place specification.
4. **Attribution exists but source questionable** — "$800K/day" from "export companies" (which ones?). FIX: source-specificity rule for quantified losses.
5. **Implicit absence of attribution** — "Houthi forces fired missiles" with no source. FIX: regex gate can't catch ABSENCE of attribution (it catches WRONG attribution). Need editorial review to flag naked claims.

## WHAT THE GATE CATCHES vs MISSES

CATCHES: Vague sources ("officials say"), loaded language, structure violations, geographic absence
MISSES: Attribution absence (no source at all), passive voice hiding agency, vague temporal anchors, implicit editorializing through story order, numbers without precision tags (confirmed vs estimated)

## KEY INSIGHT: The rejection gate catches WRONG things. It doesn't catch MISSING things. Need a complementary check: "Does every factual claim have an 'according to'?"
