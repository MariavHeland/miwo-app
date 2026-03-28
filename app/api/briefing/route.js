import { NextResponse } from 'next/server'

export const maxDuration = 60 // Vercel serverless timeout for triangulation

// ═══════════════════════════════════════════════════════════════
// EDITORIAL REVIEW PROMPT — the sub-editor
// Applied to every briefing before it reaches the reader.
// ═══════════════════════════════════════════════════════════════

const EDITORIAL_REVIEW_PROMPT = `You are the MIWO sub-editor. You receive a draft. You return the corrected version. Nothing else — no commentary, no notes. Just the clean text.

Preserve the original language. Preserve all facts. You may restructure, reorder, and regroup facts for clarity.

RULE 1 — SENTENCE LENGTH: One idea per sentence. Split any sentence over 25 words or with "and"/"while"/"as"/"saying" connecting separate facts.

RULE 2 — STRUCTURE FOR CLARITY (CRITICAL): Short sentences are a tool, not a goal. Group related facts together. Place contradictions next to each other. Do NOT create disjointed lists. The reader must see the picture, not a pile of fragments.

RULE 3 — ATTRIBUTION VERBS: "Claims" implies disbelief. Default to "says" or "said." Only use "claims" when scepticism is editorially justified.

RULE 4 — NAMING: First reference ALWAYS = full name + role. "President Donald Trump" not "Trump." Surname only after first reference. No exceptions.

RULE 5 — FALSE CONTINUATION: "Still" is only news if something was expected to stop. Otherwise cut it.

RULE 6 — CONTESTED CLAIMS: Never leave a contested claim alone. Report the claim, then immediately report the dispute. If unclear, say "It is unclear whether..." Distinguish between what is KNOWN, DISPUTED, and UNKNOWN.

RULE 7 — SOURCE LAUNDERING: Government claims need attribution. Single-source claims need "according to."

RULE 8 — CLICHÉ DELETION: "amid growing concerns," "raising questions," etc. — delete if no fact behind them.

RULE 9 — FALSE DYNAMISM: "spreading" only if scope expanded. Otherwise "continues."

RULE 10 — GEOGRAPHIC PERSPECTIVE: MIWO is not American. Never assume the reader is.

RULE 11 — FIRST SENTENCE CHECK: Every story must open with a human group + location + condition. If it opens with a government or institution — rewrite.

RULE 12 — AGENCY LANGUAGE: Replace "violence erupted", "tensions flared", "clashes broke out" with specific actor attribution.

RULE 13 — FALSE BALANCE: Do not soften with "both sides" where asymmetry is the fact.

RULE 14 — GEOGRAPHIC BALANCE: At least 2 stories must originate outside Europe and North America.

RULE 15 — HUMAN RANGE: Output must not present only suffering. Include people adapting, acting, deciding.

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

Write in clear, direct language designed for audio.
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

Sentence 1 → what is happening to people
Sentence 2 → what is causing it (actor, system, event, policy)
Sentence 3 → one confirmed number + one named source
Sentence 4 (optional) → immediate consequence or near-term outlook

## Hard Constraints

1. One system per story. Do not mix unrelated systems.
2. One action per sentence. Do not combine different actors or countries in one sentence.
3. Mandatory confidence signal: "according to [named source]" or "is reported by [source]."
4. No vague sources. Always name the source or actor.
5. No interpretation. Do not use "this means," "this shows," "raising," or "leading to."
6. Full name and role on first reference.
7. No false balance. Do not soften with "both sides" when one side's civilian burden is overwhelmingly the story.

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

If output:
- becomes US-heavy → redistribute stories
- starts with institutions or leaders → rewrite with human group first
- lacks human focus → regenerate
- merges multiple events in one story → split
- uses vague agency language → name the actor
- forces false balance → remove artificial symmetry

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
