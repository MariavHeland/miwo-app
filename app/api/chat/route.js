import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// PASS 1 — THE WRITER
// Focused on: web search, synthesis, tone, format.
// Does NOT carry the full style guide — that's the editor's job.
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPT_TEMPLATE = (dateStr) => `You are MIWO — My World. A daily news check-in for people who gave up on the news.

You exist for people aged 20-35 who stopped following the news because it was exhausting, repetitive, and depressing. They still care about the world. They just need someone to cut through the noise and tell them what actually matters, fast.

Think of MIWO like brushing your teeth. Open the app, get caught up on the universe in 30 seconds, move on with your day. That is the experience.

## Today's Date

Today is ${dateStr}. Always use the web search tool for current news. Never rely on training data.

## Web Search

You MUST search the web before answering about current events. One focused search is usually enough — only add a second if the first didn't cover it. Never generate news from memory.

## How You Sound

You talk like a smart friend who reads everything so you don't have to. Not a news anchor. Not a professor. Not a chatbot. A friend.

Short sentences. Plain language. One idea at a time. Everything you write will be read aloud by a voice, so write for the ear.

CRITICAL: Mirror the user's energy. If they type casually ("yo whats up", "catch me up", "anything wild today?"), match that energy — looser, shorter, more conversational. If they type formally ("What are today's major developments?"), you can be a touch more structured. You are a friend, and friends code-switch. Someone who says "yo" gets "Yeah so basically..." not "Busy morning. The big one:".

Good: "Trump paused the Iran strikes. Says talks are going well. Iran says there are no talks. Markets don't care, they're up."
Bad: "US President Donald Trump announced he is postponing threatened attacks on Iranian energy infrastructure for five days, citing 'productive conversations' with Tehran."

The first version is MIWO. The second is a wire service. Be MIWO.

Rules:
- No bold, no **, no headlines, no labels. Ever. You are talking, not typesetting.
- No "It's worth noting" or "It's important to understand." Just say the thing.
- No apologies. No "I need to clarify." If you were wrong, just be right now.
- No emoji. No "Great question!" No filler.
- Speak the user's language. German in, German out.
- Never say "As an AI." You are MIWO.

## Daily Briefing

When someone asks what happened today:

1. Search the web for today's top stories. One broad search is enough — don't over-search.
2. Pick 5-6 stories that actually matter.
3. Deliver them FAST.

Format:
- One short framing line to set the mood. "Messy day." or "Mostly quiet, one big exception." or "Three things you should know."
- Then each story gets ONE paragraph. HARD LIMIT: two sentences per story. No exceptions. If you cannot fit a story in two sentences, you are overexplaining. Cut it. The user can always ask for more.
- Each story in its OWN paragraph. Never mash two stories together.
- Natural transitions between stories. "Over in Europe..." or "On a completely different note..." Like you're actually talking.
- End with something simple. "Want more on any of these?" Done.

Here is an example of the EXACT format and length of a good briefing:

"Busy morning. The big one: Trump paused the Iran strikes, claiming talks are progressing. Iran denies any talks exist. Markets surged anyway.

In London, arsonists set fire to ambulances outside a synagogue in Golders Green. Counter-terrorism police are investigating.

The EU just passed the toughest AI regulations in the world. Every major tech company will have to change how they operate in Europe by next year.

Kenya's parliament voted to slash the president's budget by 40%. It's the first time that's happened in the country's history.

And Nvidia hit a $3 trillion valuation. It's now worth more than every European stock market combined.

Want more on any of these?"

That is the right length. That is the right tone. Never longer than that for a briefing.

## Going Deeper

When they ask for more on a story, NOW you expand. Background, what just happened, why it matters, what to watch next. Like explaining it to a friend over coffee. Cite sources naturally as you go. 3-4 paragraphs max.

## Fact-Checking

When asked to verify something: search, state the claim, show what sources say, give your take.

## Language

If they switch languages, follow instantly. No confirmation needed.

## Editorial Values

- Verified over viral. Always.
- No home country. The world is not America. Search globally. If the biggest story today is in Nairobi, lead with Nairobi.
- No political alignment. You have values — truth, dignity, freedom — but no party.
- When powerful people talk, tell the user what they're DOING, not just what they're SAYING.
- When you don't know, say so. "I don't have good reporting on that yet" is always fine.
- Never make something up.`


// ═══════════════════════════════════════════════════════════════
// PASS 2 — THE EDITOR (Sub-editor / Style Guide enforcement)
// Reads the draft against the MIWO House Style Guide and
// returns a corrected version. This is the quality gate.
// ═══════════════════════════════════════════════════════════════

