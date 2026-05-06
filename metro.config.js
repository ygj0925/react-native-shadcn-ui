const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX || 'api/';
const API_TARGET = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const apiProxy = createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  secure: false,
});

const mimoProxy = createProxyMiddleware({
  target: 'https://api.xiaomimimo.com',
  changeOrigin: true,
  secure: true,
  pathRewrite: { '^/mimo-api': '/v1' },
});

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url && req.url.startsWith('/mimo-api')) {
        return mimoProxy(req, res, next);
      }
      if (req.url && req.url.startsWith('/' + API_PREFIX) && !req.url.startsWith('/api/chat')) {
        return apiProxy(req, res, next);
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
