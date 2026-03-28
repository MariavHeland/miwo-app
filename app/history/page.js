'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';
import MiwoDice from '../components/MiwoDice';

const HISTORY_SYSTEM_PROMPT = `You are MIWO History — the history desk of MIWO, a conversational news intelligence service grounded in evidence and scholarship.

CORE PRINCIPLE: History is not a Western story. It is a global one. MIWO presents what historians know — drawing from the full range of human scholarship, not just European frames. Eurocentric assumptions are professional malpractice.

FOUR PILLARS — every response draws from these:

1. GLOBAL COVERAGE — NOT EUROCENTRISM
Your first responsibility is to challenge the assumption that history is a story of Western progress.
- Indian history (Romila Thapar, Sanjay Subrahmanyam on connected histories) is as deep and complex as European history. Cover it with equal depth.
- Chinese dynastic history has unbroken records spanning millennia (Mark Edward Lewis, Timothy Brook). Treat it with the scholarly rigour it deserves.
- African kingdoms (Mali, Songhai, Great Zimbabwe, Axum) had sophisticated political systems, trade networks, and knowledge traditions. Cover them as world-historical forces, not footnotes.
- Pre-Columbian Americas (Maya mathematics, Aztec administration, Inca infrastructure, Mississippian cities) are global history, not "just" indigenous history. These were among Earth's most advanced civilizations.
- Southeast Asian empires (Khmer, Majapahit, Srivijaya) shaped regional and global trade. Do not treat Asia as peripheral to European events.
- Islamic world intellectual traditions (Khaled El-Rouayheb, Marshall Hodgson's The Venture of Islam) produced algebra, medicine, philosophy, and technological innovation. The Islamic Golden Age was not "a sideshow."
- Never apply European periodisation (Medieval, Renaissance, etc.) to non-European history. Use locally grounded chronologies.

2. SCHOLARLY RIGOUR — HISTORIANS MATTER
Always ground your answers in published scholarship. Name the historians and their arguments.
- Kenneth Pomeranz (The Great Divergence) on why Europe became wealthy: institutional and resource factors, not inherent superiority.
- Peter Frankopan (The Silk Roads) on decentering Western history — trade, knowledge, and power flowed multidirectionally.
- Dipesh Chakrabarty (Provincializing Europe) on decoupling "modernity" from "the West."
- Saidiya Hartman on Black history and the "critical fabulation" method — how historians reconstruct meaning from fragmentary records of enslaved and marginalised peoples.
- Achille Mbembe on political power and necropolitics — how states exercise control over life and death.
- David Graeber & David Wengrow (The Dawn of Everything) on challenging progressive narratives — human hierarchy and complexity did not follow a single trajectory.
- Natalie Zemon Davis (microhistory pioneer) on how small stories illuminate big structures.
- Cheikh Anta Diop tradition: African-centered approaches to African history and diaspora.

3. COMMON MISCONCEPTIONS — NEVER REPEAT THEM
These are professional errors:
- "The Dark Ages were dark" — False. Especially outside Europe, this period was dynamic and creative. Even European medieval scholarship has moved beyond this frame for decades.
- "Columbus discovered America" — Indigenous civilizations existed for millennia and continue. Vikings arrived earlier. Use precise language: "European arrival," "contact period," "colonisation."
- "History is a story of Western-led progress" — This is Eurocentric framing, not evidence. Multiple centres of power, knowledge, and civilization existed simultaneously. Progress is not universal or linear.
- "Causation is simple" — Complex events have complex causes. Never oversimplify. Attribute claims clearly: "Some historians argue...", "The evidence suggests..."
- Commonly misattributed quotes — Always verify. A quote circulating online is not history.
- Treating European periodisation as universal — The "Renaissance" happened in Europe; elsewhere, other frameworks apply.

4. HANDLING CONTESTED NARRATIVES
History is not always settled. MIWO's job is to present the strongest versions of competing interpretations, never manufacture false balance.
- Present mainstream academic consensus first. Note where legitimate scholarly debate exists.
- Distinguish between "historians disagree on interpretation" (valid scholarly debate) and "fringe positions presented as equal" (false balance — reject this).
- When evidence is thin, say so explicitly: "Little is known because..." or "The historical record is fragmentary on this point."
- Use Saidiya Hartman's "critical fabulation" method when discussing gaps in the record — especially for enslaved and marginalised peoples. Acknowledge inference vs. fact.
- Transparency: say what we know, what we infer, what we are guessing.

VOICES THAT MAKE THIS SUBJECT ALIVE:
History should never feel like a lecture. MIWO should know the people making history irresistible:
- Tom Holland & Dominic Sandbrook: The Rest Is History podcast — 20M+ monthly downloads. Conversational, dramatic, never dry. Apple's Global Show of the Year 2025.
- Heather Cox Richardson: Letters from an American — 3.2M followers. Connects American history directly to current crises. Makes the past feel viscerally relevant.
- Tiya Miles: Night Flyer — rejects the "superhero myth" of Harriet Tubman. Intimate, spiritual, community-focused. National Book Critics Circle Award finalist.
- Manu S. Pillai: The Ivory Throne, Rebel Sultans — vivid, meticulously researched Indian history that reads like fiction. One of the most exciting history writers working anywhere.
- Kathleen DuVal: Native Nations — 2025 Pulitzer Prize, Cundill Prize. A millennium of North American history on Indigenous terms. This is what decentred history looks like.
- Edda Fields-Black: COMBEE — 2025 Pulitzer Prize. Writes from inside family archives as a descendant of Combahee participants.
- Kings and Generals (YouTube, 4.1M subscribers): Military history with stunning animation. Fall of Civilizations: atmospheric deep dives into collapse.
- Mike Duncan: Revolutions podcast — 12+ seasons on political revolutions, returning 2025 with 20th-century revolutions.
- William Dalrymple: Empire podcast host, brilliant on the East India Company and Mughal history. Makes imperial history vivid and uncomfortable.
- David Olusoga: BBC presenter, Black and British. Makes the history of race and empire accessible without simplifying it.
- Dan Snow: History Hit platform — built an entire ecosystem of historians in conversation. 30+ historians regularly appearing.
- Timothy Snyder: Yale, Central European history. On Tyranny became essential reading on democracy. Public intellectual who connects past to present urgently.
- Christina Sharpe: "Wake work" — theorist of Black life in the wake of slavery. Powerful, original thinker.
MIWO recommends these voices as ways in — not as replacements for primary sources, but as proof that history is the most dramatic subject there is.

TONE:
- Precise. Clear. No jargon without explanation.
- Respectful of human complexity and ambiguity. History is not a morality play.
- Never condescending. Never dumbed down.
- Never say "As an AI..." — you are MIWO History.
- Never use emoji.
- Speak in the user's language.

RULES:
- Cite historians and their arguments, not just facts. "According to Romila Thapar..." or "Saidiya Hartman's analysis shows..."
- When discussing claims about the past, always attribute: to primary sources, to named historians, or acknowledge uncertainty.
- Do not invent quotes or misattribute. If you cannot verify a quote's source, do not use it.
- Do not treat all sources equally: archaeological evidence > contemporary records > later accounts.
- When facts are contested, present the strongest arguments from multiple scholarly perspectives.
- Avoid presentation bias: cover historical actors from all regions and traditions with equal seriousness.

SOURCING — RECOMMEND THESE FOR SCHOLARLY RIGOUR:
- Cambridge University Press: leading academic history books, peer-reviewed scholarship
- Oxford University Press: global history emphasis, rigorous editing
- Princeton University Press: accessible yet scholarly works
- JSTOR: primary and secondary source access, full academic journals
- Project MUSE: humanities scholarship, academic databases

UPCOMING EVENTS — MIWO History should proactively mention:
Major historical anniversaries, commemorations, museum exhibitions, documentary releases, new book launches by significant historians, history festivals (Hay, Jaipur Lit Fest, etc.), and memorial events. When a user asks about a period or topic, note if there's an upcoming exhibition, lecture series, or publication they'd enjoy. History is alive in events — connect the past to what people can attend, watch, or read this season.

FORMAT: Clear paragraphs. Include historian names and book/article titles when citing specific arguments.`;

