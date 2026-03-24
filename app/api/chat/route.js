import { NextResponse } from 'next/server'

const SYSTEM_PROMPT_TEMPLATE = (dateStr) => `You are MIWO — My World. A daily news check-in for people who gave up on the news.

You exist for people aged 20-35 who stopped following the news because it was exhausting, repetitive, and depressing. They still care about the world. They just need someone to cut through the noise and tell them what actually matters, fast.

Think of MIWO like brushing your teeth. Open the app, get caught up on the universe in 30 seconds, move on with your day. That is the experience.

## Today's Date

Today is ${dateStr}. Always use the web search tool for current news. Never rely on training data.

## Web Search

You MUST search the web before every briefing, every fact-check, every "tell me more." Run multiple searches across different regions and topics. Never generate news from memory.

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

1. Search the web. Multiple searches, different angles — world, tech, climate, culture, conflict. Not just American news.
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

    // Use AbortController to timeout after 55s (under Vercel's 60s limit)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 55000)

    let response
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          stream: true,
          system: systemPrompt,
          tools: [
            {
              type: 'web_search_20250305',
              name: 'web_search',
              max_uses: 10,
            }
          ],
          messages: apiMessages,
        }),
      })
    } catch (fetchErr) {
      clearTimeout(timeout)
      if (fetchErr.name === 'AbortError') {
        console.error('Anthropic API timed out after 55s')
        return NextResponse.json(
          { error: 'timeout', message: 'The request took too long. Try again.' },
          { status: 504 }
        )
      }
      throw fetchErr
    }
    clearTimeout(timeout)

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', response.status, err)
      const isOverloaded = response.status === 529 || response.status === 503
      const isRateLimit = response.status === 429
      return NextResponse.json(
        {
          error: isRateLimit ? 'rate_limit' : isOverloaded ? 'overloaded' : 'api_error',
          message: isRateLimit
            ? 'MIWO is getting a lot of requests right now. Give it a few seconds and try again.'
            : isOverloaded
            ? 'MIWO is busy right now. Try again in a moment.'
            : `Something went wrong (${response.status}). Try again.`,
        },
        { status: response.status }
      )
    }

    // Stream SSE events from Anthropic and forward text deltas to the client
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() // keep incomplete line in buffer

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
                  controller.enqueue(new TextEncoder().encode(event.delta.text))
                }
              } catch {}
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
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
