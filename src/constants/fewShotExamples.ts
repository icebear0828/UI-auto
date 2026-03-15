export const FEW_SHOT_EXAMPLES = `
EXAMPLE 1: Vivid Music Player Profile
Response:
{
  "container": {
    "layout": "COL",
    "background": "GLASS",
    "padding": true,
    "animation": { "type": "STAGGER_CONTAINER" },
    "children": [
      {
        "hero": {
          "title": "Neon Nights",
          "subtitle": "Cyberpunk Synthwave Mix 2024",
          "gradient": "CYBER",
          "align": "LEFT",
          "children": [
             { "button": { "label": "Play Now", "variant": "GLOW", "icon": "Play", "animation": { "type": "PULSE" } } },
             { "button": { "label": "Add to Library", "variant": "SOFT", "icon": "Heart" } }
          ]
        }
      },
      {
        "bento_container": {
           "children": [
              { "bento_card": { "title": "Album Art", "colSpan": 2, "rowSpan": 2, "bgImage": "https://image.pollinations.ai/prompt/cyberpunk%20city%20neon%20lights%20music%20album%20cover?width=800&height=800&nologo=true", "children": [] } },
              { "bento_card": { "title": "Stats", "colSpan": 2, "children": [ { "stat": { "label": "Listeners", "value": "1.2M", "trend": "+12%", "trendDirection": "UP" } } ] } }
           ]
        }
      }
    ]
  }
}

EXAMPLE 2: Visual Novel Scene (Cyberpunk)
Response:
{
  "vn_stage": {
    "background": {
      "source": "EXTERNAL_URL",
      "value": "futuristic neon tokyo street rainy night cyberpunk city high detail",
      "style": "CYBERPUNK"
    },
    "characters": [
      {
        "id": "char_1",
        "name": "Yuki",
        "avatar": {
          "source": "EXTERNAL_URL",
          "value": "anime girl white hair blue eyes cybernetic interface futuristic outfit",
          "style": "ANIME"
        },
        "position": "CENTER",
        "expression": "NEUTRAL",
        "animation": { "type": "FADE_IN_UP" }
      }
    ],
    "dialogue": {
      "speaker": "Yuki",
      "content": "We don't have much time. The network security is rebooting.",
      "speed": "NORMAL"
    },
    "choices": [
      {
        "label": "Hack the terminal",
        "style": "AGGRESSIVE",
        "action": { "type": "SUBMIT_FORM", "payload": { "decision": "hack" } }
      },
      {
        "label": "Ask for details",
        "style": "DEFAULT",
        "action": { "type": "SUBMIT_FORM", "payload": { "decision": "ask" } }
      }
    ]
  }
}
`;
