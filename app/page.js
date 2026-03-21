'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

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

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState(-1)
  const [autoRead, setAutoRead] = useState(false)
  const [voiceMode, setVoiceMode] = useState('chatterbox') // 'browser' or 'chatterbox'
  const [voiceName, setVoiceName] = useState('maria') // 'maria' or 'johnny'
  const [ttsStatus, setTtsStatus] = useState('') // '', 'generating', 'playing'
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [chatterboxAvailable, setChatterboxAvailable] = useState(true)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)
  const audioRef = useRef(null)
  const audioCtxRef = useRef(null) // Persistent AudioContext for TTS playback

  // Debug helper — visible banner for diagnosing TTS issues
  const debugLog = useCallback((msg) => {
    console.log('[MIWO TTS]', msg)
    let el = document.getElementById('tts-debug')
    if (!el) {
      el = document.createElement('div')
      el.id = 'tts-debug'
      el.style.cssText = 'position:fixed;bottom:60px;left:10px;right:10px;background:#1a1a1a;color:#C47D5A;font-size:11px;padding:8px 12px;border-radius:6px;z-index:9999;max-height:120px;overflow-y:auto;font-family:monospace;border:1px solid #333;'
      document.body.appendChild(el)
    }
    el.innerHTML += msg + '<br>'
    el.scrollTop = el.scrollHeight
  }, [])

  // Unlock AudioContext on any user gesture so auto-read works later
  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    // Play silent buffer to fully unlock
    const buf = audioCtxRef.current.createBuffer(1, 1, 22050)
    const src = audioCtxRef.current.createBufferSource()
    src.buffer = buf
    src.connect(audioCtxRef.current.destination)
    src.start()
    return audioCtxRef.current
  }, [])

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  // Chatterbox is available via HuggingFace Space (public, free)
  useEffect(() => {
    setChatterboxAvailable(true)
  }, [])

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
      .replace(/\*\*(.*?)\*\*/g, '$1')  // remove bold markers
      .replace(/\*(.*?)\*/g, '$1')       // remove italic markers
      .replace(/#{1,6}\s/g, '')          // remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text only
      .replace(/\n{2,}/g, '. ')          // paragraph breaks → pauses
      .replace(/\n/g, ' ')
      .trim()
  }

  // Browser TTS
  const speakBrowser = useCallback((text, index) => {
    if (!synthRef.current) return

    // Stop any current speech
    synthRef.current.cancel()

    const cleanText = cleanTextForSpeech(text)
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 0.95
    utterance.pitch = 1.0

    // Try to pick a natural-sounding voice
    const voices = synthRef.current.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Samantha') || v.name.includes('Karen') ||
      v.name.includes('Google UK English Female') || v.name.includes('Microsoft Zira')
    ) || voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
      || voices.find(v => v.lang.startsWith('en'))

    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setSpeakingIndex(index)
    utterance.onend = () => setSpeakingIndex(-1)
    utterance.onerror = () => setSpeakingIndex(-1)

    synthRef.current.speak(utterance)
  }, [])

  // Chatterbox TTS via HuggingFace Space (runs in browser, no server needed)
  const speakChatterbox = useCallback(async (text, index) => {
    try {
      setSpeakingIndex(index)
      setTtsStatus('generating')
      debugLog('Starting Chatterbox TTS...')

      // Use persistent AudioContext (pre-unlocked on user gesture)
      const audioCtx = ensureAudioContext()
      debugLog('AudioContext state: ' + audioCtx.state)

      const cleanText = cleanTextForSpeech(text)
      const truncated = cleanText.substring(0, 300)
      debugLog('Text: ' + truncated.substring(0, 50) + '...')

      // Load Gradio client from CDN (npm package doesn't bundle for browser)
      debugLog('Loading Gradio client...')
      if (!window.__gradioClient) {
        const mod = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js')
        window.__gradioClient = mod
      }
      const { Client, handle_file } = window.__gradioClient
      debugLog('✓ Gradio loaded')

      // Voice reference files served from /voices/
      const voiceFiles = {
        maria: '/voices/Maria_MIWO.wav',
        johnny: '/voices/JOHNNY_MIWO.mp3',
      }
      const voiceUrl = window.location.origin + (voiceFiles[voiceName] || voiceFiles.maria)
      debugLog('Voice: ' + voiceName)

      debugLog('Connecting to Chatterbox Space...')
      const client = await Client.connect('ResembleAI/Chatterbox')
      debugLog('✓ Connected, calling predict...')

      const result = await client.predict('/generate_tts_audio', {
        text_input: truncated,
        audio_prompt_path_input: handle_file(voiceUrl),
        exaggeration_input: 0.15,
        temperature_input: 0.6,
        seed_num_input: 0,
        cfgw_input: 0.8,
        vad_trim_input: true,
      })
      debugLog('✓ Got result')

      // Result contains a file URL from the Space
      let audioUrl
      if (result.data && result.data[0] && result.data[0].url) {
        audioUrl = result.data[0].url
      } else if (result.data && typeof result.data[0] === 'string') {
        audioUrl = result.data[0]
      } else {
        throw new Error('Unexpected response format: ' + JSON.stringify(result.data).substring(0, 100))
      }

      // Fetch audio as ArrayBuffer and play through AudioContext
      debugLog('Fetching audio...')
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) throw new Error('Audio fetch failed: ' + audioResponse.status)
      const arrayBuffer = await audioResponse.arrayBuffer()
      debugLog('✓ Fetched ' + Math.round(arrayBuffer.byteLength / 1024) + 'KB')

      // Ensure AudioContext is running before decode
      if (audioCtx.state === 'suspended') {
        debugLog('Resuming suspended AudioContext...')
        await audioCtx.resume()
      }

      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      debugLog('✓ Decoded: ' + decodedBuffer.duration.toFixed(1) + 's')

      setTtsStatus('playing')
      const playSource = audioCtx.createBufferSource()
      playSource.buffer = decodedBuffer
      playSource.connect(audioCtx.destination)
      playSource.onended = () => {
        debugLog('✓ Playback finished')
        setSpeakingIndex(-1)
        setTtsStatus('')
      }
      playSource.start()
      audioRef.current = { pause: () => { playSource.stop(); setTtsStatus('') }, currentTime: 0 }
      debugLog('✓ Playing via AudioContext! (state: ' + audioCtx.state + ')')
    } catch (err) {
      debugLog('✗ Error: ' + err.message)
      console.error('Chatterbox TTS error:', err)
      setSpeakingIndex(-1)

      // Show user-friendly error toast
      if (err.message && err.message.includes('GPU quota')) {
        setTtsStatus('quota')
        setTimeout(() => setTtsStatus(''), 5000)
      } else {
        setTtsStatus('')
      }
    }
  }, [voiceName, debugLog, ensureAudioContext])

  // Speak a message — always use Chatterbox (no browser fallback)
  const speak = useCallback((text, index) => {
    speakChatterbox(text, index)
  }, [speakChatterbox])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setSpeakingIndex(-1)
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
          <span className="tagline">my world my news</span>
        </div>
      </header>

      {/* Voice picker — always visible */}
      <div className="voice-settings">
        <div className="voice-settings-row">
          <div className="voice-settings-label">Voice</div>
          <div className="voice-options">
            <button
              className={`voice-option ${voiceName === 'maria' ? 'active' : ''}`}
              onClick={() => setVoiceName('maria')}
            >
              Nova
            </button>
            <button
              className={`voice-option ${voiceName === 'johnny' ? 'active' : ''}`}
              onClick={() => setVoiceName('johnny')}
            >
              Atlas
            </button>
          </div>
        </div>
      </div>

      {messages.length === 0 && !isLoading ? (
        <div className="welcome">
          <img src="/miwo-logo.jpeg" alt="MIWO" className="welcome-logo-img" />
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
