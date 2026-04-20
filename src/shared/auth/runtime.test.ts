import { test } from 'node:test';
import assert from 'node:assert/strict';

import { shouldBlockGoogleSignInForExecutionEnvironment } from './runtime.ts';

test('does not block Google sign-in in Expo Go runtime anymore', () => {
  assert.equal(shouldBlockGoogleSignInForExecutionEnvironment('storeClient'), false);
});

test('does not block Google sign-in in development or standalone runtimes', () => {
  assert.equal(shouldBlockGoogleSignInForExecutionEnvironment('standalone'), false);
  assert.equal(shouldBlockGoogleSignInForExecutionEnvironment('bare'), false);
  assert.equal(shouldBlockGoogleSignInForExecutionEnvironment(undefined), false);
});
