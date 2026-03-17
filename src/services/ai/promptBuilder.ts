import { COMPONENT_SPECS, SYSTEM_INSTRUCTION, FEW_SHOT_EXAMPLES } from '@/constants';
import { GenerationConfig, RefineConfig, FixConfig } from './IAIProvider';

export const JSON_ENFORCEMENT = '\nYou MUST respond with raw JSON only. No markdown, no explanation, no code fences.';

export function buildGenerationPrompt(config: GenerationConfig): string {
  const { prompt, context, previousState } = config;

  const skipComponentSpecs = context.mode === 'svg_animation' || context.mode === 'galgame' || context.mode === 'presentation';

  let contextPrompt = `
CURRENT USER CONTEXT:
Role: ${context.role}
Device: ${context.device}
Theme: ${context.theme}
Mode: ${context.mode || 'default'}
`;

  if (!skipComponentSpecs) {
    contextPrompt += `
AVAILABLE COMPONENT LIBRARY (PROTOBUF DEFINITIONS):
${COMPONENT_SPECS}

FEW-SHOT EXAMPLES:
${FEW_SHOT_EXAMPLES}
`;
  }

  if (context.mode === 'galgame') {
    contextPrompt += `

*** GALGAME ENGINE ACTIVE ***
You are running in Visual Novel Mode.
1. YOUR OUTPUT MUST BE A 'vn_stage' COMPONENT.
2. Do not generate standard UI widgets (containers, cards) unless they are part of the game UI.
3. Act as a Creative Director / Game Master.
4. Use 'EXTERNAL_URL' (Pollinations) for backgrounds to ensure variety.
`;
  }

  if (context.mode === 'svg_animation') {
    contextPrompt += `

# Role: SVG Animation Director

You create stunning, self-contained animated SVG illustrations. You output complete SVG code wrapped in a JSON structure.

## Output Format (CRITICAL)
RAW JSON ONLY. Response starts with \`{\` and ends with \`}\`:
\`\`\`
{ "svg_animation": { "title": "Scene Title", "svg_code": "<svg ...>...</svg>" } }
\`\`\`

The \`svg_code\` value is a complete SVG string. Escape quotes inside as \\" and newlines as \\n.

## SVG Foundation (always follow)
- viewBox="0 0 ${context.device === 'mobile' ? '720 1280' : '1280 720'}", width="100%", height="100%"
- Canvas: ${context.device === 'mobile' ? '720×1280 (9:16 portrait)' : '1280×720 (16:9 landscape, 720p)'}
- SMIL animations only (animate, animateTransform, animateMotion). NO CSS animations, NO JavaScript.
- Valid SVG 1.1, self-contained, no external dependencies
- Use <defs> for: gradients, filters, markers, patterns, reusable <symbol>
- Group with <g>, meaningful ids
- Background: radialGradient dark base + subtle overlay pattern (dots or grid)
- Vignette: radialGradient (transparent center → dark edges)
- Glow filter: feGaussianBlur stdDeviation=3-4 + feComposite on key elements

## Color Theme (pick ONE per scene based on topic, NEVER reuse last theme)
- **Cyber**: bg #0a0f1a, accents #22d3ee #a78bfa #34d399 #fb7185
- **Ocean**: bg #0a1628, accents #38bdf8 #818cf8 #2dd4bf #fbbf24
- **Ember**: bg #1a0a0a, accents #f97316 #ef4444 #fbbf24 #a3e635
- **Forest**: bg #0a1a0f, accents #4ade80 #a3e635 #34d399 #38bdf8
- **Neon**: bg #0f0a1a, accents #e879f9 #c084fc #f472b6 #22d3ee
Pick the theme that best matches the topic mood. Use the 4 accents for different roles (primary, secondary, success, highlight).

## Typography (always follow)
- Title: 20-24px bold, near-white (#f8fafc), centered, with decorative side-lines
- Subtitle: 11px #64748b below title
- Section labels: 9px uppercase, letter-spacing 0.5, accent color
- Body/annotations: 11-13px sans-serif #94a3b8
- Code/technical: 9px monospace, accent color at 0.6 opacity

## Text-Box Alignment (CRITICAL — prevents misalignment)
- To center text in a rect: text x = rect.x + rect.width/2, text y = rect.y + rect.height/2
- ALWAYS use text-anchor="middle" + dominant-baseline="middle" for centered text
- Estimate text width: fontSize × 0.55 × characterCount. Ensure rect.width > estimated text width + 20px padding
- For pill badges: rx = rect.height/2, text centered both axes
- For labels below elements: text y = element bottom + 15, text-anchor="middle", x = element center x
- NEVER position text by guessing — always calculate from the parent rect's coordinates

## Characters (pre-built symbols — use \`<use>\` references)
- Stick figures are pre-injected as symbols. Use: \`<use href="#stickman" x="100" y="150" width="60" height="100"/>\`
- Variants: #stickman (standing), #stickman-wave (waving), #stickman-point (pointing)
- Set color on parent \`<g color="#60a5fa">\` to control figure color (uses currentColor)
- Add bob animation on the parent \`<g>\`: animateTransform type="translate" values="0,0; 0,2; 0,0" dur 3-4s
- Speech bubbles: also use \`<use href="#speech-bubble" x="50" y="80" width="200" height="60"/>\` then overlay text

## Connections & Flow
- Arrows: stroke-dasharray="4,6" + animated stroke-dashoffset (dur 1.5s, indefinite)
- Arrow markers: triangular viewBox 0 0 8 8, refX=7, fill matching stroke color
- Data particles: circles r=2-3, animateMotion on curved paths, staggered begin, fading opacity
- Return/response paths: curved below main flow, lower opacity (0.4)

## Animation Choreography
- Sequential reveal with staggered begin times, fill="freeze"
- 0-1s: background, title fade in
- 1-3s: main actors/elements appear
- 2-5s: connections animate, data flows
- 4-6s: results/output appear
- 6-8s: summary callouts fade in
- Persistent loops: bob, dash-flow, pulse continue indefinitely

## Layout (pick the BEST fit for the topic, vary between scenes)
- **Horizontal flow** (A → B → C): for processes, pipelines, request-response
- **Split comparison** (left vs right with center divider): for comparisons, tradeoffs
- **Hub-spoke** (center node + radiating connections): for architectures, ecosystems
- **Top-down cascade**: for hierarchies, decision trees
- **Timeline** (horizontal line with milestones): for histories, sequences

## Content Requirements
- Educational callout badges: rounded rect rx=10, accent border, near-white text, slide-in animation
- At least 3 text blocks explaining key concepts
- Technical annotations near arrows (e.g. "GET /api", "JWT", "200 OK") in monospace
- Bottom summary bar: rounded rect with 3 icon+text columns, separated by thin lines
- Rich information density — teach, don't just decorate

## Rules
- Each user click generates ONE complete scene. Build on previous context.
- All text readable, properly positioned, no overlaps
- Balance visual appeal with educational clarity
- NEVER generate the same layout + color combo twice in a row
`;
  }

  if (context.mode === 'presentation') {
    contextPrompt += `

# Role: Presentation Designer

You create stunning slide decks as structured JSON with SVG slides. Output 3-6 slides per request.

## Output Format (CRITICAL)
RAW JSON ONLY. Response starts with \`{\` and ends with \`}\`:
\`\`\`
{ "presentation": {
    "title": "Deck Title",
    "slides": [
      { "title": "Slide 1 Title", "svg_code": "<svg ...>...</svg>" },
      { "title": "Slide 2 Title", "svg_code": "<svg ...>...</svg>" }
    ]
  }
}
\`\`\`

## SVG Foundation (every slide must follow)
- viewBox="0 0 ${context.device === 'mobile' ? '720 1280' : '1280 720'}", width="100%", height="100%"
- SMIL animations only (animate, animateTransform, animateMotion). NO CSS, NO JavaScript.
- Use <defs> for: gradients, filters, markers, patterns, reusable <symbol>
- Background layers (ALL required in every slide):
  1. radialGradient dark base (theme bg color)
  2. Subtle pattern overlay: dotted grid (circle r=0.8, spacing 30px, fill #1e293b) OR line grid (stroke #1e293b, opacity 0.3)
  3. Vignette: radialGradient (transparent center → dark edges, opacity 0.6)
- Glow filter: feGaussianBlur stdDeviation=3-4 + feComposite on key elements

## Color Themes (pick ONE for entire deck)
- **Cyber**: bg #0a0f1a, accents #22d3ee #a78bfa #34d399 #fb7185
- **Ocean**: bg #0a1628, accents #38bdf8 #818cf8 #2dd4bf #fbbf24
- **Ember**: bg #1a0a0a, accents #f97316 #ef4444 #fbbf24 #a3e635
- **Forest**: bg #0a1a0f, accents #4ade80 #a3e635 #34d399 #38bdf8
- **Neon**: bg #0f0a1a, accents #e879f9 #c084fc #f472b6 #22d3ee

## Typography
- Slide title: 28-34px bold #f8fafc, top area, with decorative side-lines (——— Title ———)
- Section labels: 9px uppercase, letter-spacing 1-2, accent color
- Body text: 14-18px sans-serif #94a3b8
- Code/technical: 11px monospace, accent color at 0.6 opacity
- Text alignment: ALWAYS text-anchor="middle" + dominant-baseline="middle", x/y calculated from parent rect center
- Estimate text width: fontSize × 0.55 × charCount, ensure container is wider with 20px+ padding

## Visual Style Reference (FOLLOW THIS AESTHETIC EXACTLY)
Study this example SVG pattern and replicate its style in every slide:

**Stick figure characters** — pre-built symbols are auto-injected. Just use \`<use>\`:
\`\`\`
<g color="#60a5fa">
  <animateTransform attributeName="transform" type="translate" values="0,0; 0,2; 0,0" dur="3.5s" repeatCount="indefinite"/>
  <use href="#stickman" x="100" y="150" width="60" height="100"/>
  <!-- variants: #stickman, #stickman-wave, #stickman-point -->
</g>
<text x="130" y="270" font-size="9" fill="#64748b" text-anchor="middle" letter-spacing="0.5">LABEL</text>
\`\`\`
IMPORTANT: Set \`color\` on the parent \`<g>\` to control the stick figure color (it uses currentColor).

**Speech bubble** (pop-in scale animation):
\`\`\`
<g transform="translate(0, -75)">
  <animateTransform attributeName="transform" type="scale" values="0;1.1;1" begin="1s" dur="0.4s" fill="freeze"/>
  <path d="M -40,-20 h 80 a 8,8 0 0 1 8,8 v 14 a 8,8 0 0 1 -8,8 h -35 l -5,6 l -5,-6 h -35 a 8,8 0 0 1 -8,-8 v -14 a 8,8 0 0 1 8,-8 z" fill="#1e293b" stroke="#334155"/>
  <text x="0" y="3" font-size="12" fill="#f8fafc" text-anchor="middle">Message here</text>
</g>
\`\`\`

**Central panel with code-lines effect** (draw-in animation):
\`\`\`
<rect x="-100" y="-60" width="200" height="120" rx="12" fill="#0f172a" stroke="#334155" stroke-dasharray="640" stroke-dashoffset="640">
  <animate attributeName="stroke-dashoffset" values="640;0" dur="1.5s" fill="freeze"/>
</rect>
<rect x="-80" y="-30" width="0" height="6" rx="3" fill="#60a5fa" opacity="0.3">
  <animate attributeName="width" values="0;100" dur="0.5s" fill="freeze"/>
</rect>
\`\`\`

**Spinning gears** (for services/processing):
\`\`\`
<g>
  <animateTransform attributeName="transform" type="rotate" values="0;360" dur="8s" repeatCount="indefinite"/>
  <circle r="20" fill="none" stroke="#4ade80" stroke-width="2" stroke-dasharray="6,4"/>
</g>
\`\`\`

**Data particles on path**:
\`\`\`
<path id="flow-path" d="M 130 200 Q 500 130 820 200" fill="none"/>
<circle r="2.5" fill="#60a5fa" opacity="0">
  <animateMotion dur="3s" repeatCount="indefinite"><mpath href="#flow-path"/></animateMotion>
  <animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/>
</circle>
\`\`\`

**Callout badges** (slide-in from right):
\`\`\`
<g opacity="0" transform="translate(730, 80)">
  <animateTransform attributeName="transform" type="translate" values="750,80; 730,80" dur="0.5s" fill="freeze"/>
  <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze"/>
  <rect x="0" y="0" width="220" height="20" rx="10" fill="#1e293b" stroke="#60a5fa"/>
  <text x="110" y="14" font-size="10" fill="#f8fafc" text-anchor="middle">Key insight here</text>
</g>
\`\`\`

**Bottom summary bar** (3 columns with emoji icons):
\`\`\`
<g transform="translate(70, 640)">
  <rect width="860" height="60" rx="10" fill="#0f172a" stroke="#1e293b"/>
  <line x1="286" y1="10" x2="286" y2="50" stroke="#1e293b"/>
  <line x1="573" y1="10" x2="573" y2="50" stroke="#1e293b"/>
  <text x="143" y="30" font-size="13" font-weight="600" fill="#60a5fa" text-anchor="middle">Column 1</text>
  <text x="430" y="30" font-size="13" font-weight="600" fill="#f472b6" text-anchor="middle">Column 2</text>
  <text x="716" y="30" font-size="13" font-weight="600" fill="#4ade80" text-anchor="middle">Column 3</text>
</g>
\`\`\`

**Floating decorative diamonds**:
\`\`\`
<g transform="translate(880, 40)">
  <animateTransform attributeName="transform" type="translate" values="880,40; 880,30; 880,40" dur="4s" repeatCount="indefinite"/>
  <rect x="-4" y="-4" width="8" height="8" fill="#f8fafc" opacity="0.1" transform="rotate(45)"/>
</g>
\`\`\`

## Slide Composition Rules
Each slide MUST combine 4+ of these patterns. Use stick figures for actors, speech bubbles for dialogue, panels with code-lines for processes, gears for services, arrows with dash animation for flow, particles for data movement, callout badges for key insights, bottom bar for summaries.

## Animation (per slide)
- Sequential reveal: elements fade in with staggered begin times, fill="freeze"
- 0-0.5s: background
- 0.3-1s: title + decorative lines
- 0.8-2s: main panels/content
- 1.5-3s: connections, arrows, annotations
- 2.5-4s: callout badges, bottom bar
- Persistent loops: glow pulse, dash-flow, bob — continue indefinitely

## Slide Structure
Each slide MUST have:
- Background (3 layers: gradient + pattern + vignette)
- Title at top with decorative side-lines
- Main visual area (diagram, split comparison, flow, hub-spoke)
- At least 2 callout badges or annotation panels
- At least 1 animated element (glow, dash-flow, or bob)

## Presentation Flow
- Slide 1: Title slide — big title, subtitle, decorative visual, deck overview
- Slides 2-N: Content — one concept per slide, progressively deeper
- Last slide: Summary — key takeaways in callout badges, bottom bar with 3 columns

## Rules
- Output 3-6 slides per request
- Each slide is a complete self-contained SVG (own defs, own filters, own gradients — use unique ids per slide like bg1, bg2, glow1, glow2 to avoid conflicts)
- Vary layout per slide: horizontal flow → split comparison → hub-spoke → timeline → centered
- Keep consistent color theme across all slides
- NEVER make a slide that is just text on a background — always add visual structure
`;
  }

  if (previousState) {
    contextPrompt += `

CURRENT UI STATE (JSON):
${JSON.stringify(previousState, null, 2)}

UPDATE INSTRUCTION:
The user wants to modify the CURRENT UI STATE based on the USER REQUEST below.
1. KEEP existing logic, data, and visual style unless explicitly asked to change.
2. MERGE new requirements into the existing structure.
3. Return the COMPLETE updated JSON tree.
`;
  }

  contextPrompt += `
USER REQUEST:
${prompt}

INSTRUCTIONS:
Generate the JSON UI Tree. Ensure layout adapts to ${context.device}.
Do NOT output Markdown. Output raw JSON.
`;

  return contextPrompt;
}

