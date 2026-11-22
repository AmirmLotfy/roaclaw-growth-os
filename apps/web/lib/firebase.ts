import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

export const firebaseApp = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
});

function initializeBrowserAppCheck() {
  if (typeof window === 'undefined') return undefined;

  const appCheckWindow = window as Window & { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string };
  const marker = appCheckWindow.FIREBASE_APPCHECK_DEBUG_TOKEN;
  const debugRequested = marker === true || typeof marker === 'string';
  const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

  // The SDK reads the debug marker from the browser global during initialization.
  if (debugRequested && !isLoopback) return undefined;

  const siteKey = isLoopback ? undefined : process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey && !debugRequested) return undefined;

  return initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(siteKey || 'localhost-debug-provider'),
  });
}

export const appCheck = initializeBrowserAppCheck();
