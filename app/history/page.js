'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const sendMessage = async (text) => {
    const userMessage = text || input;
    if (!userMessage.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          section: 'history',
          filter: activeFilter,
        }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Something went wrong. Try again in a moment.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filters = [
    { id: 'all', label: 'All History' },
    { id: 'ancient', label: 'Ancient' },
    { id: 'medieval', label: 'Medieval' },
    { id: 'modern', label: 'Modern' },
    { id: 'onthisday', label: 'On This Day' },
    { id: 'myths', label: 'Myths & Legends' },
  ];

  const suggestedPrompts = [
    'What happened on this day in history?',
    'Tell me a fascinating story from ancient Rome',
    'Explain a turning point that shaped the modern world',
    'What\u2019s a common historical myth that\u2019s wrong?',
  ];

  const cowardPrompt = `Today's "Coward We Should Remember." History celebrates heroes endlessly. But cowardice — acts of moral failure, betrayal, capitulation, or craven self-interest by people in positions of power — shaped the world just as much. Tell me about one historical figure whose cowardice had significant consequences. Not a villain or a tyrant (they had conviction, however twisted). A coward: someone who knew what was right, had the power to act, and chose not to — or who betrayed others to save themselves. Give me their name, what they did (or failed to do), and why it mattered. Be specific, be fair, and don't soften it. End with a single sentence on what we should learn from their failure. Pick someone different each day — draw from any era, any civilisation. At least half the time, choose someone who is not a white man. Cowardice is universal — make sure your selections reflect that.`;

  return (
    <>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-left">
          <Link href="/">
            <div className="nav-brand">MIWO</div>
          </Link>
          <div className="nav-div" />
          <div className="nav-section" style={{ color: 'var(--history)' }}>History</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/sports">
            <button className="nav-btn" style={{ borderColor: 'var(--sport)', color: 'var(--sport)' }}>
              Sport
            </button>
          </Link>
          <Link href="/arts">
            <button className="nav-btn" style={{ borderColor: 'var(--art)', color: 'var(--art)' }}>
              Arts
            </button>
          </Link>
          <Link href="/cook">
            <button className="nav-btn" style={{ borderColor: 'var(--cooking)', color: 'var(--cooking)' }}>
              Cook
            </button>
          </Link>
          <Link href="/">
            <button className="nav-btn">
              Home
            </button>
          </Link>
        </div>
      </nav>

      {/* Section filters */}
      {messages.length === 0 && (
        <div style={{ paddingTop: '80px' }}>
          <div className="sport-nav">
            {filters.map((f) => (
              <button
                key={f.id}
                className={`sport-pill ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
                style={
                  activeFilter === f.id
                    ? { background: 'rgba(160, 136, 96, 0.1)', borderColor: 'var(--history)', color: 'var(--history)' }
                    : {}
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="chat-container" style={messages.length === 0 ? { paddingTop: '20px' } : {}}>
        {messages.length === 0 ? (
          <div className="welcome">
            <div className="welcome-label" style={{ color: 'var(--history)' }}>
              History
            </div>
            <h1 className="welcome-title">
              The past is<br />never dead.
            </h1>
            <p className="welcome-sub">
              From ancient civilisations to yesterday&rsquo;s turning points &mdash;
              the stories that shaped the world, told fresh each day.
            </p>
            {/* Daily feature: Cowards We Should Remember */}
            <div
              className="coward-card"
              onClick={() => sendMessage(cowardPrompt)}
              style={{
                background: 'var(--surface)',
                border: '1px solid rgba(160, 136, 96, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 28px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                maxWidth: '440px',
                marginTop: '28px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--history)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(160, 136, 96, 0.25)'; }}
            >
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--history)', marginBottom: '8px',
              }}>
                Daily Feature
              </div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600,
                color: 'var(--text)', lineHeight: 1.3, marginBottom: '8px',
              }}>
                Cowards We Should Remember
              </div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontSize: '14px',
                color: 'var(--text-muted)', lineHeight: 1.6,
              }}>
                History is full of heroes. It&rsquo;s also full of people who knew what was right,
                had the power to act, and chose not to. Today&rsquo;s story &rarr;
              </div>
            </div>

            <div className="prompt-pills">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="prompt-pill"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message message-${msg.role}`}>
                <div
                  className={`message-label`}
                  style={
                    msg.role === 'user'
                      ? { textAlign: 'right', color: 'var(--text-faint)' }
                      : { color: 'var(--history)' }
                  }
                >
                  {msg.role === 'assistant' ? 'MIWO HISTORY' : 'You'}
                </div>
                <div className="message-bubble">
                  {msg.role === 'assistant'
                    ? msg.content.split('\n\n').map((p, j) => <p key={j}>{p}</p>)
                    : msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message message-assistant">
                <div className="message-label" style={{ color: 'var(--history)' }}>MIWO HISTORY</div>
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat input */}
      <div className="chat-bar">
        <div className="chat-inner">
          <input
            className="chat-input"
            placeholder="Ask about any era, event, or figure in history..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            style={{ background: 'var(--history)' }}
          >
            &rarr;
          </button>
        </div>
      </div>
    </>
  );
}
