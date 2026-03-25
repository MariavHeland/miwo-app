'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLang, LangPicker } from './i18n'

// SVG Icons
function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
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

// Globe images — two hemispheres flanking the MIWO wordmark
const GLOBE_FRONT = '/globe-front.png'  // Africa & Europe (left)
const GLOBE_BACK = '/globe-back.png'    // Asia-Pacific (right)

export default function Home() {
  const { t } = useLang()
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
  const [showWelcome, setShowWelcome] = useState(true)
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

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
  const cleanTextForSpeech = (text) => {
    let cleaned = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim()

    // Convert numbers to spoken words (e.g. "389" → "three hundred and eighty nine")
    // Handle percentages first: "12%" → "twelve percent"
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
    // Handle standalone numbers (not inside words): "389" → "three hundred and eighty nine"
    cleaned = cleaned.replace(/\b(\d[\d,]*)\b/g, (match) => {
      const num = parseInt(match.replace(/,/g, ''), 10)
      return isNaN(num) || num > 999999999999 ? match : numberToWords(num)
    })

    // Apply pronunciation fixes
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

  // TTS queue — speaks paragraph by paragraph so voice starts fast
  const ttsQueueRef = useRef([])
  const ttsPlayingRef = useRef(false)
  const ttsCancelledRef = useRef(false)
  const lastParaIndexRef = useRef(-1) // track paragraph transitions for pauses

  // Generate audio for one chunk of text
  const generateAudio = useCallback(async (text) => {
    const cleanText = cleanTextForSpeech(text)
    if (!cleanText) return null

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText, voice: voiceName }),
    })

    if (!res.ok) return null
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  }, [voiceName])

  // Play the next item in the TTS queue
  const playNextInQueue = useCallback(async () => {
    if (ttsPlayingRef.current || ttsCancelledRef.current) return
    if (ttsQueueRef.current.length === 0) {
      setSpeakingIndex(-1)
      setSpeakingParaIndex(-1)
      setTtsStatus('')
      lastParaIndexRef.current = -1
      return
    }

    // Lock immediately to prevent overlapping calls during the pause
    ttsPlayingRef.current = true

    const { url, resolve, paraIndex } = ttsQueueRef.current[0]

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
      if (resolve) resolve()
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
      if (resolve) resolve()
      if (!ttsCancelledRef.current) playNextInQueue()
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      ttsPlayingRef.current = false
      if (resolve) resolve()
      if (!ttsCancelledRef.current) playNextInQueue()
    }

    try { await audio.play() } catch {
      ttsPlayingRef.current = false
      if (resolve) resolve()
    }
  }, [])

  // Track paragraph counter for TTS queue
  const ttsParaCounterRef = useRef(0)

  // Add a paragraph to the TTS queue and start playing if idle
  const queueParagraph = useCallback(async (text, msgIndex, paraIndex) => {
    setSpeakingIndex(msgIndex)
    setTtsStatus('generating')

    const pIdx = paraIndex >= 0 ? paraIndex : ttsParaCounterRef.current++

    const url = await generateAudio(text)
    if (ttsCancelledRef.current) {
      if (url) URL.revokeObjectURL(url)
      return
    }

    ttsQueueRef.current.push({ url, paraIndex: pIdx })
    if (!ttsPlayingRef.current) playNextInQueue()
  }, [generateAudio, playNextInQueue])

  // Speak full text at once (for manual click on speaker icon)
  const speak = useCallback(async (text, index) => {
    ttsCancelledRef.current = false
    ttsQueueRef.current = []
    ttsPlayingRef.current = false
    ttsParaCounterRef.current = 0

    setSpeakingIndex(index)
    setSpeakingParaIndex(0)
    setTtsStatus('generating')

    // Split into paragraphs, then into sentence chunks within each
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
    for (let pi = 0; pi < paragraphs.length; pi++) {
      const chunks = splitIntoChunks(paragraphs[pi])
      for (const chunk of chunks) {
        if (ttsCancelledRef.current) break
        const url = await generateAudio(chunk)
        if (ttsCancelledRef.current) {
          if (url) URL.revokeObjectURL(url)
          break
        }
        ttsQueueRef.current.push({ url, paraIndex: pi })
        if (!ttsPlayingRef.current) playNextInQueue()
      }
      if (ttsCancelledRef.current) break
    }
  }, [generateAudio, playNextInQueue])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
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

  // Voice swap — stop playback instantly, new voice applies to next generation
  const setVoiceName = useCallback((name) => {
    stopSpeaking()
    setVoiceNameRaw(name)
  }, [stopSpeaking])

  const sendMessage = async (text, baseMessages) => {
    const messageText = text || input
    if (!messageText.trim() || isLoading) return

    // Hide welcome screen when user sends a message
    setShowWelcome(false)

    // Pre-unlock AudioContext on this user gesture so auto-read works after response
    if (autoRead) ensureAudioContext()

    // Stop any current speech when user sends a new message
    stopSpeaking()

    const userMessage = { role: 'user', content: messageText.trim() }
    const history = baseMessages || messages
    const newMessages = [...history, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    const maxRetries = 2
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages, prefs }),
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
          setMessages([...newMessages, {
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

        setMessages([...newMessages, { role: 'assistant', content: '' }])
        setIsLoading(false)

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullText += decoder.decode(value, { stream: true })
          setMessages([...newMessages, { role: 'assistant', content: fullText }])

          // Auto-read: send completed sentences to TTS as they stream in
          if (autoRead) {
            const remaining = fullText.substring(spokenUpTo)
            // Match only the FIRST sentence (non-greedy) that ends with punctuation + whitespace
            const m = remaining.match(/^(.*?[.!?])(\s+)/)
            if (m) {
              const sentence = m[1]
              spokenUpTo += m[0].length
              queueParagraph(sentence, newMessages.length, paraCounter)
              paraCounter++
            }
          }
        }

        // Auto-read: send the final paragraph
        if (autoRead && fullText.length > spokenUpTo) {
          const remaining = fullText.substring(spokenUpTo)
          if (remaining.trim()) {
            queueParagraph(remaining, newMessages.length, paraCounter)
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
    setMessages([...newMessages, {
      role: 'assistant',
      content: 'Couldn\'t connect. Check your internet and tap retry.',
      isError: true,
      retryText: messageText.trim(),
    }])
    setIsLoading(false)
  }

  // Keep sendMessage ref current so speech recognition always uses latest version
  sendMessageRef.current = sendMessage

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
    setShowWelcome(false)
    setMessages([])
    localStorage.removeItem('miwo-messages')
    setInput(text)
    sendMessage(text, [])
  }

  const formatMessage = (text, isSpeakingMsg) => {
    return text.split('\n\n').map((para, i) => {
      // Strip markdown headings but keep bold as <strong> for copper emphasis
      const cleaned = para.replace(/#{1,6}\s+/g, '')
      // Convert **bold** to <strong> spans for visual warmth
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
          className={isActivePara ? 'speaking-paragraph' : ''}
        >
          {parts}
        </p>
      )
    })
  }

  return (
    <div className="app">
      <header className="header">
        <img
          src="/miwo-nav.png"
          alt="MIWO"
          className="header-logo"
          onClick={() => { setShowWelcome(true); setMessages([]); localStorage.removeItem('miwo-messages') }}
          style={{ cursor: 'pointer' }}
          title="New conversation"
        />
        <div className="header-controls">
          <Link href="/sports" className="nav-link">{t('sport')}</Link>
          <Link href="/history" className="nav-link">{t('history')}</Link>
          <Link href="/classics" className="nav-link">{t('classics')}</Link>
          <Link href="/arts" className="nav-link">{t('arts')}</Link>
          <Link href="/nature" className="nav-link">{t('nature')}</Link>
          <Link href="/cook" className="nav-link">{t('cook')}</Link>
          <LangPicker />
          <button
            className={`header-btn auto-read-btn ${autoRead ? 'active' : ''}`}
            onClick={() => {
              if (autoRead) stopSpeaking()
              else ensureAudioContext() // Unlock audio on user gesture
              setAutoRead(!autoRead)
            }}
            title={autoRead ? 'Auto-read on — click to turn off' : 'Auto-read off — click to turn on'}
          >
            {autoRead ? <SpeakerIcon size={16} /> : <SpeakerOffIcon size={16} />}
          </button>
          <button
            className={`header-btn ${showPrefs ? 'active' : ''}`}
            onClick={() => setShowPrefs(!showPrefs)}
            title="Preferences"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      {/* Preferences panel */}
      {showPrefs && (
        <div className="prefs-panel">
          <div className="prefs-section">
            <div className="prefs-label">Regions</div>
            <div className="prefs-chips">
              {['Europe', 'Middle East', 'Asia', 'Africa', 'Americas', 'Oceania'].map(r => (
                <button key={r} className={`pref-chip ${prefs.regions.includes(r) ? 'active' : ''}`}
                  onClick={() => togglePref('regions', r)}>{r}</button>
              ))}
            </div>
          </div>
          <div className="prefs-section">
            <div className="prefs-label">Topics</div>
            <div className="prefs-chips">
              {['Politics', 'Economy', 'Tech', 'Climate', 'Culture', 'Science', 'Conflict'].map(t => (
                <button key={t} className={`pref-chip ${prefs.topics.includes(t) ? 'active' : ''}`}
                  onClick={() => togglePref('topics', t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="prefs-section">
            <div className="prefs-label">Depth</div>
            <div className="prefs-chips">
              {[['brief', 'Brief'], ['standard', 'Standard'], ['deep', 'Deep']].map(([v, l]) => (
                <button key={v} className={`pref-chip ${prefs.depth === v ? 'active' : ''}`}
                  onClick={() => setPrefs(p => ({ ...p, depth: v }))}>{l}</button>
              ))}
            </div>
          </div>
          <div className="prefs-hint">These shape your briefings. No regions selected = global coverage.</div>
        </div>
      )}

      {/* Voice picker — always visible */}
      <div className="voice-settings">
        <div className="voice-settings-row">
          <div className="voice-settings-label">{t('voice')}</div>
          <div className="voice-options">
            <button
              className={`voice-option ${voiceName === 'nova' ? 'active' : ''}`}
              onClick={() => setVoiceName('nova')}
            >
              Nova
            </button>
            <button
              className={`voice-option ${voiceName === 'atlas' ? 'active' : ''}`}
              onClick={() => setVoiceName('atlas')}
            >
              Atlas
            </button>
            <button
              className={`voice-option ${voiceName === 'cleo' ? 'active' : ''}`}
              onClick={() => setVoiceName('cleo')}
            >
              Cleo
            </button>
            <button
              className={`voice-option ${voiceName === 'sol' ? 'active' : ''}`}
              onClick={() => setVoiceName('sol')}
            >
              Sol
            </button>
            <button
              className={`voice-option ${voiceName === 'iris' ? 'active' : ''}`}
              onClick={() => setVoiceName('iris')}
            >
              Iris
            </button>
          </div>
        </div>
      </div>

      {showWelcome ? (
        <div className="welcome">
          <div className="welcome-identity">
            <img src={GLOBE_FRONT} alt="" className="welcome-globe welcome-globe-left" />
            <img src="/miwo-brand.png" alt="MIWO — my world my news" className="welcome-brand-img" />
            <img src={GLOBE_BACK} alt="" className="welcome-globe welcome-globe-right" />
          </div>
          <div className="welcome-promise">
            <p>{t('promise1')}</p>
            <p style={{ marginTop: '6px' }}>{t('promise2')}</p>
          </div>
          <div className="welcome-prompts">
            <button className="welcome-prompt" onClick={() => handlePromptClick(t('prompt1'))}>
              {t('prompt1')}
            </button>
            <button className="welcome-prompt" onClick={() => handlePromptClick(t('prompt2'))}>
              {t('prompt2')}
            </button>
            <button className="welcome-prompt" onClick={() => handlePromptClick(t('prompt3'))}>
              {t('prompt3')}
            </button>
          </div>
        </div>
      ) : (
        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role} ${msg.isError ? 'error-msg' : ''}`}>
              <div className="message-content">
                {msg.role === 'assistant' ? formatMessage(msg.content, speakingIndex === i) : msg.content}
              </div>
              {msg.role === 'assistant' && msg.isError && (
                <button
                  className="retry-btn"
                  onClick={() => {
                    // Remove the error message and the user message that triggered it
                    // Pass cleaned messages directly to avoid stale closure
                    const cleaned = messages.filter(m => m !== msg && !(m.role === 'user' && m.content === msg.retryText && messages.indexOf(m) === i - 1))
                    setMessages(cleaned)
                    sendMessage(msg.retryText, cleaned)
                  }}
                >
                  ↻ Try again
                </button>
              )}
              {msg.role === 'assistant' && !msg.isError && (
                <div className="message-actions">
                  {speakingIndex === i ? (
                    <button
                      className="msg-action-btn speaking"
                      onClick={stopSpeaking}
                      title="Stop reading"
                    >
                      <StopIcon size={14} />
                    </button>
                  ) : (
                    <button
                      className="msg-action-btn"
                      onClick={() => { ensureAudioContext(); speak(msg.content, i) }}
                      title="Read aloud"
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
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="input-area">
        <div className="input-row">
          <button
            className={`voice-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleVoice}
            title={isListening ? 'Stop listening' : 'Speak to MIWO'}
          >
            <MicIcon />
          </button>
          {ttsStatus && (
            <div style={{
              position: 'absolute', top: '-36px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(196,125,90,0.15)', color: '#C47D5A', fontSize: '12px',
              padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(196,125,90,0.3)',
              whiteSpace: 'nowrap', animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              {ttsStatus === 'generating' ? '✨ Generating MIWO voice...' : ttsStatus === 'quota' ? '⏳ Voice quota reached — try again in a minute' : '🔊 Playing...'}
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="input-field"
            placeholder={isListening ? '...' : t('talkTo')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
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
