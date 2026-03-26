'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';

/* ═══════════════════════════════════════════════
   SPORTS EDITORIAL PERSONA
   ═══════════════════════════════════════════════ */
const SPORT_SYSTEM_PROMPT = `You are MIWO Sport — the sports desk of MIWO, a conversational news intelligence service. You are a senior sports editor who has watched every match, read every wire, and speaks with the authority of someone who understands sport at every level — from grassroots to global.

Voice: The same calm, precise, warm tone as MIWO's main desk, but with the energy of someone who genuinely loves sport. You can convey excitement through sharp writing, not through exclamation marks.

Tone rules:
- No filler words. No hedging. No "It's worth noting that..."
- No alarm. Even when the result is extraordinary, you are measured and clear.
- No opinions on who should win. You have strong opinions on what's significant, what's accurate, and what's a good story.
- Speak in the user's language. If they write in Spanish, respond in Spanish.
- Keep it tight. Default to 2-4 paragraphs. Go longer only when the user asks to go deeper.
- Use paragraph prose, not bullet lists, unless the user asks for a list.
- Always cite competitions, governing bodies, and institutions by their full name on first reference.
- When covering a match: score first, context second, significance third.

What you cover:
- Football (global — Premier League, La Liga, Serie A, Bundesliga, Champions League, international)
- Cricket (IPL, Test, ODI, T20 World Cup)
- American Football (NFL, college)
- Ice Hockey (NHL)
- Tennis (ATP, WTA, Grand Slams)
- Basketball (NBA, EuroLeague)
- Rugby (Six Nations, Rugby Championship, club)
- Formula 1 and motorsport
- Golf (PGA, European Tour, Majors)
- The unusual — the strange, brilliant, obscure sports that most people have never heard of. Falcon racing, cheese rolling, sepak takraw, hurling, buzkashi. You love these.

What you never do:
- Never say "As an AI..." — you are MIWO Sport. You have editorial judgment.
- Never use emoji.
- Never say "Great question!" or any filler praise.
- Never fabricate results, scores, or standings. If you're not certain of a score, say so.
- Never assume a home market. Cover all sports globally with equal seriousness.
- Never dismiss a sport as "minor." Every sport is someone's entire world.
- Representation matters. When highlighting athletes, coaches, and sports figures, at least half should be people who are not white men. Cover women's sport with the same depth and seriousness as men's. Seek out athletes from underrepresented regions and backgrounds. This is not tokenism — it is accuracy. Sport is global.

When the user asks "What's happening in sport?" deliver 5-7 of the most significant stories across sports, ordered by significance. Each gets 1-2 sentences. End with: "Want to go deeper on any of these?"

Always cite sources by name. Always distinguish confirmed results from projections or analysis.`;

/* ═══════════════════════════════════════════════
   STORY DATA
   ═══════════════════════════════════════════════ */
