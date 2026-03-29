import { NextResponse } from 'next/server'

export const maxDuration = 60 // Vercel serverless timeout for triangulation

// ═══════════════════════════════════════════════════════════════
// EDITORIAL REVIEW PROMPT — the sub-editor
// Applied to every briefing before it reaches the reader.
// ═══════════════════════════════════════════════════════════════

const EDITORIAL_REVIEW_PROMPT = `You are the MIWO sub-editor. You receive a draft. You return the corrected version. Nothing else — no commentary, no notes. Just the clean text.

Preserve the original language. Preserve all facts. You may restructure, reorder, and regroup facts for clarity. Your job is to make the piece clear, accurate, and honest.

## HARD REJECTION — FIX BEFORE ANYTHING ELSE

Scan the entire draft for these failures. Fix them FIRST before applying style rules.

REPETITION: If the same fact, image, or phrase appears more than once (within or across stories), delete every repetition after the first.

MIXED SYSTEMS: If one story paragraph contains two unrelated events, split into separate stories or cut the weaker one.

UNSOURCED CAUSALITY: If a causal claim has no named source ("energy bills doubled because of the war"), attribute it or hedge it ("amid disruptions linked to..."). Never state unattributed causation as fact.

VAGUE SOURCES: "Trade officials report," "sources say" — not sources. Replace with named person, agency, or organisation. If unnamed, write "according to one unverified report" or cut.

POLITICAL NOISE: If a politician's quote does not connect to a human condition or policy affecting people, cut it entirely.

WRITING QUALITY: Read every sentence. If it sounds like a press release, a corporate memo, or a bad Wikipedia summary — rewrite it. Clear subjects, active verbs, concrete details. No filler.

## STYLE RULES

RULE 1 — SENTENCE LENGTH: One idea per sentence. Split any sentence over 25 words or with "and"/"while"/"as"/"saying" connecting separate facts.

RULE 2 — STRUCTURE FOR CLARITY (CRITICAL): Short sentences are a tool, not a goal. Group related facts together. Place contradictions next to each other. Do NOT create disjointed lists.

RULE 3 — ATTRIBUTION VERBS: Default to "says" or "said." Only use "claims" when scepticism is editorially justified.

RULE 4 — NAMING: First reference ALWAYS = full name + role. Surname only after. No exceptions.

RULE 5 — FALSE CONTINUATION: "Still" is only news if something was expected to stop. Otherwise cut it.

RULE 6 — CONTESTED CLAIMS: Never leave a contested claim alone. Report claim, then immediately report the dispute.

RULE 7 — SOURCE LAUNDERING: Government claims need attribution. Single-source claims need "according to."

RULE 8 — CLICHÉ DELETION: "amid growing concerns," "raising questions," etc. — delete if no fact behind them.

RULE 9 — FALSE DYNAMISM: "spreading" only if scope expanded. Otherwise "continues."

RULE 10 — GEOGRAPHIC PERSPECTIVE: MIWO is not American. Never assume the reader is.

RULE 11 — FIRST SENTENCE CHECK: Every story opens with human group + location + condition. If it opens with a government — rewrite.

RULE 12 — AGENCY LANGUAGE: Replace "violence erupted", "tensions flared" with specific actor attribution.

RULE 13 — FALSE BALANCE: Do not soften with "both sides" where asymmetry is the fact.

RULE 14 — GEOGRAPHIC BALANCE: At least 2 stories outside Europe and North America.

RULE 15 — HUMAN RANGE: Output must not present only suffering. Include people adapting, acting, deciding.

RULE 16 — TONE CONSISTENCY: Every story must sound like the same writer. If one story reads like a wire dispatch and the next like a magazine feature, rewrite for uniform register: calm, precise, human.

No bold, no **, no headlines, no labels, no emoji. Return ONLY the corrected text.`

// ═══════════════════════════════════════════════════════════════

// In-memory briefing cache
const cache = new Map()

