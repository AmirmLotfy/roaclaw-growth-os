# Component inventory

The web shell combines a workspace selector, navigation rail, status line, data strip and two-column audit. The evidence pane owns inspected source, execution mode, findings and optional cloud commentary. The action pane owns the before/proposed URL and Chrome receipt. Its companion panel groups capture, research and action approvals in the available width.

| Component | Files |
|---|---|
| Workbench, evidence, action and workspace sections | `apps/web/app/page.tsx`, `apps/web/app/globals.css` |
| Demo storefront | `apps/web/app/demo-store/page.tsx`, `apps/web/app/demo-store/store.tsx` |
| Chrome companion | `apps/extension/panel.html`, `apps/extension/panel.css`, `apps/extension/panel.js` |
| Data and approval behaviors | `apps/web/lib/`, `apps/extension/service-worker.js`, `firestore.rules` |