const STORIES = [
  {
    sport: 'football', label: 'Football',
    meta: 'UEFA Champions League \u00b7 Quarter-Final Draw',
    headline: 'Real Madrid draw Bayern Munich as Champions League quarter-finals take shape',
    lede: 'The Champions League quarter-final draw has produced a heavyweight clash: Real Madrid against Bayern Munich. Paris Saint-Germain face Liverpool in the other standout tie. First legs are scheduled for April 7\u20138.',
    detail: 'Real Madrid reached this stage after dismantling Manchester City 5\u20131 on aggregate, with Vin\u00edcius J\u00fanior scoring in both legs. Barcelona put seven past Newcastle across two legs. Atl\u00e9tico Madrid defeated Tottenham Hotspur 5\u20132 over the two matches. The draw sets up what could be the tie of the round: two clubs with a combined eighteen European Cups meeting for the first time since the 2024 semi-final.',
    aside: 'Worth knowing: Real Madrid and Bayern Munich have played each other more often in European competition than any other pairing. The history between these two clubs is essentially the history of the tournament itself.',
  },
  {
    sport: 'cricket', label: 'Cricket',
    meta: 'IPL 2026 \u00b7 Season Preview',
    headline: 'IPL 2026 begins this week: Royal Challengers Bengaluru host Sunrisers Hyderabad in the opener',
    lede: 'The eighteenth edition of the Indian Premier League starts on March 28. Ten teams, eighty-four matches, running through to the end of May. The tournament opens with Royal Challengers Bengaluru hosting Sunrisers Hyderabad.',
    detail: 'KKR have been dealt an early blow: their premier fast bowler Harshit Rana has been ruled out. On the brighter side, 19-year-old Angkrish Raghuvanshi announced himself with a 55-ball century in KKR\'s first practice match. The IPL remains the richest cricket league in the world and, increasingly, the tournament where international careers are made or broken.',
    aside: 'If you\'re new to IPL: think of it as the English Premier League of cricket. City-based franchises, the best players from every country, and more money in play than most international series. The format is T20 \u2014 twenty overs per side, roughly three hours per match.',
  },
  {
    sport: 'nfl', label: 'American Football',
    meta: 'NFL Free Agency \u00b7 March 2026',
    headline: 'Vikings sign Kyler Murray as NFL free agency reshapes the quarterback market',
    lede: 'The Minnesota Vikings have signed quarterback Kyler Murray to a one-year deal. He\'s expected to compete with J.J. McCarthy for the starting role. It\'s one of several seismic moves in unusually volatile free agency.',
    detail: 'Elsewhere: the Los Angeles Rams acquired All-Pro cornerback Trent McDuffie from the Kansas City Chiefs. The Denver Broncos brought in Jaylen Waddle from the Miami Dolphins. The Pittsburgh Steelers gave wide receiver Michael Pittman Jr. a three-year, $59 million contract. All eyes now turn to the NFL Draft, April 23\u201325 in Pittsburgh.',
    aside: 'For those outside the United States: the NFL off-season is, in many ways, more dramatic than the season itself. Free agency is a market in real time \u2014 players changing teams, fortunes shifting overnight. The Draft in April is where the next generation enters.',
  },
  {
    sport: 'hockey', label: 'Ice Hockey',
    meta: 'NHL \u00b7 Playoff Race',
    headline: 'Colorado Avalanche clinch first playoff spot and become first team to 100 points',
    lede: 'The Colorado Avalanche became the first team in the NHL to clinch a playoff berth on March 20, and the first to reach 100 points this season.',
    detail: 'The Columbus Blue Jackets have been the surprise story of the second half, going 17\u20132\u20134 under new coach Rick Bowness. The New York Islanders have dropped below the playoff line. In the Western Conference, the Dallas Stars sit four points behind the Central Division leaders.',
    aside: 'Ice hockey\'s trade deadline is one of the most compelling days in North American sport. Contenders load up for the playoffs; rebuilding teams sell for future assets. The Capitals moving Carlson signals a full rebuild for a franchise that won the Stanley Cup just eight years ago.',
  },
  {
    sport: 'tennis', label: 'Tennis',
    meta: 'ATP & WTA \u00b7 Indian Wells & Miami Open',
    headline: 'Sinner takes Indian Wells; Miami Open underway with Alcaraz and Sabalenka as top draws',
    lede: 'Jannik Sinner won the BNP Paribas Open at Indian Wells, defeating Daniil Medvedev 7\u20136, 7\u20136 in a match decided entirely by tiebreaks. On the women\'s side, Aryna Sabalenka took the title.',
    detail: 'Sinner\'s win in the Californian desert consolidates his position at the top of the ATP rankings. The Italian has now won three of the last five Masters 1000 events. The Miami Open runs through March 29 at Hard Rock Stadium \u2014 the combined men\'s and women\'s draw makes it one of the most watched events outside the Grand Slams.',
    aside: 'Indian Wells and Miami are known collectively as the \u201cSunshine Double.\u201d Winning both in the same year is rare \u2014 only Djokovic, Federer and a handful of others have managed it. Sinner will be trying.',
  },
  {
    sport: 'basketball', label: 'Basketball',
    meta: 'NBA \u00b7 Playoff Race',
    headline: 'Detroit Pistons lead the East at 51\u201319 despite losing Cade Cunningham to collapsed lung',
    lede: 'The story of the NBA season: Detroit, once the league\'s worst team, sits atop the Eastern Conference at 51\u201319, having clinched a playoff spot. They\'ve done it despite losing franchise cornerstone Cade Cunningham to a collapsed lung.',
    detail: 'Boston (47\u201323) are on a four-game winning streak and occupy second in the East. New York sit third at 46\u201325. The Oklahoma City Thunder lead the West at 52\u201318 with the league\'s best net rating. The Cavaliers added James Harden before the deadline.',
    aside: 'Detroit\'s rise is one of the great turnaround stories in recent NBA history. Two seasons ago they won eighteen games all year. Now they\'ve won fifty-one with weeks still to play. The Cunningham injury makes it more remarkable, not less.',
  },
  {
    sport: 'rugby', label: 'Rugby',
    meta: 'Six Nations \u00b7 Final Results',
    headline: 'France win back-to-back Six Nations titles after 48\u201346 thriller against England',
    lede: 'France retained the Six Nations championship on March 14, beating England 48\u201346. Thomas Ramos kicked the winning penalty. Ireland won the Triple Crown but finished second.',
    detail: 'Hollie Davidson became the first woman to referee a men\'s Six Nations match. Italy beat England for the first time, ending a 32-game losing streak against them. Wales broke a sixteen-match winless run. The 94-point total in the France\u2013England match was the highest in Six Nations history.',
    aside: 'A 48\u201346 scoreline in international rugby would have been unthinkable twenty years ago. The game has changed: faster, more attacking, less willing to settle for a grinding win.',
  },
  {
    sport: 'f1', label: 'Formula 1',
    meta: '2026 Season \u00b7 Opening Rounds',
    headline: 'F1 2026 season underway: Australian GP opens the calendar, Japanese GP next weekend',
    lede: 'The 2026 Formula 1 season opened at the Australian Grand Prix on March 6\u20138, followed by the Chinese Grand Prix. The Japanese Grand Prix at Suzuka takes place March 27\u201329.',
    detail: 'The 2026 regulations represent a significant shift: new engine rules, revised aerodynamic packages, and a continued push toward sustainability. The season features 22 rounds \u2014 down from 24 after the cancellation of the Bahrain and Saudi Arabian races.',
    aside: 'The cancellation of the Bahrain and Saudi Arabian races is noteworthy. Formula 1 expanded aggressively into the Gulf in the 2020s, often drawing criticism about sportswashing. Whether these cancellations signal a strategic retreat or a scheduling adjustment is worth watching.',
  },
  {
    sport: 'golf', label: 'Golf',
    meta: 'PGA Tour \u00b7 March Schedule',
    headline: 'Valspar Championship this weekend; the Masters three weeks away',
    lede: 'The PGA Tour is at the Valspar Championship at Innisbrook Resort this weekend. The first major of the year \u2014 the Masters at Augusta National \u2014 is three weeks away, April 9\u201312.',
    detail: 'The 2026 major championship calendar: the Masters (April 9\u201312, Augusta National), the PGA Championship (May 14\u201317, Aronimink Golf Club), the US Open (June 18\u201321, Shinnecock Hills), and the Open Championship (July 16\u201319, Royal Birkdale).',
    aside: 'Shinnecock Hills for the US Open is a statement. It\'s one of the original five founding clubs of the USGA, and it has a complicated history \u2014 including a long-disputed connection to the Shinnecock Indian Nation whose land it sits on.',
  },
];

