// ═══════════════════════════════════════════════════════════════
// HARD REJECTION GATE
// Runs AFTER editorial review and BEFORE output to user
// Returns { passed: boolean, failures: string[] }
// ═══════════════════════════════════════════════════════════════

/**
 * CHECK 1: VAGUE SOURCES
 * Scans for patterns like "officials say", "sources said", "analysts say", etc.
 * Works in English and German
 */
function checkVagueSources(text) {
  const failures = []

  // Patterns to catch (case-insensitive, with word boundaries)
  const vaguePatterns = [
    // English
    /\bofficials\s+(?:say|said|report)/gi,
    /\bsources\s+(?:say|said|suggest|report)/gi,
    /\banalysts\s+(?:say|said|suggest)/gi,
    /\breports\s+suggest/gi,
    /\bobservers\s+(?:say|said)/gi,
    /\btrade\s+officials/gi,
    /\bindustry\s+sources/gi,
    /\b(?:three|multiple|some)\s+(?:industry\s+)?analysts/gi,

    // German
    /\bBeamte\s+sagen/gi,
    /\bHandelsbeamte/gi,
    /\bQuellen\s+sagen/gi,
    /\bAnalysten\s+sagen/gi,
    /\bBerichte\s+deuten/gi,
    /\bBeobachter\s+sagen/gi,
  ]

  for (const pattern of vaguePatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      failures.push(`Vague source found: "${match[0]}"`)
    }
  }

  return failures
}

/**
 * CHECK 2: LOADED LANGUAGE
 * Scans for words like fury, outrage, slammed, etc.
 * Only flags matches OUTSIDE of quoted text (between " " or « » or „ ")
 */
