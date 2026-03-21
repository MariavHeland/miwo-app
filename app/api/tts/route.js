import { NextResponse } from 'next/server'

// Chatterbox TTS endpoint — forwards text to Railway-hosted Chatterbox
// Once Chatterbox is deployed, set CHATTERBOX_URL in Vercel env vars
// e.g., CHATTERBOX_URL=https://your-chatterbox-service.up.railway.app

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

    // Split long text into sentences for faster first-audio response
    // Chatterbox processes each chunk and we concatenate
    const response = await fetch(`${chatterboxUrl}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.trim(),
        voice: voice || 'maria', // default voice reference
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Chatterbox error:', err)
      return NextResponse.json(
        { error: 'TTS synthesis failed' },
        { status: 502 }
      )
    }

    // Chatterbox returns audio/wav — forward it to the client
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