const ODD_SPORTS = [
  { emoji: '\uD83E\uDD85', region: 'UAE \u00b7 Saudi Arabia \u00b7 Qatar', title: 'Falcon Racing', text: 'Nine championship events this season. Saudi Arabia\'s King Abdulaziz Festival drew nine countries, prizes worth over 38 million riyals.', detail: 'A multi-billion-dollar industry. Falcons fly at speeds exceeding 240 km/h. The birds have passports. Some are worth more than luxury cars. UNESCO Intangible Cultural Heritage since 2010.' },
  { emoji: '\uD83E\uDDC0', region: 'Gloucestershire, England', title: 'Cheese Rolling', text: 'Cooper\'s Hill returns May 25, 2026. Chase a wheel of Double Gloucester down a 1:2 gradient slope. At least 600 years old.', detail: 'The cheese reaches 70 mph. The humans reach the bottom mostly by falling. No registration, no qualification, no insurance. Completely unorganised, completely ungovernable, completely brilliant.' },
  { emoji: '\uD83C\uDFC7', region: 'Kazakhstan \u00b7 Central Asia', title: 'Buzkashi', text: 'International tournament in Turkistan, March 15\u201321 \u2014 first in nine years. Nine nations competed, including Afghanistan and Mongolia.', detail: 'Played on horseback. The objective: grab a goat or calf carcass and carry it to a scoring area while dozens of other riders try to take it from you. Extraordinarily violent, extraordinarily skilled.' },
  { emoji: '\uD83D\uDC6B', region: 'Sonkaj\u00e4rvi, Finland', title: 'Wife Carrying', text: '2025 world championship won by the Roeslers from Wisconsin \u2014 first non-European couple since 1992. New record: 1:01.17.', detail: 'The course is 253.5 metres. The \u201cwife\u201d must weigh at least 49 kg. The prize is the wife\'s weight in beer. 2026 championship: July 3\u20134. Two hundred competitors from eighteen countries.' },
  { emoji: '\uD83E\uDD3F', region: 'Llanwrtyd Wells, Wales', title: 'Bog Snorkelling', text: 'World championship: August 30, 2026. Navigate a 120-yard trench using only snorkel and flippers \u2014 no conventional swimming strokes.', detail: 'Claimed to be the smallest town in Britain. The water is opaque, freezing, and smells of peat. Competitors wear fancy dress. Running since 1988.' },
  { emoji: '\uD83C\uDFD1', region: 'Ireland', title: 'Hurling', text: 'Allianz National League in final rounds. Cork are reigning champions. St Kieran\'s won a record 26th Croke Cup on St Patrick\'s Day.', detail: 'A 3,000-year-old game. The sliotar travels at up to 150 km/h. Entirely amateur: every player has a day job. If you have never watched hurling, find a way.' },
  { emoji: '\uD83E\uDD4B', region: 'Southeast Asia \u00b7 India', title: 'Sepak Takraw', text: 'India\'s men\'s team won first-ever gold at the ISTAF World Cup in 2025, defeating Japan in the final.', detail: 'Volleyball but you can only use feet, knees, chest, and head. The acrobatics \u2014 bicycle kicks over a net at head height \u2014 are staggering. Growing rapidly in South Asia.' },
  { emoji: '\uD83D\uDC1D', region: 'Oxfordshire, England', title: 'World Poohsticks Championship', text: '43rd annual championship: May 24, 2026 at Sandford Lock. Yes, from Winnie-the-Pooh. Yes, it has a world championship.', detail: 'Drop a stick from one side of a bridge, rush to the other side, see whose appears first. Invented by A.A. Milne in 1928. By some distance, the most charming sporting event on earth.' },
];

