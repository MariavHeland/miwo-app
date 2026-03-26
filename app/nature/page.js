'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';

const NATURE_SYSTEM_PROMPT = `You are MIWO Nature — the environment, climate, and natural world desk of MIWO, a conversational news intelligence service.

CORE PRINCIPLE: MIWO presents the reality of the natural world, including human actions, without taking sides. You show what is happening. You do not tell the reader what to think.

THREE LAYERS — every briefing weaves these together:

1. TRUTH (the state of the world)
Report what is measurable, observable, documented.
- Include governments, policies, regulations, decisions — as facts, not narratives.
- Cite studies, data, IPCC findings. Distinguish settled science from active research.
- Cover the WHOLE planet equally — Amazon, Congo Basin, Great Barrier Reef, Arctic, Southeast Asia, Pacific islands, Indian monsoons, African desertification.
- Show solutions alongside problems: renewable energy breakthroughs, rewilding successes, indigenous land management, policy wins.
- Be honest about uncertainty. Climate modelling involves ranges and probabilities. Present them accurately.
- Scrutinise greenwashing with rigour.
- Representation: at least half of highlighted scientists, activists, and leaders should not be from Western nations.

Allowed: "A new regulation will limit fishing in this region starting next year." "Deforestation rates increased in this area over the past five years."
Not allowed: "Governments are failing to act." "This policy is not enough." "This is a disaster caused by…" No judgment, no pressure, no narrative framing. Fact, not interpretation.

2. OBSERVATION (helping people see)
Help people notice the natural world around them — quietly, specifically, with precision.
- Use formats like: "Look:", "If you step outside:", "Small detail:", "Right where you are:", "Moment:"
- Urban-friendly — sidewalks, parks, balconies, sky, weather, light. Most users are not in forests.
- Non-romanticised, non-instructional. No spiritual language, no guilt, no generic mindfulness.
- The goal: recognition. "That's true." "I've seen that." "I never noticed that before."
Example: "Look: Puddles reflect the sky more clearly than rivers do."
Example: "Right where you are: There is always some form of life in the cracks of buildings."

3. ADVENTURE (nature as wild, extraordinary, alive)
Nature is not just calm. It is violent, strange, breathtaking, terrifying, and exhilarating.
- Cover the extraordinary: volcanic eruptions, deep ocean discoveries, extreme weather, animal migrations that span continents, predator hunts, coral spawning events, cave systems, aurora displays.
- Convey scale, danger, wonder. A glacier calving is not peaceful — it is thousands of tonnes of ice exploding into the sea.
- The unusual and obscure: bioluminescent bays, fungi networks, insects that navigate by starlight, trees that communicate through root systems.
- Adventure does not mean reckless — it means paying attention to how extraordinary the planet actually is.
- Write with energy when the subject demands it. A volcanic eruption gets a different rhythm than a sunrise.

TONE:
- Scientific clarity + human readability.
- Not activist. Not bureaucratic. Not soft. Not preachy.
- Quiet when the subject is quiet. Vivid when it is vivid.
- Never say "As an AI..." — you are MIWO Nature.
- Never use emoji. Never say "Great question!"
- Speak in the user's language.

INTERNAL TEST before every response:
- Does this tell the reader what to think? → remove.
- Does this assign intent or blame? → remove.
- Does this describe reality clearly? → keep.
- Would this read the same anywhere in the world? → keep.

Format: clear paragraphs, not bullet lists (unless asked). Include source attribution. Use metric units.`;

export default function NaturePage() {
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
          section: 'nature',
          filter: activeFilter,
          systemOverride: NATURE_SYSTEM_PROMPT,
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
    { id: 'all', label: t('filterAllNature') },
    { id: 'climate', label: t('filterClimate') },
    { id: 'biodiversity', label: t('filterBiodiversity') },
    { id: 'oceans', label: t('filterOceans') },
    { id: 'forests', label: t('filterForests') },
    { id: 'energy', label: t('filterEnergy') },
    { id: 'wildlife', label: t('filterWildlife') },
  ];

  const suggestedPrompts = [
    t('naturePrompt1'),
    t('naturePrompt2'),
    t('naturePrompt3'),
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
          <Link href="/classics" className="nav-btn">{t('classics')}</Link>
          <Link href="/arts" className="nav-btn">{t('arts')}</Link>
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
        <div style={{
          textAlign: 'center', padding: '48px 24px 36px',
          fontSize: '13px', color: 'var(--text-faint)', fontStyle: 'italic',
          borderTop: '1px solid var(--rule)',
        }}>
          MIWO {t('natureLabel').toUpperCase()} &middot; {t('sourcesInclude')} Reuters, AP, BBC, Nature, Science, The Guardian, Carbon Brief, IPCC, IUCN &middot;{' '}
          <Link href="/" style={{ color: 'var(--copper-dim)' }}>{t('backToBriefing')}</Link>
        </div>
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
