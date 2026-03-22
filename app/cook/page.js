'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import './cook.css';

export default function CookPage() {
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

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

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

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Something went wrong. Try again in a moment.' },
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
    'What\u2019s in season right now?',
    'Give me a 15-minute dinner idea',
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
          <div className="nav-section" style={{ color: 'var(--cooking)' }}>Cook</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/sports">
            <button className="nav-btn" style={{ borderColor: 'var(--sport)', color: 'var(--sport)' }}>
              Sport
            </button>
          </Link>
          <Link href="/arts">
            <button className="nav-btn" style={{ borderColor: 'var(--art)', color: 'var(--art)' }}>
              Arts
            </button>
          </Link>
          <Link href="/history">
            <button className="nav-btn" style={{ borderColor: 'var(--history)', color: 'var(--history)' }}>
              History
            </button>
          </Link>
          <Link href="/">
            <button className="nav-btn">Home</button>
          </Link>
        </div>
      </nav>

      {/* Filters + "What do you have?" button */}
      {messages.length === 0 && (
        <div style={{ paddingTop: '80px' }}>
          <div className="sport-nav">
            {filters.map((f) => (
              <button
                key={f.id}
                className={`cook-pill ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
            <button
              className="cook-pantry-btn"
              onClick={() => setPantryOpen(!pantryOpen)}
            >
              What do you have?
            </button>
          </div>

          {/* Pantry panel */}
          {pantryOpen && (
            <div className="cook-pantry">
              <div className="cook-pantry-inner">
                <div className="cook-pantry-header">
                  <h3 className="cook-pantry-title">What&rsquo;s in your kitchen?</h3>
                  <button
                    className="cook-pantry-find"
                    onClick={findRecipesFromPantry}
                    disabled={pantryIngredients.length === 0}
                  >
                    Find Recipes
                  </button>
                </div>
                <p className="cook-pantry-desc">
                  Type your ingredients separated by commas, or tap the chips below. We&rsquo;ll suggest what you can cook right now.
                </p>
                <div className="cook-pantry-input-row">
                  <input
                    className="cook-pantry-input"
                    value={pantryInput}
                    onChange={(e) => setPantryInput(e.target.value)}
                    onKeyDown={pantryHandleKey}
                    placeholder="e.g. chicken, potatoes, garlic, lemon"
                  />
                  <button className="cook-pantry-add" onClick={addPantryItem}>+ Add</button>
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
        </div>
      )}

      {/* Chat area */}
      <div className="chat-container" style={messages.length === 0 ? { paddingTop: '20px' } : {}}>
        {messages.length === 0 ? (
          <div className="welcome">
            <div className="welcome-label" style={{ color: 'var(--cooking)' }}>
              Cook
            </div>
            <h1 className="welcome-title">
              Every dish<br />has a story.
            </h1>
            <p className="welcome-sub">
              Recipes, techniques, ingredients, and the culture behind what we eat &mdash;
              from quick weeknight meals to the deep traditions of world cuisine.
            </p>
            <div className="prompt-pills">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="prompt-pill"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
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
                  {msg.role === 'assistant' ? 'MIWO COOK' : 'You'}
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
                <div className="message-label cooking">MIWO COOK</div>
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
            placeholder="Ask about any recipe, technique, cuisine, or ingredient..."
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