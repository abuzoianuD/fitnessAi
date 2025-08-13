const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Suppress React 19 useInsertionEffect warnings from i18next
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;