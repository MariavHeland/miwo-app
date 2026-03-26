import { NextResponse } from 'next/server'
import { encode } from '@msgpack/msgpack'

// Fish Audio TTS endpoint
// Takes text + voice name + lang, returns audio as mp3 stream
export const maxDuration = 60

export async function POST(request) {
  try {
    const { text, voice, lang } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const apiKey = process.env.FISH_AUDIO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Fish Audio API key not configured' }, { status: 500 })
    }

    // Voice lookup — same voices for ALL languages
    const voices = {
      nova: process.env.FISH_VOICE_NOVA || '3c86704b6c1741f4b6d3723397061f04',
      atlas: process.env.FISH_VOICE_ATLAS || '22ed56c43aa54f4dbd3c56674964d016',
      cleo: process.env.FISH_VOICE_CLEO || '289cad70b38b4ab890f7c1344b732115',
      sol: process.env.FISH_VOICE_SOL || '5009c2727b164afe8e4040619cfcc9ab',
      iris: process.env.FISH_VOICE_IRIS || '6d49364c9eaa4d10ae3a01502a79b084',
    }
    const voiceId = voices[(voice || 'nova').toLowerCase()] || voices.nova
    const isEnglish = !lang || lang === 'en'

    let response

    if (isEnglish) {
      // ── English: S1 with cloned voices ────────────────────────────────────
      // Proven path. JSON body, no model header.
      response = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim().substring(0, 2000),
          reference_id: voiceId,
          format: 'mp3',
          mp3_bitrate: 64,
          normalize: true,
          latency: 'normal',
        }),
      })
    } else {
      // ── Non-English: S2-pro multilingual ──────────────────────────────────
      // S2-pro handles French/German/Arabic/Spanish natively.
      //
      // For languages with non-Latin scripts (Arabic, Hebrew, etc.), using an
      // English-cloned reference_id produces English-accented pronunciation.
      // These languages DROP the reference_id so S2-pro uses its own native voice.
      //
      // For Latin-script languages (French, Spanish, German), the reference_id
      // keeps the voice consistent across chunks while S2-pro handles pronunciation.
      const NATIVE_VOICE_LANGS = ['ar', 'he', 'fa', 'ur', 'zh', 'ja', 'ko']
      const useNativeVoice = NATIVE_VOICE_LANGS.includes(lang)

      const ttsPayload = {
        text: text.trim().substring(0, 2000),
        format: 'mp3',
        mp3_bitrate: 64,
        normalize: true,
        latency: 'normal',
      }

      // Only include reference_id for Latin-script languages
      if (!useNativeVoice) {
        ttsPayload.reference_id = voiceId
      }

      const msgpackBody = encode(ttsPayload)

      response = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/msgpack',
          'model': 's2-pro',
        },
        body: msgpackBody,
      })
    }

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
