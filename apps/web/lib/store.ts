import { getAuth, signInAnonymously, type User } from 'firebase/auth';
import { doc, getDoc, getFirestore, runTransaction } from 'firebase/firestore';
import { firebaseApp } from './firebase';

export const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

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

export async function updateWorkspace<T extends object>(uid: string, workspaceId: string, update: (stored: T | null) => T): Promise<T> {
  requireSession(uid);
  const reference = doc(db, 'organizations', uid, 'workspaces', workspaceId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    requireSession(uid);
    const next = update(snapshot.exists() ? snapshot.data() as T : null);
    transaction.set(reference, next);
    return next;
  });
}
