import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'RecoverScope',
  slug: 'recover-scope',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'recoverscope',
  userInterfaceStyle: 'dark',
  platforms: ['android', 'ios', 'web'],
  android: {
    package: 'com.recoverscope.app',
    adaptiveIcon: {
      backgroundColor: '#08111F',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    permissions: [
      'READ_MEDIA_IMAGES',
      'READ_MEDIA_VIDEO',
      'READ_MEDIA_AUDIO',
      'READ_EXTERNAL_STORAGE',
      'MANAGE_EXTERNAL_STORAGE',
    ],
  },
  plugins: [
    'expo-router',
    'expo-sharing',
    './plugins/withUnityLevelPlay',
    ['expo-splash-screen', { image: './assets/images/splash-icon.png', resizeMode: 'contain', backgroundColor: '#08111F' }],
  ],
  experiments: { typedRoutes: true },
  extra: {
    flutterwaveConfigured: Boolean(process.env.EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY),
    stripeConfigured: Boolean(process.env.EXPO_PUBLIC_STRIPE_PLUS_MONTHLY_LINK),
    unityConfigured: Boolean(process.env.EXPO_PUBLIC_UNITY_GAME_ID),
  },
};

export default config;
