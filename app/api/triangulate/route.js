// MIWO Multi-AI Triangulation Pipeline
// Editorial engine implementing concurrent AI generation with bias detection and fact verification
// Architecture: Generator (Anthropic) + Counter-Generator (Mistral) → Challenger (OpenAI) → Verifier (Perplexity) → Synthesis (Anthropic)

export const maxDuration = 60; // Vercel serverless timeout

const PROVIDERS = {
  ANTHROPIC: 'anthropic',
  MISTRAL: 'mistral',
  OPENAI: 'openai',
  PERPLEXITY: 'perplexity',
};

const ENDPOINTS = {
  anthropic: 'https://api.anthropic.com/v1/messages',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
  perplexity: 'https://api.perplexity.ai/chat/completions',
};

const TIMEOUT = 30000; // 30 second timeout per provider

/**
 * MIWO editorial system prompt for news generation
 * Used by both generator (Anthropic) and counter-generator (Mistral)
 */
function getMIWOPrompt(lang = 'en', region = 'global') {
  return `You are MIWO, a global news editorial system focused on human impact.

Search for today's most significant global news.
Select 5-6 independent story systems with global impact.

SELECTION CRITERIA:
- Number of people affected
- Severity of impact
- Geographic diversity
- At least 2 stories outside Europe and North America

STORY FORMAT:
- 3-4 sentences per story
- First sentence: what is happening to people (human group + location + condition)
- Include one confirmed number and one named source
- One event per story only
- Start each story with "Right now."

STRUCTURE:
- Use § between stories
- End with "Want more on any of these?"

LANGUAGE: ${lang}
REGIONAL FOCUS: ${region}

Generate the briefing now.`;
}

/**
 * Wraps fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call Anthropic Claude Sonnet (generator)
 */
async function callAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetchWithTimeout(ENDPOINTS.anthropic, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    // Extract text from Anthropic response (may include web search tool use blocks)
    let text = '';
    if (data.content && Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === 'text') text += block.text;
      }
    }
    return text || null;
  } catch (error) {
    console.error('Anthropic call failed:', error.message);
    return null;
  }
}

/**
 * Call Mistral (counter-generator with different bias profile)
 */
async function callMistral(prompt) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetchWithTimeout(ENDPOINTS.mistral, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Mistral call failed:', error.message);
    return null;
  }
}

/**
 * Call OpenAI (challenger - identifies biases, gaps, framing issues)
 */
async function callOpenAI(outputA, outputB) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const challengePrompt = `You are a bias detection system. Compare these two news outputs from different AI models.

OUTPUT A (Anthropic):
${outputA}

OUTPUT B (Mistral):
${outputB}

Identify:
1. SELECTION BIAS: Are they covering different regions? Is one US-heavy?
2. FRAMING BIAS: Who starts with power/governments? Who starts with people?
3. MISSING PERSPECTIVES: What stories did one include that the other missed?
4. LANGUAGE ISSUES: Vague agency language? Hidden framing? False balance?
5. GEOGRAPHIC IMBALANCE: Is any region over or underrepresented?

Be specific and critical. Return structured JSON:
{
  "selectionDifferences": [...],
  "framingIssues": [...],
  "missingPerspectives": [...],
  "languageFlags": [...],
  "recommendation": "brief synthesis of what the final output should prioritize"
}`;

  try {
    const response = await fetchWithTimeout(ENDPOINTS.openai, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: challengePrompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { raw: content };
  } catch (error) {
    console.error('OpenAI call failed:', error.message);
    return null;
  }
}

/**
 * Extract claims with numbers and sources for verification
 */
function extractClaimsForVerification(text) {
  const claims = [];

  // Simple regex to find sentences with numbers
  const numberPattern = /([^.!?]*\d+[^.!?]*[.!?])/g;
  let match;

  while ((match = numberPattern.exec(text)) !== null) {
    claims.push(match[1].trim());
  }

  return claims.slice(0, 10); // Limit to 10 claims for verification
}

/**
 * Call Perplexity (verifier - checks facts, numbers, sources)
 */
async function callPerplexity(claims) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey || claims.length === 0) return null;

  const verificationPrompt = `Verify these specific claims from a news briefing. For each, confirm or flag with sources:

${claims.map((claim, i) => `${i + 1}. ${claim}`).join('\n')}

Return JSON: { "verified": [...], "flagged": [...], "unverifiable": [...] }

Be concise. Include source URLs where available.`;

  try {
    const response = await fetchWithTimeout(ENDPOINTS.perplexity, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: verificationPrompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { raw: content };
  } catch (error) {
    console.error('Perplexity call failed:', error.message);
    return null;
  }
}

/**
 * Synthesis pass: Use challenge analysis to refine output
 */
