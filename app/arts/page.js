'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';

export default function ArtsPage() {
  const { t } = useLang();
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
          section: 'arts',
          filter: activeFilter,
        }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: t('errorMessage') },
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
    { id: 'all', label: 'All Arts' },
    { id: 'visual', label: 'Visual Arts' },
    { id: 'music', label: 'Music' },
    { id: 'theatre', label: 'Theatre' },
    { id: 'film', label: 'Film' },
    { id: 'culture', label: 'Culture' },
  ];

  const suggestedPrompts = [
    'What\u2019s happening in the art world today?',
    'Any major exhibitions opening this week?',
    'Latest in music and live performance',
    'Cultural news from around the world',
  ];

  return (
    <>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-left">
          <Link href="/">
            <div className="nav-brand"><img src="/miwo-nav.png" alt="MIWO" /></div>
          </Link>
          <div className="nav-div" />
          <div className="nav-section" style={{ color: 'var(--art)' }}>{t('artsLabel')}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <LangPicker />
          <Link href="/sports">
            <button className="nav-btn" style={{ borderColor: 'var(--sport)', color: 'var(--sport)' }}>
              {t('sport')}
            </button>
          </Link>
          <Link href="/history">
            <button className="nav-btn" style={{ borderColor: 'var(--history)', color: 'var(--history)' }}>
              {t('history')}
            </button>
          </Link>
          <Link href="/nature">
            <button className="nav-btn" style={{ borderColor: 'var(--nature)', color: 'var(--nature)' }}>
              {t('nature')}
            </button>
          </Link>
          <Link href="/cook">
            <button className="nav-btn" style={{ borderColor: 'var(--cooking)', color: 'var(--cooking)' }}>
              {t('cook')}
            </button>
          </Link>
          <Link href="/">
            <button className="nav-btn">
              {t('home')}
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
                    ? { background: 'rgba(196, 154, 90, 0.1)', borderColor: 'var(--art)', color: 'var(--art)' }
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
            <div className="welcome-label" style={{ color: 'var(--art)' }}>
              {t('artsLabel')}
            </div>
            <h1 className="welcome-title">
              {t('artsTitle').split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
            </h1>
            <p className="welcome-sub">
              {t('artsSub')}
            </p>
            <div className="prompt-pills">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="prompt-pill"
                  onClick={() => sendMessage(prompt)}
                  style={{ '--hover-bg': 'rgba(196, 154, 90, 0.08)' }}
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
                  className={`message-label ${msg.role === 'assistant' ? 'miwo' : ''}`}
                  style={
                    msg.role === 'user'
                      ? { textAlign: 'right', color: 'var(--text-faint)' }
                      : { color: 'var(--art)' }
                  }
                >
                  {msg.role === 'assistant' ? `MIWO ${t('artsLabel').toUpperCase()}` : t('you')}
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
                <div className="message-label" style={{ color: 'var(--art)' }}>MIWO {t('artsLabel').toUpperCase()}</div>
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
            placeholder={t('artsPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            style={{ background: 'var(--art)' }}
          >
            &rarr;
          </button>
        </div>
      </div>
    </>
  );
}
