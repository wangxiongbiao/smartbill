import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import {
  buildInvoiceDocumentHtml,
  DEFAULT_INVOICE_DOCUMENT_LANGUAGE,
} from '@/shared/invoice-document';
import { useInvoiceFlow } from '@/shared/invoice-flow';
import { MOBILE_THEME } from '@/shared/mobile-theme';

export default function InvoicePreviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draftInvoice: invoice, submitDraftInvoice } = useInvoiceFlow();
  const [isLoading, setIsLoading] = useState(true);

  const previewHtml = buildInvoiceDocumentHtml(invoice, {
    lang: DEFAULT_INVOICE_DOCUMENT_LANGUAGE,
    mode: 'app-preview',
  });

  useEffect(() => {
    setIsLoading(true);
  }, [previewHtml]);

  const handleSubmit = () => {
    submitDraftInvoice();
    router.replace('/(tabs)');
  };

  const handleContinueEditing = () => {
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <View style={styles.previewFrame}>
          <WebView
            key={previewHtml}
            bounces={false}
            javaScriptEnabled
            onLoadEnd={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}
            originWhitelist={['*']}
            scrollEnabled
            setSupportMultipleWindows={false}
            showsVerticalScrollIndicator={false}
            source={{ html: previewHtml }}
            style={styles.webview}
          />

          {isLoading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={MOBILE_THEME.primary} size="small" />
            </View>
          ) : null}
        </View>

        <View style={[styles.bottomDock, { paddingBottom: insets.bottom + 10 }]}>
          <Pressable onPress={handleSubmit} style={styles.submitButton}>
            <Text allowFontScaling={false} style={styles.submitButtonText}>
              Create Invoice
            </Text>
          </Pressable>
          <Pressable onPress={handleContinueEditing} style={styles.secondaryButton}>
            <Text allowFontScaling={false} style={styles.secondaryButtonText}>
              Continue editing
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f5f2',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f6f5f2',
  },
  previewFrame: {
    flex: 1,
    marginBottom: 162,
    backgroundColor: '#f6f5f2',
  },
  webview: {
    flex: 1,
    backgroundColor: '#f6f5f2',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246, 245, 242, 0.75)',
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 10,
  },
  submitButton: {
    height: 48,
    borderRadius: 18,
    backgroundColor: MOBILE_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
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
