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

// Globe views — rotate randomly to avoid Western-centric default
// TODO: Add globe-asia.jpg and globe-pacific.jpg when files are available
const GLOBE_VIEWS = [
  '/globe.png',          // Africa & Europe (current)
  // '/globe-asia.jpg',  // East Asia & Oceania — add file to /public
  // '/globe-pacific.jpg', // Asia-Pacific & Indian Ocean — add file to /public
]

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
  const [voiceName, setVoiceName] = useState('nova') // 'nova' or 'atlas'
  const [ttsStatus, setTtsStatus] = useState('') // '', 'generating', 'playing', 'quota'
  const [speakingParaIndex, setSpeakingParaIndex] = useState(-1) // which paragraph is currently being read aloud
  const [globeSrc, setGlobeSrc] = useState('/globe.png') // fallback
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const audioCtxRef = useRef(null)

  // Pick a random globe view on mount
  useEffect(() => {
    setGlobeSrc(GLOBE_VIEWS[Math.floor(Math.random() * GLOBE_VIEWS.length)])
  }, [])

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
              sendMessage(transcript)
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
  const ttsPronunciationFixes = {
    'parliament': 'parliment',
    'Parliament': 'Parliment',
    'parliamentary': 'parlimentary',
    'Parliamentary': 'Parlimentary',
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

    // Apply pronunciation fixes
    for (const [word, replacement] of Object.entries(ttsPronunciationFixes)) {
      cleaned = cleaned.replaceAll(word, replacement)
    }

    return cleaned
  }

  // TTS queue — speaks paragraph by paragraph so voice starts fast
  const ttsQueueRef = useRef([])
  const ttsPlayingRef = useRef(false)
  const ttsCancelledRef = useRef(false)

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
      return
    }

    ttsPlayingRef.current = true
    const { url, resolve, paraIndex } = ttsQueueRef.current.shift()

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

    // Split into paragraphs and queue them
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
    for (let pi = 0; pi < paragraphs.length; pi++) {
      if (ttsCancelledRef.current) break
      const url = await generateAudio(paragraphs[pi])
      if (ttsCancelledRef.current) {
        if (url) URL.revokeObjectURL(url)
        break
      }
      ttsQueueRef.current.push({ url, paraIndex: pi })
      if (!ttsPlayingRef.current) playNextInQueue()
    }
  }, [generateAudio, playNextInQueue])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    ttsCancelledRef.current = true
    ttsQueueRef.current = []
    ttsPlayingRef.current = false
    ttsParaCounterRef.current = 0
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setSpeakingIndex(-1)
    setSpeakingParaIndex(-1)
    setTtsStatus('')
  }, [])

  const sendMessage = async (text) => {
    const messageText = text || input
    if (!messageText.trim() || isLoading) return

    // Pre-unlock AudioContext on this user gesture so auto-read works after response
    if (autoRead) ensureAudioContext()

    // Stop any current speech when user sends a new message
    stopSpeaking()

    const userMessage = { role: 'user', content: messageText.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    const maxRetries = 2
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages }),
        })

        if (!res.ok) {
          if (attempt < maxRetries && res.status >= 500) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
            continue
          }
          setMessages([...newMessages, {
            role: 'assistant',
            content: 'Something went wrong reaching MIWO. Check the API key configuration.',
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

          // Auto-read: send completed paragraphs to TTS as they arrive
          if (autoRead) {
            const paragraphs = fullText.split(/\n\n+/)
            // All but the last paragraph are complete (last may still be streaming)
            const completeParagraphs = paragraphs.slice(0, -1)
            const completeText = completeParagraphs.join('\n\n')

            if (completeText.length > spokenUpTo) {
              const newText = fullText.substring(spokenUpTo, completeText.length)
              spokenUpTo = completeText.length
              queueParagraph(newText, newMessages.length, paraCounter)
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
      content: 'Connection error. Please check your internet and try again.',
    }])
    setIsLoading(false)
  }

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
    setInput(text)
    sendMessage(text)
  }

  const formatMessage = (text, isSpeakingMsg) => {
    return text.split('\n\n').map((para, i) => {
      const formatted = para.replace(
        /\*\*(.*?)\*\*/g,
        '<strong>$1</strong>'
      )
      const isActivePara = isSpeakingMsg && speakingParaIndex === i
      return (
        <p
          key={i}
          className={isActivePara ? 'speaking-paragraph' : ''}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
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
          onClick={() => { setMessages([]); localStorage.removeItem('miwo-messages') }}
          style={{ cursor: 'pointer' }}
          title="New conversation"
        />
        <div className="header-controls">
          <Link href="/sports" className="nav-link">{t('sport')}</Link>
          <Link href="/history" className="nav-link">{t('history')}</Link>
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
        </div>
      </header>

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

      {messages.length === 0 && !isLoading ? (
        <div className="welcome">
          <div className="welcome-hero">
            <img src={globeSrc} alt="" className="welcome-globe" />
            <div className="welcome-right">
              <img src="/miwo-brand.png" alt="MIWO" className="welcome-brand-img" />
              <p className="welcome-sub">
                {t('tagline')}
              </p>
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
          </div>
        </div>
      ) : (
        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.role === 'assistant' ? formatMessage(msg.content, speakingIndex === i) : msg.content}
              </div>
              {msg.role === 'assistant' && (
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
