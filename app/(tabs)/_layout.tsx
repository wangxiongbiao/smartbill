import Feather from '@expo/vector-icons/Feather';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    case 'estimates':
      return { label: 'Estimates', icon: 'file-text' as const };
    case 'clients':
      return { label: 'Clients', icon: 'users' as const };
    case 'reports':
      return { label: 'Reports', icon: 'pie-chart' as const };
    default:
      return { label: routeName, icon: 'circle' as const };
  }
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index]?.name;
  const showCreateButton = activeRouteName === 'index';

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={[styles.dockBackground, { paddingBottom: insets.bottom }]}>
        {showCreateButton ? (
          <Pressable style={styles.createButton}>
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
                <TabIcon color="#111111" name={icon} />
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
      <Tabs.Screen name="estimates" options={{ title: 'Estimates' }} />
      <Tabs.Screen name="clients" options={{ title: 'Clients' }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: '#171f2d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    fontSize: 30,


  },
  createButtonText: {
    fontSize: 15,
    lineHeight: 16,
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
    backgroundColor: '#ecebea',
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
  },
});