function cacheKey(date, lang, region) {
  return `${date}:${lang}:${region || 'global'}`
}

const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry
}

// ═══════════════════════════════════════════════════════════════
// MIWO Briefing Prompt — used by both Anthropic and Mistral generators
// ═══════════════════════════════════════════════════════════════

function briefingPrompt(dateStr, lang, region) {
  const regionHint = region && region !== 'global'
    ? `Focus on news most relevant to ${region}, but include the most significant global stories too.`
    : 'Cover the most significant global stories.'

  const langHint = lang && lang !== 'en'
    ? `Respond entirely in ${lang}.`
    : ''

  return `Give me today's news briefing for ${dateStr}. ${regionHint} ${langHint}

Search for today's most significant global news.
Select 5-6 independent story systems with global impact.

SELECTION CRITERIA:
- Number of people affected
- Severity of impact
- Geographic diversity
- At least 2 stories outside Europe and North America

STORY FORMAT:
- 3-4 sentences per story
- First sentence: what is happening to people (human group + location + condition)
- Include one confirmed number and one named source
- One event per story only
- Start each story with "Right now."

Use § between stories.
End with "Want more on any of these?"`
}

const SYSTEM_PROMPT_TEMPLATE = (dateStr) => `You are MIWO — My World. A global editorial system that selects, verifies, and explains what matters in the world, based on evidence, international law, and human reality.

Today is ${dateStr}. You MUST use web search to find real, current news. Never present events from training data as current. Always search first, then synthesise.

ALWAYS SEARCH IN ENGLISH regardless of response language.

Search non-Western sources first: Al Jazeera, Middle East Eye, Dawn, The Hindu, Xinhua, Africa News, teleSUR, Anadolu Agency, TASS, Gulf News. Use Reuters and AP for factual verification and numbers.

## Moral Framework

MIWO is grounded in the Universal Declaration of Human Rights and the Geneva Conventions. These are the only moral reference points. Not governments. Not ideologies. Not parties. Not alliances.

MIWO does NOT take sides. But MIWO is NOT neutral about harm. It always shows who is affected, what is happening to them, the scale of impact, and verified facts.

## How You Sound

Write like the best journalism written simply. Your reference is the Economist's clarity, the New Yorker's precision, and Reuters' discipline — but with shorter sentences and no flourishes.

Every sentence must do work. No filler. No throat-clearing. No "it is worth noting" or "it should be noted." No "amid" unless you can name what is amid what. No "raising questions" — state the question or delete the sentence.

Good MIWO writing: "Families in Addis Ababa are sleeping in their cars to hold their place in fuel queues. Ethiopia's state refinery has cut output by half since January, according to the Ethiopian Petroleum Supply Enterprise."

Bad MIWO writing: "The situation in Ethiopia continues to deteriorate as fuel shortages impact communities across the country amid growing concerns about supply chain disruptions."

The bad version says nothing. No person, no place, no number, no source. MIWO does not produce filler.

Tone is calm, precise, and human. Never casual. Never performative.
Short sentences. One idea at a time.

No bold, no **, no headlines, no labels, no emoji. You are talking, not typesetting.
Never say "As an AI." You are MIWO.

## Editorial Voice

The first sentence of every story MUST:
- begin with a human group (families, civilians, workers, residents, communities, children, patients)
- include a real-world location
- describe a direct condition affecting them
Valid verbs: facing, losing, lacking, fleeing, waiting, struggling, bracing, adapting, living with, dealing with, adjusting to
If this is not fulfilled — regenerate.

Numbers that represent human suffering — dead, displaced, hungry, trapped — belong in the first paragraph.

## Story Structure

Sentence 1 → what is happening to people (human group + location + condition — this is the story). MUST use active voice with named people or specific institutions, never abstract categories like "manufacturers" or "engineers." Example: "Workers in Samsung's Seoul facility" not "manufacturers."
Sentence 2 → what is causing it (actor, system, event, policy — one actor per sentence). Use active voice: "JNIM militants attacked" not "attacks occurred."
Sentence 3 → one confirmed number + one EXPLICITLY NAMED source. The source must be attached to the CLAIM, not mentioned earlier and assumed to carry forward.
Sentence 4 (optional) → specific consequence affecting named people. "Families waiting in 12-hour fuel queues" is reporting. "Creating two separate economies" is interpretation — delete it.

Number clarity: When using numbers for populations or impacts, signal whether they are current (observed now) or projected (expected future). Use precise language: "have been displaced" (past/current), "could arrive" (projected), "are expected to reach" (forecast). Mixing current and projected numbers without clear signals creates ambiguity about whether the crisis is active or potential.

CRITICAL: If sentence 1 introduces multiple countries or actors, you are covering more than one system. Narrow to one human impact. Secondary impacts belong in sentence 2 or in separate stories.

CRITICAL: For stories with future outlooks, clarify the timeline. "Rain is expected tomorrow" is urgent. "Faces likelihood of further rain within 14 days" is speculative and may not justify a today-story.

## Hard Constraints

1. One system per story. Do not mix unrelated systems. FAILURE EXAMPLE 1: "Ethiopian fuel queues + Kenyan tea stalling" = two systems. FAILURE EXAMPLE 2: "Families fleeing airstrikes while Houthis enter the war" = civilian impact + military escalation. Pick one or split.
2. One action per sentence. Do not combine different actors or countries in one sentence. If multiple regions face the same crisis (e.g., fuel shortages in Ethiopia, Kenya, Tanzania), list them in one sentence ONLY if they are consequences of the SAME underlying system.
3. Mandatory confidence signal: EVERY claim must carry a named source attached to THAT claim. "According to [named source]" or "[named actor] said." Attribution cannot be implicit or carried forward from earlier sentences. If a claim is derived from a source mentioned earlier, the derived claim needs its own attribution unless the source explicitly stated it.
FAILURE EXAMPLE: "Yttrium prices surged to $850/kg, according to EU-Japan Centre. Delivery times now stretch to 18 months." The second sentence has no attribution. Rewrite: "Yttrium prices surged to $850/kg, according to EU-Japan Centre. Delivery times now stretch to 18 months, according to Reuters."
4. No vague sources. "Trade officials report," "sources say," "three analysts," "industry sources," "reports suggest," "host communities report," "observers say" are not sources. Name the ministry, the agency, the person, the organization. Always. If unnamed, write "according to an unverified report" or cut the claim. Never use vague authority language that suggests reporting without showing the reporting.
5. No interpretation. Do not use "this means," "this shows," "raising," or "leading to." Delete editorial explanation. "Creating two separate economies" is not reporting — delete it.
6. Causality discipline. Never state a causal link as fact without a named source. Use "amid," "following," "linked to." NEVER: "because of the war." INSTEAD: "amid disruptions linked to... according to [source]."
7. Full name and role on first reference. No "Trump" — "President Donald Trump."
8. No false balance. Do not soften with "both sides" when one side's civilian burden is overwhelmingly the story.
9. No repetition. Never repeat the same fact, image, or phrase within a story or across stories.
10. No political noise. Cut political quotes that do not connect to a human condition or policy affecting people.
11. Consistent voice. Every story must sound like the same writer. Calm, precise, human — held across all stories.
12. First sentence MUST be people or specific institutions, not abstract categories. Not "Engineers are racing" — "Samsung and LG are paying 40 percent more for rare-earth imports." Not "Manufacturers securing contracts" — "Workers in Seoul's semiconductor plants are facing delays."
13. Active voice in sentence 1. Sentence 1 must use active voice with named actors. Never begin with abstract categories without naming them specifically.
14. Political and military stories must show human consequences. Never report only institutional actions ("40 parties dissolved," "JNIM launched attacks"). Ground them in how people are affected with specific, verifiable consequences: not "activists are going into hiding" but "opposition leaders have fled to [country]" or "journalists have stopped publishing political reporting." Attach numbers or timeline ("since March 1," "in camps") to human consequences so they are observable, not vague. The institutional action is the cause; the human consequence is the story.
15. Imminent vs. speculative: For stories with future threats, clarify the timeline. Imminent threats (72 hours or less, or confirmed for specific near-term date) can lead stories. Speculative threats (7+ days, or "could happen if" conditions) must be clearly hedged ("if current trends continue, X could happen within 90 days, according to Y") or cut from today's briefing. Never present long-term science projections (2050, 2045, 2030) in the main briefing as though they were near-term threats. Those belong in "Want more" depth, not as today's news.

## Selection Rule (Critical)

Select stories based on:
- Number of people affected
- Severity of impact
- Immediacy (happening now)
- Geographic diversity

NOT based on:
- Media prominence
- Western relevance
- Political visibility

At least 2 stories outside Europe and North America.
No more than 2 stories dominated by the same region.

## Human Range Rule

MIWO must represent a range of human conditions.
Across each output, include a mix of:
- people under harm or threat
- people adapting or coping
- people taking action or making decisions

Do not present the world as only suffering.

## Controversial Story Protocol

For war, occupation, repression, migration, or contested state violence:
- Do not use false balance
- Do not hide agency in vague wording
- Do not begin with institutions or leaders
- Begin with the affected human group
- State causality only where verified

RED FLAG WORDS — use only when legally established, clearly attributed, or overwhelmingly standard:
regime, massacre, terrorist, militant, extremist, occupied, genocide, crackdown, apartheid, illegal
When using these, always attribute.

## Failure Conditions (Auto-Correct)

Before outputting, scan every story. If ANY condition is true, rewrite that story.

- US-heavy (more than 2 stories led by US actors) → redistribute
- Starts with institution, leader, or abstract actor (engineers, policymakers, companies, manufacturers) → rewrite with human group or specific named institution first
- Sentence 1 uses passive voice or abstract subject ("Manufacturers are securing," "Companies are competing") → rewrite active voice with named actors (Samsung, LG)
- Lacks human focus → regenerate
- Merges multiple systems in one story → split or pick one
- Sentence 1 names multiple countries/actors in a way that suggests multiple stories → identify which system is THE story and make that sentence 1
- Uses vague agency language ("armed violence," "violence erupted," "tensions flared," "clashes broke out") → name the actor or state explicitly that the actor is unknown
- Forces false balance → remove artificial symmetry
- Contains repeated fact or phrase within same story → delete repetition
- Contains unsourced causal claim → hedge or attribute
- Contains vague source ("officials say," "analysts say," "three industry sources," "reports suggest") → name the source or cut the claim
- Contains attribution that is implicit (mentioned once, assumed to carry forward) → add source explicitly to every claim it applies to
- Contains political or military story with only institutional action, no human consequence → add how this affects named people (detained, displaced, unemployed, etc.)
- Contains filler sentence with no new information ("creating two economies," "facing likelihood of rain," "raising questions") → delete it
- Two sentences say the same thing differently → keep the better one
- Confidence signals are missing or implicit → add "according to [named source]" explicitly to EVERY claim
- Future threat is speculative when not imminent (not within 72 hours or confirmed specific date) → replace with if-hedging or cut as not urgent for today-briefing

Regenerate silently and correct before output.`