const SPORT_FILTER_KEYS = [
  { key: 'all', i18nKey: 'filterAll' },
  { key: 'football', i18nKey: 'filterFootball' },
  { key: 'cricket', i18nKey: 'filterCricket' },
  { key: 'nfl', i18nKey: 'filterAmericanFootball' },
  { key: 'hockey', i18nKey: 'filterHockey' },
  { key: 'tennis', i18nKey: 'filterTennis' },
  { key: 'basketball', i18nKey: 'filterBasketball' },
  { key: 'rugby', i18nKey: 'filterRugby' },
  { key: 'f1', i18nKey: 'filterF1' },
  { key: 'golf', i18nKey: 'filterGolf' },
  { key: 'odd', i18nKey: 'filterUnusual' },
];

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
const LANG_LOCALE_MAP = { en: 'en-GB', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', ar: 'ar-EG' };

export default function SportsPage() {
  const { t, lang } = useLang();
  const [view, setView] = useState('feed');
  const [activeSport, setActiveSport] = useState('all');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [expandedOdd, setExpandedOdd] = useState(new Set());

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const locale = LANG_LOCALE_MAP[lang] || 'en-GB';
  const today = new Date().toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  /* ── Chat ── */
  const sendMessage = useCallback(async (text) => {
    const userMessage = text || input;
    if (!userMessage.trim() || isLoading) return;

    if (view === 'feed') setView('chat');

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
          systemOverride: SPORT_SYSTEM_PROMPT,
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
  }, [input, isLoading, messages, view]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Card toggles ── */
  const toggleCard = (idx) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleOdd = (idx) => {
    setExpandedOdd((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const askAbout = (headline) => {
    sendMessage(t('askMiwoAbout') + ' ' + headline);
  };

  /* ── Filtering ── */
  const filteredStories = activeSport === 'all' || activeSport === 'odd'
    ? STORIES : STORIES.filter((s) => s.sport === activeSport);
  const showOdd = activeSport === 'all' || activeSport === 'odd';
  const sportColor = (sport) => 'var(--' + sport + ')';

  /* ── Render grouped stories ── */
  const renderGrouped = () => {
    const sports = [...new Set(filteredStories.map((s) => s.sport))];
    return sports.map((sport) => {
      const group = filteredStories.filter((s) => s.sport === sport);
      return (
        <div key={sport} className="story-section">
          <div className="story-section-tag" style={{ color: sportColor(sport) }}>
            {group[0].label}
          </div>
          {group.map((story) => {
            const idx = STORIES.indexOf(story);
            const open = expandedCards.has(idx);
            return (
              <div key={idx} className="story-card" onClick={() => toggleCard(idx)}>
                <div className="story-meta">{story.meta}</div>
                <div className="story-headline">{story.headline}</div>
                {open ? (
                  <>
                    <div className="story-lede" style={{ display: 'block' }}>{story.lede}</div>
                    <div className="story-detail" style={{ display: 'block' }}>{story.detail}</div>
                    <div className="story-aside" style={{ display: 'block' }}>{story.aside}</div>
                    <button className="story-ask" onClick={(e) => { e.stopPropagation(); askAbout(story.headline); }}>
                      {t('askMiwoAbout')} &rarr;
                    </button>
                  </>
                ) : (
                  <div style={{ fontSize: '13px', color: sportColor(story.sport), marginTop: '10px' }}>
                    {t('readMore')} &darr;
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <>
      {/* ── Navigation — text links, matching homepage ── */}
      <nav className="nav">
        <div className="nav-left">
          <Link href="/"><div className="nav-brand"><img src="/miwo-nav.png" alt="MIWO" /></div></Link>
          <div className="nav-div" />
          <div className="nav-section" style={{ color: 'var(--sport)' }}>{t('sportLabel')}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {view === 'chat' ? (
            <button className="nav-btn" style={{ color: 'var(--sport)' }} onClick={() => setView('feed')}>
              {t('stories')}
            </button>
          ) : (
            <button className="nav-btn" style={{ color: 'var(--sport)' }} onClick={() => setView('chat')}>
              {t('askMiwo')}
            </button>
          )}
          <Link href="/history" className="nav-btn">{t('history')}</Link>
          <Link href="/arts" className="nav-btn">{t('arts')}</Link>
          <Link href="/nature" className="nav-btn">{t('nature')}</Link>
          <Link href="/cook" className="nav-btn">{t('cook')}</Link>
          <LangPicker />
          <Link href="/" className="nav-btn">{t('home')}</Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
           VIEW: STORY FEED
         ═══════════════════════════════════════ */}
      {view === 'feed' && (
        <>
          {/* Hero */}
          <section style={{
            padding: '130px 48px 40px', textAlign: 'center', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '100%', height: '100%',
              background: 'radial-gradient(ellipse 650px 500px at 50% 40%, rgba(90,139,106,0.07) 0%, rgba(90,139,106,0.03) 40%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            <div className="welcome-label" style={{ color: 'var(--sport)' }}>
              {t('sportLabel')} &middot; {today}
            </div>
            <h1 className="welcome-title">{t('sportTitle')}</h1>
            <p className="welcome-sub">
              {t('sportSub')}
            </p>
          </section>

          {/* Sport filter pills */}
          <div className="sport-nav">
            {SPORT_FILTER_KEYS.map(({ key, i18nKey }) => (
              <button
                key={key}
                className={'sport-pill' + (activeSport === key ? ' active' : '')}
                onClick={() => setActiveSport(key)}
              >
                {t(i18nKey)}
              </button>
            ))}
          </div>

          {/* Story feed */}
          <div className="stories-feed">
            {renderGrouped()}

            {/* The Unusual */}
            {showOdd && (
              <div className="story-section">
                <div className="story-section-tag" style={{ color: 'var(--odd)' }}>
                  {t('theUnusual')}
                </div>
                <p style={{
                  fontSize: '15px', color: 'var(--text-secondary)',
                  lineHeight: '1.7', marginBottom: '24px',
                }}>
                  {t('unusualIntro')}
                </p>
                <div className="odd-grid">
                  {ODD_SPORTS.map((odd, i) => (
                    <div key={i} className="odd-card" onClick={() => toggleOdd(i)}>
                      <div className="odd-emoji">{odd.emoji}</div>
                      <div className="odd-region" style={{ color: 'var(--odd)' }}>{odd.region}</div>
                      <div className="odd-title">{odd.title}</div>
                      <div className="odd-text">{odd.text}</div>
                      {expandedOdd.has(i) && (
                        <div style={{
                          marginTop: '10px', fontSize: '13px',
                          lineHeight: '1.7', color: 'var(--text-muted)',
                        }}>
                          {odd.detail}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{
              textAlign: 'center', padding: '48px 24px 36px',
              fontSize: '13px', color: 'var(--text-faint)', fontStyle: 'italic',
              borderTop: '1px solid var(--rule)',
            }}>
              MIWO {t('sportLabel').toUpperCase()} &middot; Sources include Reuters, AP, ESPN, BBC Sport, The Athletic, ICC, NFL, NHL, ATP, WTA, PGA Tour, F1, World Rugby &middot;{' '}
              <Link href="/" style={{ color: 'var(--copper-dim)' }}>{t('backToBriefing')}</Link>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════
           VIEW: SPORTS CHAT
         ═══════════════════════════════════════ */}
      {view === 'chat' && (
        <div className="chat-container">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-label" style={{ color: 'var(--sport)' }}>
                MIWO {t('sportLabel')}
              </div>
              <h1 className="welcome-title">
                {t('sportTitle')}
              </h1>
              <p className="welcome-sub">
                {t('sportSub')}
              </p>
              <div className="prompt-pills">
                {[
                  t('sportPrompt1'),
                  t('sportPrompt2'),
                  t('sportPrompt3'),
                  t('sportPrompt4'),
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    className="prompt-pill"
                    onClick={() => sendMessage(prompt)}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--sport)';
                      e.target.style.color = 'var(--sport-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '';
                      e.target.style.color = '';
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={'message message-' + msg.role}>
                  <div
                    className={'message-label' + (msg.role === 'assistant' ? ' sport' : '')}
                    style={msg.role === 'user' ? { textAlign: 'right', color: 'var(--text-faint)' } : {}}
                  >
                    {msg.role === 'assistant' ? `MIWO ${t('sportLabel').toUpperCase()}` : t('you')}
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
                  <div className="message-label sport">MIWO {t('sportLabel').toUpperCase()}</div>
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      )}

      {/* ── Chat input (always visible) ── */}
      <div className="chat-bar">
        <div className="chat-inner">
          <input
            className="chat-input"
            placeholder={t('sportPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(90,139,106,0.4)'; }}
            onBlur={(e) => { e.target.style.borderColor = ''; }}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            style={{ background: 'var(--sport)' }}
            onMouseEnter={(e) => { if (!e.target.disabled) e.target.style.background = 'var(--sport-light)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'var(--sport)'; }}
          >
            &rarr;
          </button>
        </div>
      </div>
    </>
  );
}
