const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX || 'api/';
const API_TARGET = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url && req.url.startsWith('/' + API_PREFIX)) {
        return createProxyMiddleware({
          target: API_TARGET,
          changeOrigin: true,
          secure: false,
        })(req, res, next);
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