async function synthesizeFinalOutput(
  originalPrompt,
  outputA,
  outputB,
  challengeAnalysis,
  verificationResults
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback: return best available output
    return outputA || outputB;
  }

  const synthesisPrompt = `You are MIWO refining a global news briefing based on editorial analysis.

ORIGINAL BRIEFING (Output A):
${outputA}

EDITORIAL CHALLENGE ANALYSIS:
${JSON.stringify(challengeAnalysis, null, 2)}

FACT VERIFICATION RESULTS:
${JSON.stringify(verificationResults, null, 2)}

Using these insights and the original MIWO editorial rules:
1. MIWO editorial authority takes precedence over any AI bias
2. Prioritize human impact and severity
3. Ensure geographic diversity (at least 2 stories outside Europe and North America)
4. Use the challenge analysis to correct framing issues and missing perspectives
5. Maintain the MIWO format: "Right now..." stories, § separators, end with "Want more on any of these?"

Generate the refined briefing that incorporates the best insights while maintaining MIWO editorial integrity.`;

  try {
    const response = await fetchWithTimeout(ENDPOINTS.anthropic, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: synthesisPrompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic synthesis error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Anthropic synthesis failed:', error.message);
    // Fallback to original output
    return outputA || outputB;
  }
}

/**
 * Main handler: POST /api/triangulate
 */
export async function POST(request) {
  const startTime = Date.now();
  const timings = {};

  try {
    const body = await request.json();
    const { lang = 'en', region = 'global', date } = body;

    // Check for at least Anthropic key (minimum viable)
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'ANTHROPIC_API_KEY required',
          message: 'At least Anthropic API key is required for triangulation',
        }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const miwoPrompt = getMIWOPrompt(lang, region);

    // STEP 1: Parallel generation from Anthropic and Mistral
    console.log('[TRIANGULATE] Starting generation phase...');
    const generationStart = Date.now();

    const [generatorA, generatorB] = await Promise.all([
      callAnthropic(miwoPrompt),
      callMistral(miwoPrompt),
    ]);

    timings.generation = Date.now() - generationStart;

    // Graceful degradation: if only one generator succeeded
    if (!generatorA && !generatorB) {
      return new Response(
        JSON.stringify({
          error: 'Generation failed',
          message: 'Both Anthropic and Mistral calls failed',
        }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }

    const primaryOutput = generatorA || generatorB;
    const secondaryOutput = generatorB || null;

    // STEP 2: Challenge analysis (only if we have two outputs)
    let challengeAnalysis = null;
    if (generatorA && generatorB) {
      console.log('[TRIANGULATE] Starting challenge phase...');
      const challengeStart = Date.now();
      challengeAnalysis = await callOpenAI(generatorA, generatorB);
      timings.challenge = Date.now() - challengeStart;
    }

    // STEP 3: Fact verification
    console.log('[TRIANGULATE] Starting verification phase...');
    const verificationStart = Date.now();
    const claims = extractClaimsForVerification(primaryOutput);
    const verificationResults = await callPerplexity(claims);
    timings.verification = Date.now() - verificationStart;

    // STEP 4: Synthesis (refine based on challenge and verification)
    let finalOutput = primaryOutput;
    if (challengeAnalysis || verificationResults) {
      console.log('[TRIANGULATE] Starting synthesis phase...');
      const synthesisStart = Date.now();
      finalOutput = await synthesizeFinalOutput(
        miwoPrompt,
        generatorA,
        generatorB,
        challengeAnalysis || {},
        verificationResults || {}
      );
      timings.synthesis = Date.now() - synthesisStart;
    }

    const totalTime = Date.now() - startTime;

    // STEP 5: Return structured response
    const response = {
      finalOutput,
      generatorA: generatorA || null,
      generatorB: generatorB || null,
      challengeAnalysis: challengeAnalysis || null,
      verification: verificationResults || null,
      metadata: {
        lang,
        region,
        date: date || new Date().toISOString(),
        providersUsed: {
          anthropic: !!process.env.ANTHROPIC_API_KEY,
          mistral: !!process.env.MISTRAL_API_KEY,
          openai: !!process.env.OPENAI_API_KEY,
          perplexity: !!process.env.PERPLEXITY_API_KEY,
        },
        timings: {
          ...timings,
          total: totalTime,
        },
        timestamp: new Date().toISOString(),
      },
    };

    console.log(`[TRIANGULATE] Complete in ${totalTime}ms`, {
      generation: timings.generation,
      challenge: timings.challenge,
      verification: timings.verification,
      synthesis: timings.synthesis,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[TRIANGULATE] Fatal error:', error);
    return new Response(
      JSON.stringify({
        error: 'Triangulation failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
