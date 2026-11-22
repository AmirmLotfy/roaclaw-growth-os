# Visual QA checklist — don't ship mock-polished empty screens

## Required captures
- Marketing hero with real audit screenshot and no fake testimonials.
- 1440px Overview, 1280px Growth Audit, 390px responsive dashboard.
- 360px side panel with selected page context.
- 420px side panel with actionable finding and approval.
- Agency workspace switch to a second client.
- Light/dark only if both are fully styled (do not ship half-finished dark mode).
- Local model unavailability and cloud fallback consent.
- Error, stale data, loading, synthetic-demo label, approved action receipt.

## Must inspect manually
Contrast, typography, truncated labels, data alignment, action priority, line breaks, correct currency/timezone, empty states, horizontal scroll overflow, keyboard focus, reduced motion, JSON/debug text leaks. At least one visual screenshot comparison after refactor.

## Copy audit
Remove `unlock`, `supercharge`, `transform your journey`, overpromising causal results, invented testimonials, random customer logos, AI chatbot clichés, exaggerated savings. Every chart must have labeled axis/unit/period or be omitted.

## Research documentation
Mobbin/Refero source IDs and design decisions logged; third-party screenshots not used as product assets.
