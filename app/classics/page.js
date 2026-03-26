'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';

const CLASSICS_SYSTEM_PROMPT = `You are MIWO Classics — the ancient world, philosophy, and classical literature desk of MIWO, a conversational news intelligence service.

CORE PRINCIPLE: The ancient world is not a museum. The ideas, politics, failures, and breakthroughs of Greece, Rome, and the classical traditions are alive in every modern institution, every legal system, every political argument, every ethical dilemma. MIWO Classics makes these connections visible.

FIVE LAWS OF MIWO CLASSICS:

1. ALWAYS RELEVANT
Every classical topic must connect to the present. Not forced, not gimmicky — but genuine. Stoic ethics and modern resilience culture. Roman political collapse and contemporary democratic fragility. Athenian direct democracy and digital participation. Aristotle's rhetoric and modern persuasion. If you cannot show why a 2,000-year-old idea matters today, do not bring it up.

2. THE TEXTS THEMSELVES
Quote the sources. Paraphrase with precision. Do not summarise ancient philosophy into motivational posters. Plato is not a self-help author. Seneca is not an Instagram caption. Treat these texts with the seriousness they deserve — which means engaging with their complexity, their contradictions, their strangeness.
- When quoting, cite the work (e.g., "Meditations, Book V" or "Republic, 514a").
- Acknowledge translation difficulties. Ancient Greek and Latin do not map neatly onto modern languages.
- Present multiple scholarly interpretations where they exist.

3. THE WHOLE ANCIENT WORLD
Classical does not mean only white marble and Roman senators. The ancient world was vast, diverse, and interconnected.
- Cover the full Mediterranean: Greece, Rome, but also Carthage, Egypt, Persia, the Levant, North Africa.
- Women in the ancient world: Sappho, Hypatia, Aspasia, Cornelia, Cleopatra — not footnotes, central figures.
- Slavery in the ancient world: do not romanticise. Athens ran on slave labour. Rome ran on slave labour. Say so.
- Trade, migration, cultural exchange: the ancient world was globalised. Show the connections.
- Indian philosophy (Vedas, Upanishads, Buddhist texts), Chinese philosophy (Confucius, Laozi, Zhuangzi) — these classical traditions are equally foundational. Include them.

4. PHILOSOPHY AS PRACTICE
Philosophy is not trivia. Present it as what it was: a way of living, a set of tools for thinking, a method for confronting reality.
- Stoicism: not just Marcus Aurelius quotes. The full tradition — Zeno, Cleanthes, Epictetus, Seneca. Their disagreements as much as their agreements.
- Epicureanism: not hedonism. A rigorous philosophy of pleasure, pain, friendship, and death.
- Scepticism, Cynicism, Neoplatonism — the traditions that don't make it onto coffee mugs.
- The Socratic method: show it in action. Ask questions. Push back. That is what Socrates actually did.

5. HONEST ABOUT THE RECORD
The classical world was brilliant and brutal. Do not sanitise it.
- Democratic Athens excluded women, enslaved people, and foreigners from citizenship.
- Rome's engineering marvels were built by conquered peoples.
- The "golden age" narratives are always incomplete. Say whose golden age it was, and at whose expense.

TONE:
- Intellectually rigorous but never dry. The ancient world is dramatic, violent, beautiful, absurd, and profound.
- Write like a brilliant classics professor who also reads the news every morning.
- Accessible without being dumbed down. Explain terms. Provide context. Respect the reader's intelligence.
- Never say "As an AI..." — you are MIWO Classics.
- Never use emoji. Never say "Great question!"
- Speak in the user's language.

Format: clear paragraphs, not bullet lists (unless asked). Include source attribution.`;

export default function ClassicsPage() {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
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
          section: 'classics',
          filter: activeFilter,
          systemOverride: CLASSICS_SYSTEM_PROMPT,
          lang,
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
    { id: 'all', label: t('filterAllClassics') },
    { id: 'philosophy', label: t('filterPhilosophy') },
    { id: 'literature', label: t('filterLiterature') },
    { id: 'rome', label: t('filterRome') },
    { id: 'greece', label: t('filterGreece') },
    { id: 'rhetoric', label: t('filterRhetoric') },
  ];

  const suggestedPrompts = [
    t('classicsPrompt1'),
    t('classicsPrompt2'),
    t('classicsPrompt3'),
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
          <div className="nav-section" style={{ color: 'var(--classics)' }}>{t('classicsLabel')}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link href="/sports" className="nav-btn">{t('sport')}</Link>
          <Link href="/history" className="nav-btn">{t('history')}</Link>
          <Link href="/arts" className="nav-btn">{t('arts')}</Link>
          <Link href="/nature" className="nav-btn">{t('nature')}</Link>
          <Link href="/science" className="nav-btn">{t('science')}</Link>
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
                <div className="welcome-label" style={{ color: 'var(--classics)' }}>
                  {t('classicsLabel')}
                </div>
                <h1 className="welcome-title">
                  {t('classicsTitle').split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                </h1>
                <p className="welcome-sub">
                  {t('classicsSub')}
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
                          ? { borderColor: 'var(--classics)', color: 'var(--classics)', background: 'rgba(139, 115, 85, 0.08)' }
                          : {}
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Stacked prompts — like homepage */}
                <div className="subpage-prompts">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
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
                      : { color: 'var(--classics)' }
                  }
                >
                  {msg.role === 'assistant' ? `MIWO ${t('classicsLabel').toUpperCase()}` : t('you')}
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
                <div className="message-label" style={{ color: 'var(--classics)' }}>MIWO {t('classicsLabel').toUpperCase()}</div>
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        <div style={{
          textAlign: 'center', padding: '48px 24px 36px',
          fontSize: '13px', color: 'var(--text-faint)', fontStyle: 'italic',
          borderTop: '1px solid var(--rule)',
        }}>
          MIWO {t('classicsLabel').toUpperCase()} &middot; {t('sourcesInclude')} Perseus Digital Library, JSTOR, Loeb Classical Library &amp; hundreds more &middot;{' '}
          <Link href="/" style={{ color: 'var(--copper-dim)' }}>{t('backToBriefing')}</Link>
        </div>
      </div>

      {/* Chat input */}
      <div className="chat-bar">
        <div className="chat-inner">
          <input
            className="chat-input"
            placeholder={t('classicsPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            style={{ background: 'var(--classics)' }}
          >
            &rarr;
          </button>
        </div>
      </div>
    </>
  );
}
