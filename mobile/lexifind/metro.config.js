const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const fs = require('fs');
const path = require('path');

let config = getDefaultConfig(__dirname);

// NativeWind splits cliCommand by space — the absolute path to tailwindcss contains
// spaces ("National Exams") which breaks the split. Use the local .bin shim (relative
// path, no spaces) so the spawn call stays intact.
config = withNativeWind(config, {
  input: './global.css',
  cliCommand: './node_modules/.bin/tailwindcss',
});

// Fix NativeWind web bundling bug (v4.0.36):
// On web, the transformer emits require(output) where output is the BARE path
// (.cache/nativewind/global.css). Only the platform-specific file
// (.cache/nativewind/global.css.web.css) is ever written, so Metro can't resolve
// the bare path. Intercept it and redirect to the web-specific file instead.
const nativewindOutput = path.resolve(
  __dirname,
  'node_modules',
  '.cache',
  'nativewind',
  'global.css',
);
const prevResolveRequest = config.resolver?.resolveRequest;

config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web' && moduleName === nativewindOutput) {
      const webFile = `${nativewindOutput}.web.css`;
      // Create an empty placeholder if Tailwind hasn't run yet for this session
      if (!fs.existsSync(webFile)) {
        fs.mkdirSync(path.dirname(webFile), { recursive: true });
        fs.writeFileSync(webFile, '');
      }
      return { type: 'sourceFile', filePath: webFile };
    }
    if (prevResolveRequest) return prevResolveRequest(context, moduleName, platform);
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
