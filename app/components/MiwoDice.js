'use client';

import { useState } from 'react';

/**
 * MIWO Dice — a playful element on each room page.
 * When clicked, it triggers a "surprise me" prompt that asks MIWO
 * for something unusual, unexpected, or little-known about the topic.
 *
 * Props:
 * - section: string (e.g. 'science', 'history', 'sport')
 * - color: string (CSS color, e.g. 'var(--science)')
 * - onRoll: function(prompt) — called with the surprise prompt text
 * - disabled: boolean
 */

const DICE_PROMPTS = {
  sport: [
    "Tell me something truly unusual from the world of sport — a forgotten rule, a bizarre record, an event most people have never heard of. One story, grounded in fact, with a source.",
    "Find me the most surprising thing happening in sport right now that nobody is talking about. Something real, something odd, something human.",
    "What is the strangest sport that people actually compete in professionally? Tell me about it — where, who, how it works.",
    "Give me one sport story from outside Europe and North America that deserves more attention. Something unexpected.",
    "What is the most remarkable underdog story in sport right now? Not the famous ones. Something real and current.",
  ],
  history: [
    "Tell me about a moment in history that changed everything but almost nobody knows about. One story, verified, with the source.",
    "What is a widely believed historical 'fact' that is actually wrong or heavily distorted? Show me what really happened.",
    "Find me a connection between two historical events that seem completely unrelated but are actually linked. Surprise me.",
    "Tell me about a person from history who should be famous but isn't. What did they do and why were they forgotten?",
    "What happened on this exact date in a year most people would never think of? Something real, something grounding.",
  ],
  classics: [
    "Tell me about a classic work of literature, music, or philosophy that contains a hidden meaning most people miss. One work, one insight.",
    "What is a classic that was hated or banned when it first appeared but is now considered essential? Tell me the story behind the scandal.",
    "Find me a forgotten classic — a book, composition, or idea that was once celebrated and has since disappeared from common knowledge.",
    "What is the most surprising thing about a classic work that everyone thinks they know? Challenge my assumption.",
    "Tell me about a classic from outside the Western canon that deserves to be as famous as Shakespeare or Beethoven.",
  ],
  arts: [
    "Tell me about a piece of art — painting, sculpture, installation, performance — that contains a secret most viewers never notice. One work, one revelation.",
    "What is the most unusual art technique ever developed? How does it work and who created it?",
    "Find me an artist working right now, anywhere in the world, who is doing something genuinely different. Not famous yet. Real talent.",
    "Tell me about a work of art that caused a genuine political crisis or changed a law. One story, with sources.",
    "What is the strangest material ever used to make art? Tell me about the work and why the artist chose it.",
  ],
  nature: [
    "Tell me about the most bizarre creature on Earth that most people have never heard of. What does it do that seems impossible?",
    "What is happening in nature right now — this season, this month — that is extraordinary but rarely reported? Something real and current.",
    "Find me a natural phenomenon that science still cannot fully explain. What do we know, what don't we know?",
    "Tell me about a relationship between two species that sounds made up but is completely real. One story, verified.",
    "What is the most surprising thing discovered about an ordinary animal in recent years? Something that changed what scientists thought they knew.",
  ],
  science: [
    "Tell me a scientific fact that sounds completely wrong but is verified and true. Explain why it surprises people.",
    "What is the most interesting unsolved problem in science right now? Not the famous ones — something researchers are quietly obsessed with.",
    "Find me a recent scientific discovery from outside the US and Europe that deserves global attention. With the journal or source.",
    "Tell me about an experiment that went spectacularly wrong and accidentally led to a major discovery.",
    "What is the most counterintuitive thing about the universe that has been confirmed by evidence? One fact, well explained.",
  ],
  cook: [
    "Tell me about a food combination that sounds terrible but is actually delicious and has a real culinary tradition behind it.",
    "What is the most unusual ingredient used in a traditional cuisine somewhere in the world? How is it prepared and why?",
    "Find me a cooking technique that most home cooks have never heard of but professional chefs use every day. Explain how it works.",
    "Tell me the surprising origin story of a common food or dish. Something most people don't know about what they eat every day.",
    "What is the rarest food in the world that people actually eat? Where does it come from and what makes it so rare?",
  ],
  education: [
    "Tell me about a way of learning or teaching that is completely different from traditional schooling and actually works. Something real, with evidence.",
    "What is something that most educated people believe they understand but actually have fundamentally wrong? One misconception, well explained.",
    "Find me the most surprising finding in learning science from the last few years. Something that challenges how we think about education.",
    "Tell me about a school or educational experiment somewhere in the world that is doing something genuinely radical. Not famous, but real.",
    "What is the most important thing that is almost never taught in schools anywhere? Why is it missing and where can you learn it?",
  ],
  future: [
    "Introduce me to a thinker I've probably never heard of who is saying something genuinely important about where the world is headed. What's their argument? Where can I read them?",
    "Tell me about a social experiment happening somewhere in the world right now — a city, a community, a country trying something radically different. What are they doing and is it working?",
    "What is the most interesting disagreement between serious thinkers about the future right now? Not tech predictions — about how humans should live together.",
    "Find me an idea that is quietly reshaping how people think about work, or cities, or democracy, or belonging. Something most people haven't encountered yet.",
    "What question about the future keeps the most interesting minds up at night? Not AI doom, not climate collapse — something deeper, more human, less obvious.",
  ],
};

export default function MiwoDice({ section, color, onRoll, disabled }) {
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    if (disabled || isRolling) return;

    setIsRolling(true);

    // Pick a random prompt for this section
    const prompts = DICE_PROMPTS[section] || DICE_PROMPTS.science;
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];

    // Brief animation delay
    setTimeout(() => {
      setIsRolling(false);
      onRoll(prompt);
    }, 600);
  };

  return (
    <button
      className={`miwo-dice ${isRolling ? 'rolling' : ''}`}
      onClick={handleRoll}
      disabled={disabled || isRolling}
      title="Roll the dice — surprise me"
      style={{
        '--dice-color': color || 'var(--copper)',
      }}
    >
      <img
        src="/miwo-dice.png"
        alt="MIWO Dice"
        width="40"
        height="40"
        style={{ display: 'block' }}
      />
    </button>
  );
}
