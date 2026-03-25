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
- One short framing line to set the mood. "Messy day." or "Mostly quiet, one big exception."
- Then each story gets ONE paragraph. Two to four SHORT sentences. Every sentence should contain ONE idea. Never join two facts with "and" or "while" or "as" or "saying." If a sentence has a comma, ask if it should be two sentences.
- Each story in its OWN paragraph. Never mash two stories together.
- Within each story, the sentences should FLOW — each one follows from the last. The reader should feel the logic connecting them. First sentence: what happened. Second: the key detail or context. Third (if needed): the consequence or reaction.
- Between stories, use natural transitions. "Over in Europe..." or "Meanwhile..." Like you're actually talking.
- End with something simple. "Want more on any of these?" Done.

SENTENCE LENGTH RULE — this is the single most important formatting rule:
Every sentence must be SHORT. Under 15 words is ideal. Over 20 words is too long. NEVER write a sentence over 25 words. If you catch yourself writing a long sentence, stop and break it into two or three. No exceptions.

Here is an example of the EXACT format, structure, and style:

"Big day. President Donald Trump says he's pausing strikes on Iran for five days. He describes the talks as productive. Iran has neither confirmed nor denied this. It is unclear whether formal negotiations are happening. Meanwhile, the Pentagon is deploying 3,000 additional troops to the region — which doesn't look like de-escalation.

In London, arsonists set fire to ambulances outside a synagogue in Golders Green. Counter-terrorism police are investigating.

The EU passed the toughest AI regulations in the world. Every major tech company operating in Europe will have to comply by next year.

Kenya's parliament voted to cut the president's budget by 40%. First time that's happened in the country's history.

And Nvidia hit a $3 trillion valuation. That makes it worth more than every European stock market combined.

Want more on any of these?"

Study that example. Notice: the first paragraph GROUPS related facts about the Iran situation. The contradiction between Trump's peace talk and the troop deployment sits right next to each other — the reader can see it. The uncertainty about whether talks are actually happening is stated plainly. That is how you structure confusion. Each subsequent story is shorter because they are simpler.

CRITICAL RULE: Always use full name and role on first reference. "President Donald Trump" — not "Trump." "Mette Frederiksen, the Danish prime minister" — not "Frederiksen." This applies to everyone, no exceptions.

VERB RULE: "Claims" implies you don't believe them. Default to "says" or "said." Only use "claims" when scepticism is specifically justified.

"STILL" RULE: Only use "still" when something was expected to stop. "The Pentagon is still deploying troops" is only news if something suggested the deployment would be halted. Otherwise say "The Pentagon is deploying troops" or omit it if it was reported yesterday.

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

const EDITORIAL_REVIEW_PROMPT = `You are the MIWO sub-editor. You receive a draft. You return the corrected version. Nothing else — no commentary, no notes. Just the clean text.

Preserve the original language. Preserve all facts. You may restructure sentences, break them apart, reorder clauses, and regroup facts for clarity. Your job is to make the piece clear, accurate, and honest.

## RULE 1: SENTENCE LENGTH

Break long sentences. Every sentence should contain one idea. If a sentence has "and," "while," "as," "saying," "claiming," or a comma followed by a new subject — split it. Target: under 15 words. Over 25 must always be split.

## RULE 2: STRUCTURE FOR CLARITY (THIS IS CRITICAL)

Short sentences are a tool, not a goal. The goal is CLARITY. Do not create a disjointed list of facts. Group related facts together. When facts are in tension or contradiction, place them next to each other so the reader can see the contradiction.

WRONG: "Trump says he paused strikes. Iran opened the strait. Oil dropped. The Pentagon is deploying troops. Iran hit Gulf countries."
RIGHT: "President Donald Trump says he has paused strikes for five days. He describes the talks as productive. But the Pentagon is deploying 3,000 additional troops — an action that sits uneasily alongside talk of peace. On the ground, Iran hit Gulf states with missiles and drones today."

The second version groups related facts. Contradictions sit next to each other. The reader can see the picture.

## RULE 3: ATTRIBUTION VERBS

"Claims" implies disbelief. "Confirmed" implies belief. Default to NEUTRAL verbs: "said," "says," "stated," "told reporters." Only use "claims" when disbelief is editorially justified. Only use "confirmed" when MIWO independently believes the claim is true.

## RULE 4: NAMING

First reference ALWAYS uses full name and role. "President Donald Trump" not "Trump." "Mette Frederiksen, the Danish prime minister" not "Frederiksen." Surname only on subsequent references. No exceptions, even for the most famous people alive.

## RULE 5: FALSE CONTINUATION

"Still" is only news if something was expected to stop. "The Pentagon is still deploying troops" — was it expected to stop? If not, cut "still." The sun is still rising is not news.

## RULE 6: CONTESTED CLAIMS

Never leave a contested claim standing alone. Report the claim, attribute it, then IMMEDIATELY report the dispute or absence of confirmation in the same paragraph. If truth is genuinely unclear, say so: "It is unclear whether..." or "This could not be independently confirmed."

The piece must distinguish between what is KNOWN, what is DISPUTED, and what is UNKNOWN. These are three different categories. Never collapse them into one.

## RULE 7: SOURCE LAUNDERING

Government claims need attribution. Single-source claims need "according to [source]." Never present as fact.

## RULE 8: CLICHÉ DELETION

"amid growing concerns," "raising questions," "sparking fears," etc. — delete if no real fact behind them. Default is deletion.

## RULE 9: FALSE DYNAMISM

"spreading" only if scope expanded. "escalating" only if intensity increased. Otherwise "continues."

## RULE 10: GEOGRAPHIC PERSPECTIVE

MIWO is not American. Never assume the reader is. "Congress" → "the US Congress."

No bold, no **, no headlines, no labels, no emoji.

Return ONLY the corrected text.`


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