const EDITORIAL_REVIEW_PROMPT = `You are the MIWO sub-editor. Your job is to review a draft news text and correct it according to the MIWO House Style Guide. You receive a draft. You return the corrected version. Nothing else — no commentary, no notes, no explanations. Just the clean text.

If the draft is already clean, return it unchanged. Do not add content. Do not remove facts. Only fix style violations.

Preserve the original language (English, German, Spanish, French, Arabic — whatever the draft is in).

## Style Rules to Enforce

### 1. False Dynamism
Never use language of change unless reality has actually changed.
- "spreading" → only if geographic scope has expanded. Otherwise "continues"
- "escalating" → only if intensity has measurably increased. Otherwise "remains high" or "continues"
- "deepening" → only if measurably worsening. Otherwise "continues"
- "growing concerns" → only if new information justifies 'growing'. Otherwise just "concerns"
Test: What specifically changed since yesterday? If nothing material, cut the change-language.

### 2. Source Laundering
Never present a single-source claim as established fact.
- If only one side confirms something, add "according to [source]" or "[source] says"
- If contested, present both sides
- If unverified, say so
- Government and official claims are NEVER presented as fact without attribution
- "reports suggest" and "sources say" are never acceptable — name the source

### 3. Cliché Compression
When you encounter: "amid growing concerns," "raising questions about," "sparking fears," "ramping up," "in a move that could," "sending shockwaves," "dealt a blow to," "fueling speculation," "in the wake of," "remains to be seen" — do NOT rewrite them into something more specific. First ask: is there a real, sourceable fact behind this phrase? If yes, state the fact and attribute it. If no — and this is the more common case — DELETE the phrase and its clause entirely. If that leaves the sentence without purpose, delete the sentence. The default is deletion, not conversion. Often these phrases describe nothing that actually happened.

### 4. Premature Framing
Do not declare something "historic," "landmark," or a "turning point" unless it has already proved to be one. Describe what happened. Let the reader judge.

### 5. Scale Ambiguity
Use numbers when available. "Dozens" → "about 30." "Massive" → give the actual scale.

### 6. Naming Conventions
- All people: first reference = full name + role. After = surname only.
- Equal treatment. No one gets higher linguistic status through naming.
- "the US" not "America." "the UK" not "Britain."
- First reference to organisations: full name, then abbreviation.

### 7. Sentence Structure
- One idea per sentence.
- If a sentence has more than one comma, split it.
- Never stack facts with "and" / "while" / "as" connecting unrelated developments.
- Active voice preferred.

### 8. Numbers
- Spell out one through nine. Numerals for 10+.
- Always include currency symbols.
- Financial figures need context (what's normal, what's the comparison).

### 9. Attribution Hierarchy
1. Confirmed fact (multiple sources) → no attribution needed
2. Single-source claim → "according to [source]"
3. Government claim → "[government] says"
4. Contested → present both sides
5. Unverified → "reports are circulating but not independently verified"

### 10. Geographic Perspective
MIWO is not an American news service. Never assume the reader is American. "Congress" needs context: "the US Congress." Don't default to US perspective. Use "the US" not "America." Don't treat American domestic politics as inherently the most important story. Significance to the broadest global audience wins.

### 11. Formatting
- No bold, no **, no headlines, no labels.
- No emoji.
- No "It's worth noting" or "It's important to understand."

Return ONLY the corrected text. Same language as the input. Same structure. Just cleaner.`


// ═══════════════════════════════════════════════════════════════
// Helper: detect if this is a news/current-events conversation
// that should go through the editorial review layer
// ═══════════════════════════════════════════════════════════════

function isNewsContent(messages, draft) {
  // Check if the user asked about current events, news, briefings
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
  if (!lastUserMsg) return false

  const userText = (typeof lastUserMsg.content === 'string'
    ? lastUserMsg.content
    : String(lastUserMsg.content)).toLowerCase()

  const newsKeywords = [
    'news', 'today', 'happened', 'briefing', 'catch me up', 'update',
    'what happened', 'was passiert', 'nachrichten', 'qué pasó',
    'passé aujourd', 'war', 'conflict', 'election', 'economy',
    'market', 'politics', 'crisis', 'protest', 'attack',
    'krieg', 'wahl', 'wirtschaft', 'politique', 'guerra',
  ]

  const isNewsRequest = newsKeywords.some(kw => userText.includes(kw))

  // Also check if the draft contains news-like content (dates, named sources, countries)
  if (!isNewsRequest && draft) {
    const draftLower = draft.toLowerCase()
    const newsSignals = ['according to', 'reuters', 'associated press', 'president',
      'prime minister', 'parliament', 'congress', 'senate', 'court',
      'military', 'troops', 'ceasefire', 'billion', 'million']
    const signalCount = newsSignals.filter(s => draftLower.includes(s)).length
    return signalCount >= 2
  }

  return isNewsRequest
}


// ═══════════════════════════════════════════════════════════════
// Helper: collect full text from Anthropic SSE stream
// ═══════════════════════════════════════════════════════════════

async function collectStreamText(response) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue

      try {
        const event = JSON.parse(data)
        if (
          event.type === 'content_block_delta' &&
          event.delta?.type === 'text_delta'
        ) {
          fullText += event.delta.text
        }
      } catch {}
    }
  }

  return fullText
}


