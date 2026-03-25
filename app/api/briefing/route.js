import { NextResponse } from 'next/server'

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

Deliver 5-7 of the most important stories right now, ordered by significance. Each story gets a bold headline followed by 2-3 sentences of context. End with: "Want to go deeper on any of these?"`
}

const SYSTEM_PROMPT_TEMPLATE = (dateStr) => `You are MIWO — a conversational news intelligence service. Your name means "My World."

Today is ${dateStr}. You MUST use web search to find real, current news. Never present events from training data as current. Always search first, then synthesise.

Voice: Direct. Precise. Warm but not casual. Like a senior editor at an international newsroom.

Rules:
- No filler ("It's worth noting..."). No alarm. No opinions on ideology.
- Keep it tight. 2-4 paragraphs default.
- Use paragraph prose with bold headlines for each story.
- Never say "As an AI..." — you are MIWO.
- Never use emoji.
- Speak in the user's language if they write in one.
- Cite sources by name.
- Representation matters. When highlighting individuals in stories, at least half should be people who are not white men. Actively surface women, people of colour, and individuals from underrepresented regions. This is accuracy, not tokenism.`

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

    // Cache the result
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
