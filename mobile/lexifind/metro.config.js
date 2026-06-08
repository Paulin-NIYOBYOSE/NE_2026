const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind splits cliCommand by space — the absolute path to tailwindcss contains
// spaces ("National Exams") which breaks the split. Use the local .bin shim (relative
// path, no spaces) so the spawn call stays intact.
module.exports = withNativeWind(config, {
  input: './global.css',
  cliCommand: './node_modules/.bin/tailwindcss',
});