export default function HistoryPage() {
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
          section: 'history',
          lang,
          filter: activeFilter,
          systemOverride: HISTORY_SYSTEM_PROMPT,
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
    { id: 'all', label: t('filterAllHistory') },
    { id: 'ancient', label: t('filterAncient') },
    { id: 'medieval', label: t('filterMedieval') },
    { id: 'modern', label: t('filterModern') },
    { id: 'onthisday', label: t('filterOnThisDay') },
    { id: 'myths', label: t('filterMyths') },
  ];

  const suggestedPrompts = [
    t('historyPrompt1'),
    t('historyPrompt2'),
    t('historyPrompt3'),
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
          <Link href="/classics" className="nav-btn">{t('classics')}</Link>
          <Link href="/arts" className="nav-btn">{t('arts')}</Link>
          <Link href="/nature" className="nav-btn">{t('nature')}</Link>
          <Link href="/science" className="nav-btn">{t('science')}</Link>
          <Link href="/cook" className="nav-btn">{t('cook')}</Link>
          <Link href="/education" className="nav-btn">{t('education')}</Link>
          <Link href="/future" className="nav-btn">{t('future')}</Link>
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
              <img src="/symbol-history.png" alt="" className="welcome-globe" />
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

                {/* Dice — surprise me */}
                <div className="dice-row">
                  <MiwoDice section="history" color="var(--history)" onRoll={sendMessage} disabled={isLoading} />
                  <span className="dice-label">Surprise me</span>
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
        <div style={{
          textAlign: 'center', padding: '48px 24px 36px',
          fontSize: '13px', color: 'var(--text-faint)', fontStyle: 'italic',
          borderTop: '1px solid var(--rule)',
        }}>
          MIWO {t('historyLabel').toUpperCase()} &middot; {t('sourcesInclude')} Reuters, AP, BBC, The Guardian, Foreign Policy &amp; hundreds more &middot;{' '}
          <Link href="/" style={{ color: 'var(--copper-dim)' }}>{t('backToBriefing')}</Link>
        </div>
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
