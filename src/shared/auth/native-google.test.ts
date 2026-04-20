import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildNativeGoogleSignInConfig,
  getGoogleIdTokenFromSignInResult,
  type NativeGoogleSignInResult,
} from './native-google.ts';

test('buildNativeGoogleSignInConfig requires a web client id', () => {
  assert.throws(() => buildNativeGoogleSignInConfig({ webClientId: '' }), /EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID/);
});

test('buildNativeGoogleSignInConfig returns a compact config object', () => {
  assert.deepEqual(
    buildNativeGoogleSignInConfig({
      iosClientId: 'ios-client-id',
      webClientId: 'web-client-id',
    }),
    {
      iosClientId: 'ios-client-id',
      offlineAccess: false,
      scopes: ['email', 'profile'],
      webClientId: 'web-client-id',
    }
  );
});

test('getGoogleIdTokenFromSignInResult reads idToken from either top-level or nested data', () => {
  const directResult = { idToken: 'direct-token' } satisfies NativeGoogleSignInResult;
  const nestedResult = { data: { idToken: 'nested-token' } } satisfies NativeGoogleSignInResult;

  assert.equal(getGoogleIdTokenFromSignInResult(directResult), 'direct-token');
  assert.equal(getGoogleIdTokenFromSignInResult(nestedResult), 'nested-token');
  assert.equal(getGoogleIdTokenFromSignInResult({}), null);
});
