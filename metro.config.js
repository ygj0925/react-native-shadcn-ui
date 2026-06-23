const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

// Exclude server-side packages from web bundle to reduce memory pressure.
// ai@6 pulls in gateway/otel/oidc which are Node-only and unused client-side.
const emptyModule = path.resolve(__dirname, 'lib/empty-module.js');
config.resolver.extraNodeModules = {
  '@ai-sdk/gateway': emptyModule,
  '@opentelemetry/api': emptyModule,
  '@vercel/oidc': emptyModule,
};

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

const mimoTpProxy = createProxyMiddleware({
  target: 'https://token-plan-cn.xiaomimimo.com',
  changeOrigin: true,
  secure: true,
  pathRewrite: { '^/mimo-tp': '/v1' },
});

const openaiBaseURL = process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com';
const openaiProxy = createProxyMiddleware({
  target: openaiBaseURL,
  changeOrigin: true,
  secure: true,
  pathRewrite: { '^/openai-api': '/v1' },
});

const claudeBaseURL = process.env.EXPO_PUBLIC_CLAUDE_BASE_URL || '';
const claudeProxy = claudeBaseURL
  ? createProxyMiddleware({
      target: claudeBaseURL,
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/claude-api': '/v1' },
    })
  : null;

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url && req.url.startsWith('/mimo-api')) {
        return mimoProxy(req, res, next);
      }
      if (req.url && req.url.startsWith('/mimo-tp')) {
        return mimoTpProxy(req, res, next);
      }
      if (req.url && req.url.startsWith('/openai-api')) {
        return openaiProxy(req, res, next);
      }
      if (claudeProxy && req.url && req.url.startsWith('/claude-api')) {
        return claudeProxy(req, res, next);
      }
      if (req.url && req.url.startsWith('/' + API_PREFIX)) {
        return apiProxy(req, res, next);
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
