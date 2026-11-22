import assert from 'node:assert/strict';
import { test } from 'node:test';

const project = 'demo-roaclaw';

function emulatorAddress(name) {
  const address = process.env[name];
  assert.match(address ?? '', /^127\.0\.0\.1:\d+$/, `${name} must point to a loopback emulator`);
  return `http://${address}`;
}

const auth = emulatorAddress('FIREBASE_AUTH_EMULATOR_HOST');
const firestore = emulatorAddress('FIRESTORE_EMULATOR_HOST');
const documents = `${firestore}/v1/projects/${project}/databases/(default)/documents`;

async function anonymousSession() {
  const response = await fetch(`${auth}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true }),
  });
  assert.equal(response.status, 200);
  const { localId, idToken } = await response.json();
  assert.ok(localId && idToken, 'Auth Emulator must issue a UID and a session token');
  return { uid: localId, token: idToken };
}

const string = (value) => ({ stringValue: value });
const list = (values = []) => ({ arrayValue: { values } });
const audit = { mapValue: { fields: { id: string('synthetic-audit') } } };

function workspaceState(privacy = 'local') {
  return { audits: list([audit]), research: list(), followups: list(), privacy: string(privacy) };
}

async function request(method, path, session, fields) {
  const headers = fields ? { 'Content-Type': 'application/json' } : {};
  if (session) headers.Authorization = `Bearer ${session.token}`;
  const response = await fetch(`${documents}/${path}`, {
    method,
    headers,
    body: fields ? JSON.stringify({ fields }) : undefined,
  });
  return { status: response.status, body: await response.json() };
}

function workspacePath(session, id = 'sable-stem') {
  return `organizations/${session.uid}/workspaces/${id}`;
}

test('Spark demo workspace rules enforce identity, supported paths, and state shape', async (t) => {
  const [owner, other] = await Promise.all([anonymousSession(), anonymousSession()]);
  assert.notEqual(owner.uid, other.uid);
  const path = workspacePath(owner);

  async function expectStatus(method, path, session, status, fields) {
    const result = await request(method, path, session, fields);
    assert.equal(result.status, status, result.body.error?.message);
    return result.body;
  }

  await t.test('owner can create, read, and update the three demo workspaces', async () => {
    for (const id of ['sable-stem', 'northline-retail', 'morrow-dental']) {
      const owned = workspacePath(owner, id);
      await expectStatus('PATCH', owned, owner, 200, workspaceState());
      await expectStatus('GET', owned, owner, 200);
    }
    const next = { ...workspaceState('hybrid'), updatedAt: string('2026-11-22T12:00:00.000Z') };
    const written = await expectStatus('PATCH', path, owner, 200, next);
    assert.deepEqual(written.fields.privacy, next.privacy);
  });

  await t.test('two authenticated demos can use the same workspace ID in separate namespaces', async () => {
    const otherPath = workspacePath(other);
    await expectStatus('PATCH', otherPath, other, 200, workspaceState('cloud'));
    const [ownerDoc, otherDoc] = await Promise.all([
      expectStatus('GET', path, owner, 200),
      expectStatus('GET', otherPath, other, 200),
    ]);
    assert.equal(ownerDoc.fields.privacy.stringValue, 'hybrid');
    assert.equal(otherDoc.fields.privacy.stringValue, 'cloud');
  });

  await t.test('anonymous public and foreign authenticated requests cannot cross UID boundaries', async () => {
    await expectStatus('GET', path, undefined, 403);
    await expectStatus('PATCH', path, undefined, 403, workspaceState());
    await expectStatus('GET', path, other, 403);
    await expectStatus('PATCH', path, other, 403, workspaceState());
    await expectStatus('GET', workspacePath(other), owner, 403);
    await expectStatus('DELETE', path, other, 403);
  });

  await t.test('listing, deletion, organization documents, arbitrary IDs and children are denied', async () => {
    await expectStatus('GET', `organizations/${owner.uid}/workspaces`, owner, 403);
    await expectStatus('GET', `organizations/${owner.uid}/workspaces`, undefined, 403);
    await expectStatus('DELETE', path, owner, 403);
    await expectStatus('PATCH', `organizations/${owner.uid}`, owner, 403, workspaceState());
    await expectStatus('PATCH', `${path}/researchItems/unscoped`, owner, 403, workspaceState());
    await expectStatus('PATCH', workspacePath(owner, 'other-brand'), owner, 403, workspaceState());
  });

  await t.test('required fields, field names, values, list types and bounds are validated on writes', async () => {
    const noPrivacy = workspaceState();
    delete noPrivacy.privacy;
    const invalid = [
      noPrivacy,
      { ...workspaceState(), ownerId: string(other.uid) },
      { ...workspaceState(), isAdmin: { booleanValue: true } },
      workspaceState('unexpected'),
      { ...workspaceState(), privacy: { integerValue: '1' } },
      { ...workspaceState(), updatedAt: string('tomorrow') },
      { ...workspaceState(), updatedAt: { integerValue: '0' } },
      { ...workspaceState(), audits: string('wrong field type') },
      { ...workspaceState(), audits: list(Array(31).fill(audit)) },
      { ...workspaceState(), research: list(Array(31).fill(audit)) },
      { ...workspaceState(), followups: list(Array(31).fill(audit)) },
    ];
    const fresh = await anonymousSession();
    for (const fields of invalid) {
      await expectStatus('PATCH', workspacePath(fresh), fresh, 403, fields);
      await expectStatus('PATCH', path, owner, 403, fields);
    }
  });
});
