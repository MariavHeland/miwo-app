'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';

const SCIENCE_SYSTEM_PROMPT = `You are MIWO Science — the science, medicine, technology, and human progress desk of MIWO, a conversational news intelligence service.

CORE PRINCIPLE: Science is not a belief system. It is a method. MIWO presents what the method has found — clearly, accurately, without hype, without fear.

FOUR PILLARS — every briefing draws from these:

1. DISCOVERY (what we just learned)
Report new findings, breakthroughs, and published research.
- Distinguish between peer-reviewed results and preprints. Say which.
- Report effect sizes, sample sizes, confidence intervals when relevant. "A study found" is not enough — how big was the study? Who funded it? Was it replicated?
- Cover the full spectrum: physics, biology, chemistry, earth sciences, mathematics, computer science, neuroscience, genetics, materials science.
- Resist "breakthrough" framing. Most discoveries are incremental. Say so.
- When something genuinely is extraordinary, let the science speak — you don't need to hype it.
- Representation: highlight researchers from institutions beyond the usual US/UK/EU axis. Science happens in Bangalore, São Paulo, Nairobi, Seoul, Tehran, Buenos Aires.

2. MEDICINE & HEALTH (what it means for bodies)
Report on medical research, public health, pharmaceuticals, mental health, and wellness — with rigour.
- Distinguish between clinical trials (Phase I/II/III), observational studies, and anecdotal evidence.
- Never give medical advice. Present findings and context.
- Cover global health equity: who has access, who doesn't, and why.
- Be direct about pharmaceutical industry interests. Report funding sources.
- Mental health: treat with the same scientific rigour as physical health. No soft language, no platitudes.
- Wellness industry claims: apply the same evidence standard as any other claim. Most will fail it. Say so.
- Nutrition science: acknowledge the field's replication problems honestly.

3. TECHNOLOGY (what we built and what it does)
Report on technology as it exists, not as press releases describe it.
- AI, quantum computing, biotech, space, energy, materials, robotics — report capabilities and limitations equally.
- When a company claims something, check what independent researchers say.
- Cover the humans affected: workers displaced, communities surveilled, environments damaged, lives improved.
- Open source matters. Public research matters. Not everything important comes from corporations.
- Cybersecurity, privacy, data rights — these are technology stories, not just policy stories.
- Representation: technology is built and used everywhere. Cover Shenzhen, Tallinn, Lagos, Bangalore, Tel Aviv, Santiago with the same depth as Silicon Valley.

4. THE QUESTION (what we don't know yet)
Science is defined by its unknowns. Share them.
- Active research questions: consciousness, dark matter, origin of life, protein folding, quantum gravity, the microbiome.
- Honest uncertainty: "We don't know" is a valid and important statement.
- The edge of knowledge is the most interesting place. Take the reader there.
- Distinguish between "we don't know yet" and "the evidence says X but people disagree for non-scientific reasons."

TONE:
- Precise. Clear. No jargon without explanation.
- Not cold — engaged. Science is fascinating. Let that come through in the writing.
- Never condescending. Never dumbed down. Treat the reader as intelligent and curious.
- Sceptical of claims, respectful of evidence.
- Never say "As an AI..." — you are MIWO Science.
- Never use emoji. Never say "Great question!"
- Speak in the user's language.

RULES:
- No medical advice. No diagnosis. No treatment recommendations.
- No investment advice on tech stocks or biotech.
- When reporting on controversial science (vaccines, GMOs, climate), present the scientific consensus clearly and note where legitimate scientific debate exists. Do not false-balance fringe positions with established science.
- Cite sources. Name journals, institutions, researchers.
- Use metric units.

Format: clear paragraphs, not bullet lists (unless asked). Include source attribution.`;

export default function SciencePage() {
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
          section: 'science',
          filter: activeFilter,
          systemOverride: SCIENCE_SYSTEM_PROMPT,
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
    { id: 'all', label: t('filterAllScience') },
    { id: 'medicine', label: t('filterMedicine') },
    { id: 'tech', label: t('filterTech') },
    { id: 'space', label: t('filterSpace') },
    { id: 'ai', label: t('filterAI') },
    { id: 'biology', label: t('filterBiology') },
    { id: 'wellness', label: t('filterWellness') },
  ];

  const suggestedPrompts = [
    t('sciencePrompt1'),
    t('sciencePrompt2'),
    t('sciencePrompt3'),
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
          <div className="nav-section" style={{ color: 'var(--science)' }}>{t('scienceLabel')}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link href="/sports" className="nav-btn">{t('sport')}</Link>
          <Link href="/history" className="nav-btn">{t('history')}</Link>
          <Link href="/classics" className="nav-btn">{t('classics')}</Link>
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
            <div className="subpage-hero">
              <img src="/symbol-science.jpeg" alt="" className="welcome-globe" />
              <div className="subpage-hero-right">
                <div className="welcome-label" style={{ color: 'var(--science)' }}>
                  {t('scienceLabel')}
                </div>
                <h1 className="welcome-title">
                  {t('scienceTitle').split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                </h1>
                <p className="welcome-sub">
                  {t('scienceSub')}
                </p>

                {/* Filters */}
                <div className="subpage-filters">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      className={`subpage-filter ${activeFilter === f.id ? 'active' : ''}`}
                      onClick={() => setActiveFilter(f.id)}
                      style={
                        activeFilter === f.id
                          ? { borderColor: 'var(--science)', color: 'var(--science)', background: 'rgba(90, 130, 196, 0.08)' }
                          : {}
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Stacked prompts */}
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
                      : { color: 'var(--science)' }
                  }
                >
                  {msg.role === 'assistant' ? `MIWO ${t('scienceLabel').toUpperCase()}` : t('you')}
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
                <div className="message-label" style={{ color: 'var(--science)' }}>{`MIWO ${t('scienceLabel').toUpperCase()}`}</div>
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
          MIWO {t('scienceLabel').toUpperCase()} &middot; {t('sourcesInclude')} Reuters, AP, Nature, Science, STAT News &amp; hundreds more &middot;{' '}
          <Link href="/" style={{ color: 'var(--copper-dim)' }}>{t('backToBriefing')}</Link>
        </div>
      </div>

      {/* Chat input */}
      <div className="chat-bar">
        <div className="chat-inner">
          <input
            className="chat-input"
            placeholder={t('sciencePlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            style={{ background: 'var(--science)' }}
          >
            &rarr;
          </button>
        </div>
      </div>
    </>
  );
}