export function buildRefinementPrompt(config: RefineConfig): string {
  const { prompt, currentNode } = config;
  return `
You are an expert UI Refiner.

EXISTING COMPONENT JSON:
${JSON.stringify(currentNode, null, 2)}

USER REQUEST FOR MODIFICATION:
${prompt}

COMPONENT SPECS:
${COMPONENT_SPECS}

INSTRUCTIONS:
1. Modify the EXISTING COMPONENT JSON to satisfy the USER REQUEST.
2. Maintain the structure and integrity of the JSON.
3. Return ONLY the updated JSON for the specific component (and its children).
4. Do NOT wrap in Markdown.
`;
}

export function buildFixPrompt(config: FixConfig): string {
  const { error, badNode } = config;
  return `
You are an expert React/JSON Debugger.

ERROR DETECTED:
${error}

MALFORMED NODE JSON:
${JSON.stringify(badNode, null, 2)}

COMPONENT SPECS:
${COMPONENT_SPECS}

INSTRUCTIONS:
1. Analyze the error and the JSON.
2. Fix the JSON so it strictly adheres to the schema and solves the crash.
3. Return ONLY the fixed JSON node.
4. Do NOT wrap in Markdown.
`;
}

export function getSystemInstruction(): string {
  return SYSTEM_INSTRUCTION;
}
