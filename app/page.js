'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLang, LangPicker } from './i18n'

// Copper image icons (generated assets)
function MicIcon() {
  return (
    <img src="/miwo-microphone.png" alt="Speak" className="copper-icon copper-mic" />
  )
}

function SendIcon() {
  return (
    <img src="/miwo-arrow.png" alt="Send" className="copper-icon copper-send" />
  )
}

function SpeakerIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  )
}

function SpeakerOffIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  )
}

function StopIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
    </svg>
  )
}

function SettingsIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )
}

function HomeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

// Globe images — two hemispheres flanking the MIWO wordmark
const GLOBE_FRONT = '/globe-front.png'  // Africa & Europe (left)
const GLOBE_BACK = '/globe-back.png'    // Asia-Pacific (right)

export default function Home() {
  const { t, lang } = useLang()
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('miwo-messages')
        return saved ? JSON.parse(saved) : []
      } catch { return [] }
    }
    return []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState(-1)
  const [autoRead, setAutoRead] = useState(false)
  const [voiceName, setVoiceNameRaw] = useState('nova')
  const [ttsStatus, setTtsStatus] = useState('') // '', 'generating', 'playing', 'quota'
  const [speakingParaIndex, setSpeakingParaIndex] = useState(-1) // which paragraph is currently being read aloud
  // Globe sources are fixed — no random rotation needed
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [prefs, setPrefs] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('miwo-prefs')
        return saved ? JSON.parse(saved) : { regions: [], topics: [], depth: 'standard' }
      } catch { return { regions: [], topics: [], depth: 'standard' } }
    }
    return { regions: [], topics: [], depth: 'standard' }
  })
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const audioCtxRef = useRef(null)
  const sendMessageRef = useRef(null)
  const hasAutoLoadedRef = useRef(false)

  // Globe images are now fixed constants (GLOBE_FRONT, GLOBE_BACK)

  // Unlock AudioContext on user gesture so auto-read works after async fetch
  function ensureAudioContext() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }
  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try { localStorage.setItem('miwo-messages', JSON.stringify(messages)) }
      catch {}
    }
  }, [messages])

  // Save prefs to localStorage
  useEffect(() => {
    try { localStorage.setItem('miwo-prefs', JSON.stringify(prefs)) }
    catch {}
  }, [prefs])

  const togglePref = (category, value) => {
    setPrefs(prev => {
      const list = prev[category] || []
      const next = list.includes(value) ? list.filter(v => v !== value) : [...list, value]
      return { ...prev, [category]: next }
    })
  }

  // Auto-scroll — only when a NEW message appears or loading starts.
  // During streaming (same message count, content growing), don't force scroll.
  // This stops the "trembling" effect where every token push scrolls the page.
  const prevMsgCountRef = useRef(0)
  useEffect(() => {
    const count = messages.length
    if (count !== prevMsgCountRef.current || isLoading) {
      prevMsgCountRef.current = count
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '46px'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('')
          setInput(transcript)

          if (event.results[0].isFinal) {
            setIsListening(false)
            setTimeout(() => {
              // Use ref to avoid stale closure — sendMessage changes every render
              if (sendMessageRef.current) sendMessageRef.current(transcript)
            }, 300)
          }
        }

        recognition.onend = () => setIsListening(false)
        recognition.onerror = () => setIsListening(false)
        recognitionRef.current = recognition
      }
    }
  }, [])

  // Words that Fish Audio TTS mispronounces — mapped to phonetic spellings
  const ttsPronunciationFixes = [
    [/\bParliamentary\b/g, 'Parlimentary'],
    [/\bparliamentary\b/g, 'parlimentary'],
    [/\bParliament\b/g, 'Parliment'],
    [/\bparliament\b/g, 'parliment'],
    [/\bBundestag\b/g, 'Boon-des-tahg'],
    [/\bReichstag\b/g, 'Rysh-tahg'],
    [/\bTaoiseach\b/g, 'Tee-shuck'],
    [/\bXi Jinping\b/g, 'Shee Jin-ping'],
    [/\bZelensky\b/gi, 'Zeh-LEN-skee'],
    [/\bMacron\b/g, 'Ma-KRON'],
    [/\bSchultz\b/g, 'Shooltz'],
    [/\bScholz\b/g, 'Sholts'],
    [/\bKyiv\b/g, 'Keev'],
    [/\bBlinken\b/g, 'BLINK-en'],
    [/\bIsrael\b/g, 'Izrel'],
    [/\bIsraeli\b/g, 'Izrely'],
    [/\bHamas\b/g, 'hah-MAHS'],
    [/\bHezbollah\b/g, 'Hezballah'],
    [/\bUkraine\b/g, 'you-CRANE'],
    [/\bUkrainian\b/g, 'you-CRANE-ee-an'],
    [/\bQatar\b/g, 'KAH-tar'],
    [/\bErdogan\b/g, 'AIR-doh-wan'],
    [/\bNetanyahu\b/g, 'net-an-YAH-hoo'],
    [/—/g, ', '],
    [/–/g, ', '],
    [/\.\.\./g, ', '],
    [/\s*\(\s*/g, ', '],
    [/\s*\)\s*/g, ', '],
  ]

  // Convert numbers to spoken words for natural TTS
  const numberToWords = (num) => {
    if (num === 0) return 'zero'
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

    const convert = (n) => {
      if (n < 20) return ones[n]
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
      if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + convert(n % 100) : '')
      if (n < 1000000) return convert(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '')
      if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' million' + (n % 1000000 ? ' ' + convert(n % 1000000) : '')
      return convert(Math.floor(n / 1000000000)) + ' billion' + (n % 1000000000 ? ' ' + convert(n % 1000000000) : '')
    }

    const isNeg = num < 0
    const result = convert(Math.abs(num))
    return isNeg ? 'minus ' + result : result
  }

  // Strip markdown for TTS and fix pronunciation
  // lang param determines whether to convert numbers to words (English only)
  const cleanTextForSpeech = (text) => {
    const isEnglish = !lang || lang === 'en'
    let cleaned = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim()

    // Number-to-words and date conversion: English only
    // For non-English, Fish Audio reads digits natively in the target language
    if (isEnglish) {
      // Handle percentages: "12%" → "twelve percent"
      cleaned = cleaned.replace(/(\d[\d,]*)\s*%/g, (_, n) => {
        const num = parseInt(n.replace(/,/g, ''), 10)
        return isNaN(num) ? n + ' percent' : numberToWords(num) + ' percent'
      })
      // Handle currency: "$4,560" → "four thousand five hundred and sixty dollars"
      cleaned = cleaned.replace(/\$(\d[\d,]*(?:\.\d+)?)/g, (_, n) => {
        const parts = n.replace(/,/g, '').split('.')
        const whole = parseInt(parts[0], 10)
        let result = numberToWords(whole) + ' dollars'
        if (parts[1]) {
          const cents = parseInt(parts[1], 10)
          if (cents > 0) result += ' and ' + numberToWords(cents) + ' cents'
        }
        return result
      })
      // Convert date-day numbers to ordinals: "March 1" → "March first"
      const ordinalWord = (n) => {
        const specials = { 1: 'first', 2: 'second', 3: 'third', 5: 'fifth', 8: 'eighth', 9: 'ninth', 12: 'twelfth' }
        if (specials[n]) return specials[n]
        if (n <= 19) return numberToWords(n) + 'th'
        if (n % 10 === 0) return numberToWords(n).replace(/y$/, 'ieth')
        const onesDigit = n % 10
        const tensWord = numberToWords(n - onesDigit)
        return tensWord + ' ' + (specials[onesDigit] || numberToWords(onesDigit) + 'th')
      }
      const months = '(?:January|February|March|April|May|June|July|August|September|October|November|December)'
      cleaned = cleaned.replace(new RegExp('(' + months + ')\\s+(\\d{1,2})\\b', 'g'), (_, month, day) => {
        return month + ' ' + ordinalWord(parseInt(day, 10))
      })
      cleaned = cleaned.replace(new RegExp('\\b(\\d{1,2})\\s+(' + months + ')', 'g'), (_, day, month) => {
        return 'the ' + ordinalWord(parseInt(day, 10)) + ' of ' + month
      })
      // Standalone numbers: "389" → "three hundred and eighty nine" (skip years)
      cleaned = cleaned.replace(/\b(\d[\d,]*)\b/g, (match) => {
        const num = parseInt(match.replace(/,/g, ''), 10)
        if (isNaN(num) || num > 999999999999) return match
        if (num >= 1900 && num <= 2099) return match
        return numberToWords(num)
      })
    }

    // Apply pronunciation fixes (English names in any language)
    for (const [pattern, replacement] of ttsPronunciationFixes) {
      cleaned = cleaned.replace(pattern, replacement)
    }

    return cleaned
  }

  // Split text into speakable sentence chunks (2-3 sentences each for natural flow)
  const splitIntoChunks = (text) => {
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim())
    const chunks = []
    for (let i = 0; i < sentences.length; i += 2) {
      chunks.push(sentences.slice(i, i + 2).join(' '))
    }
    return chunks.filter(c => c.trim())
  }

  // TTS queue — ordered slots ensure audio always plays top-to-bottom
  // Each slot is { url: string|null, ready: bool, paraIndex: number }
  // Slots are pre-allocated in order; filled asynchronously as TTS returns.
  const ttsQueueRef = useRef([])
  const ttsPlayingRef = useRef(false)
  const ttsCancelledRef = useRef(false)
  const lastParaIndexRef = useRef(-1) // track paragraph transitions for pauses

  // Generate audio for one chunk of text
  const generateAudio = useCallback(async (text, voiceOverride) => {
    const cleanText = cleanTextForSpeech(text)
    if (!cleanText) return null

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText, voice: voiceOverride || voiceName, lang }),
    })

    if (!res.ok) return null
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  }, [voiceName, lang])

  // Play the next READY item in the TTS queue (always slot 0)
  const playNextInQueue = useCallback(async () => {
    if (ttsPlayingRef.current || ttsCancelledRef.current) return
    if (ttsQueueRef.current.length === 0) {
      setSpeakingIndex(-1)
      setSpeakingParaIndex(-1)
      setTtsStatus('')
      lastParaIndexRef.current = -1
      return
    }

    // Wait for the FIRST slot to be ready — never skip ahead
    const slot = ttsQueueRef.current[0]
    if (!slot.ready) return // not yet — will be triggered when the slot fills

    // Lock immediately to prevent overlapping calls during the pause
    ttsPlayingRef.current = true

    const { url, paraIndex } = slot

    // Half-second pause between paragraphs (different news items)
    if (lastParaIndexRef.current >= 0 && paraIndex !== lastParaIndexRef.current) {
      await new Promise(r => setTimeout(r, 500))
      if (ttsCancelledRef.current) {
        ttsPlayingRef.current = false
        return
      }
    }

    ttsQueueRef.current.shift()
    lastParaIndexRef.current = paraIndex

    if (!url) {
      ttsPlayingRef.current = false
      playNextInQueue()
      return
    }

    const audio = new Audio(url)
    audioRef.current = audio

    audio.onplay = () => {
      setTtsStatus('playing')
      if (paraIndex >= 0) setSpeakingParaIndex(paraIndex)
    }
    audio.onended = () => {
      URL.revokeObjectURL(url)
      ttsPlayingRef.current = false
      if (!ttsCancelledRef.current) playNextInQueue()
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      ttsPlayingRef.current = false
      if (!ttsCancelledRef.current) playNextInQueue()
    }

    try { await audio.play() } catch {
      ttsPlayingRef.current = false
    }
  }, [])

  // Track paragraph counter for TTS queue
  const ttsParaCounterRef = useRef(0)

  // Stop speaking — defined here so queueParagraph and speak can reference it without TDZ
  const stopSpeaking = useCallback(() => {
    // Stop Fish Audio queue
    ttsCancelledRef.current = true
    ttsQueueRef.current = []
    ttsPlayingRef.current = false
    ttsParaCounterRef.current = 0
    lastParaIndexRef.current = -1
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setSpeakingIndex(-1)
    setSpeakingParaIndex(-1)
    setTtsStatus('')
  }, [])

  // Add a paragraph to the TTS queue and start playing if idle
  // Pre-allocates an ordered slot SYNCHRONOUSLY, then fills it when audio arrives.
  // This guarantees playback order regardless of which TTS request returns first.
  const queueParagraph = useCallback(async (text, msgIndex, paraIndex) => {
    setSpeakingIndex(msgIndex)
    setTtsStatus('generating')

    const pIdx = paraIndex >= 0 ? paraIndex : ttsParaCounterRef.current++

    // 1. Reserve a slot in order (synchronous — runs before any await)
    const slot = { url: null, ready: false, paraIndex: pIdx }
    ttsQueueRef.current.push(slot)

    // 2. Fetch audio (async — may complete out of order, that's fine)
    const url = await generateAudio(text)
    if (ttsCancelledRef.current) {
      if (url) URL.revokeObjectURL(url)
      return
    }

    // 3. Fill the slot and mark ready
    slot.url = url
    slot.ready = true

    // 4. Kick the player — it will only play if this slot is first in line
    if (!ttsPlayingRef.current) playNextInQueue()
  }, [generateAudio, playNextInQueue])

  // Speak full text at once (for manual click on speaker icon)
  // Pre-allocates ALL slots in order first, then fills them as TTS returns.
  const speak = useCallback(async (text, index) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    ttsCancelledRef.current = false
    ttsQueueRef.current = []
    ttsPlayingRef.current = false
    ttsParaCounterRef.current = 0
    lastParaIndexRef.current = -1

    setSpeakingIndex(index)
    setSpeakingParaIndex(0)
    setTtsStatus('generating')

    // Alternating voices for story presentation — one voice per story system
    const STORY_VOICES = ['nova', 'atlas']
    const hasStoryMarkers = text.includes('§')

    // Split by § to get story groups, then paragraphs within each
    const storyGroups = hasStoryMarkers
      ? text.split(/\n?§\n?/).filter(s => s.trim())
      : [text]

    const paragraphs = []
    const paragraphVoices = []
    storyGroups.forEach((story, storyIdx) => {
      const voice = hasStoryMarkers
        ? STORY_VOICES[storyIdx % STORY_VOICES.length]
        : voiceName
      story.split(/\n\n+/).filter(p => p.trim()).forEach(para => {
        paragraphs.push(para)
        paragraphVoices.push(voice)
      })
    })

    // 1. Pre-allocate all slots in order (synchronous)
    const allSlots = []
    for (let pi = 0; pi < paragraphs.length; pi++) {
      const chunks = splitIntoChunks(paragraphs[pi])
      for (const chunk of chunks) {
        const slot = { url: null, ready: false, paraIndex: pi, text: chunk, voice: paragraphVoices[pi] }
        ttsQueueRef.current.push(slot)
        allSlots.push(slot)
      }
    }

    // 2. Generate audio for all slots with story-assigned voice
    for (const slot of allSlots) {
      if (ttsCancelledRef.current) break
      const url = await generateAudio(slot.text, slot.voice)
      if (ttsCancelledRef.current) {
        if (url) URL.revokeObjectURL(url)
        break
      }
      slot.url = url
      slot.ready = true
      delete slot.text
      if (!ttsPlayingRef.current) playNextInQueue()
    }
  }, [generateAudio, playNextInQueue, stopSpeaking])

  // Voice swap — stop playback instantly, new voice applies to next generation
  const setVoiceName = useCallback((name) => {
    stopSpeaking()
    setVoiceNameRaw(name)
  }, [stopSpeaking])

  const sendMessage = async (text, baseMessages, opts = {}) => {
    const messageText = text || input
    if (!messageText.trim() || isLoading) return

    // Pre-unlock AudioContext on this user gesture so auto-read works after response
    if (autoRead) ensureAudioContext()

    // Stop any current speech when user sends a new message
    stopSpeaking()

    const userMessage = { role: 'user', content: messageText.trim() }
    const history = baseMessages || messages
    // For auto-load briefing, include user message in API call but don't display it
    const apiMessages = [...history, userMessage]
    const displayMessages = opts.hideUserMessage ? [...history] : apiMessages
    setMessages(displayMessages)
    setInput('')
    setIsLoading(true)
    // Use apiMessages for the API call (includes the trigger question)
    const newMessages = apiMessages

    const maxRetries = 2
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages, prefs, lang }),
        })

        if (!res.ok) {
          if (attempt < maxRetries && (res.status >= 500 || res.status === 429)) {
            const delay = res.status === 429 ? 3000 * (attempt + 1) : 1000 * (attempt + 1)
            await new Promise(r => setTimeout(r, delay))
            continue
          }
          let errorMsg = 'Something went wrong. Tap retry to try again.'
          try {
            const errData = await res.json()
            if (errData.message) errorMsg = errData.message
          } catch {}
          setMessages([...displayMessages, {
            role: 'assistant',
            content: errorMsg,
            isError: true,
            retryText: messageText.trim(),
          }])
          setIsLoading(false)
          return
        }

        // Stream the response token by token
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ''
        let spokenUpTo = 0 // track how much text we've sent to TTS

        // Reset TTS queue for auto-read during streaming
        let paraCounter = 0
        if (autoRead) {
          ttsCancelledRef.current = false
          ttsQueueRef.current = []
          ttsPlayingRef.current = false
          ttsParaCounterRef.current = 0
        }

        setMessages([...displayMessages, { role: 'assistant', content: '' }])
        setIsLoading(false)

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullText += decoder.decode(value, { stream: true })
          setMessages([...displayMessages, { role: 'assistant', content: fullText }])

          // Auto-read: batch completed sentences into chunks before sending to TTS.
          // Batching gives the TTS engine enough context for proper intonation —
          // a lone "The first woman." sounds unfinished, but "She's the 106th person
          // to hold the job. The first woman." sounds conclusive.
          if (autoRead) {
            const remaining = fullText.substring(spokenUpTo)
            // Look for a paragraph break (double newline) — that's always a chunk boundary
            const paraBreak = remaining.indexOf('\n\n')
            if (paraBreak > 0) {
              const chunk = remaining.substring(0, paraBreak).trim()
              if (chunk) {
                spokenUpTo += paraBreak + 2 // skip past the \n\n
                // Skip whitespace after the break
                while (spokenUpTo < fullText.length && fullText[spokenUpTo] === '\n') spokenUpTo++
                queueParagraph(chunk, displayMessages.length, paraCounter)
                paraCounter++
              }
            }
          }
        }

        // Auto-read: send the final paragraph
        if (autoRead && fullText.length > spokenUpTo) {
          const remaining = fullText.substring(spokenUpTo)
          if (remaining.trim()) {
            queueParagraph(remaining, displayMessages.length, paraCounter)
          }
        }
        return

      } catch (err) {
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
          continue
        }
      }
    }

    // All retries failed
    setMessages([...displayMessages, {
      role: 'assistant',
      content: 'Couldn\'t connect. Check your internet and tap retry.',
      isError: true,
      retryText: messageText.trim(),
    }])
    setIsLoading(false)
  }

  // Keep sendMessage ref current so speech recognition always uses latest version
  sendMessageRef.current = sendMessage

  // No auto-load — the "Right now" button is the entry point.
  // User lands on front page, sees identity, taps "Right now" to get news.

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setInput('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handlePromptClick = (text) => {
    setMessages([])
    localStorage.removeItem('miwo-messages')
    setInput(text)
    sendMessage(text, [])
  }

  const formatMessage = (text, isSpeakingMsg) => {
    // Split by § story boundary marker into story groups, then by \n\n within each
    const stories = text.split(/\n?§\n?/).filter(s => s.trim())
    let paraIndex = 0
    return stories.flatMap((story, storyIdx) => {
      const storyClass = storyIdx % 2 === 0 ? 'story-a' : 'story-b'
      return story.split('\n\n').filter(p => p.trim()).map((para) => {
        const i = paraIndex++
        const cleaned = para.replace(/#{1,6}\s+/g, '')
        const parts = cleaned.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={j}>{part.slice(1, -1)}</em>
          }
          return part
        })
        const isActivePara = isSpeakingMsg && speakingParaIndex === i
        return (
          <p
            key={i}
            className={[storyClass, isActivePara ? 'speaking-paragraph' : ''].filter(Boolean).join(' ')}
          >
            {parts}
          </p>
        )
      })
    })
  }

  return (
    <div className="app">
      <header className="header">
        <img
          src="/miwo-nav.png"
          alt="MIWO"
          className="header-logo"
          onClick={() => { stopSpeaking(); setMessages([]); localStorage.removeItem('miwo-messages') }}
          style={{ cursor: 'pointer' }}
          title={t('newConversation')}
        />
        <div className="header-controls">
          <button
            className="header-btn home-btn"
            onClick={() => {
              stopSpeaking()
              setMessages([])
              localStorage.removeItem('miwo-messages')
            }}
            title={t('home') || 'Home'}
          >
            <HomeIcon size={16} />
          </button>
          <Link href="/sports" className="nav-link">{t('sport')}</Link>
          <Link href="/history" className="nav-link">{t('history')}</Link>
          <Link href="/classics" className="nav-link">{t('classics')}</Link>
          <Link href="/arts" className="nav-link">{t('arts')}</Link>
          <Link href="/nature" className="nav-link">{t('nature')}</Link>
          <Link href="/science" className="nav-link">{t('science')}</Link>
          <Link href="/cook" className="nav-link">{t('cook')}</Link>
          <Link href="/education" className="nav-link">{t('education')}</Link>
          <Link href="/future" className="nav-link">{t('future')}</Link>
          <LangPicker />
          <button
            className={`header-btn auto-read-btn ${autoRead ? 'active' : ''}`}
            onClick={() => {
              if (autoRead) stopSpeaking()
              else ensureAudioContext() // Unlock audio on user gesture
              setAutoRead(!autoRead)
            }}
            title={autoRead ? t('autoReadOn') : t('autoReadOff')}
          >
            {autoRead ? <SpeakerIcon size={16} /> : <SpeakerOffIcon size={16} />}
          </button>
          <button
            className={`header-btn ${showPrefs ? 'active' : ''}`}
            onClick={() => setShowPrefs(!showPrefs)}
            title={t('preferences')}
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      {/* Preferences panel */}
      {showPrefs && (
        <div className="prefs-panel">
          <div className="prefs-section">
            <div className="prefs-label">{t('voice')}</div>
            <div className="prefs-chips">
              {[['nova','Nova'],['atlas','Atlas'],['cleo','Cleo'],['sol','Sol'],['iris','Iris']].map(([v, label]) => (
                <button key={v} className={`pref-chip ${voiceName === v ? 'active' : ''}`}
                  onClick={() => setVoiceName(v)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="prefs-section">
            <div className="prefs-label">{t('prefRegions')}</div>
            <div className="prefs-chips">
              {['Europe', 'Middle East', 'Asia', 'Africa', 'Americas', 'Oceania'].map(r => (
                <button key={r} className={`pref-chip ${prefs.regions.includes(r) ? 'active' : ''}`}
                  onClick={() => togglePref('regions', r)}>{r}</button>
              ))}
            </div>
          </div>
          <div className="prefs-section">
            <div className="prefs-label">{t('prefTopics')}</div>
            <div className="prefs-chips">
              {[['Politics', 'topicPolitics'], ['Economy', 'topicEconomy'], ['Tech', 'topicTech'], ['Climate', 'topicClimate'], ['Culture', 'topicCulture'], ['Science', 'topicScience'], ['Conflict', 'topicConflict']].map(([id, key]) => (
                <button key={id} className={`pref-chip ${prefs.topics.includes(id) ? 'active' : ''}`}
                  onClick={() => togglePref('topics', id)}>{t(key)}</button>
              ))}
            </div>
          </div>
          <div className="prefs-section">
            <div className="prefs-label">{t('prefDepth')}</div>
            <div className="prefs-chips">
              {[['brief', 'depthBrief'], ['standard', 'depthStandard'], ['deep', 'depthDeep']].map(([v, k]) => (
                <button key={v} className={`pref-chip ${prefs.depth === v ? 'active' : ''}`}
                  onClick={() => setPrefs(p => ({ ...p, depth: v }))}>{t(k)}</button>
              ))}
            </div>
          </div>
          <div className="prefs-hint">{t('prefHint')}</div>
        </div>
      )}

      <div className="messages">
        {/* Front page identity — shows on first load, scrolls away as user converses */}
        {messages.length === 0 && (
          <div className="welcome-hero">
            <div className="welcome-identity">
              <img src={GLOBE_FRONT} alt="" className="welcome-globe welcome-globe-left" />
              <img src="/miwo-brand.png" alt="MIWO — my world my news" className="welcome-wordmark-img" />
              <img src={GLOBE_BACK} alt="" className="welcome-globe welcome-globe-right" />
            </div>
            <div className="welcome-promise">
              <p>{t('promise1')}</p>
              <p style={{ marginTop: '6px' }}>{t('promise2')}</p>
            </div>
            <img
              src="/miwo-rightnow.png"
              alt={t('rightNow') || 'Right now'}
              className="right-now-img"
              onClick={() => {
                stopSpeaking()
                setMessages([])
                localStorage.removeItem('miwo-messages')
                hasAutoLoadedRef.current = true
                sendMessageRef.current?.(t('prompt1'), [], { hideUserMessage: true })
              }}
            />
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role} ${msg.isError ? 'error-msg' : ''}`}>
            <div className="message-content">
              {msg.role === 'assistant' ? formatMessage(msg.content, speakingIndex === i) : msg.content}
            </div>
            {msg.role === 'assistant' && msg.isError && (
              <button
                className="retry-btn"
                onClick={() => {
                  const cleaned = messages.filter(m => m !== msg && !(m.role === 'user' && m.content === msg.retryText && messages.indexOf(m) === i - 1))
                  setMessages(cleaned)
                  sendMessage(msg.retryText, cleaned)
                }}
              >
                {t('tryAgain')}
              </button>
            )}
            {msg.role === 'assistant' && !msg.isError && (
              <div className="message-actions">
                {speakingIndex === i ? (
                  <button
                    className="msg-action-btn speaking"
                    onClick={stopSpeaking}
                    title={t('stopReading')}
                  >
                    <StopIcon size={14} />
                  </button>
                ) : (
                  <button
                    className="msg-action-btn"
                    onClick={() => { ensureAudioContext(); speak(msg.content, i) }}
                    title={t('readAloud')}
                  >
                    <SpeakerIcon size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        {/* Charter values — fades in/out while loading, stays below news */}
        {messages.length > 0 && (
          <div className={`welcome-charter ${isLoading ? 'charter-breathing' : ''}`}>
            <h3 className="charter-title">{t('charterTitle')}</h3>
            <p><strong>{t('charter1label')}</strong><br />{t('charter1')}</p>
            <p><strong>{t('charter2label')}</strong><br />{t('charter2')}</p>
            <p><strong>{t('charter3label')}</strong><br />{t('charter3')}</p>
            <Link href="/charter" className="charter-link">{t('charterLink')} →</Link>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        {ttsStatus && (
          <div className="tts-status-badge">
            {ttsStatus === 'generating' ? t('voiceGenerating') : ttsStatus === 'quota' ? t('voiceQuotaReached') : t('voicePlaying')}
          </div>
        )}
        <div className="input-row">
          <button
            className={`voice-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleVoice}
            title={isListening ? t('stopListening') : t('speakToMiwo')}
          >
            <MicIcon />
          </button>
          <div className="chatbox-wrapper">
            <img src="/miwo-chatbox.png" alt="" className="chatbox-frame" />
            <textarea
              ref={textareaRef}
              className="input-field"
              placeholder={isListening ? '...' : t('talkTo')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
