# ROACLAW design research

Reviewed 22 November 2026. Connected Mobbin and Refero returned live results. The observations below come from 16 inspected screen previews, six inspected flow previews and six inspected marketing or supporting sections. Refero also returned three full style references. Source links identify third-party reference material and carry no reuse rights. The product and submission must use original ROACLAW interface captures.

## Screens

| Reference | What the screen showed | ROACLAW decision |
|---|---|---|
| [Klaviyo campaign dates](https://mobbin.com/screens/2e181e3a-0b02-4090-a44e-2ce8d38c29e8) | The chosen date range lives directly above the campaign table. | Put period and currency beside the figures. Add selectable periods only when there are multiple real snapshots. |
| [Eventbrite Ads](https://mobbin.com/screens/cb099d59-5734-41c4-aa21-e277c8c12608) | A short performance summary and a campaign table sit under separate headings. | Use a single metric strip followed by the audit queue. Keep promotional banners out of the workspace. |
| [Shopify Attribution](https://mobbin.com/screens/0fefe340-be05-4143-a323-9c4cad81cf88) | The attribution selector stays in view above the chart, beside the date controls. | Keep data origin and attribution next to ROAS. Leave charting for a fixture with real time-series data. |
| [Reddit Ads Manager](https://mobbin.com/screens/caefd35c-08e4-47f9-a6fb-90f8e62eacd6) | UTC is explicit in the date picker and the reporting delay appears beneath the data table. | Put the timezone and freshness near the audited evidence. Skip write controls on read-only campaign records. |
| [incident.io Catalog](https://mobbin.com/screens/5f7e27d9-ca30-414c-911d-be9c498b5ed4) | The menu lists catalog types with brief descriptions and clear grouping. | Show business type under the workspace name where labels might be ambiguous. Keep dashboard navigation shallow. |
| [Plane workspace navigation](https://mobbin.com/screens/ab364279-6ade-4afa-bea0-51edb9a04c88) | Workspace and team spaces have visible group labels, with additional views behind an expandable list. | Keep the current workspace and the active page easy to distinguish. Keep frequently used audit destinations visible. |
| [hilos workspaces](https://mobbin.com/screens/31c62342-dc6a-4f0c-ba88-55c60028ded9) | The selected workspace has a check, and the workspace creation action sits below a rule. | Label the current workspace in text and give creation a separate action. Use the ROACLAW neutral palette. |
| [HubSpot authorization](https://mobbin.com/screens/0ec5719f-7602-44cf-b56a-f8d6d631c894) | The authorization screen divides capabilities into what the app can do and what it can view. | Put data access and the exact browser write in distinct lines. Keep the full scope of the one action visible. |
| [Intercom authorization](https://mobbin.com/screens/1c0be7f8-f887-40fc-b404-565c3711207f) | The modal lists requested access immediately above two explicit outcomes. | Show the affected workspace, destination and cancel action together. Use a short scope tied to the selected page. |
| [Motion permissions](https://mobbin.com/screens/0c8f5852-5996-4614-ad84-59b20aed9fcf) | Each permission has a short explanation alongside its name. | Explain current-tab access and bookmark access in the context of the action that needs each permission. |
| [Contra assistant](https://mobbin.com/screens/7d4bb864-3dec-4e3c-860c-89511edaf3a3) | A wide empty assistant canvas offers several starter tasks beneath the composer. | Give a new user one direct task, Inspect current page, from the existing workspace context. |
| [Navan Agent setup](https://mobbin.com/screens/d890d63f-7e07-4aa9-907f-c2a423e01a2c) | Setup progress remains visible in the side panel header while the content changes underneath. | Pin current scope and actual audit stage above the scrollable panel content. Avoid hiding source details behind a composer. |
| [Canva assistant](https://mobbin.com/screens/b1b2ff42-136b-4a79-a383-85479b0744b7) | A small set of selectable options replaces free-text answers for a bounded question. | Use a named choice when mode or workspace matters. Reserve free text for the text interaction fallback. |
| [Dock Reports](https://refero.design/pages/84f44ffa-3238-4d5c-afa4-6c5b17c80f8e) | Report dimensions, global filters and the time controls have separate visual levels. | Keep workspace scope global and evidence controls with each report. Avoid a wall of unhelpful metric boxes. |
| [Attio pie report source](https://refero.design/pages/750b8e85-2f2a-400e-b7d4-a342efdb55b0) | Data source and filters remain visible in a narrow right lane while the report fills the center. | Reserve a review lane for source context and action approval beside the findings. |
| [Attio bar report source](https://refero.design/pages/81cf41aa-ffb9-47d9-a6bb-e4cb250681f9) | The report title and refresh control stay near the result while axis settings remain in the configuration lane. | Show last observed data and rerun alongside results. Keep review controls away from the evidence text. |

## Flows

| Reference | Visible sequence | ROACLAW decision |
|---|---|---|
| [Lemni workspace creation](https://mobbin.com/flows/dee9b76a-28b7-460c-8448-316ff4684c0e) | The current workspace menu opens on top of the current record and adds a new choice. | Use a short, scoped switch flow and clear the previous client's content as soon as a change starts. |
| [Notion workspace creation](https://mobbin.com/flows/757b6888-6eaa-498d-9b18-c013c9a2ef4a) | The flow asks intended use, creates a named workspace and offers an invitation step before landing in the new workspace. | Select business type early. Demo access should reach the workspace without an invitation. |
| [Asana workspace creation](https://mobbin.com/flows/9a8a34ca-5372-468f-a766-3a963f99d7eb) | A short dialog creates a workspace and the result is visibly empty under the new name. | Show a clear next action on empty workspaces and keep selected workspace context on screen. |
| [Cofounder connection](https://mobbin.com/flows/7897406d-dd60-4afa-94ad-65a9468c1d64) | The app keeps the selected destination visible and instructs the user to finish in the popup. | Keep the pending destination visible during native browser permission. Show success after the permission or action returns and is checked. |
| [Reddit Google connection](https://mobbin.com/flows/51ec77f0-7832-416d-a74d-1a6d6ad8f753) | The third-party permission step names both identities, followed by a visible disconnect option in settings. | Show Chrome permission and workspace selection as explicit states. Provide a way to remove access. |
| [YouTube connected apps](https://mobbin.com/flows/fe7dda5d-8a91-4cf3-b7e3-2f240ac32f57) | The user chooses an app, confirms the account connection and returns to the list. | Require confirmation for the selected binding and show its status on return. Avoid a broad connector gallery for the first release. |

## Marketing and supporting sections

| Reference | Observed pattern | ROACLAW decision |
|---|---|---|
| [Twenty hero](https://mobbin.com/sites/sections/abe261e4-d901-42f1-bea3-0a806e2d0669) | A large typographic promise leads into a legible application view. | Present one promise and one true audit screenshot. Leave ornamental graphics out of the product proof. |
| [Front hero](https://mobbin.com/sites/sections/ba4ff47e-3460-4256-b2fb-0e0948cd8eb9) | The image shows the list, work detail and contact record together. | Choose a real capture that shows the finding, its source and the associated action. Use a flat paper surface. |
| [Contractbook hero](https://mobbin.com/sites/sections/302907ff-78a2-4aa6-88c8-aeebf1bcdf99) | The crop features the product with one recognizable reminder interaction. | Show one annotated approval when footage exists. Leave ratings, award badges and arrows out of the hero. |
| [Clay security and privacy](https://mobbin.com/sites/sections/f6b99489-51e8-4c71-b48c-3d752496629f) | A contents rail indexes each data source beside a readable policy column. | Document what happens to captured page fields, bookmarks and model inputs in source-specific terms. |
| [mymind data security](https://mobbin.com/sites/sections/e28ccedd-81eb-490b-9080-26a18395379e) | A dedicated heading introduces a concrete explanation of data handling. | Explain separately where analysis runs and what can be stored. Keep the description grounded in verified behavior. |
| [Campsite security section](https://mobbin.com/sites/sections/7dd8f0d7-cc02-4852-8557-7eaf89de6fa7) | An isolated trust callout is easy to find, with minimal supporting prose. | Place the privacy choice close to the first audit action and state its concrete effect. |

## Direction

Scores are design judgments on a five-point scale. The pack supplies the final tokens.

| Direction and Refero style | Clarity | Distinctiveness | Trust | Accessibility | Feasibility | Decision |
|---|---:|---:|---:|---:|---:|---|
| Editorial Ledger, [Munro Partners](https://munropartners.com), style `83fcbacf-7eb7-49ce-b7f8-07f5f6f4d3e3` | 5 | 5 | 5 | 5 | 5 | Selected. Use fine rules and readable figures to build the evidence ledger. |
| Dark Monitoring Terminal, [Serro](https://serro.ai), style `b5e299df-6ce9-4a9f-a977-31b1f7844abd` | 4 | 4 | 4 | 3 | 3 | Retain clear status labels and compact controls. Dark treatments and instrumentation add scope. |
| Playful Consumer Assistant, [Todoist](https://todoist.com), style `301153ce-4e7f-4f78-94d7-74b6a4b0157f` | 4 | 4 | 3 | 4 | 3 | Retain everyday action language. Illustrations and tinted panels compete with audit evidence. |

The chosen direction keeps the specified paper and ink palette, oxide action accent, IBM Plex Sans and Mono, and Instrument Serif for marketing display type. The report area should keep review controls beside cited evidence on desktop and stack those elements at narrow widths. Keep keyboard focus visible in deep teal and use text for status. Show page origin and permission scope before capture, then carry workspace identity and the verified receipt through the 360px side panel. Motion should acknowledge meaningful actions and respect reduced motion. Use logical alignment and direction-aware components for future RTL work.

Refero's section search returned a tool-not-found response. The six visually inspected Mobbin sections cover the requested section count. The individual Refero screen images and full style records worked.

## Visual revision · 22 November 2026

The project owner rejected the initial warm editorial direction after reviewing it. The current implementation uses the audit layout and tokens documented in DESIGN.md.

- The Customer.io event detail screen shows a narrow source table beside contextual review. ROACLAW uses that same relationship for findings and bookmark approval, with its own layout and controls. [Mobbin screen](https://mobbin.com/screens/c1d45657-65be-40cc-a6b7-52602efd2dbf)
- Serro uses squared controls, restrained color, blue for action, and software as evidence. ROACLAW carries through the action color and keeps the workflow itself in view. [Refero style source](https://serro.ai)
- Sourcegraph uses fine rules and a disciplined accent. ROACLAW uses quiet rules for evidence and reserves stronger colors for confirmed states, priority, and the run action. [Refero style source](https://sourcegraph.com)
