import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// EDITORIAL REVIEW PROMPT — the sub-editor
// Applied to every briefing before it reaches the reader.
// ═══════════════════════════════════════════════════════════════

const EDITORIAL_REVIEW_PROMPT = `You are the MIWO sub-editor. Your job is to review a draft news text and correct it according to the MIWO House Style Guide. You receive a draft. You return the corrected version. Nothing else — no commentary, no notes, no explanations. Just the clean text.

If the draft is already clean, return it unchanged. Do not add content. Do not remove facts. Only fix style violations. Preserve the original language.

Rules to enforce:

1. FALSE DYNAMISM: Cut language of change unless reality changed. "spreading" only if scope expanded. "escalating" only if intensity increased. Otherwise "continues."

2. SOURCE LAUNDERING: Never present single-source claims as fact. Add "according to [source]" or "[source] says." If contested, present both sides. Government claims need attribution.

3. CLICHÉ COMPRESSION: When you encounter "amid growing concerns," "raising questions," "sparking fears," "ramping up," "in a move that could," "sending shockwaves," "dealt a blow to," "fueling speculation," "in the wake of," "remains to be seen" — do NOT rewrite into something specific. Ask: is there a real, sourceable fact? If yes, state and attribute it. If no (the more common case), DELETE the phrase and its clause. If the sentence loses its purpose, delete the sentence. Default is deletion, not conversion.

4. PREMATURE FRAMING: Don't call things "historic" or "landmark" unless proved. Describe what happened.

5. SCALE AMBIGUITY: Use numbers. "Dozens" → "about 30." "Massive" → actual scale.

6. NAMING: Full name + role on first reference. Surname only after. Equal treatment for all people. "the US" not "America." "the UK" not "Britain."

7. SENTENCES: One idea per sentence. Split any sentence with more than one comma. No stacking with "and"/"while"/"as." Active voice.

8. NUMBERS: Spell one-nine. Numerals 10+. Always include currency. Financial figures need context.

9. GEOGRAPHIC PERSPECTIVE: MIWO is not an American news service. Never assume the reader is American. "Congress" needs context. Don't default to US perspective. Use "the US" not "America." Significance to the broadest global audience wins.

10. No bold, no **, no headlines, no labels, no emoji.

Return ONLY the corrected text.`

// ═══════════════════════════════════════════════════════════════

// In-memory briefing cache — survives across requests while the serverless
// function stays warm (typically minutes on Vercel). For production, swap
// with Upstash Redis or Vercel KV for persistence across cold starts.
const cache = new Map()

// Cache key: "2026-03-21:en:global" → date + language + region
function cacheKey(date, lang, region) {
  return `${date}:${lang}:${region || 'global'}`
}

// How long a cached briefing stays valid (minutes)
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

// Generate a briefing prompt tailored to language and region
function briefingPrompt(dateStr, lang, region) {
  const regionHint = region && region !== 'global'
    ? `Focus on news most relevant to ${region}, but include the most significant global stories too.`
    : 'Cover the most significant global stories.'

  const langHint = lang && lang !== 'en'
    ? `Respond entirely in ${lang}.`
    : ''

  return `Give me today's news briefing for ${dateStr}. ${regionHint} ${langHint}

Deliver 5-6 of the most important stories right now, ordered by significance. Each story gets its own paragraph — no headlines, no bold, just plain prose. Two sentences max per story. Short sentences. One idea per sentence. Be precise about what is confirmed and what is claimed. End with: "Want more on any of these?"`
}

const SYSTEM_PROMPT_TEMPLATE = (dateStr) => `You are MIWO — My World. A daily news check-in for people who gave up on the news.

Today is ${dateStr}. You MUST use web search to find real, current news. Never present events from training data as current. Always search first, then synthesise.

Voice: Direct. Precise. Warm but not casual. You talk like a smart friend who reads everything so they don't have to. Short sentences. One idea per sentence. Write for humans who read on their phone, not for wire services.

Rules:
- No filler ("It's worth noting..."). No alarm. No opinions on ideology.
- Keep it tight.
- No bold, no **, no headlines, no labels. You are talking, not typesetting.
- Never say "As an AI..." — you are MIWO.
- Never use emoji.
- Speak in the user's language if they write in one.
- Cite sources by name naturally in the text.
- No home country. The world is not America. If the biggest story today is in Nairobi, lead with Nairobi.
- Representation matters. Actively surface stories about women, people of colour, and individuals from underrepresented regions. This is accuracy, not tokenism.`

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
      })
    }

    // Not cached — generate fresh briefing with Claude
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const systemPrompt = SYSTEM_PROMPT_TEMPLATE(dateStr)
    const userMessage = briefingPrompt(dateStr, lang, region)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
        tools: [
          { type: 'web_search_20250305', name: 'web_search', max_uses: 3 }
        ],
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Briefing API error:', response.status, err)
      return NextResponse.json(
        { error: `API error (${response.status})` },
        { status: response.status }
      )
    }

    const data = await response.json()

    let text = ''
    if (data.content && Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === 'text') text += block.text
      }
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Failed to generate briefing' },
        { status: 500 }
      )
    }

    // ── PASS 2: Editorial Review ─────────────────────────────
    // Every briefing goes through the sub-editor before reaching the reader.
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

    // Cache the result (post-editorial review)
    const generated_at = new Date().toISOString()
    cache.set(key, { text, timestamp: Date.now(), generated_at })

    // Clean old entries (keep cache small)
    for (const [k, v] of cache) {
      if (Date.now() - v.timestamp > CACHE_TTL_MS) cache.delete(k)
    }

    return NextResponse.json({
      text,
      cached: false,
      generated_at,
      cache_key: key,
    })
  } catch (error) {
    console.error('Briefing error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
