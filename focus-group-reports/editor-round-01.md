# Editor Round 1 — March 29, 2026

## TEST BRIEFING (simulating current pipeline output)

Right now.

Civilians across the Middle East are bracing for a second month of airstrikes as the war between Iran, Israel, and the United States enters its 29th day.
At least 1,900 people have been killed in Israeli and American strikes on Iran since February 28, according to Al Jazeera.
In Lebanon, more than one million people have been displaced, according to the International Organization for Migration.
Iran's supreme leader Mojtaba Khamenei issued his first public statement since taking office, calling on Iranian forces to maintain the blockade of the Strait of Hormuz.

§

Families across western Cuba are living without electricity after the national power grid collapsed for the third time this month.
The latest blackout, caused by a failure at the Nuevitas thermoelectric plant in Camagüey province, left millions in Havana and surrounding areas in darkness.
Cuba's energy crisis has deepened since the United States tightened oil sanctions, cutting off the island's access to Venezuelan crude, according to NPR.
Hospitals are running on backup generators, and residents report food spoiling in refrigerators as temperatures rise, according to Al Jazeera.

§

Between six thousand and eight thousand tonnes of Kenyan tea worth approximately twenty-four million dollars sit stuck at the Port of Mombasa, unable to ship to international buyers.
The backlog is a direct consequence of Red Sea shipping lane closures linked to the Middle East conflict, according to the Port Authority of Mombasa.
Tea exporters say the delay is costing the industry roughly eight hundred thousand dollars per day in lost revenue, according to interviews with export companies in Mombasa.
Without a clear timeline for reopening shipping lanes, Kenya's tea sector — the country's largest foreign exchange earner — faces cascading losses that could trigger job cuts across rural growing regions.

§

Children in Indonesia woke up on Saturday to find their TikTok, Instagram, and YouTube accounts blocked after the government enforced a social media ban for users under 16.
Communication Minister Meutya Hafid signed the regulation making Indonesia the first country in Southeast Asia to restrict minors' access to high-risk digital platforms, according to Bloomberg.
Approximately 70 million Indonesians are under the age of 16, according to Indonesia's national statistics agency.
Parents and educators are divided, with some welcoming the protection and others warning that enforcement will be difficult in a country where children often use family devices, according to The Diplomat.

§

Lufthansa pilots began a 48-hour strike on Sunday, grounding all flights departing German airports.
The Vereinigung Cockpit union says pilots are striking over unresolved pension disputes, according to Reuters.
Lufthansa estimates the strike will affect approximately 100,000 passengers per day and cost the airline roughly 30 million euros daily.
Travellers across Europe are scrambling to rebook as the strike disrupts connections through Frankfurt and Munich, two of Europe's busiest transit hubs.

§

Want more on any of these?

---

## EDITOR CRITIQUE

### Overall Assessment

This is **significantly better** than what the system was producing three rounds of hardening ago. The rules are landing. But there are still problems, and I want them fixed before I call this ready.

### What's Working

1. **Human-first openings**: Every story opens with people, not institutions. Cuba: "Families across western Cuba." Kenya: the tea is stuck but framed through consequences. Indonesia: "Children in Indonesia woke up." This is MIWO.

2. **Source discipline**: Every claim has a named source. No "officials say." No "analysts suggest." This is a massive improvement from earlier output.

3. **Briefing architecture**: The thread is visible. Story 1 sets the war. Story 3 (Kenya) explicitly says "direct consequence of Red Sea shipping lane closures linked to the Middle East conflict." The reader sees the shape.

4. **Geographic range**: Middle East, Cuba, Kenya, Indonesia, Germany. Five regions. No US-dominance.

5. **Layer 4 present**: Every story has a consequence sentence. Cuba: hospitals on generators. Kenya: job cuts. Indonesia: enforcement debate. Lufthansa: travellers scrambling.

### What's Failing

**FAILURE 1: The lead is TOO DENSE.**

The lead tries to cover: airstrikes (1,900 dead), Lebanon displacement (1 million), AND Iran's supreme leader statement. That's three distinct developments crammed into one story block. The rule says the lead CAN cover the dominant crisis with multiple actors, but must be "written from ONE human vantage point." This lead jumps between Iran casualties, Lebanon displacement, and a leadership statement — three different vantage points in three different countries.