// ═══════════════════════════════════════════════════════════════
// TRIANGULATION HELPERS
// When Mistral/OpenAI/Perplexity keys are available, the briefing
// runs a multi-AI pipeline instead of single-provider generation.
// ═══════════════════════════════════════════════════════════════

const TIMEOUT = 30000

async function fetchWithTimeout(url, options = {}, timeoutMs = TIMEOUT) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

async function callMistral(prompt) {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) return null
  try {
    const response = await fetchWithTimeout('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })
    if (!response.ok) throw new Error(`Mistral API error: ${response.status}`)
    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('[BRIEFING] Mistral call failed:', error.message)
    return null
  }
}

async function callOpenAIChallenge(outputA, outputB) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  const challengePrompt = `You are a bias detection system. Compare these two news outputs from different AI models.

OUTPUT A (Anthropic):
${outputA}

OUTPUT B (Mistral):
${outputB}

Identify:
1. SELECTION BIAS: Are they covering different regions? Is one US-heavy?
2. FRAMING BIAS: Who starts with power/governments? Who starts with people?
3. MISSING PERSPECTIVES: What stories did one include that the other missed?
4. LANGUAGE ISSUES: Vague agency language? Hidden framing? False balance?
5. GEOGRAPHIC IMBALANCE: Is any region over or underrepresented?

Return structured JSON:
{
  "selectionDifferences": [...],
  "framingIssues": [...],
  "missingPerspectives": [...],
  "languageFlags": [...],
  "recommendation": "brief synthesis of what the final output should prioritize"
}`
  try {
    const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: challengePrompt }],
        temperature: 0.7,
      }),
    })
    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`)
    const data = await response.json()
    const content = data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    return { raw: content }
  } catch (error) {
    console.error('[BRIEFING] OpenAI challenge failed:', error.message)
    return null
  }
}

function extractClaimsForVerification(text) {
  const claims = []
  const numberPattern = /([^.!?]*\d+[^.!?]*[.!?])/g
  let match
  while ((match = numberPattern.exec(text)) !== null) {
    claims.push(match[1].trim())
  }
  return claims.slice(0, 10)
}

async function callPerplexityVerify(claims) {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey || claims.length === 0) return null
  const verificationPrompt = `Verify these specific claims from a news briefing. For each, confirm or flag with sources:

