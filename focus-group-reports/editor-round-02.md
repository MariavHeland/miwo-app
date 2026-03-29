# Editor Round 2 — March 29, 2026

## TEST BRIEFING (post-Round-1 fixes)

Right now.

Families in Tehran are sheltering through a second month of airstrikes as the war between Iran, Israel, and the United States enters its 29th day.
At least 1,900 people have been killed in strikes on Iran since February 28, according to Al Jazeera.
In Lebanon, more than one million people have fled their homes since Israeli strikes intensified on March 2, according to the International Organization for Migration.
The UN Security Council held an emergency session on Friday, but produced no ceasefire resolution, according to UN News.

§

Families across western Cuba are living without electricity after the national power grid collapsed for the third time this month.
The latest failure at the Nuevitas thermoelectric plant in Camagüey province left millions in Havana and surrounding areas in darkness, according to NPR.
Cuba's fuel supply has dropped sharply since the United States seized Venezuelan oil tankers bound for the island in early March, according to Al Jazeera.
Hospitals in Havana are running on backup generators, and residents report food spoiling as temperatures reach 33 degrees, according to interviews with residents by NPR.

§

Between six thousand and eight thousand tonnes of Kenyan tea sit stuck at the Port of Mombasa, unable to reach international buyers.
The backlog is a direct consequence of Red Sea shipping lane closures linked to the Middle East conflict, according to the Port Authority of Mombasa.
Tea exporters say the delay is costing the industry roughly eight hundred thousand dollars per day, according to interviews with export companies in Mombasa.
Workers on tea estates in the Rift Valley are reporting reduced hours as warehouses fill and orders stop, according to the Kenya Tea Development Agency.

§

Seventy million children in Indonesia lost access to TikTok, Instagram, and YouTube on Saturday after the government enforced a social media ban for users under 16.
Communication Minister Meutya Hafid signed the regulation making Indonesia the first country in Southeast Asia to restrict minors' access to high-risk platforms, according to Bloomberg.
Teenagers in Jakarta and Surabaya are already borrowing parents' devices to access blocked accounts, according to The Jakarta Post.
Street vendors who sell prepaid data plans near schools report a drop in sales since the ban took effect, according to Reuters interviews in Jakarta.

§

Lufthansa pilots walked off the job on Sunday, grounding all flights departing German airports for 48 hours.
The Vereinigung Cockpit union says pilots are striking over unresolved pension disputes, according to Reuters.
Lufthansa estimates the strike will affect approximately 100,000 passengers per day and cost the airline roughly 30 million euros daily, according to company statements.
Travellers at Frankfurt and Munich airports are rebooking through other carriers or waiting in terminals, according to Deutsche Welle.

§

Want more on any of these?

---

## EDITOR CRITIQUE

### Overall Assessment

Marked improvement from Round 1. The fixes landed. Let me walk through what changed and what's still not right.

### What Improved

1. **Lead is anchored.** "Families in Tehran are sheltering" — one place, one group, one verb. The Lebanon displacement and UN session appear as context in sentences 3-4, not as co-equal leads. This is what the lead should be.

2. **No more speculative verbs.** "Bracing" → "sheltering." "Scrambling" → "rebooking... or waiting in terminals." These are observable.

3. **Indonesia has teeth now.** "Teenagers in Jakarta and Surabaya are already borrowing parents' devices" — that's observable. "Street vendors who sell prepaid data plans near schools report a drop in sales" — that's a real consequence. The story went from policy feature to reporting.

4. **Kenya consequence is specific.** "Workers on tea estates in the Rift Valley are reporting reduced hours" — better than "could trigger job cuts." Named region, named consequence, attributed.

5. **"Cascading" is gone.** Good.

### What's Still Failing

**FAILURE 1: Sentence 3 of the lead VIOLATES the re-attribution rule.**

"In Lebanon, more than one million people have fled their homes since Israeli strikes intensified on March 2, according to the International Organization for Migration."

This sentence does two things: (a) states a displacement number (sourced to IOM — fine), and (b) states that "Israeli strikes intensified on March 2" — this is a CAUSAL CLAIM embedded inside the sentence with no separate attribution. Who says strikes intensified? The IOM is cited for the displacement number, not for the characterization of Israeli strikes. This is the kind of subtle violation that passes because the attribution at the end of the sentence feels like it covers everything. It doesn't.

