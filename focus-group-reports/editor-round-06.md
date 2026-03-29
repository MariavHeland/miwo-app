# Editor Round 6 — March 29, 2026 (GERMAN)

## KEY FINDINGS: German-specific failures

1. **Vague sources passing in German**: "Beobachter zufolge", "Experten sagen", "Digitalexperten warnen" — all vague, all passing current gate
2. **German loaded language NOT on banned list**: verschärfend/Verschärfung, entfesselt, erschüttern — emotionally charged verbs
3. **Subordinate clause attribution burial**: German Nebensätze push source far from claim, weakening accountability
4. **MIWO voice sounds bureaucratic in German**: Long compound sentences are natural in German but kill MIWO's staccato rhythm
5. **"Praktisch" as hedge**: Weakens factual claims without adding information

## FIXES NEEDED

- Add to rejection gate: "Experten sagen", "Beobachter zufolge", "Digitalexperten warnen", "laut Berichten"
- Add to loaded language list: verschärfend, entfesselt, erschüttern, entfachen
- Add to editorial review: German sentence shortening guidance — prefer "Subject + verb + fact" over Nebensatz constructions
- Add to system prompt: "In German, frontload the source: 'Iranische Behörden melden...' not 'Nach offiziellen iranischen Angaben sind...'"