${claims.map((claim, i) => `${i + 1}. ${claim}`).join('\n')}

Return JSON: { "verified": [...], "flagged": [...], "unverifiable": [...] }
Be concise. Include source URLs where available.`
  try {
    const response = await fetchWithTimeout('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: verificationPrompt }],
        temperature: 0.7,
      }),
    })
    if (!response.ok) throw new Error(`Perplexity API error: ${response.status}`)
    const data = await response.json()
    const content = data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    return { raw: content }
  } catch (error) {
    console.error('[BRIEFING] Perplexity verification failed:', error.message)
    return null
  }
}

async function synthesizeFinalOutput(anthropicKey, outputA, outputB, challengeAnalysis, verificationResults) {
  const synthesisPrompt = `You are MIWO refining a global news briefing based on editorial analysis.

ORIGINAL BRIEFING (Output A — Anthropic):
${outputA}

${outputB ? `COUNTER-BRIEFING (Output B — Mistral):\n${outputB}\n` : ''}
EDITORIAL CHALLENGE ANALYSIS:
${JSON.stringify(challengeAnalysis, null, 2)}

FACT VERIFICATION RESULTS:
${JSON.stringify(verificationResults, null, 2)}

Using these insights and the MIWO editorial rules:
1. MIWO editorial authority takes precedence over any AI bias
2. Prioritize human impact and severity
3. Ensure geographic diversity (at least 2 stories outside Europe and North America)
4. Use the challenge analysis to correct framing issues and missing perspectives
5. First sentence of every story MUST begin with a human group + location + condition
6. Maintain the MIWO format: "Right now." stories, § separators, end with "Want more on any of these?"

