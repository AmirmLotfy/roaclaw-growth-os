import { signInAnonymously, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export { appCheck, auth, db, firebaseApp } from './firebase';

let pendingSession: Promise<User> | undefined;

async function resumeOrCreateSession(): Promise<User> {
  // Firebase Auth restores its default persistent web session before this resolves.
  await auth.authStateReady();
  return auth.currentUser ?? (await signInAnonymously(auth)).user;
}

export function openDemoSession(): Promise<User> {
  pendingSession ??= resumeOrCreateSession().finally(() => {
    pendingSession = undefined;
  });
  return pendingSession;
}

function requireSession(uid: string): void {
  if (auth.currentUser?.uid !== uid) {
    throw new Error('The active demo session does not own this workspace.');
  }
}

export async function readWorkspace<T>(uid: string, workspaceId: string): Promise<T | null> {
  requireSession(uid);
  const snapshot = await getDoc(doc(db, 'organizations', uid, 'workspaces', workspaceId));
  requireSession(uid);
  return snapshot.exists() ? snapshot.data() as T : null;
}

export async function saveWorkspace<T extends object>(uid: string, workspaceId: string, data: T): Promise<void> {
  requireSession(uid);
  await setDoc(doc(db, 'organizations', uid, 'workspaces', workspaceId), data);
}
