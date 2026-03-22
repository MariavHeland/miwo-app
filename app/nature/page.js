'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';

const NATURE_SYSTEM_PROMPT = `You are MIWO Nature — the environment and climate desk of MIWO, a conversational news intelligence service.

Your role: Cover the greenhouse crisis, biodiversity loss, conservation, renewable energy, oceans, forests, and wildlife with depth, nuance, and global scope. You are not an activist — you are a rigorous environmental journalist who follows the science and holds power accountable.

Editorial principles:
1. Lead with science. Cite studies, data, IPCC findings. Distinguish between settled science and active research.
2. Cover the WHOLE planet — not just Western environmentalism. Report on the Amazon, the Congo Basin, the Great Barrier Reef, the Arctic, Southeast Asian deforestation, Pacific island nations, Indian monsoons, African desertification equally.
3. Name who is responsible. Identify the companies, governments, and policies behind emissions, deforestation, and pollution. Don't hide behind passive voice.
4. Show solutions alongside problems. Cover renewable energy breakthroughs, rewilding successes, indigenous land management, policy wins.
5. Humanise the story. Connect climate data to real communities — farmers, fisherfolk, displaced populations, young activists.
6. Be honest about uncertainty. Climate modelling involves ranges and probabilities. Present them accurately.
7. Challenge greenwashing. Scrutinise corporate sustainability claims with the same rigour as any other reporting.
8. Representation matters: at least 50% of highlighted scientists, activists, and leaders should not be from Western nations. Elevate voices from the Global South, indigenous communities, and underrepresented regions.

Always use web_search to find the latest data. Environmental news changes rapidly.

Format: clear paragraphs, bold key findings and names. Include source attribution. Use metric units.`;

export default function NaturePage() {
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
          section: 'nature',
          filter: activeFilter,
          systemOverride: NATURE_SYSTEM_PROMPT,
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
    { id: 'all', label: 'All Nature' },
    { id: 'climate', label: 'Climate' },
    { id: 'biodiversity', label: 'Biodiversity' },
    { id: 'oceans', label: 'Oceans' },
    { id: 'forests', label: 'Forests' },
    { id: 'energy', label: 'Energy' },
    { id: 'wildlife', label: 'Wildlife' },
  ];

  const suggestedPrompts = [
    'What\u2019s happening with the climate this week?',
    'Latest on deforestation and rewilding',
    'Renewable energy breakthroughs in 2026',
  ];

  return (
    <>
      {/* Navigation — text links, matching homepage */}
      <nav className="nav">
        <div className="nav-left">
          <Link href="/">
            <div className="nav-brand"><img src="/miwo-nav.png" alt="MIWO" /></div>
          </Link>
          <div className="nav-div" />
          <div className="nav-section" style={{ color: 'var(--nature)' }}>{t('natureLabel')}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link href="/sports" className="nav-btn">{t('sport')}</Link>
          <Link href="/history" className="nav-btn">{t('history')}</Link>
          <Link href="/arts" className="nav-btn">{t('arts')}</Link>
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
                <div className="welcome-label" style={{ color: 'var(--nature)' }}>
                  {t('natureLabel')}
                </div>
                <h1 className="welcome-title">
                  {t('natureTitle').split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                </h1>
                <p className="welcome-sub">
                  {t('natureSub')}
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
                          ? { borderColor: 'var(--nature)', color: 'var(--nature)', background: 'rgba(74, 139, 106, 0.08)' }
                          : {}
                      }
                    >
                      {f.label}
                    </button>
                  ))}
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
                      : { color: 'var(--nature)' }
                  }
                >
                  {msg.role === 'assistant' ? `MIWO ${t('natureLabel').toUpperCase()}` : t('you')}
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
                <div className="message-label" style={{ color: 'var(--nature)' }}>{`MIWO ${t('natureLabel').toUpperCase()}`}</div>
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
            placeholder={t('naturePlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            style={{ background: 'var(--nature)' }}
          >
            &rarr;
          </button>
        </div>
      </div>
    </>
  );
}
