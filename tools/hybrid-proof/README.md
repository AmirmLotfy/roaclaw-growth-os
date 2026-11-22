# Firebase hybrid inference probe

This development probe sends one fixed synthetic product offer through the Firebase JavaScript SDK. It validates the exact fixture fields and reads the SDK's `response.inferenceSource`. The two cloud buttons explicitly authorize sending the synthetic fixture. The on-device button always selects `ONLY_ON_DEVICE`.

Use Node 22, pnpm 10.34.9 and an installed desktop Google Chrome. Work from this directory.

```sh
npm exec --yes --package=pnpm@10.34.9 -- pnpm install --frozen-lockfile
npm exec --yes --package=pnpm@10.34.9 -- pnpm check
npm exec --yes --package=pnpm@10.34.9 -- pnpm dev
```

Populate `.env.local` using `.env.example` and the intended Firebase web app's SDK configuration. The development server binds to `http://127.0.0.1:5173`, a secure context for the Chrome API. A registered reCAPTCHA Enterprise site key is supported for an attested HTTPS origin. Keep development tokens in a private file and inject them only into the loopback test context. [App Check setup](https://firebase.google.com/docs/ai-logic/app-check)

The verifier launches installed Google Chrome in an isolated profile and enables the three Chrome flags for Gemma 4, Prompt API, and Prompt API multimodal input. Chrome can download its own model components using its normal browser configuration. With `--keep-profile`, Chrome retains model download state in the gitignored `.local/g0-chrome` directory. The profile volume needs at least 22 GB free before the initial download. [Chrome hardware and model requirements](https://developer.chrome.com/docs/ai/get-started)

To verify the on-device path and repeat it offline, run this from a second shell. Use the same profile on later runs so Chrome can reuse downloaded components.

```sh
npm exec --yes --package=pnpm@10.34.9 -- pnpm verify --local-only --keep-profile
```

This run uses the Firebase web configuration and skips cloud requests and App Check debug token injection. It writes its screenshots, Chrome broker diagnostics, and redacted request summary to `qa/evidence/g0/after-storage/`. The offline check disconnects the browser context after the probe page has loaded and records `navigator.onLine`. Both calls must return the SDK's `on_device` source and the exact synthetic fixture with zero external requests from the page.

For a full hybrid verification, set `ROACLAW_DEBUG_TOKEN_FILE` to the absolute path of a private file with a temporary App Check debug token unless a registered website key is configured. Revoke the token when testing ends.

```sh
npm exec --yes --package=pnpm@10.34.9 -- pnpm verify --keep-profile
```

The full run writes to `qa/evidence/g0/` and requires observed cloud and local SDK results.
