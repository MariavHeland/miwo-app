'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

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
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState(-1)
  const [autoRead, setAutoRead] = useState(false)
  const [voiceName, setVoiceName] = useState('nova') // 'nova' or 'atlas'
  const [ttsStatus, setTtsStatus] = useState('') // '', 'generating', 'playing', 'quota'
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

  // Strip markdown for TTS
  const cleanTextForSpeech = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim()
  }

  // Fish Audio TTS — calls server-side /api/tts, returns mp3
  const speak = useCallback(async (text, index) => {
    try {
      setSpeakingIndex(index)
      setTtsStatus('generating')

      const cleanText = cleanTextForSpeech(text)

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, voice: voiceName }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'TTS failed' }))
        throw new Error(err.error || `TTS error ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)

      audio.onplay = () => setTtsStatus('playing')
      audio.onended = () => {
        setSpeakingIndex(-1)
        setTtsStatus('')
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => {
        setSpeakingIndex(-1)
        setTtsStatus('')
        URL.revokeObjectURL(url)
      }

      audioRef.current = audio
      await audio.play()
    } catch (err) {
      console.error('TTS error:', err)
      setSpeakingIndex(-1)
      setTtsStatus('')
    }
  }, [voiceName])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setSpeakingIndex(-1)
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

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await res.json()

      if (data.error) {
        setMessages([...newMessages, {
          role: 'assistant',
          content: 'Something went wrong reaching MIWO. Check the API key configuration.',
        }])
      } else {
        const assistantMsg = { role: 'assistant', content: data.text }
        const updatedMessages = [...newMessages, assistantMsg]
        setMessages(updatedMessages)

        // Auto-read the response if enabled
        if (autoRead && data.text) {
          // Small delay so the UI updates first
          setTimeout(() => {
            speak(data.text, updatedMessages.length - 1)
          }, 200)
        }
      }
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Connection error. Make sure the server is running.',
      }])
    } finally {
      setIsLoading(false)
    }
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

  const formatMessage = (text) => {
    return text.split('\n\n').map((para, i) => {
      const formatted = para.replace(
        /\*\*(.*?)\*\*/g,
        '<strong>$1</strong>'
      )
      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
    })
  }

  return (
    <div className="app">
      <header className="header">
        <img src="/miwo-logo.jpeg" alt="MIWO" className="header-logo" />
        <div className="header-controls">
          <Link href="/sports" className="nav-link">Sport</Link>
          <Link href="/history" className="nav-link">History</Link>
          <Link href="/arts" className="nav-link">Arts</Link>
          <Link href="/cook" className="nav-link">Cook</Link>
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
          <div className="voice-settings-label">Voice</div>
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
              <div className="welcome-brand">MIWO</div>
              <p className="welcome-sub">
                Your trusted news editor. Ask me what happened today,
                go deeper on any story, or verify a claim.
              </p>
              <div className="welcome-prompts">
                <button className="welcome-prompt" onClick={() => handlePromptClick('What happened today?')}>
                  What happened today?
                </button>
                <button className="welcome-prompt" onClick={() => handlePromptClick('Give me the global briefing')}>
                  Give me the global briefing
                </button>
                <button className="welcome-prompt" onClick={() => handlePromptClick('Was ist heute in Deutschland passiert?')}>
                  Was ist heute in Deutschland passiert?
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
                {msg.role === 'assistant' ? formatMessage(msg.content) : msg.content}
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
            placeholder={isListening ? 'Listening...' : 'Talk to MIWO...'}
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
