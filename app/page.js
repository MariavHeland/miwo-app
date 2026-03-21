'use client'

import { useState, useRef, useEffect } from 'react'

// Microphone SVG icon
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

// Send arrow SVG icon
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

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

          // If final result, send it
          if (event.results[0].isFinal) {
            setIsListening(false)
            // Small delay to show the text before sending
            setTimeout(() => {
              sendMessage(transcript)
            }, 300)
          }
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onerror = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  const sendMessage = async (text) => {
    const messageText = text || input
    if (!messageText.trim() || isLoading) return

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
        setMessages([...newMessages, {
          role: 'assistant',
          content: data.text,
        }])
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

  // Format assistant messages with paragraphs
  const formatMessage = (text) => {
    return text.split('\n\n').map((para, i) => {
      // Bold text between **
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
        <span className="logo">MIWO</span>
        <span className="tagline">my world my news</span>
      </header>

      {messages.length === 0 && !isLoading ? (
        <div className="welcome">
          <div className="welcome-logo">MIWO</div>
          <p className="welcome-sub">
            Your trusted news editor. Ask me what happened today,
            go deeper on any story, or verify a claim.
          </p>
          <div className="welcome-prompts">
            <button
              className="welcome-prompt"
              onClick={() => handlePromptClick('What happened today?')}
            >
              What happened today?
            </button>
            <button
              className="welcome-prompt"
              onClick={() => handlePromptClick('Give me the global briefing')}
            >
              Give me the global briefing
            </button>
            <button
              className="welcome-prompt"
              onClick={() => handlePromptClick('Was ist heute in Deutschland passiert?')}
            >
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
