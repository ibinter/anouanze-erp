export default {
  expo: {
    name: 'ANOUANZÊ ERP',
    slug: 'anouanze-erp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#146C43',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.ibig.anouanzeerp',
    },
    android: {
      package: 'com.ibig.anouanzeerp',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#146C43',
      },
    },
    web: {
      bundler: 'metro',
    },
    plugins: ['expo-router', 'expo-secure-store'],
    scheme: 'anouanze-erp',
    extra: {
      eas: {
        projectId: 'anouanze-erp',
      },
    },
  },
};