**FIX**: The lead should pick ONE human vantage point. Either: civilians in Iran dealing with continued strikes, OR displaced families in Lebanon. The other developments can be woven in as context, not as co-equal leads.

**FAILURE 2: "cascading losses that could trigger job cuts" is INTERPRETATION.**

Story 3 (Kenya) ends with "faces cascading losses that could trigger job cuts across rural growing regions." This is editorial prediction. The word "cascading" is literary flourish. "Could trigger" is speculation without attribution. Who says job cuts are coming? A named source needs to say this, or it needs to be cut.

**FIX**: Either attribute ("Tea exporters warn of layoffs in growing regions, according to the Kenya Tea Development Agency") or cut the speculation and replace with an observable fact.

**FAILURE 3: "scrambling to rebook" is LOADED LANGUAGE.**

Story 5 (Lufthansa) uses "scrambling." This isn't on the banned list, but it's the same category — emotional verb that implies chaos without sourcing it. Are they scrambling? Says who? This is the kind of colour that creeps in when the writer feels the story needs energy.

**FIX**: Add "scrambling" to the loaded-language watchlist OR replace with neutral: "Travellers across Europe are rebooking flights as the strike disrupts connections."

**FAILURE 4: Story 4 (Indonesia) is NOT a crisis story. Is it MIWO?**

Indonesia's social media ban affects 70 million children. That's the scale test. But is this a HARM story? Children are not suffering — a regulation was enacted. The story passes the selection filter technically (affects millions, cross-border precedent), but it reads like a policy feature, not reporting. The consequence sentence ("parents and educators are divided") is weak — it's a survey of opinion, not a condition.

**FIX**: Either find the HUMAN HARM angle (children who rely on social media for education or income now cut off, street vendors who sell data plans losing customers) or strengthen the consequence with a specific observable fact. "Parents and educators are divided" is wire-service filler.

**FAILURE 5: Lead sentence 1 uses "bracing for" — which is SPECULATIVE.**

"Civilians across the Middle East are bracing for a second month of airstrikes." Are they bracing? Who reported this? "Bracing" implies anticipation, not a current condition. The rule says sentence 1 must describe "a direct condition affecting them." Bracing is not a condition — it's an emotional state projected onto millions.

**FIX**: Replace with an observable condition: "Civilians across the Middle East are entering a second month under airstrikes" or "Civilians in Tehran are sheltering through a second month of airstrikes, according to [source]."

**FAILURE 6: "Cascading" — rejected vocabulary.**

Not on the banned list but should be. "Cascading losses" is the kind of journalistic cliché that sounds dramatic without saying anything. Add to editorial review watchlist.

### Structural Notes

The § separator structure is correct. The "Want more?" ending is correct. The layer structure (L1→L2→L3→L4) is consistently applied across all five stories. The visual structure (one sentence per development) is mostly there but the lead crams too much.

### VERDICT: 7/10

The system is doing what it was told. Source discipline is good. Architecture is visible. But the lead is overloaded, speculative language is creeping in ("bracing," "scrambling," "cascading"), and one story (Indonesia) lacks the human-harm depth that MIWO promises.

### SPECIFIC CODE/PROMPT FIXES NEEDED

1. **SYSTEM_PROMPT — Lead guidance**: Add: "The lead picks ONE human vantage point. Even when covering a multi-actor crisis, the first sentence describes what is happening to ONE specific group in ONE specific place. Other actors appear as context in sentences 2-4."

2. **EDITORIAL_REVIEW — Speculative verbs**: Add a scan for speculative-state verbs used without attribution: "bracing," "scrambling," "reeling," "grappling," "gearing up." These project emotional states onto populations. Either source them or replace with observable verbs.

3. **REJECTION GATE — Add "cascading" and "scrambling" to loaded language list**: These are editorial-colour words that add drama without information.

4. **SYSTEM_PROMPT — Policy stories**: Add guidance: "Policy or regulatory stories qualify for MIWO only if you can show the human consequence as an observable condition, not an opinion survey. 'Parents are divided' is not a consequence. 'Street vendors in Jakarta report losing 40% of their data-plan sales' is a consequence."

5. **EDITORIAL_REVIEW — Lead density check**: Add: "If the lead story mentions more than TWO countries by name, check whether it maintains a single human vantage point. If it jumps between vantage points in different countries, rewrite to anchor in one."
