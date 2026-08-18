import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gastrohotel.app',
  appName: 'GastroHotelTech',
  webDir: 'dist/gastro-hotel/browser',
  server: {
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    }
  }
};

export default config;
