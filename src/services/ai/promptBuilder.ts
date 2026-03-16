import { COMPONENT_SPECS, SYSTEM_INSTRUCTION, FEW_SHOT_EXAMPLES } from '@/constants';
import { GenerationConfig, RefineConfig, FixConfig } from './IAIProvider';

export const JSON_ENFORCEMENT = '\nYou MUST respond with raw JSON only. No markdown, no explanation, no code fences.';

export function buildGenerationPrompt(config: GenerationConfig): string {
  const { prompt, context, previousState } = config;

  const isSvgMode = context.mode === 'svg_animation';
  const isGalgameMode = context.mode === 'galgame';

  let contextPrompt = `
CURRENT USER CONTEXT:
Role: ${context.role}
Device: ${context.device}
Theme: ${context.theme}
Mode: ${context.mode || 'default'}
`;

  // SVG and galgame modes don't need the full component library or few-shot examples
  if (!isSvgMode && !isGalgameMode) {
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

## Characters (when explaining human/agent interactions)
- Stick figures: circle head r=12-14, line body+limbs, stroke-width 2.5, stroke-linecap round
- Each character a different accent color matching their role
- Gentle bob: animateTransform type="translate" values="0,0; 0,2; 0,0" dur 3-4s
- Speech bubbles: rounded rect rx=8, fill dark, stroke #334155, triangle tail, pop-in scale animation

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
