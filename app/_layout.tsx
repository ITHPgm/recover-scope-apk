import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { AppStoreProvider } from '@/lib/app-store';
import { palette } from '@/components/ui';

export default function RootLayout() {
  return (
    <AppStoreProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: palette.background }, headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </AppStoreProvider>
  );
}
