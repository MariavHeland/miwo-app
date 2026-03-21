import { NextResponse } from 'next/server'

// Health check for Chatterbox TTS — the frontend pings this
// to decide whether to show the "MIWO voice" option

export async function GET() {
  const chatterboxUrl = process.env.CHATTERBOX_URL

  if (!chatterboxUrl) {
    return NextResponse.json({ available: false }, { status: 503 })
  }

  try {
    const res = await fetch(`${chatterboxUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({
        available: data.available !== false,
        voices: data.voices || [],
        device: data.device || 'unknown',
      })
    }
    return NextResponse.json({ available: false }, { status: 503 })
  } catch {
    return NextResponse.json({ available: false }, { status: 503 })
  }
}
