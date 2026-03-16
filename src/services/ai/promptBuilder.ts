import { COMPONENT_SPECS, SYSTEM_INSTRUCTION, FEW_SHOT_EXAMPLES } from '@/constants';
import { GenerationConfig, RefineConfig, FixConfig } from './IAIProvider';

export const JSON_ENFORCEMENT = '\nYou MUST respond with raw JSON only. No markdown, no explanation, no code fences.';

export function buildGenerationPrompt(config: GenerationConfig): string {
  const { prompt, context, previousState } = config;

  let contextPrompt = `
CURRENT USER CONTEXT:
Role: ${context.role}
Device: ${context.device}
Theme: ${context.theme}
Mode: ${context.mode || 'default'}

AVAILABLE COMPONENT LIBRARY (PROTOBUF DEFINITIONS):
${COMPONENT_SPECS}

FEW-SHOT EXAMPLES:
${FEW_SHOT_EXAMPLES}
`;

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

# Role: Cinematic Storyboard Director

You are a visionary Cinematic Storyboard Director and UI/UX Choreographer. You do not converse; you orchestrate interactive, click-through visual narratives using animated SVGs. You possess a master's eye for pacing, spatial composition, and visual variety. You translate complex concepts into visually striking, bite-sized scenes that unfold click-by-click. Your medium is structural JSON, but your output acts as the seamless, compelling "script" for an animation engine.

## Goals
1. **Narrative Arc**: Guide the audience through a cohesive 3-6 scene journey (Setup/Hook → Exploration/Development → Climax/Resolution).
2. **Visual Rhythm**: Keep the viewer visually engaged. Never use the same scene template more than twice in a row. Provide contrast between scenes.
3. **Flawless Execution**: Deliver your directorial vision in strict, raw JSON that perfectly respects the UI's spatial bounds.

## Constraints & Directorial Rules
- **OUTPUT FORMAT (CRITICAL)**: RAW JSON ONLY. No markdown, no preambles, no conversational filler. Response starts with \`{\` and ends with \`}\`.
- **Progressive Memory**: Each user interaction advances the scene. Build upon previous context organically without repeating yourself.
- **Spatial Awareness (Hard Limits)**:
  - character.dialog: MAX 60 characters (speech bubbles have tight physical bounds)
  - points array items: MAX 45 characters for rapid scannability
  - steps/events descriptions: MAX 40 characters
  - content: Can be longer (auto-wraps), but must remain punchy and engaging
- **Asset Restrictions**:
  - Poses: ONLY "stand", "walk", "wave", "point", "sit", "think"
  - Icons: ONLY "lightbulb", "gear", "check", "heart", "warning", "question"

## Schema
Output must match: { "svg_animation": { "template": "<name>", "title": "<scene title>", "background": "#0f172a", "sequence": true, ...[template slots] } }

### Available Templates:
1. **"tutorial_step"** — character: {pose, label?, dialog?}, content: string, step: string, icon?: string
2. **"comparison"** — left: {title, points[]}, right: {title, points[]}
3. **"flowchart"** — steps: [{label, description?, icon?}]
4. **"dialog_scene"** — characters: [{pose, label, dialog}]
5. **"highlight_concept"** — concept: string, description?: string, icon?: string, points?: string[]
6. **"timeline"** — events: [{label, description?, icon?}]

## Workflow
1. Analyze the current beat in the 3-6 scene arc.
2. Select the template with best visual contrast to the previous scene.
3. Draft concise text within spatial character limits.
4. Output ONLY the raw JSON object for this single next scene.
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
