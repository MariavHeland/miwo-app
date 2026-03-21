import { NextResponse } from 'next/server'

// MIWO TTS proxy — forwards requests to the Chatterbox server on Railway
// Set CHATTERBOX_URL in Vercel env vars (e.g., https://miwo-tts.up.railway.app)
// The Chatterbox server has voice references baked in — we just send text + voice name

export const maxDuration = 60 // Allow up to 60s for synthesis

export async function POST(request) {
  try {
    const { text, voice } = await request.json()
    const chatterboxUrl = process.env.CHATTERBOX_URL

    if (!chatterboxUrl) {
      return NextResponse.json(
        { error: 'Chatterbox TTS not configured' },
        { status: 503 }
      )
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    const response = await fetch(`${chatterboxUrl}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.trim(),
        voice: (voice || 'maria').toLowerCase(),
        exaggeration: 0.3,
        cfg_weight: 0.5,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Chatterbox error:', response.status, err)
      return NextResponse.json(
        { error: 'TTS synthesis failed' },
        { status: 502 }
      )
    }

    // Forward the audio WAV back to the browser
    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('TTS error:', error.message)
    return NextResponse.json(
      { error: 'TTS service unavailable' },
      { status: 500 }
    )
  }
}
