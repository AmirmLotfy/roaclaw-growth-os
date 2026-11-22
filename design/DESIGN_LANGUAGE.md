# ROACLAW visual system

## Audit layout

The desktop layout has a 222px workspace rail, a client and view breadcrumb, and a single scrollable audit area. Put campaign figures in one horizontal strip. Keep the selected page, inference mode, and run action together. Lay out the findings next to the Chrome review on wide screens. On narrow screens, stack them in reading order and open navigation from Menu.

Use the verified two-column price comparison as the focal point when the sources disagree. Print captured and campaign evidence below its corresponding finding. Use the secondary rail for the exact bookmark destination, approval state, and audit history. In Chrome, put the connected workspace at the top and promote a pending approval above Inspect.

## Color

| Role | Color |
|---|---|
| Workspace rail | `#132642` |
| Dashboard canvas | `#F4F7FB` |
| Surface | `#FFFFFF` |
| Ink | `#14243D` |
| Secondary text | `#4C5B70` |
| Primary action and focus | `#1853D8` |
| Selected evidence | `#E9F1FD` |
| Border | `#CBD8E5` |
| Verified | `#17674F` |
| Warning | `#79460F` |
| High priority | `#9C2348` |

Keep dark navy in navigation and blue in primary controls, text links, focus, and selected evidence. Pair priority and verification colors with text. Surfaces use thin rules and radii of 4–6px.

## Type and content

IBM Plex Sans serves interface copy, headings, and the metric strip. Use IBM Plex Mono for timestamps, evidence excerpts, and URLs. Set the current view as the page heading. Use the supporting sentence to tell the user what they can do. Use plain verbs in controls and direct labels for what the model or browser returned.

When an action has a prerequisite, show it at the point of use. The browser panel keeps the destination visible during bookmark review. The demo storefront labels itself and uses an original illustrative product image for the synthetic item. Dashboard metrics and analysis originate from the documented fixtures and the actual inference calls.