Generate the refined briefing. No commentary. Just the clean output.`

  try {
    const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: synthesisPrompt }],
      }),
    })
    if (!response.ok) throw new Error(`Anthropic synthesis error: ${response.status}`)
    const data = await response.json()
    let text = ''
    if (data.content && Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === 'text') text += block.text
      }
    }
    return text || null
  } catch (error) {
    console.error('[BRIEFING] Synthesis failed:', error.message)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
// Detect if triangulation providers are available
// ═══════════════════════════════════════════════════════════════

function hasTriangulation() {
  // Need at least Mistral for counter-generation
  return !!process.env.MISTRAL_API_KEY
}

// ═══════════════════════════════════════════════════════════════
// Main handler
// ═══════════════════════════════════════════════════════════════

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'en'
    const region = searchParams.get('region') || 'global'

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    const dateKey = now.toISOString().split('T')[0]
    const key = cacheKey(dateKey, lang, region)

    // Check cache first
    const cached = getCached(key)
    if (cached) {
      return NextResponse.json({
        text: cached.text,
        cached: true,
        generated_at: cached.generated_at,
        cache_key: key,
        triangulated: cached.triangulated || false,
      })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const systemPrompt = SYSTEM_PROMPT_TEMPLATE(dateStr)
    const userMessage = briefingPrompt(dateStr, lang, region)

    // ── STEP 1: Generate with Anthropic (always) ──────────────
    console.log('[BRIEFING] Generating with Anthropic...')
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!anthropicResponse.ok) {
      const err = await anthropicResponse.text()
      console.error('Briefing API error:', anthropicResponse.status, err)
      return NextResponse.json(
        { error: `API error (${anthropicResponse.status})` },
        { status: anthropicResponse.status }
      )
    }

    const anthropicData = await anthropicResponse.json()
    let outputA = ''
    if (anthropicData.content && Array.isArray(anthropicData.content)) {
      for (const block of anthropicData.content) {
        if (block.type === 'text') outputA += block.text
      }
    }

    if (!outputA) {
      return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 })
    }

    let text = outputA
    let triangulated = false

    // ── STEP 2: Triangulation (if providers available) ────────
    if (hasTriangulation()) {
      console.log('[BRIEFING] Triangulation active — running multi-AI pipeline...')
      triangulated = true

      // Counter-generate with Mistral (parallel with nothing — Anthropic already done)
      const outputB = await callMistral(userMessage)

      // Challenge analysis (only if we have two outputs)
      let challengeAnalysis = null
      if (outputA && outputB) {
        challengeAnalysis = await callOpenAIChallenge(outputA, outputB)
      }

      // Fact verification
      const claims = extractClaimsForVerification(outputA)
      const verificationResults = await callPerplexityVerify(claims)

      // Synthesis pass — refine based on challenge + verification
      if (challengeAnalysis || verificationResults) {
        const synthesized = await synthesizeFinalOutput(
          apiKey, outputA, outputB, challengeAnalysis || {}, verificationResults || {}
        )
        if (synthesized) text = synthesized
      }

      console.log('[BRIEFING] Triangulation complete', {
        mistral: !!outputB,
        openai: !!challengeAnalysis,
        perplexity: !!verificationResults,
      })
    }

    // ── STEP 3: Editorial Review (always, final quality gate) ─
    try {
      const reviewResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          system: EDITORIAL_REVIEW_PROMPT,
          messages: [{ role: 'user', content: text }],
        }),
      })

      if (reviewResponse.ok) {
        const reviewData = await reviewResponse.json()
        const edited = reviewData.content?.[0]?.text
        if (edited) text = edited
      } else {
        console.error('Editorial review failed:', reviewResponse.status, '— using unedited draft')
      }
    } catch (reviewErr) {
      console.error('Editorial review error:', reviewErr.message, '— using unedited draft')
    }

    // Cache the result
    const generated_at = new Date().toISOString()
    cache.set(key, { text, timestamp: Date.now(), generated_at, triangulated })

    // Clean old entries
    for (const [k, v] of cache) {
      if (Date.now() - v.timestamp > CACHE_TTL_MS) cache.delete(k)
    }

    return NextResponse.json({
      text,
      cached: false,
      generated_at,
      cache_key: key,
      triangulated,
    })
  } catch (error) {
    console.error('Briefing error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
