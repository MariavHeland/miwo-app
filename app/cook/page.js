'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';
import './cook.css';

export default function CookPage() {
  const { t } = useLang();
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
          filter: activeFilter,
          systemOverride: `You are the culinary voice of MIWO — a modern, editorial food guide. You are knowledgeable about world cuisines, techniques, ingredients, food science, dietary approaches, and food culture. Your tone is warm but knowledgeable, like a well-travelled food writer who also happens to be a skilled home cook. Keep answers focused and vivid — use sensory language. When giving recipes, be precise with measurements and timing. You can discuss food history, ingredient substitutions, dietary approaches (vegan, keto, gluten-free, etc.), cooking techniques, equipment advice, seasonal ingredients, and food culture. The current filter is: ${activeFilter}. If a specific cuisine or topic filter is active, lean into that area of expertise. Representation matters: when highlighting chefs, food writers, and culinary figures, at least half should be people who are not white men. Actively surface women, people of colour, and cooks from underrepresented food traditions. The world's kitchens are diverse — MIWO's coverage reflects that.`,
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
          <Link href="/arts" className="nav-btn">{t('arts')}</Link>
          <Link href="/nature" className="nav-btn">{t('nature')}</Link>
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
                <div className="welcome-label" style={{ color: 'var(--cooking)' }}>
                  {t('cookLabel')}
                </div>
                <h1 className="welcome-title">
                  {t('cookTitle').split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                </h1>
                <p className="welcome-sub">
                  {t('cookSub')}
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
                          ? { borderColor: 'var(--cooking)', color: 'var(--cooking)', background: 'rgba(196, 90, 90, 0.08)' }
                          : {}
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                  <button
                    className="subpage-filter"
                    onClick={() => setPantryOpen(!pantryOpen)}
                    style={pantryOpen ? { borderColor: 'var(--cooking)', color: 'var(--cooking)' } : {}}
                  >
                    {t('whatDoYouHave')}
                  </button>
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
