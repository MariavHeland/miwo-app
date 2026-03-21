import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Chatterbox TTS endpoint — forwards text + voice reference to Railway-hosted Chatterbox
// Set CHATTERBOX_URL in Vercel env vars once deployed
// e.g., CHATTERBOX_URL=https://your-chatterbox-service.up.railway.app

// Voice reference files stored in /public/voices/
const VOICE_FILES = {
  maria: 'Maria_MIWO.wav',
  johnny: 'JOHNNY_MIWO.mp3',
}

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

    // Select voice reference file
    const voiceKey = (voice || 'maria').toLowerCase()
    const voiceFile = VOICE_FILES[voiceKey] || VOICE_FILES.maria

    // Read the voice reference audio and send as base64 to Chatterbox
    const voicePath = join(process.cwd(), 'public', 'voices', voiceFile)
    let voiceBase64
    try {
      const voiceBuffer = await readFile(voicePath)
      voiceBase64 = voiceBuffer.toString('base64')
    } catch {
      console.error(`Voice file not found: ${voicePath}`)
      // Continue without voice reference — Chatterbox will use its default
      voiceBase64 = null
    }

    const response = await fetch(`${chatterboxUrl}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.trim(),
        voice_ref: voiceBase64,
        voice_ref_name: voiceFile,
        voice: voiceKey,
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
