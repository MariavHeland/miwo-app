'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';
import MiwoDice from '../components/MiwoDice';
import './cook.css';

export default function CookPage() {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [pantryOpen, setPantryOpen] = useState(false);
  const [pantryIngredients, setPantryIngredients] = useState([]);
  const [pantryInput, setPantryInput] = useState('');
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
          section: 'cook',
          lang,
          filter: activeFilter,
          systemOverride: `You are the culinary voice of MIWO — a modern, editorial food guide grounded in rigorous research and genuine respect for all food traditions. You are knowledgeable about world cuisines, techniques, ingredients, food science, dietary approaches, and food culture.

Your tone is warm but knowledgeable, like a well-travelled food writer who also happens to be a skilled home cook. Keep answers focused and vivid — use sensory language. When giving recipes, be precise with measurements and timing.

AUTHORITIES YOU TRUST:
Food science: Harold McGee (On Food and Cooking), J. Kenji López-Alt (The Food Lab — science explaining WHY), Samin Nosrat (Salt Fat Acid Heat — principles over recipes). Food history: Krishnendu Ray, Claudia Roden, Fuchsia Dunlop. Non-Western voices: Andrea Nguyen (Vietnamese, tofu, fermentation), Meera Sodha (Indian, plant-based), Kwame Onwuachi (African diaspora), Yotam Ottolenghi (Middle Eastern), Yasmin Khan (food and activism). INDIGENOUS FOOD: Sean Sherman/The Sioux Chef (Indigenous food reclamation is both culinary and political), Nephi Craig, Loretta Barrett Oden. Indigenous peoples are PRIMARY authorities on their own food traditions.
Recipes: Serious Eats, Cook's Illustrated. Food journalism: Civil Eats, FERN.

WHAT YOU DISCUSS:
Food history, ingredient science and substitutions, dietary approaches (vegan, keto, gluten-free, etc.), cooking techniques, equipment advice, seasonal ingredients, and food culture. The current filter is: ${activeFilter}. If a specific cuisine or topic filter is active, lean into that area of expertise.

THE POLITICS OF FOOD (you address this naturally):
- Supply chains: 6 companies control 75% of global pesticides. Farmers get tiny shares of retail price.
- Labour: 2.8 million U.S. food workers are on food stamps. The people who produce and serve food often cannot afford to eat well.
- Food waste: 1 billion tonnes annually (10% of global emissions). Solutions exist.
- Food sovereignty: Indigenous food reclamation as both cultural recovery and climate solution.
- Cultural exchange: attribution and respect matter. Understand power imbalances.

ERRORS YOU AVOID:
- Never exoticise non-Western cuisines ("exotic," "ethnic," "weird," "bizarre" for everyday food).
- Be precise about food origins and honest about uncertainty.
- Distinguish settled science (vegetables are good, trans fats are bad) from contested claims (superfoods, supplements). Nutrition science has a replication crisis.
- Cover the labour behind food, not just the chefs.

WHAT'S HAPPENING NOW:
Fermentation revival (koji, kefir, kimchi, kombucha — $394B market by 2034). Foraging as reconnection with lost knowledge. Cultured meat: climate benefit depends entirely on energy source. Regenerative agriculture: promising but hold it to the same evidence standard as everything else.

REPRESENTATION MATTERS: When highlighting chefs, food writers, and culinary figures, at least half should be people who are not white men. Actively surface women, people of colour, and cooks from underrepresented food traditions. The world's kitchens are diverse — MIWO's coverage reflects that.

VOICES THAT MAKE THIS SUBJECT ALIVE:
Food writing should make you hungry AND thoughtful:
- Serena Dai: Founder of Tostada Magazine — food stories about and written by people of colour and immigrant communities. Reshaping food journalism.
- Fuchsia Dunlop: Chinese cuisine with genuine depth and respect. The Land of Fish and Rice. A model of cross-cultural food writing.
- Sean Sherman / The Sioux Chef: Indigenous food reclamation as both culinary art and political act. The New Native Kitchen is essential.
- J. Kenji López-Alt: The Food Lab — explains WHY things work. Food science for curious home cooks.
- Samin Nosrat: Salt Fat Acid Heat — principles over recipes. Changed how people think about cooking.
- Hrishikesh Hirway & Samin Nosrat: Home Cooking podcast — quarantine cooking that became a movement. Process over perfection.
- Michael Pollan: The Omnivore's Dilemma, Cooked. Connects what you eat to politics, agriculture, and culture. Essential food systems thinker.
- José Andrés: World Central Kitchen founder. Feeding people in crisis zones — the chef as humanitarian. Changed what a restaurant can be.
- Andrea Nguyen: Vietnamese food authority. Tofu, pho, fermentation. Precise, respectful, deeply knowledgeable.
- Kwame Onwuachi: Notes from a Young Black Chef. African diaspora cuisine. Memoir and recipes that tell a story about race, identity, and who gets a seat at the table.
MIWO Cook should feel like cooking with someone who knows the history, respects the tradition, and genuinely wants you to eat well.

UPCOMING EVENTS — MIWO Cook should proactively mention:
Food festivals, restaurant openings, cookbook releases, seasonal ingredient availability, harvest festivals, fermentation and foraging workshops, food documentary releases, James Beard Awards, World's 50 Best announcements, and cultural food celebrations (Lunar New Year feasts, Diwali sweets, Ramadan iftar traditions, harvest thanksgiving). When discussing a cuisine or technique, mention if there's a seasonal moment or event that makes it especially relevant right now.

Never say "As an AI." Keep it warm, knowledgeable, and genuinely respectful of every food tradition on earth.`,
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

  /* ── Pantry logic ── */
  const COMPOUNDS = ['olive oil', 'sesame oil', 'coconut milk', 'coconut oil', 'soy sauce',
    'cream cheese', 'black pepper', 'chili flakes', 'rice vinegar', 'bell pepper', 'red onion',
    'bone broth', 'peanut butter', 'almond butter', 'maple syrup', 'sour cream', 'lemon zest',
    'fish sauce', 'oyster sauce', 'hoisin sauce', 'hot sauce', 'balsamic vinegar', 'dijon mustard'];

  const addPantryItem = () => {
    const raw = pantryInput.trim().toLowerCase();
    if (!raw) return;
    let parts;
    if (raw.includes(',')) {
      parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    } else if (COMPOUNDS.includes(raw)) {
      parts = [raw];
    } else {
      let remaining = raw;
      parts = [];
      for (const c of COMPOUNDS) {
        if (remaining.includes(c)) {
          parts.push(c);
          remaining = remaining.replace(c, ' ').trim();
        }
      }
      if (remaining) remaining.split(/\s+/).filter(Boolean).forEach(w => parts.push(w));
    }
    const next = [...pantryIngredients];
    parts.forEach(p => { if (p && !next.includes(p)) next.push(p); });
    setPantryIngredients(next);
    setPantryInput('');
  };

  const removePantryItem = (item) => {
    setPantryIngredients(pantryIngredients.filter(i => i !== item));
  };

  const pantryQuickAdd = (item) => {
    if (!pantryIngredients.includes(item)) {
      setPantryIngredients([...pantryIngredients, item]);
    }
  };

  const findRecipesFromPantry = () => {
    if (pantryIngredients.length === 0) return;
    const prompt = `I have these ingredients: ${pantryIngredients.join(', ')}. Suggest 2–3 recipes I can make with mostly what I have. For each recipe, tell me the name, which of my ingredients it uses, what I might still need, and give me quick step-by-step instructions. Keep it practical and modern.`;
    setPantryOpen(false);
    sendMessage(prompt);
  };

  const pantryHandleKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addPantryItem(); }
  };

  const quickChips = ['chicken', 'potatoes', 'eggs', 'rice', 'garlic', 'olive oil',
    'onion', 'tomato', 'lemon', 'butter', 'pasta', 'honey', 'cheese', 'salmon', 'cucumber'];

  /* ── Filters ── */
  const filters = [
    { id: 'all', label: 'All Cuisines' },
    { id: 'italian', label: 'Italian' },
    { id: 'japanese', label: 'Japanese' },
    { id: 'mexican', label: 'Mexican' },
    { id: 'indian', label: 'Indian' },
    { id: 'french', label: 'French' },
    { id: 'thai', label: 'Thai' },
    { id: 'middle-eastern', label: 'Middle Eastern' },
    { id: 'korean', label: 'Korean' },
    { id: 'technique', label: 'Techniques' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'keto', label: 'Keto' },
  ];

  const suggestedPrompts = [
    'What should I cook tonight?',
    'Teach me a technique I probably don\u2019t know',
    'Give me a 15-minute dinner idea',
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
          <div className="nav-section" style={{ color: 'var(--cooking)' }}>{t('cookLabel')}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link href="/sports" className="nav-btn">{t('sport')}</Link>
          <Link href="/history" className="nav-btn">{t('history')}</Link>
          <Link href="/classics" className="nav-btn">{t('classics')}</Link>
          <Link href="/arts" className="nav-btn">{t('arts')}</Link>
          <Link href="/nature" className="nav-btn">{t('nature')}</Link>
          <Link href="/science" className="nav-btn">{t('science')}</Link>
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
              <img src="/fridge-globe.png" alt="" className="welcome-globe" />
              <div className="subpage-hero-right">
                <div className="welcome-label" style={{ color: 'var(--cooking)' }}>
                  {t('cookLabel')}
                </div>
                <h1 className="welcome-title">
                  {t('cookTitle').split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                </h1>
                <p className="welcome-sub">
                  {t('cookSub')}
                </p>

                {/* Fridge button — prominent CTA */}
                <button
                  className="cook-fridge-btn"
                  onClick={() => setPantryOpen(!pantryOpen)}
                  style={pantryOpen ? { background: 'rgba(196, 90, 90, 0.15)', borderColor: 'var(--cooking)' } : {}}
                >
                  <span className="cook-fridge-icon">🧊</span>
                  <span className="cook-fridge-text">
                    <strong>{t('whatDoYouHave')}</strong>
                    <span className="cook-fridge-sub">Tell us what's in your fridge — we'll find recipes</span>
                  </span>
                </button>

                {/* Filters — compact, inline */}
                <div className="subpage-filters">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      className={`subpage-filter ${activeFilter === f.id ? 'active' : ''}`}
                      onClick={() => setActiveFilter(f.id)}
                      style={
                        activeFilter === f.id
                          ? { borderColor: 'var(--cooking)', color: 'var(--cooking)', background: 'rgba(196, 90, 90, 0.08)' }
                          : {}
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Pantry panel */}
                {pantryOpen && (
                  <div className="cook-pantry" style={{ marginTop: '8px' }}>
                    <div className="cook-pantry-inner">
                      <div className="cook-pantry-header">
                        <h3 className="cook-pantry-title">{t('pantryTitle')}</h3>
                        <button
                          className="cook-pantry-find"
                          onClick={findRecipesFromPantry}
                          disabled={pantryIngredients.length === 0}
                        >
                          {t('pantryFind')}
                        </button>
                      </div>
                      <p className="cook-pantry-desc">{t('pantrySub')}</p>
                      <div className="cook-pantry-input-row">
                        <input
                          className="cook-pantry-input"
                          value={pantryInput}
                          onChange={(e) => setPantryInput(e.target.value)}
                          onKeyDown={pantryHandleKey}
                          placeholder={t('cookPlaceholder')}
                        />
                        <button className="cook-pantry-add" onClick={addPantryItem}>{t('pantryAdd')}</button>
                      </div>
                      {pantryIngredients.length > 0 && (
                        <div className="cook-pantry-tags">
                          {pantryIngredients.map((item) => (
                            <span key={item} className="cook-pantry-tag">
                              {item}
                              <button className="cook-pantry-tag-x" onClick={() => removePantryItem(item)}>&times;</button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="cook-pantry-chips">
                        {quickChips.filter(c => !pantryIngredients.includes(c)).slice(0, 12).map((chip) => (
                          <button key={chip} className="cook-pantry-chip" onClick={() => pantryQuickAdd(chip)}>
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

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

                {/* Dice — surprise me */}
                <div className="dice-row">
                  <MiwoDice section="cook" color="var(--cooking)" onRoll={sendMessage} disabled={isLoading} />
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
                  className={`message-label ${msg.role === 'assistant' ? 'cooking' : ''}`}
                  style={
                    msg.role === 'user'
                      ? { textAlign: 'right', color: 'var(--text-faint)' }
                      : {}
                  }
                >
                  {msg.role === 'assistant' ? `MIWO ${t('cookLabel').toUpperCase()}` : t('you')}
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
                <div className="message-label cooking">{`MIWO ${t('cookLabel').toUpperCase()}`}</div>
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
            placeholder={t('cookPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            style={{ background: 'var(--cooking)' }}
          >
            &rarr;
          </button>
        </div>
      </div>
    </>
  );
}
