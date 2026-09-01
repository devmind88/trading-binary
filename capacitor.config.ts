import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.secondchance.binaryoptionsos',
  appName: 'Binary Options OS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  plugins: {
    // Mobile hardware permission notes for App Store review
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#030712',
      showSpinner: false
    }
  }
};

export default config;
