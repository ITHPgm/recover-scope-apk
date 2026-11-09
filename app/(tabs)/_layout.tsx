import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { palette } from '@/components/ui';

const icon = (symbol: string) => ({ color }: { color: unknown }) => <Text style={{ color: typeof color === 'string' ? color : palette.muted, fontSize: 18 }}>{symbol}</Text>;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.border, height: 72, paddingBottom: 10, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: icon('⌂') }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: icon('⌕') }} />
      <Tabs.Screen name="results" options={{ title: 'Results', tabBarIcon: icon('▦') }} />
      <Tabs.Screen name="bin" options={{ title: 'Bin', tabBarIcon: icon('♧') }} />
      <Tabs.Screen name="premium" options={{ title: 'Premium', tabBarIcon: icon('✦') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('⚙') }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
