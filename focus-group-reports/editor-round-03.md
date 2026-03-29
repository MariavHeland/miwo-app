# Editor Round 3 — March 29, 2026

## KEY FINDINGS (7 new failure modes)

1. **Attribution bracketing errors** — sub-claims unattributed in compound sentences (semicolons mask gaps)
2. **False transparency verbs** — "documented" implies verification without stating basis
3. **Temporal float on quotes** — time-dependent claims reprinted without date anchor
4. **Orphaned numbers** — large population figures with no reference class
5. **Causal chain attribution drift** — actor reasoning ("due to security concerns") presented as objective fact
6. **Passive voice urgency** — "feared" / "expected" without attribution
7. **Tense depth ambiguity** — standing positions vs. fresh proposals conflated in present tense

## FIXES APPLIED

- Added attribution bracketing rule to SYSTEM_PROMPT
- Added false transparency verb guidance to EDITORIAL_REVIEW
- Added orphaned number rule (>1M requires reference class)
- Added confidence separation rule (different verification levels = separate sentences)
- Added temporal float check for quoted time-dependent claims
- Updated rejection gate with aggregator chain patterns

## VERDICT: Issues are now SUBTLE — compound attribution gaps, institutional voice verbs, quantitative orphaning. The easy failures are gone.
