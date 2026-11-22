# G4 Firebase Live voice verification

**Blocked by the Web SDK’s Live App Check transport.** Firebase documents `gemini-3.1-flash-live-preview` as a free-tier Gemini Developer API model and Web Live as a Preview feature. The dedicated Spark project has Firebase AI Logic App Check enforced. [Firebase Live guide](https://firebase.google.com/docs/ai-logic/live-api) · [Project App Check evidence](spark-readback.json)

The installed `firebase@13.4.0` resolves to `@firebase/ai@3.1.0`. Inspection of its published browser bundle found that `WebSocketUrl.toString()` supplies the Firebase Web API key as the only query parameter. `LiveSession._connectSession()` sends the model setup without retrieving or conveying an App Check token. The SDK attaches its App Check token in the separate HTTPS request path. An explicit `getToken()` before `getLiveGenerativeModel(...).connect()` therefore leaves the Live handshake unattested.

A report on the Firebase JavaScript SDK issue reproduces the same failure with the Gemini Developer API backend, a valid reCAPTCHA Enterprise setup, and a comparison HTTPS call that received HTTP 200 with App Check. Its Live WebSocket closed with code `1008` and reported `Firebase App Check token is invalid`. A Firebase maintainer confirms Web SDK Live has no supported exclusion from enforcement. [SDK issue and maintainer response](https://github.com/firebase/firebase-js-sdk/issues/10018) · [Firebase AI Logic App Check](https://firebase.google.com/docs/ai-logic/app-check)

ROACLAW’s Agent exposes its existing text lookup. Hands-free audio is deferred until a supported Firebase Web SDK release can attest the Live connection. Verification here consists of installed SDK inspection and upstream evidence. No microphone, audio payload, or model session was used.