**FIX**: Split: "In Lebanon, more than one million people have fled their homes, according to the International Organization for Migration. Israeli strikes on Lebanon have intensified since March 2, according to Al Jazeera."

**FAILURE 2: Cuba story sentence 3 makes an implied causal claim.**

"Cuba's fuel supply has dropped sharply since the United States seized Venezuelan oil tankers bound for the island in early March, according to Al Jazeera."

The word "since" here creates a temporal-causal implication. The sentence says fuel supply dropped SINCE the seizure, implying the seizure caused the drop. If Al Jazeera reported that the seizure caused the fuel drop, fine. But if Al Jazeera only reported the seizure, and the fuel drop comes from a different source, then this sentence launders causality through temporal proximity.

This is a SUBTLE version of the "wegen des Krieges" problem. The rule says: "Never state a causal link as fact unless you have a named source confirming it."

**FIX**: The editorial review prompt needs a specific scan for "since [event]" constructions that imply causality. Add: "When 'since' is followed by a specific event (not a date), check whether the source cited confirms the causal link. 'Since March' is a time marker. 'Since the United States seized tankers' is a causal claim dressed as a time marker."

**FAILURE 3: The Lufthansa story is the weakest.**

It's competent but generic. Sentence 1: pilots struck. Sentence 2: why. Sentence 3: cost. Sentence 4: travellers rebooking. This reads like a wire service story. It passes every rule — and that's the problem. It passes because it's inoffensive, not because it's good.

The MIWO voice demands specificity. "Travellers at Frankfurt and Munich airports are rebooking through other carriers or waiting in terminals" — what does that look like? Are families sleeping in airports? Are business travellers driving to Amsterdam? The story has no IMAGE. It has no scene.

**FIX**: This is not a code fix. This is a prompt fix. Add to the writer prompt: "Every story must contain at least one SPECIFIC DETAIL that a camera could capture. If you cannot picture the scene, neither can the reader. 'Travellers are rebooking' is procedural. 'Families with suitcases are queuing at Eurowings counters at Frankfurt Terminal 1' is a scene."

**FAILURE 4: "Right now." opening is correct but the transition to story 1 is abrupt.**

"Right now." followed immediately by "Families in Tehran are sheltering..." The gold standard from editor-and-strategist.md had a one-line scene-setter after "Right now." before the first story. The current version jumps straight into the first story.

This is a STYLE preference, not a hard failure. But it matters for the reading experience. The "Right now." is a breath. The next sentence should feel like the camera landing on a scene. Currently it works because the sentence is specific. But if the lead were slightly more abstract, the abruptness would hurt.

**NOT A CODE FIX.** Just noting for voice calibration later.

### VERDICT: 8/10

The system is enforcing its rules. The fixes from Round 1 are working. The remaining issues are SUBTLE — embedded causal claims disguised by temporal language, wire-service competence without specificity, and re-attribution gaps in compound sentences. These are the mistakes a good junior editor makes, not a careless system.

### SPECIFIC CODE/PROMPT FIXES NEEDED

1. **EDITORIAL_REVIEW — "Since [event]" causal scan**: Add: "When 'since' is followed by a specific event or action (not just a date), check whether the attributed source confirms the causal link. 'Since March' is a time marker — allowed. 'Since the United States seized tankers' is a causal claim dressed as a time marker — requires its own attribution."

2. **SYSTEM_PROMPT — Camera test**: Add to Story Structure: "Every story must contain at least one SPECIFIC DETAIL that a camera could capture. If you cannot picture the scene, the reader cannot either. 'Travellers are rebooking' is procedural. 'Families with suitcases are queuing at rival airline counters' is a scene."

3. **EDITORIAL_REVIEW — Compound sentence attribution**: Add: "When a sentence contains TWO distinct claims joined by a dependent clause, check that the attribution covers BOTH claims. 'One million fled since strikes intensified, according to IOM' — does IOM say strikes intensified? If not, split the sentence and attribute each claim separately."
