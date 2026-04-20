export type NativeGoogleSignInConfigInput = {
  iosClientId?: string;
  webClientId?: string;
};

export type NativeGoogleSignInResult = {
  data?: {
    idToken?: string | null;
  } | null;
  idToken?: string | null;
};

export function buildGoogleIosUrlScheme(iosClientId?: string) {
  const trimmed = iosClientId?.trim();

  if (!trimmed) {
    return null;
  }

  const suffix = '.apps.googleusercontent.com';

  if (!trimmed.endsWith(suffix)) {
    throw new Error('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must end with .apps.googleusercontent.com.');
  }

  return `com.googleusercontent.apps.${trimmed.slice(0, -suffix.length)}`;
}

export function buildNativeGoogleSignInConfig({
  iosClientId,
  webClientId,
}: NativeGoogleSignInConfigInput) {
  if (!webClientId?.trim()) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Add it before testing native Google sign-in.');
  }

  return {
    iosClientId: iosClientId?.trim() || undefined,
    offlineAccess: false,
    scopes: ['email', 'profile'],
    webClientId: webClientId.trim(),
  };
}

export function getGoogleIdTokenFromSignInResult(result: NativeGoogleSignInResult) {
  return result.idToken ?? result.data?.idToken ?? null;
}
