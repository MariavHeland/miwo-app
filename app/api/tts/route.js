import { NextResponse } from 'next/server'

// Fish Audio TTS endpoint
// Takes text + voice name, returns audio as mp3 stream
export const maxDuration = 60

export async function POST(request) {
  try {
    const { text, voice } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const apiKey = process.env.FISH_AUDIO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Fish Audio API key not configured' }, { status: 500 })
    }

    // Voice IDs — display name → Fish Audio reference ID
    const voices = {
      nova: process.env.FISH_VOICE_NOVA || '3c86704b6c1741f4b6d3723397061f04',
      atlas: process.env.FISH_VOICE_ATLAS || '22ed56c43aa54f4dbd3c56674964d016',
      cleo: process.env.FISH_VOICE_CLEO || '289cad70b38b4ab890f7c1344b732115',
      sol: process.env.FISH_VOICE_SOL || '5009c2727b164afe8e4040619cfcc9ab',
    }

    const voiceId = voices[(voice || 'nova').toLowerCase()] || voices.nova

    // Fish Audio TTS API
    const response = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim().substring(0, 2000),
        reference_id: voiceId,
        format: 'mp3',
        mp3_bitrate: 128,
        normalize: true,
        latency: 'balanced',
        prosody: {
          speed: 0.92,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Fish Audio error:', response.status, err)
      return NextResponse.json(
        { error: `TTS error (${response.status}): ${err.substring(0, 200)}` },
        { status: response.status }
      )
    }

    // Return the mp3 audio
    const audioBuffer = await response.arrayBuffer()

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('TTS error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
