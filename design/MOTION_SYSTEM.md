# Motion specification — ROACLAW

## Art/motion/interaction/technology separation
Art = warm editorial control-room identity. Motion = efficient acknowledgment and evidence progression. Interaction = user actions, approvals and navigation. Technology = CSS transitions, lightweight Motion/Framer if already justified, Remotion for the video. No WebGL/Three.js or continuous background animation.

## Source patterns / inspiration credits (not direct asset licenses)
- Motion Atlas `motion-cinematic-ui-documentary`: narrative with actual interface capture; ref https://motion.dev/docs/scroll
- Motion Atlas `motion-editorial-swiss-motion`: disciplined kinetic type; creative example https://www.ordinaryfolk.co/project/school-of-motion-manifesto
- Motion Atlas `motion-animated-infographics-data`: factual data storytelling; example https://buck.co/work/ibm-design-language
- Motion Atlas `motion-ui-ux-product-animation`: authentic product state changes; example https://www.ordinaryfolk.co/project/webflow-ecommerce

## Tokens
- Press feedback 140ms `cubic-bezier(0.2,0,0,1)`.
- Drawers and page context swap 280ms `cubic-bezier(0.22,1,0.36,1)`.
- Audit step transition up to 480ms only when it aids comprehension.
- List stagger <=45ms only for 3-5 items and never hide content needed for keyboard navigation.
- Move 6-12px max in product UI; avoid scale/rotation theatrics.
- No essential content delayed by a transition. `prefers-reduced-motion: reduce` disables transforms and stagger; content remains available.

## State/trigger map
| Pattern | Trigger | Behavior | Reduced-motion fallback |
|---|---|---|---|
| Side panel opens | User invokes extension | Panel appears immediately; context header opacity subtle | Instant appearance |
| Workspace switch | Confirmed selection | Replace content after authorized query, no data bleed; quiet crossfade | Hard replacement |
| Audit starts | User presses Audit | Progress step list shows current real phase, no fake spinner percentage | Static progress labels |
| Finding expands | User clicks evidence row | 280ms drawer slide; focus goes to heading | Instant open + focus |
| Action approved | Confirmation | Action status changes in place, receipt appears after verified call | Instant status update |
| Chart data changes | Date/source changed | Short opacity/counter update only after data is available | Static number and period |
| Voice streaming | Connected session | Discrete waveform based on real mic signal, not fake looping waves | Static 'Listening' text |
| Error/offline | API or model fails | Inline explanation and retry; never decorative wobble | Same static alert |

## Video use
Use real screen captures as primary media; Remotion may animate camera crops, typographic chapter marks, caption highlights and data citations around footage. Strong first 5 seconds, restrained mid-film, deliberate last 6 seconds. 30fps, 16:9, caption-safe. No fake UI playback.

## Motion QA
Capture start/mid/end screenshots for each interactive transition. Test escape, back, resize, reduced-motion, low-end Chrome hardware, keyboard, and concurrent loading. Keep heavy blur/filter and global scroll hooks out of the implementation.
