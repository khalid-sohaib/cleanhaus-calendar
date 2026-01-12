/**
 * Next.js Plugin for @cleanhaus/calendar
 *
 * Auto-configures Next.js webpack and transpilation for React Native Web compatibility.
 *
 * Usage in next.config.js:
 * ```javascript
 * const withCalendar = require('@cleanhaus/calendar/next-plugin');
 *
 * module.exports = withCalendar({
 *   // Your existing Next.js config
 * });
 * ```
 */

const withCalendar = (nextConfig = {}) => {
  return {
    ...nextConfig,
    webpack: (config, options) => {
      // Apply existing webpack config if any
      const existingWebpack = nextConfig.webpack || ((c) => c);
      config = existingWebpack(config, options);

      // Add React Native Web alias
      if (!config.resolve) {
        config.resolve = {};
      }
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }

      config.resolve.alias = {
        ...config.resolve.alias,
        "react-native$": "react-native-web",
      };

      // Handle React Native asset extensions
      if (!config.resolve.extensions) {
        config.resolve.extensions = [];
      }

      // Add React Native extensions if not already present
      const extensions = [
        ".web.js",
        ".web.jsx",
        ".web.ts",
        ".web.tsx",
        ...config.resolve.extensions,
      ];
      config.resolve.extensions = [...new Set(extensions)];

      // Handle image assets
      if (!config.module) {
        config.module = {};
      }
      if (!config.module.rules) {
        config.module.rules = [];
      }

      // Add asset handling if not already present
      const hasAssetRule = config.module.rules.some(
        (rule) =>
          rule && rule.test && rule.test.toString().includes("png|jpg|jpeg")
      );

      if (!hasAssetRule) {
        config.module.rules.push({
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
          type: "asset/resource",
        });
      }

      return config;
    },
    transpilePackages: [
      ...(nextConfig.transpilePackages || []),
      "@cleanhaus/calendar",
    ],
  };
};

module.exports = withCalendar;