function checkLoadedLanguage(text) {
  const failures = []

  const loadedWords = [
    'fury', 'outrage', 'authoritarian', 'law-trampling', 'law-trample',
    'slammed', 'blasted', 'lashed out', 'doubled down', 'sparked', 'fueled',
    'rocked', 'gripped',
    // German
    'wut', 'empörung', 'autoritär', 'autoritäre\s+neigungen', 'gesetzestretend'
  ]

  // Remove quoted text first (simple approach: anything between quotes)
  let textWithoutQuotes = text
    .replace(/"[^"]*"/g, '') // English double quotes
    .replace(/«[^»]*»/g, '') // French guillemets
    .replace(/„[^"]*"/g, '')  // German quotes

  for (const word of loadedWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    let match
    while ((match = regex.exec(textWithoutQuotes)) !== null) {
      failures.push(`Loaded language found: "${match[0]}"`)
    }
  }

  return failures
}

/**
 * CHECK 3: STORY STRUCTURE
 * Split by § markers. For each story except the lead:
 * Check that it has at least 3 substantive lines (non-empty, not just whitespace)
 */
function checkStoryStructure(text) {
  const failures = []

  // Split by § marker
  const stories = text.split(/§\s*/).filter(s => s.trim())

  // Start from index 1 (skip the lead story at index 0)
  for (let i = 1; i < stories.length; i++) {
    const story = stories[i]
    // Split by newlines and count non-empty lines
    const lines = story.split('\n').filter(line => line.trim().length > 0)

    if (lines.length < 3) {
      failures.push(`Story ${i} has only ${lines.length} lines — needs at least 3 for depth`)
    }
  }

  return failures
}

/**
 * CHECK 4: GEOGRAPHIC SPECIFICITY
 * For each story block, check that at least one country or major city appears
 */
function checkGeographicAnchors(text) {
  const failures = []

  // List of ~50 most relevant countries and cities for global briefing
  const geoAnchors = [
    // Africa
    'Ethiopia', 'Egypt', 'Kenya', 'Yemen', 'Libya', 'South Africa', 'Nigeria', 'Ghana',
    'Tanzania', 'Uganda', 'Sudan', 'Somalia', 'Tunisia', 'Algeria', 'Morocco', 'Angola',
    'Zambia', 'Zimbabwe', 'Mali', 'Senegal', 'Cameroon', 'Côte d\'Ivoire', 'DRC',
    // Middle East
    'Iran', 'Israel', 'Saudi Arabia', 'Bahrain', 'UAE', 'Qatar', 'Iraq', 'Syria',
    'Lebanon', 'Palestine', 'Jordan', 'Oman', 'Kuwait', 'Turkey',
    // Asia
    'China', 'India', 'Pakistan', 'Bangladesh', 'Myanmar', 'Thailand', 'Vietnam',
    'Philippines', 'Indonesia', 'Malaysia', 'Taiwan', 'Japan', 'South Korea',
    // Europe, Americas (for reference)
    'Russia', 'Ukraine', 'EU', 'USA', 'Brazil', 'Mexico',
    // Major cities
    'Addis Ababa', 'Cairo', 'Mombasa', 'Sana\'a', 'Tehran', 'Tel Aviv', 'Jerusalem',
    'Riyadh', 'Dubai', 'Baghdad', 'Damascus', 'Beijing', 'Delhi', 'Mumbai', 'Bangkok',
    'Hong Kong', 'Manila', 'Jakarta', 'Moscow', 'Kyiv', 'Istanbul',
  ]

  // Split by § marker to check each story
  const stories = text.split(/§\s*/).filter(s => s.trim())

  for (let i = 1; i < stories.length; i++) {
    const story = stories[i]
    let foundGeo = false

    for (const geo of geoAnchors) {
      if (new RegExp(`\\b${geo}\\b`, 'i').test(story)) {
        foundGeo = true
        break
      }
    }

    if (!foundGeo) {
      failures.push(`Story ${i} has no geographic anchor (country or major city)`)
    }
  }

  return failures
}

/**
 * CHECK 5: "AND THEN WHAT" CHECK
 * For each story, check it has at least 4 substantive lines.
 * Fewer than 4 lines = warning (not hard fail) about missing consequence layer
 */
function checkConsequenceLayer(text) {
  const warnings = []

  // Split by § marker
  const stories = text.split(/§\s*/).filter(s => s.trim())

  for (let i = 1; i < stories.length; i++) {
    const story = stories[i]
    // Split by newlines and count non-empty lines
    const lines = story.split('\n').filter(line => line.trim().length > 0)

    if (lines.length < 4) {
      warnings.push(`Story ${i} may be missing consequence layer (has ${lines.length} lines, ideally 4+)`)
    }
  }

  return warnings
}

/**
 * Main rejection gate function
 * Runs all 5 checks and returns { passed: boolean, failures: string[], warnings: string[] }
 */
export function rejectionGate(text) {
  const failures = []
  const warnings = []

  // Check 1: Vague sources
  failures.push(...checkVagueSources(text))

  // Check 2: Loaded language
  failures.push(...checkLoadedLanguage(text))

  // Check 3: Story structure (3+ lines per story)
  failures.push(...checkStoryStructure(text))

  // Check 4: Geographic anchors
  failures.push(...checkGeographicAnchors(text))

  // Check 5: Consequence layer (warning only)
  warnings.push(...checkConsequenceLayer(text))

  const passed = failures.length === 0

  return {
    passed,
    failures,
    warnings,
  }
}

/**
 * Helper function to create a prompt for Haiku to fix specific gate failures
 */
export function createGateFixPrompt(text, failures) {
  return `You are MIWO's quality fixer. The following editorial quality checks failed on a briefing draft:

FAILURES:
${failures.map(f => `- ${f}`).join('\n')}

ORIGINAL TEXT:
${text}

Your job: Fix ONLY these specific failures. Do not rewrite the entire briefing. Make minimal, surgical fixes to address each failure. Return only the corrected text. Preserve all other content and structure exactly as is.

CORRECTIVE ACTIONS:
- For vague sources (officials say, analysts say, etc.): Replace with specific named sources. If you cannot identify the source, cut the claim.
- For loaded language (fury, outrage, slammed, etc.): Replace with neutral language or delete the phrase.
- For stories with too few lines: Add a substantive sentence (sourced fact or consequence).
- For missing geographic anchors: Add a country or city name to ground the story.
- For missing consequence layer: Add a line describing what happens next for the people affected.

Return only the corrected text. No commentary.`
}
