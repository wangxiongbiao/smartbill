import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/shared/auth/AuthProvider';

export default function LoginScreen() {
  const { error, isAuthenticated, isLoading, isSigningIn, signInWithGoogle } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Use back if modal pushed, else replace
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.content}>
          <View style={styles.brandBlock}>
            <Text style={styles.eyebrow}>SMARTBILL</Text>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>
              Use Google to sign in. After authentication succeeds, the app will restore your
              session and enter the invoice workspace automatically.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.googleMark}>
              <Text style={styles.googleMarkText}>G</Text>
            </View>
            <Text style={styles.googleTitle}>Continue with Google</Text>
            <Text style={styles.helper}>
              Native apps now use the Google Sign-In SDK directly. Web keeps a browser fallback for
              debugging, but device testing should happen in a development build or installed app.
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Pressable
              disabled={isSigningIn || isLoading}
              onPress={() => {
                signInWithGoogle().catch(() => undefined);
              }}
              style={[styles.button, (isSigningIn || isLoading) && styles.buttonDisabled]}
            >
              {isSigningIn || isLoading ? (
                <ActivityIndicator color="#2563eb" size="small" />
              ) : (
                <>
                  <View style={styles.buttonIcon}>
                    <Text style={styles.buttonIconText}>G</Text>
                  </View>
                  <Text style={styles.buttonText}>Sign in with Google</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    justifyContent: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#dbeafe',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -160,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#e2e8f0',
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    gap: 24,
  },
  brandBlock: {
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#2563eb',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  card: {
    borderRadius: 28,
    backgroundColor: '#ffffff',
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 36,
    elevation: 6,
    alignItems: 'center',
  },
  googleMark: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe4f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  googleMarkText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4285f4',
  },
  googleTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  button: {
    marginTop: 10,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#dbe4f0',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4285f4',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  helper: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: '#64748b',
    maxWidth: 280,
  },
  errorText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: '#c23b35',
    textAlign: 'center',
  },
});
