
import { UINode } from "@/types";

export const DIAGNOSTIC_PAYLOAD: UINode = {
  "container": {
    "layout": "COL",
    "gap": "GAP_LG",
    "padding": true,
    "animation": { "type": "STAGGER_CONTAINER" },
    "children": [
      {
        "hero": {
          "title": "System Diagnostics",
          "subtitle": "Full functional test of the GenUI Architect Engine. Inspecting all registered components and action pathways.",
          "gradient": "ORANGE_RED",
          "align": "LEFT",
          "animation": { "type": "BLUR_IN" },
          "children": [
            {
              "button": {
                "label": "Test Toast Notification",
                "variant": "GLOW",
                "icon": "Bell",
                "action": { "type": "SHOW_TOAST", "payload": { "type": "SUCCESS", "title": "System Operational", "description": "Toast system is functioning correctly." } }
              }
            },
            {
              "button": {
                "label": "Test Confetti",
                "variant": "SECONDARY",
                "icon": "Sparkles",
                "action": { "type": "TRIGGER_EFFECT", "payload": { "effect": "CONFETTI" } }
              }
            }
          ]
        }
      },
      {
        "container": {
          "layout": "GRID",
          "gap": "GAP_MD",
          "children": [
            {
              "card": {
                "title": "Interactive Inputs",
                "variant": "GLASS",
                "children": [
                  { "text": { "content": "Interact with these controls to test local state management.", "variant": "CAPTION", "color": "MUTED" } },
                  { "input": { "label": "Test Input", "placeholder": "Type something...", "value": "Initial Value" } },
                  { "switch": { "label": "Test Switch", "value": true } },
                  { "slider": { "label": "Test Slider", "min": 0, "max": 100, "value": 75 } },
                  {
                     "button": {
                        "label": "Reset Form",
                        "variant": "OUTLINE",
                        "icon": "RotateCcw",
                        "action": { "type": "RESET_FORM" }
                     }
                  }
                ]
              }
            },
            {
              "card": {
                "title": "Action Sequences",
                "variant": "NEON",
                "children": [
                  { "text": { "content": "Tests SEQUENCE, DELAY, and CYCLE_STATE.", "variant": "CAPTION", "color": "MUTED" } },
                  {
                    "button": {
                      "label": "Run Sequence Test",
                      "variant": "PRIMARY",
                      "icon": "Play",
                      "action": {
                        "type": "SEQUENCE",
                        "payload": {
                          "actions": [
                            { "type": "PATCH_STATE", "path": "root.container.children.1.container.children.1.card.children.1.button", "payload": { "label": "Running...", "disabled": true } },
                            { "type": "DELAY", "payload": { "ms": 1500 } },
                            { "type": "SHOW_TOAST", "payload": { "type": "INFO", "title": "Step 1 Complete", "description": "Delay finished." } },
                            { "type": "PATCH_STATE", "path": "root.container.children.1.container.children.1.card.children.1.button", "payload": { "label": "Run Sequence Test", "disabled": false } },
                            { "type": "TRIGGER_EFFECT", "payload": { "effect": "SNOW" } }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "button": {
                      "label": "Cycle State (Click Me)",
                      "variant": "SECONDARY",
                      "icon": "RefreshCw",
                      "action": {
                        "type": "CYCLE_STATE",
                        "payload": {
                          "next": [
                            { "label": "Confirm?", "variant": "DANGER", "icon": "AlertTriangle" },
                            { "label": "Done", "variant": "GHOST", "disabled": true, "icon": "Check" }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      {
        "separator": {}
      },
      {
        "bento_container": {
          "children": [
            {
              "bento_card": {
                "title": "System Load",
                "colSpan": 2,
                "rowSpan": 2,
                "children": [
                   { 
                     "chart": { 
                       "type": "AREA", 
                       "title": "CPU Usage", 
                       "color": "#10b981", 
                       "data": [
                         { "name": "00:00", "value": 40 },
                         { "name": "04:00", "value": 30 },
                         { "name": "08:00", "value": 65 },
                         { "name": "12:00", "value": 85 },
                         { "name": "16:00", "value": 55 },
                         { "name": "20:00", "value": 45 }
                       ] 
                     } 
                   }
                ]
              }
            },
            {
              "bento_card": {
                "title": "Geography",
                "colSpan": 2,
                "children": [
                  { 
                    "map": { 
                      "style": "DARK", 
                      "markers": [
                        { "title": "Server US-East", "lat": 40.7, "lng": -74.0 },
                        { "title": "Server EU-West", "lat": 51.5, "lng": -0.1 }
                      ] 
                    } 
                  }
                ]
              }
            },
            {
              "bento_card": {
                "title": "Kanban Board",
                "colSpan": 4,
                "children": [
                  {
                    "kanban": {
                      "columns": [
                        { "title": "Backlog", "color": "GRAY", "items": ["Optimize Render Loop", "Fix Z-Index Issue"] },
                        { "title": "In Progress", "color": "BLUE", "items": [{ "content": "Refactor Hooks", "tag": "High Priority" }] },
                        { "title": "Done", "color": "GREEN", "items": ["Initial Release"] }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      {
        "container": {
            "layout": "GRID",
            "children": [
                {
                    "alert": {
                        "title": "Warning Test",
                        "description": "This is a warning alert with SHAKE animation.",
                        "variant": "WARNING",
                        "animation": { "type": "SHAKE", "trigger": "ON_VIEW" }
                    }
                },
                {
                    "alert": {
                        "title": "Success Test",
                        "description": "This is a success alert with POP animation.",
                        "variant": "SUCCESS",
                        "animation": { "type": "POP", "trigger": "ON_VIEW" }
                    }
                }
            ]
        }
      },
      {
          "accordion": {
              "variant": "SEPARATED",
              "items": [
                  { 
                      "title": "Hidden Details (Accordion Test)", 
                      "content": [
                          { "text": { "content": "The accordion component allows hiding dense content.", "variant": "BODY" } },
                          { "progress": { "label": "Capacity", "value": 92, "color": "RED" } }
                      ]
                  }
              ]
          }
      },
      {
          "table": {
              "headers": ["Component", "Status", "Version"],
              "rows": [
                  ["Core Engine", { "badge": { "label": "Operational", "color": "GREEN" } }, "v3.5"],
                  ["AI Bridge", { "badge": { "label": "Connected", "color": "BLUE" } }, "v2.1"],
                  ["Renderer", { "badge": { "label": "Idle", "color": "GRAY" } }, "v1.0"]
              ]
          }
      }
    ]
  }
};
