// 2.1 Prompt Engineering - Detailed Component Specs for the LLM
export const COMPONENT_SPECS = `
COMPONENT DEFINITIONS (Protobuf OneOf Schema)
---------------------------------------------
Each node MUST be an object with EXACTLY ONE key (the component name).
**GLOBAL PROP:** All visual components support an optional \`animation\` object.
  - animation: {
      type: "FADE_IN" | "FADE_IN_UP" | "SLIDE_FROM_LEFT" | "SCALE_ELASTIC" | "BLUR_IN" | "STAGGER_CONTAINER" | "PULSE" | "SHIMMER" | "SHAKE" | "BOUNCE" | "GLOW" | "TYPEWRITER" | "SCRAMBLE" | "GRADIENT_FLOW" | "WIGGLE" | "POP" | "HOVER_GROW",
      duration: "FAST" | "NORMAL" | "SLOW",
      delay: number (seconds),
      trigger: "ON_MOUNT" | "ON_HOVER" | "ON_VIEW"
    }

1. "container"
   - Props:
     - layout: "COL" (default), "ROW", "GRID"
     - gap: "GAP_SM", "GAP_MD", "GAP_LG", "GAP_XL"
     - padding: boolean
     - background: "DEFAULT" (transparent), "SURFACE", "GLASS"
     - bgImage: string (URL for background image)
     - className: string (Tailwind classes)
     - children: Array of Nodes

2. "hero"
   - Props:
     - title: string
     - subtitle: string
     - gradient: "BLUE_PURPLE", "ORANGE_RED", "GREEN_TEAL", "AURORA", "CYBER"
     - align: "CENTER", "LEFT"
     - children: Array of Nodes (Buttons usually)

3. "text"
   - Props:
     - content: string
     - variant: "H1", "H2", "H3", "BODY", "CAPTION", "CODE"
     - color: "DEFAULT", "MUTED", "PRIMARY", "ACCENT", "DANGER", "SUCCESS"
     - font: "SANS" (default), "SERIF", "CURSIVE"

4. "button"
   - Props:
     - label: string
     - variant: "PRIMARY", "SECONDARY", "GHOST", "DANGER", "GLOW", "OUTLINE", "SOFT", "GRADIENT"
     - icon: string (Lucide icon name)
     - disabled: boolean
     - action: { "type": string, "payload": any }
       * "NAVIGATE": { "url": string, "target": "_blank" | "_self" }
       * "OPEN_MODAL": { "title": string, "content": UINode }
       * "CLOSE_MODAL": {}
       * "TRIGGER_EFFECT": { "effect": "CONFETTI" | "SNOW" | "FIREWORKS" | "HEARTS" | "SPARKLE" }
       * "SHOW_TOAST": { "message": string, "type": "SUCCESS" | "ERROR" | "INFO" }
       * "COPY_TO_CLIPBOARD": { "text": string }
       * "DOWNLOAD": { "filename": string, "content": string }
       * "CYCLE_STATE": { "next": Array<ButtonProps> }
       * "SUBMIT_FORM": {}
       * "RESET_FORM": {}
       * "SEQUENCE": { "actions": Array<Action> }
       * "GO_BACK": {}
       * "DELAY": { "ms": number }
       * "PATCH_STATE": { "payload": { "key": "value" } } (Can target parent stepper by path)

5. "card"
   - Props:
     - title: string
     - variant: "DEFAULT", "GLASS", "NEON", "OUTLINED", "ELEVATED", "FROSTED"
     - children: Array of Nodes

6. "table"
   - Props:
     - headers: Array<string>
     - rows: Array<Array<string | UINode>>

7. "stat"
   - Props:
     - label: string
     - value: string
     - trend: string
     - trendDirection: "UP", "DOWN", "NEUTRAL"

8. "progress"
   - Props:
     - label: string
     - value: number (0-100)
     - color: "BLUE", "GREEN", "ORANGE", "RED"

9. "alert"
   - Props:
     - title: string
     - description: string
     - variant: "INFO", "SUCCESS", "WARNING", "ERROR"

10. "avatar"
    - Props:
      - initials: string
      - src: string (URL)
      - status: "ONLINE", "OFFLINE", "BUSY"

11. "chart" (Recharts)
    - Props:
      - title: string
      - type: "BAR", "LINE", "AREA"
      - color: string (Hex)
      - data: Array<{ name: string, value: number }>

12. "accordion"
    - Props:
      - variant: "DEFAULT", "SEPARATED"
      - items: Array<{ title: string, content: Array<Nodes> }>

13. "image"
    - Props:
      - src: string (Use placeholder APIs if needed)
      - alt: string
      - caption: string
      - aspectRatio: "VIDEO", "SQUARE", "WIDE", "PORTRAIT"

14. "map"
    - Props:
      - label: string
      - defaultZoom: number
      - style: "DARK", "LIGHT", "SATELLITE"
      - markers: Array<{ title: string, lat: number, lng: number }>

15. "bento_container" (Grid Layout)
    - Props:
      - children: Array<Nodes> (Must contain "bento_card" nodes)

16. "bento_card" (Grid Item)
    - Props:
      - title: string
      - colSpan: number (1-4, default 1)
      - rowSpan: number (1-3, default 1)
      - bgImage: string (optional)
      - children: Array<Nodes>

17. "kanban" (Project Board)
    - Props:
      - columns: Array<{ title: string, color: string, items: Array<string | { content: string, tag: string }> }>
      * Colors: "BLUE", "GREEN", "ORANGE", "RED", "GRAY"

18. "input" (Text Field)
    - Props:
      - label: string
      - placeholder: string
      - inputType: "text", "email", "password", "number"
      - value: string
      - validation: {
          "required": boolean,
          "pattern": string (regex),
          "minLength": number,
          "maxLength": number,
          "errorMessage": string
        }

19. "switch" (Toggle)
    - Props:
      - label: string
      - value: boolean (default false)

20. "slider" (Range)
    - Props:
      - label: string
      - min: number
      - max: number
      - value: number
      - step: number

21. "tabs" (Tabbed Interface)
    - Props:
      - defaultValue: string (id of active tab)
      - variant: "DEFAULT", "PILLS", "UNDERLINE"
      - items: Array<{ id: string, label: string, content: Array<Nodes> }>

22. "stepper" (Multi-step Workflow)
    - Props:
      - currentStep: number (0-indexed)
      - items: Array<{ id: string, title: string, content: Array<Nodes> }>
      * To make a "Next" button, use PATCH_STATE on the button to update 'currentStep'.

23. "timeline" (Vertical Activity Log)
    - Props:
      - items: Array<{ title: string, description: string, time: string, status: "COMPLETED" | "ACTIVE" | "PENDING", icon: string }>
      - variant: "DEFAULT", "GLOW"

24. "codeblock" (Terminal / Code Display)
    - Props:
      - code: string
      - language: string
      - filename: string

25. "textarea" (Multi-line Input)
    - Props:
      - label: string
      - placeholder: string
      - value: string

26. "split_pane" (Resizable Layout)
    - Props:
      - direction: "ROW" | "COL"
      - initialSize: number (10-90, percentage)
      - children: Array<Nodes> (Must have exactly 2 children)

27. "calendar" (Date Picker)
    - Props:
      - label: string
      - selectedDate: string (YYYY-MM-DD)

28. "badge"
    - Props:
      - label: string
      - color: string (CSS color or named color)

29. "separator"
    - Props:
      - orientation: "HORIZONTAL" | "VERTICAL" (default: HORIZONTAL)

30. "vn_stage" (Visual Novel / Galgame Engine)
    - Props:
      - background: { source: "EXTERNAL_URL" | "GENERATED", value: string, style?: string }
      - characters: Array<{
          id: string,
          name: string,
          avatar: { source: "EXTERNAL_URL" | "GENERATED", value: string, style?: string },
          position: "LEFT" | "CENTER" | "RIGHT" | "CLOSE_UP",
          expression: "NEUTRAL" | "SMILE" | "ANGRY" | "BLUSH" | "SAD" | "SHOCKED"
        }>
      - dialogue: { speaker: string, content: string, speed: "SLOW" | "NORMAL" | "FAST" }
      - choices: Array<{ label: string, action: Action, style?: "DEFAULT" | "AGGRESSIVE" | "ROMANTIC" }>
      - bgm: string (optional)

31. "svg_animation" (Animated SVG Scene)
    - AI generates complete SVG code with SMIL animations
    - Props:
      - title: string (scene title)
      - svg_code: string (complete SVG markup, sanitized before rendering)
    - The AI outputs raw SVG with: radial gradients, glow filters, SMIL animations, stick figures, flow arrows, data particles
    - Use for: tutorials, diagrams, comparisons, visual storytelling, flowcharts, timelines

32. "presentation" (Slide Deck — multiple SVG slides with navigation)
    - AI generates multiple slides in one response, each with its own SVG
    - Props:
      - title: string (deck title)
      - slides: Array of { title?: string, svg_code: string, notes?: string }
    - Each slide's svg_code follows the same rules as svg_animation
    - Navigation: ← → arrow keys, thumbnails, fullscreen (F key)
    - Last slide → click next triggers "continue" to generate more slides
    - Use for: presentations, tutorials, courses, multi-page explanations
`;
