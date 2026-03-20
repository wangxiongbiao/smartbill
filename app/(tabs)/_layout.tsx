import Feather from '@expo/vector-icons/Feather';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/shared/auth/AuthProvider';
import { useInvoiceFlow } from '@/shared/invoice-flow';
import { MOBILE_THEME } from '@/shared/mobile-theme';

function TabIcon(props: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
}) {
  return <Feather size={20} strokeWidth={2.05} {...props} />;
}

function getTabMeta(routeName: string) {
  switch (routeName) {
    case 'index':
      return { label: 'Invoices', icon: 'copy' as const };
    case 'templates':
      return { label: 'Templates', icon: 'layers' as const };
    case 'stats':
      return { label: 'Stats', icon: 'bar-chart-2' as const };
    case 'my':
      return { label: 'My', icon: 'user' as const };
    default:
      return { label: routeName, icon: 'circle' as const };
  }
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resetDraftInvoice } = useInvoiceFlow();
  const activeRouteName = state.routes[state.index]?.name;
  const showCreateButton = activeRouteName === 'index';

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={[styles.dockBackground, { paddingBottom: insets.bottom }]}>
        {showCreateButton ? (
          <Pressable
            onPress={() => {
              resetDraftInvoice();
              router.push('/create-invoice');
            }}
            style={styles.createButton}
          >
            <Text allowFontScaling={false} style={styles.createButtonText}>
              Create invoice
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.container}>
          {state.routes.map((route, index) => {
            const descriptor = descriptors[route.key];
            const focused = state.index === index;
            const { label, icon } = getTabMeta(route.name);

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityLabel={descriptor.options.tabBarAccessibilityLabel}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                onLongPress={onLongPress}
                onPress={onPress}
                style={[styles.tabButton, focused && styles.tabButtonActive]}
              >
                <TabIcon color={focused ? MOBILE_THEME.primary : '#111111'} name={icon} />
                <Text
                  allowFontScaling={false}
                  style={[styles.tabLabel, focused && styles.tabLabelActive]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={MOBILE_THEME.primary} size="small" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: '#f6f5f2',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Invoices' }} />
      <Tabs.Screen name="templates" options={{ title: 'Templates' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="my" options={{ title: 'My' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#f6f5f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    paddingTop: 14,
    paddingHorizontal: 18,
  },
  createButton: {
    height: 48,
    borderRadius: 18,
    backgroundColor: MOBILE_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  createButtonText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  container: {
    height: 64,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: MOBILE_THEME.primarySurface,
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  tabLabelActive: {
    fontWeight: '700',
    color: MOBILE_THEME.primaryText,
  },
});