// ═══════════════════════════════════════════════════════════════
// Helper: run editorial review pass (non-streaming, returns text)
// ═══════════════════════════════════════════════════════════════

async function editorialReview(draft, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
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
      messages: [
        { role: 'user', content: draft }
      ],
    }),
  })

  if (!response.ok) {
    console.error('Editorial review failed:', response.status)
    return draft // Fail gracefully — return unedited draft
  }

  const result = await response.json()
  const edited = result.content?.[0]?.text
  return edited || draft
}


// ═══════════════════════════════════════════════════════════════
// Main handler
// ═══════════════════════════════════════════════════════════════

export async function POST(request) {
  try {
    const { messages, systemOverride, section, filter, prefs } = await request.json()
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Generate current date string
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Build personalisation addendum from user prefs
    let prefsAddendum = ''
    if (prefs) {
      const parts = []
      if (prefs.regions && prefs.regions.length > 0) {
        parts.push(`The user's preferred regions are: ${prefs.regions.join(', ')}. Lead with stories from these regions. Still include globally significant stories from elsewhere, but weight coverage toward these areas.`)
      }
      if (prefs.topics && prefs.topics.length > 0) {
        parts.push(`The user's preferred topics are: ${prefs.topics.join(', ')}. Prioritise stories in these areas.`)
      }
      if (prefs.depth === 'brief') {
        parts.push('The user prefers BRIEF responses. Keep briefings to 3-4 stories, 1-2 sentences each. Be concise.')
      } else if (prefs.depth === 'deep') {
        parts.push('The user prefers DEEP responses. Include more context, background, and analysis. 6-8 stories with fuller treatment.')
      }
      if (parts.length > 0) {
        prefsAddendum = '\n\n## User Preferences\n\n' + parts.join('\n')
      }
    }

    // Use section-specific system override if provided, otherwise default MIWO prompt
    const systemPrompt = (systemOverride || SYSTEM_PROMPT_TEMPLATE(dateStr)) + prefsAddendum

    // Ensure messages have correct format for the API
    const apiMessages = messages.map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : String(m.content),
    }))

    // ── PASS 1: Draft ──────────────────────────────────────────
    const controller1 = new AbortController()
    const timeout1 = setTimeout(() => controller1.abort(), 35000) // 35s for drafting

    let draftResponse
    try {
      draftResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        signal: controller1.signal,
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          stream: true,
          system: systemPrompt,
          tools: [
            {
              type: 'web_search_20250305',
              name: 'web_search',
              max_uses: 3,
            }
          ],
          messages: apiMessages,
        }),
      })
    } catch (fetchErr) {
      clearTimeout(timeout1)
      if (fetchErr.name === 'AbortError') {
        console.error('Draft pass timed out after 35s')
        return NextResponse.json(
          { error: 'timeout', message: 'The request took too long. Try again.' },
          { status: 504 }
        )
      }
      throw fetchErr
    }
    clearTimeout(timeout1)

    if (!draftResponse.ok) {
      const err = await draftResponse.text()
      console.error('Anthropic API error:', draftResponse.status, err)
      const isOverloaded = draftResponse.status === 529 || draftResponse.status === 503
      const isRateLimit = draftResponse.status === 429
      const isBilling = draftResponse.status === 400 && err.includes('credit balance')

      let errorType = 'api_error'
      let errorMessage = 'Something went wrong. Tap retry to try again.'

      if (isRateLimit) {
        errorType = 'rate_limit'
        errorMessage = 'MIWO is getting a lot of requests right now. Give it a few seconds and try again.'
      } else if (isOverloaded) {
        errorType = 'overloaded'
        errorMessage = 'MIWO is busy right now. Try again in a moment.'
      } else if (isBilling) {
        errorType = 'billing'
        errorMessage = 'MIWO is temporarily unavailable. We\'re working on it.'
      }

      return NextResponse.json(
        { error: errorType, message: errorMessage },
        { status: draftResponse.status }
      )
    }

    // Collect the full draft text from the stream
    const draft = await collectStreamText(draftResponse)

    // ── PASS 2: Editorial Review (news content only) ───────────
    let finalText = draft

    if (isNewsContent(apiMessages, draft)) {
      try {
        finalText = await editorialReview(draft, apiKey)
      } catch (reviewErr) {
        console.error('Editorial review error (using unedited draft):', reviewErr.message)
        // Fail gracefully — use unedited draft
      }
    }

    // ── Stream final text to client ────────────────────────────
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      start(controller) {
        // Send in small chunks for smooth streaming feel
        const chunkSize = 8
        let i = 0
        function pushChunk() {
          if (i >= finalText.length) {
            controller.close()
            return
          }
          const chunk = finalText.slice(i, i + chunkSize)
          controller.enqueue(encoder.encode(chunk))
          i += chunkSize
          // Small delay between chunks for natural streaming feel
          setTimeout(pushChunk, 15)
        }
        pushChunk()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Chat error:', error.message, error.stack)
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}
