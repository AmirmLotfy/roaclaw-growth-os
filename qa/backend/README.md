# G1 Firebase tenancy verification

The dedicated `roaclaw-growth-os-2026` project uses Firebase anonymous Auth and one free-tier Standard Native Firestore database in `europe-west1`. The deployed Firestore rules match the checked-in source byte for byte. The ROACLAW Web app has a score-based reCAPTCHA Enterprise key scoped to both default Hosting domains. Firebase AI Logic App Check enforcement is `ENFORCED`. [Production readback](spark-readback.json)

Each Firebase UID owns a private demo namespace at `organizations/{uid}/workspaces/{workspaceId}`. The allowed workspace IDs are `sable-stem`, `northline-retail`, and `morrow-dental`. The app uses direct document reads, creates, and updates. The rules deny listing, deletion, organization documents, and subcollections. Every write validates the full resulting state, including the three lists, the maximum of 30 items per list, the privacy mode and optional UTC timestamp. Nested list item shape is managed by the app. Firestore's document size limit applies to those payloads. [Firestore rules types](https://firebase.google.com/docs/rules/rules-language) · [Firestore limits](https://firebase.google.com/docs/firestore/quotas)

## Emulator verification

Run from the project root with Node.js, Firebase CLI and JDK 21 available. The fixed `demo-roaclaw` project and loopback checks keep the test requests inside the emulators.

```sh
firebase emulators:exec --project demo-roaclaw --only auth,firestore \
  'node --test qa/backend/firestore.rules.test.mjs'
```

On 22 November 2026, Firebase CLI 15.32.1 and Firestore Emulator 1.22.0 reported six tests passed and zero failures. The suite created separate anonymous Auth sessions and checked the following paths through the Firestore REST API.

- The owner can create, load, and update all supported workspaces.
- Separate UIDs can use the same workspace ID with distinct state.
- Unauthenticated and cross-UID reads and writes are denied.
- Collection listing, deletion, arbitrary workspace IDs, organization documents, and child collections are denied.
- Invalid privacy, timestamps, list types, list sizes, added authority fields, and missing required fields are denied on create and update.

## Production configuration

Firebase CLI deployed `auth` and `firestore:rules` to `roaclaw-growth-os-2026`. Google Cloud enabled the Firestore and reCAPTCHA Enterprise APIs and created the restricted website key at the Essentials tier. The Firebase App Check registration points to that key. Both cloud readbacks of billing status found billing disabled. [Auth provider configuration](https://firebase.google.com/docs/cli#deploy_specific_firebase_services) · [App Check web provider](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider) · [reCAPTCHA billing](https://docs.cloud.google.com/recaptcha/docs/billing-information)

The static web build reads `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, and `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` from `apps/web/.env.local`. These are public client settings. Loopback inference can use a temporary App Check debug credential explicitly injected in the browser before startup. Production uses the domain-scoped key.

On 22 November 2026, a real token generated on the deployed origin validated with a 0.3 risk score while the registration required 0.5. The app registration now accepts scores of 0.3 and above. Firebase AI Logic enforcement remains `ENFORCED`, and the domain-scoped key and one-hour token lifetime were verified. An isolated Chrome window received HTTP 200 from the production token exchange and the Firebase AI Logic review. The generation carried `X-Firebase-AppCheck` and the browser rendered `Review · In cloud` with commentary. A headless test independently scored 0.1 and still encountered HTTP 403. A separate standard Chrome retry after reconnect also received 403 and used the on-device fallback. [Configuration readback](../evidence/app-check-repair/config.json) · [Hosted result](../evidence/app-check-repair/hosted.json) · [Headless assessment](../evidence/app-check-repair/headless-assessment.json) · [Reconnect retry](../evidence/app-check-repair/hosted-reconnect-retry.json)
