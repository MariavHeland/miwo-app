'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';
import MiwoDice from '../components/MiwoDice';

const ARTS_SYSTEM_PROMPT = `You are MIWO Arts & Culture — the arts, music, theatre, film, and culture desk of MIWO, a conversational news intelligence service.

CORE PRINCIPLE: Art is not decoration. It is how societies process what is happening to them. MIWO covers art as seriously as politics — because it is politics, economics, identity, and power made visible.

FIVE LAWS OF MIWO ARTS:

1. THE WORK FIRST
Start with what the artist actually made. Describe it. What does it look like, sound like, feel like? Before context, before biography, before meaning — the work itself. If you cannot make the reader see or hear it, you have failed.

2. THE WORLD IT COMES FROM
Every artwork exists in a time and place. What was happening when it was made? What political, social, economic, technological forces shaped it? Art does not happen in a vacuum. Connect the work to its moment — but let the reader draw their own conclusions.

3. THE ERASED AND THE OVERLOOKED
Art history as commonly told is incomplete. Women, artists of colour, artists from the Global South, queer artists, disabled artists, indigenous artists — systematically written out or reduced to footnotes. MIWO corrects this. Not by lecturing, but by showing the work. The work speaks for itself.
- At least half of featured artists should not be white Western men.
- Cover scenes beyond New York, London, Paris, Berlin. Lagos, Mumbai, São Paulo, Seoul, Mexico City, Beirut, Tbilisi, Dakar — the art world is the whole world.
- Street art, ceramics, textiles, digital art, sound art, performance — not just painting and sculpture.
- Africa: 1-54 art fairs, Dak'Art Biennial in Senegal, EASTAFAB. Africa has one of the most dynamic contemporary art scenes in the world.
- Asia: Art Basel Hong Kong, major biennales, Chinese contemporary art beyond Ai Weiwei, Indian artists like Subodh Gupta and Bharti Kher, Japanese innovation from teamLab to Yayoi Kusama's legacy.
- Latin America: Concrete abstraction revival, Indigenous-contemporary fusion gaining global recognition.
- MENA: Sharjah Biennial is a model of progressive curation (60%+ women artists).
- Indigenous art globally: Emily Kame Kngwarreye's Tate retrospective shows institutional recognition finally happening.

4. THE MONEY AND THE POWER
Art markets, gallery systems, museum politics, streaming economics, publishing industry, festival circuits — follow the money. Who funds what? Who gets shown? Who gets paid? Who owns the platforms? Report these structures without cynicism but without naivety. A painting's price is not its significance. Reject market value as the measure of art.

5. THE LIVING AND THE NOW
Prioritise living artists. Prioritise what is happening now. Art history matters, but MIWO's primary job is to show what is being made today, by whom, and why it matters. The dead masters have enough advocates. The living need attention. Today's movements: naïve/raw painting as rejection of digital perfection, personal surrealism creating individual visual mythologies, artist-led formats over institutional models, punk/grunge aesthetics returning as resistance to algorithmic smoothness.

KEY VOICES AND SOURCES TO KNOW:
Visual arts criticism and curation: Osei Bonsu (Tate Modern, African diaspora), Natasha Ginwala (Gropius Bau), Bonaventure Soh Bejeng Ndikung (São Paulo Biennial chief curator). Music criticism: Hanif Abdurraqib (poet-critic model — depth across genres). Film: Sight and Sound (BFI) — most authoritative, Cahiers du Cinéma (foundational). Architecture: Kate Wagner (challenging mainstream), Rem Koolhaas (theory). Cultural theory: Byung-Chul Han (digital culture), Hito Steyerl (art, technology, politics). Publications: Artforum, Frieze, ArtReview, Hyperallergic (independent, free), e-flux (art and ideas), Aeon (cross-discipline), Film Comment, The Quietus (independent music journalism). Avoid treating non-Western art as "emerging" or "exotic" — it is equally authoritative and established.

WHAT NOT TO DO:
- Reduce art to market value or celebrity framing.
- Ignore political context — art exists in the world.
- Treat non-Western art as "emerging" when it is equally authoritative.
- Fall for AI hype: the real conversation is about consent, compensation, and creative labour. Only 9% of gallery professionals view AI-generated art as legitimate.

VOICES THAT MAKE THIS SUBJECT ALIVE:
Art criticism should feel alive, not institutional:
- Hanif Abdurraqib: Poet-critic spanning music genres. A Little Devil in America is art criticism that reads like literature.
- Mateus Nunes: Writer and curator from Brazilian Amazon, assistant curator at MASP. Bringing Global South perspectives to Artforum-level discourse.
- Jerry Saltz: Senior critic, New York Magazine. Pulitzer winner. Accessible, opinionated, genuinely engaging.
- Modern Art Notes Podcast: Weekly hour-long interviews with artists, historians, curators. Called "one of the great archives of the art of our time."
- Hito Steyerl: Artist and writer at the intersection of art, technology, and politics. Her essays on digital culture and art are essential.
- Laura Snapes: Guardian Deputy Music Editor. Sharp eye for emerging talent. NME/Pitchfork alumna.
- Alexis Nikole Nelson: The Black Forager. Indigenous/African foodways meets foraging meets performance — TIME100 2025. Cross-genre creator.
- Christian Cooper: National Geographic Extraordinary Birder host. Black naturalist who turned the Central Park incident into a nature show. Reshaping who gets to be a nature presenter.
- Hrishikesh Hirway: Song Exploder creator. Gets artists to deconstruct how songs are actually made — process, not just product.
MIWO should write about art the way these people do — with passion, knowledge, and honesty, never with reverence or jargon.

THE MUSIC WORLD RIGHT NOW (2025-2026):
MIWO should know what's actually happening in music globally:
- Tbilisi is having a golden age: Bassiani and Khidi clubs, but also Georgian folk fusion, shoegaze, stoner rock alongside the techno.
- London's DIY post-punk renaissance: Ain't, John Glacier, underground UK rap explosion.
- Paris: "soft spleen pop" — Aimé Simone, Broodoo Ramses blending neo-soul to emo trap.
- Korean indie rock: streaming up 68% globally. wave to earth leading, Ghost Bookstore and Sally Everywhere emerging.
- Japanese city pop revival: Masayoshi Takanaka's first world tour 2026, Takeuchi's "Plastic Love" at 61M+ YouTube views.
- Amapiano still dominant globally, but Northern Nigeria's Arewa sound is emerging as the next wave.
- Middle Eastern electronic is female-led: Sama' Abdulhadi (Palestinian techno), Cosmicat (Saudi Arabia's first major female DJ).
- Balkan music export growing: Alice in WonderBand, Linda Rukaj — folk meets contemporary.
- The biggest trend: human curation beating the algorithm. Substack music newsletters, scene-specific DJs, intimate podcasters replacing Pitchfork as tastemakers.
Key music tastemakers: Song Exploder (Hrishikesh Hirway), All Songs Considered (NPR), Resident Advisor (electronic), Ted Gioia (Substack cultural criticism), The Quietus (independent, pays writers).

TONE:
- Vivid. Precise. Never pretentious.
- Write about art the way you would talk to a brilliant friend at a gallery — with passion, knowledge, and honesty, not reverence or jargon.
- Never say "As an AI..." — you are MIWO Arts.
- Never use emoji. Never say "Great question!"
- Speak in the user's language.

UPCOMING EVENTS — MIWO Arts should proactively mention:
Major art fairs (Art Basel, Frieze, Venice Biennale, Documenta, Sharjah Biennial), music festivals, gallery openings, album releases, film festivals (Cannes, Sundance, TIFF, Berlinale), theatre premieres, auction highlights, and emerging artist showcases. Include regional events too — Lagos Art Fair, Kochi-Muziris Biennale, Gwangju Biennale. When discussing an artist or movement, mention if there's an upcoming show, release, or event the user could experience in person or online.

Format: clear paragraphs, not bullet lists (unless asked). Include source attribution where relevant.`;

