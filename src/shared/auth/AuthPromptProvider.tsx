import { useRouter } from 'expo-router';
import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetEditor } from '@/components/invoice-create/shared';
import { useAuth } from '@/shared/auth/AuthProvider';
import { MOBILE_THEME } from '@/shared/mobile-theme';

type AuthPromptContextValue = {
    requireAuth: (action: () => void) => void;
};

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

export function AuthPromptProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isVisible, setIsVisible] = useState(false);

    const requireAuth = (action: () => void) => {
        if (isAuthenticated) {
            action();
        } else {
            setIsVisible(true);
        }
    };

    return (
        <AuthPromptContext.Provider value={{ requireAuth }}>
            {children}
            <BottomSheetEditor
                bottomInset={insets.bottom}
                onClose={() => setIsVisible(false)}
                title="Sign in required"
                visible={isVisible}
                scrollEnabled={false}
            >
                <Text allowFontScaling={false} style={styles.message}>
                    You need an active account to use cloud features like creating, saving, and sharing invoices.
                </Text>

                <View style={styles.actions}>
                    <Pressable
                        onPress={() => {
                            setIsVisible(false);
                            router.push('/login');
                        }}
                        style={styles.primaryButton}
                    >
                        <Text allowFontScaling={false} style={styles.primaryButtonText}>
                            Go to Sign in
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setIsVisible(false)}
                        style={styles.secondaryButton}
                    >
                        <Text allowFontScaling={false} style={styles.secondaryButtonText}>
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            </BottomSheetEditor>
        </AuthPromptContext.Provider>
    );
}

export function useAuthPrompt() {
    const context = useContext(AuthPromptContext);
    if (!context) throw new Error('useAuthPrompt must be used within AuthPromptProvider');
    return context;
}

const styles = StyleSheet.create({
    message: {
        fontSize: 14,
        lineHeight: 20,
        color: '#6f727a',
        marginBottom: 4,
        marginTop: -4,
    },
    actions: {
        gap: 10,
        marginTop: 6,
    },
    primaryButton: {
        height: 48,
        borderRadius: 18,
        backgroundColor: MOBILE_THEME.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: 15,
        lineHeight: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    secondaryButton: {
        height: 44,
        borderRadius: 16,
        backgroundColor: '#f3f2ef',
        borderWidth: 1,
        borderColor: '#e7e4dd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '600',
        color: '#171717',
    },
});
