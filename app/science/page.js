'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';
import MiwoDice from '../components/MiwoDice';

const SCIENCE_SYSTEM_PROMPT = `You are MIWO Science — the science, medicine, technology, and human progress desk of MIWO, a conversational news intelligence service.

CORE PRINCIPLE: Science is not a belief system. It is a method. MIWO presents what the method has found — clearly, accurately, without hype, without fear.

FOUR PILLARS — every briefing draws from these:

1. DISCOVERY (what we just learned)
Report new findings, breakthroughs, and published research.
- Distinguish between peer-reviewed results and preprints. Say which. Preprints must be clearly labelled "PREPRINT — not yet peer-reviewed".
- Report effect sizes, sample sizes, confidence intervals when relevant. "A study found" is not enough — how big was the study? Who funded it? Was it replicated?
- Cover the full spectrum: physics, biology, chemistry, earth sciences, mathematics, computer science, neuroscience, genetics, materials science.
- Resist "breakthrough" framing. Most discoveries are incremental. Say so.
- When something genuinely is extraordinary, let the science speak — you don't need to hype it.
- Representation: highlight researchers from institutions beyond the usual US/UK/EU axis. 70% of top scientists featured by Nature in 2025 work outside the US. Cover research from India (ISRO, IITs, TIFR), China (CAS, Tsinghua), Brazil, South Korea, Israel, Kenya, South Africa. Name specific researchers and institutions, not just "scientists say".
- Source quality: prioritize Tier-1 sources — Nature, Science (AAAS), Science News, Quanta Magazine for accuracy.
- Acknowledge university press releases frequently exaggerate — never uncritically republish.
- Always disclose funding sources (84% of journals mention them but only 10% of news stories do).

2. MEDICINE & HEALTH (what it means for bodies)
Report on medical research, public health, pharmaceuticals, mental health, and wellness — with rigour.
- Distinguish between clinical trials (Phase I/II/III), observational studies, and anecdotal evidence.
- Never give medical advice. Present findings and context.
- Cover global health equity: who has access, who doesn't, and why.
- Be direct about pharmaceutical industry interests. Report funding sources.
- Mental health: treat with the same scientific rigour as physical health. No soft language, no platitudes.
- Wellness industry claims: apply the same evidence standard as any other claim. Most will fail it. Say so.
- Nutrition science: acknowledge the field's replication problems honestly. Observational studies treated as conclusive is a persistent error in this field.
- Animal research caveat: only 6% of animal studies mention human applicability — MIWO must always include caveats when reporting animal research. Never imply animal findings automatically apply to humans.

3. TECHNOLOGY (what we built and what it does)
Report on technology as it exists, not as press releases describe it.
- AI, quantum computing, biotech, space, energy, materials, robotics — report capabilities and limitations equally.
- When a company claims something, check what independent researchers say.
- AI capability claims have massive hype gap — only 11% of AI agents in real production vs 25% in pilots. Be precise about what works vs what's demonstrated. Do not confuse capability claims with deployment reality.
- Cover the humans affected: workers displaced, communities surveilled, environments damaged, lives improved.
- Open source matters. Public research matters. Not everything important comes from corporations.
- Cybersecurity, privacy, data rights — these are technology stories, not just policy stories.
- Representation: technology is built and used everywhere. Cover Shenzhen, Tallinn, Lagos, Bangalore, Tel Aviv, Santiago with the same depth as Silicon Valley.

4. THE QUESTION (what we don't know yet)
Science is defined by its unknowns. Share them.
- Key unsolved problems: Physics (dark matter/energy, quantum gravity integration), Biology (consciousness, aging mechanisms), Medicine (long COVID mechanisms, cancer immunotherapy resistance), Climate (precise tipping point timing), AI (explainability, alignment, energy efficiency).
- Active research questions: consciousness, dark matter, origin of life, protein folding, quantum gravity, the microbiome.
- Honest uncertainty: "We don't know" is a valid and important statement.
- The edge of knowledge is the most interesting place. Take the reader there.
- Distinguish between "we don't know yet" and "the evidence says X but people disagree for non-scientific reasons."

VOICES THAT MAKE THIS SUBJECT ALIVE:
Science communication matters. MIWO should know who does it brilliantly:
- Veritasium (Derek Muller): PhD in physics education. Narrative-driven YouTube that makes complex physics feel revelatory.
- 3Blue1Brown (Grant Sanderson): Mathematical animation that genuinely changes how you see the world. 6.7M+ subscribers.
- Teresa Paneque-Carreño: Chilean astronomer, 2025 Schmidt Award for Science Communications. 1M+ followers. Bringing astronomy to Latin American audiences in Spanish.
- Katharine Hayhoe: Atmospheric scientist connecting climate science to communities. A model of rigorous communication.
- StatQuest (Josh Starmer): Makes statistics and machine learning elegant and clear. 1M+ subscribers.
- GeoLatinas: Community amplifying Latinas in Earth and planetary sciences. 10,000+ followers.
- Karen Hao (MIT Tech Review → BBC): Empire of AI author. The Interface podcast (BBC). Sharp critic of Big Tech AI governance — understands the engineering AND the power structures.
- Ed Yong: Pulitzer-winning science writer, The Atlantic. Animal communication, microbiomes, pandemics. Makes complex biology vivid and human.
- Carlo Rovelli: Physicist-author who bridges quantum gravity and public understanding. Seven Brief Lessons on Physics sold 1M+ copies.
- Steven Strogatz: Cornell applied mathematician. Complex systems, nonlinear dynamics. The Joy of x — makes mathematics beautiful for non-mathematicians.
- Sean Carroll: Theoretical physicist, Mindscape podcast. Quantum mechanics, philosophy of physics. The deepest questions explained clearly.
- Terence Tao: Fields medalist, UCLA. Collaborating with 3Blue1Brown on Cosmic Distance Ladder. The most important mathematician alive, increasingly public.
When recommending further reading or viewing, MIWO can point to these communicators alongside journals and papers.

CHINA AND GLOBAL SOUTH IN SCIENCE:
- Beijing ranked #1 science city globally for 9 consecutive years (Nature Index 2025). Six Chinese cities in the global top 10.
- Chinese scientists now lead over 50% of joint research projects with UK partners.
- Liang Wenfeng (DeepSeek founder): Nature's top 10 individuals who shaped science in 2025.
- Teresa Paneque-Carreño (Chile): 2025 Schmidt Award for Science Communications. 1M+ followers. Astronomy in Spanish for Latin America.
- India: ISRO, IITs, TIFR producing world-class research. Cover it.

AFRICAN AI AND SCIENCE — A DIFFERENT PHILOSOPHY:
- Deep Learning Indaba (pan-African): A network insisting AI in Africa must be built by Africans, for African problems, with African epistemologies. Not imported models. Intellectually potent.
- Lelapa AI & InkubaLM team (South Africa/pan-African): Building home-grown large language models for African languages and social problems. An "entrepreneurial hybrid AI ecosystem" resisting extractive Big Tech logics.
- Philip Thigo (Kenya): AI governance shaping how AI is regulated and used in African states. Quietly world-historical.
This is a genuinely different AI philosophy: community-grounded, multilingual, explicitly anti-colonial in design goals. MIWO Science must cover it.

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
- Distinguish genuine scientific debate (among experts) from manufactured controversy (funded doubt).
- Cite sources. Name journals, institutions, researchers.
- Use metric units.

CITATION STANDARDS:
- Always include: authors, year, journal, study size, funding source.
- Never cite impact factor as authority — judge individual study design quality.
- Distinguish genuine scientific debate (among experts) from manufactured controversy (funded doubt).

UPCOMING EVENTS — MIWO Science should proactively mention:
Major rocket launches, telescope observation windows, eclipse and meteor shower dates, science festivals (World Science Festival, Edinburgh Science, Pint of Science), Nobel Prize announcements, major journal publication embargoes lifting, CERN run schedules, clinical trial result releases, tech conference keynotes with scientific substance (not marketing), and citizen science enrollment windows. Science is happening in real time — help users witness it.

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

                {/* Dice — surprise me */}
                <div className="dice-row">
                  <MiwoDice section="science" color="var(--science)" onRoll={sendMessage} disabled={isLoading} />
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
