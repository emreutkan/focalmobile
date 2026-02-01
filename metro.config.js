const { getDefaultConfig } = require('expo/metro-config');

// Set Expo Router to use src/app instead of app
// This can also be set via .env file with EXPO_ROUTER_APP_ROOT=src/app
if (!process.env.EXPO_ROUTER_APP_ROOT) {
  process.env.EXPO_ROUTER_APP_ROOT = 'src/app';
}

const config = getDefaultConfig(__dirname);

module.exports = config;
