'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';

export default function HistoryPage() {
  const { t, lang } = useLang();
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
          lang,
          filter: activeFilter,
        }),
      });

      if (!res.ok) {
        let errorMsg = t('errorMessage');
        try { const errData = await res.json(); if (errData.message) errorMsg = errData.message; } catch {}
        setMessages([...newMessages, { role: 'assistant', content: errorMsg }]);
        setIsLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      setMessages([...newMessages, { role: 'assistant', content: '' }]);
      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: 'assistant', content: fullText }]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: t('errorMessage') },
      ]);
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
  ];

  const cowardPrompt = `Today's "Coward We Should Remember." History celebrates heroes endlessly. But cowardice — acts of moral failure, betrayal, capitulation, or craven self-interest by people in positions of power — shaped the world just as much. Tell me about one historical figure whose cowardice had significant consequences. Not a villain or a tyrant (they had conviction, however twisted). A coward: someone who knew what was right, had the power to act, and chose not to — or who betrayed others to save themselves. Give me their name, what they did (or failed to do), and why it mattered. Be specific, be fair, and don't soften it. End with a single sentence on what we should learn from their failure. Pick someone different each day — draw from any era, any civilisation. At least half the time, choose someone who is not a white man. Cowardice is universal — make sure your selections reflect that.`;

  return (
    <>
      {/* Navigation — text links, matching homepage */}
      <nav className="nav">
        <div className="nav-left">
          <Link href="/">
            <div className="nav-brand"><img src="/miwo-nav.png" alt="MIWO" /></div>
          </Link>
          <div className="nav-div" />
          <div className="nav-section" style={{ color: 'var(--history)' }}>{t('historyLabel')}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link href="/sports" className="nav-btn">{t('sport')}</Link>
          <Link href="/arts" className="nav-btn">{t('arts')}</Link>
          <Link href="/nature" className="nav-btn">{t('nature')}</Link>
          <Link href="/cook" className="nav-btn">{t('cook')}</Link>
          <LangPicker />
          <Link href="/" className="nav-btn">{t('home')}</Link>
        </div>
      </nav>

      {/* Chat area */}
      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="welcome">
            {/* Hero layout — globe + right column, like homepage */}
            <div className="subpage-hero">
              <img src="/globe.png" alt="" className="welcome-globe" />
              <div className="subpage-hero-right">
                <div className="welcome-label" style={{ color: 'var(--history)' }}>
                  {t('historyLabel')}
                </div>
                <h1 className="welcome-title">
                  {t('historyTitle').split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                </h1>
                <p className="welcome-sub">
                  {t('historySub')}
                </p>

                {/* Filters — compact, inline */}
                <div className="subpage-filters">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      className={`subpage-filter ${activeFilter === f.id ? 'active' : ''}`}
                      onClick={() => setActiveFilter(f.id)}
                      style={
                        activeFilter === f.id
                          ? { borderColor: 'var(--history)', color: 'var(--history)', background: 'rgba(160, 136, 96, 0.08)' }
                          : {}
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Daily feature card */}
                <div
                  onClick={() => sendMessage(cowardPrompt)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid rgba(160, 136, 96, 0.25)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    marginTop: '4px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--history)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(160, 136, 96, 0.25)'; }}
                >
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--history)', marginBottom: '6px',
                  }}>
                    {t('dailyFeature')}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 600,
                    color: 'var(--text)', lineHeight: 1.3, marginBottom: '4px',
                  }}>
                    {t('cowardsTitle')}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontSize: '13px',
                    color: 'var(--text-muted)', lineHeight: 1.6,
                  }}>
                    {t('cowardsSub')} →
                  </div>
                </div>

                {/* Stacked prompts — like homepage */}
                <div className="subpage-prompts">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      className="subpage-prompt"
                      onClick={() => sendMessage(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
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
                  {msg.role === 'assistant' ? `MIWO ${t('historyLabel').toUpperCase()}` : t('you')}
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
                <div className="message-label" style={{ color: 'var(--history)' }}>MIWO {t('historyLabel').toUpperCase()}</div>
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
            placeholder={t('historyPlaceholder')}
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
