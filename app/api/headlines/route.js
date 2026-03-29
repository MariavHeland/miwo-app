import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// FAST HEADLINES — returns in 2-3 seconds while full briefing assembles
// Haiku + web search → 5-6 one-line headlines
// ═══════════════════════════════════════════════════════════════

const LANG_NAMES = { en: 'English', de: 'German', es: 'Spanish', fr: 'French', ar: 'Arabic' }

const HEADLINES_PROMPT = (lang) => {
  const langName = LANG_NAMES[lang] || null
  const langRule = langName && lang !== 'en'
    ? `Write the headlines in ${langName}. Search in English, write in ${langName}.`
    : 'Write the headlines in English.'

  return `You are MIWO's headline scanner. Search the web for today's most significant global news, then return exactly 5-6 one-line headlines. Each headline is ONE sentence, maximum 12 words.

Rules:
- Search for the biggest world news stories happening RIGHT NOW
- Cover geographic diversity: not all from one region or one crisis
- Maximum 2 headlines about the same root crisis
- Each headline names a PLACE and a HUMAN CONDITION — not an institution
- No opinion words, no loaded language
- ${langRule}

Format: Return ONLY the headlines, one per line, with a bullet • before each. Nothing else. No numbering. No preamble.

Example output:
• Families in Tehran shelter through second month of airstrikes
• Cuba's power grid collapses for third time this month
• Kenyan tea worth millions stranded at Mombasa port
• Indonesia blocks social media for 70 million children
• Lufthansa pilots ground all German flights over pensions`
}

export async function POST(request) {
  try {
    const { lang } = await request.json()
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: HEADLINES_PROMPT(lang),
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 1 }],
        messages: [{ role: 'user', content: 'What are the most important world news stories right now?' }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'headlines_failed' }, { status: response.status })
    }

    const result = await response.json()
    const text = result.content?.find(b => b.type === 'text')?.text?.trim() || ''

    return NextResponse.json({ headlines: text })

  } catch (err) {
    console.error('[HEADLINES] Error:', err.message)
    return NextResponse.json({ error: 'headlines_error' }, { status: 500 })
  }
}