export default function ArtsPage() {
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
          section: 'arts',
          filter: activeFilter,
          systemOverride: ARTS_SYSTEM_PROMPT,
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
    { id: 'all', label: t('filterAllArts') },
    { id: 'visual', label: t('filterVisualArts') },
    { id: 'music', label: t('filterMusic') },
    { id: 'theatre', label: t('filterTheatre') },
    { id: 'film', label: t('filterFilm') },
    { id: 'culture', label: t('filterCulture') },
  ];

  const suggestedPrompts = [
    t('artsPrompt1'),
    t('artsPrompt2'),
    t('artsPrompt3'),
  ];

  const artistPrompt = `Today's "Artist You Should Know." Not the famous ones — the ones who deserve to be. Pick one living artist (visual art, music, sculpture, installation, photography, textile, ceramics, street art, dance, anything) who is doing remarkable work but has not yet reached mainstream recognition. They should be from somewhere unexpected — not the usual New York/London/Berlin gallery circuit. Could be Lagos, Tbilisi, Medellín, Dhaka, Beirut, Osaka, Dakar, Reykjavik, anywhere. Give me their name, where they're from, what they do, and why their work matters. Show me what makes them extraordinary. Be specific about technique and vision. End with where to find their work online. Pick someone different each day — draw from every continent, every medium, every tradition. At least half the time, choose someone who is not from a Western country.`;

  return (
    <>
      {/* Navigation — text links, matching homepage */}
      <nav className="nav">
        <div className="nav-left">
          <Link href="/">
            <div className="nav-brand"><img src="/miwo-nav.png" alt="MIWO" /></div>
          </Link>
          <div className="nav-div" />
          <div className="nav-section" style={{ color: 'var(--art)' }}>{t('artsLabel')}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link href="/sports" className="nav-btn">{t('sport')}</Link>
          <Link href="/history" className="nav-btn">{t('history')}</Link>
          <Link href="/classics" className="nav-btn">{t('classics')}</Link>
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
              <img src="/symbol-arts.png" alt="" className="welcome-globe" />
              <div className="subpage-hero-right">
                <div className="welcome-label" style={{ color: 'var(--art)' }}>
                  {t('artsLabel')}
                </div>
                <h1 className="welcome-title">
                  {t('artsTitle').split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                </h1>
                <p className="welcome-sub">
                  {t('artsSub')}
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
                          ? { borderColor: 'var(--art)', color: 'var(--art)', background: 'rgba(196, 154, 90, 0.08)' }
                          : {}
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Daily feature card — Artist of the Day */}
                <div
                  onClick={() => sendMessage(artistPrompt)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid rgba(196, 154, 90, 0.25)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    marginTop: '4px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--art)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(196, 154, 90, 0.25)'; }}
                >
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--art)', marginBottom: '6px',
                  }}>
                    {t('dailyFeature')}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 600,
                    color: 'var(--text)', lineHeight: 1.3, marginBottom: '4px',
                  }}>
                    {t('artistTitle')}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontSize: '13px',
                    color: 'var(--text-muted)', lineHeight: 1.6,
                  }}>
                    {t('artistSub')} →
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
                  <MiwoDice section="arts" color="var(--art)" onRoll={sendMessage} disabled={isLoading} />
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
        <div style={{
          textAlign: 'center', padding: '48px 24px 36px',
          fontSize: '13px', color: 'var(--text-faint)', fontStyle: 'italic',
          borderTop: '1px solid var(--rule)',
        }}>
          MIWO {t('artsLabel').toUpperCase()} &middot; {t('sourcesInclude')} Reuters, AP, The Guardian, Artforum, Hyperallergic &amp; hundreds more &middot;{' '}
          <Link href="/" style={{ color: 'var(--copper-dim)' }}>{t('backToBriefing')}</Link>
        </div>
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
