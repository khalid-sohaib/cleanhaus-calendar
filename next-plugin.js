/**
 * Next.js Plugin for cleanhaus-calendar
 *
 * Auto-configures Next.js webpack and transpilation for React Native Web compatibility.
 *
 * Usage in next.config.js:
 * ```javascript
 * const withCalendar = require('cleanhaus-calendar/next-plugin');
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

      // Define __DEV__ for react-native-reanimated compatibility
      // Required for both client and server builds (SSR)
      const webpack = require("webpack");
      if (!config.plugins) {
        config.plugins = [];
      }
      // Check if DefinePlugin already exists to avoid duplicates
      const hasDevPlugin = config.plugins.some(
        (plugin) => plugin && plugin.constructor.name === "DefinePlugin" && plugin.definitions && plugin.definitions.__DEV__
      );
      if (!hasDevPlugin) {
        config.plugins.push(
          new webpack.DefinePlugin({
            __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
          })
        );
      }

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

      // Handle image assets - ensure node_modules are processed
      if (!config.module) {
        config.module = {};
      }
      if (!config.module.rules) {
        config.module.rules = [];
      }

      // Find existing asset rule
      const assetRuleIndex = config.module.rules.findIndex(
        (rule) =>
          rule && rule.test && rule.test.toString().includes("png|jpg|jpeg")
      );

      if (assetRuleIndex === -1) {
        // Add new asset rule at the beginning to ensure it processes images
        config.module.rules.unshift({
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
          type: "asset/resource",
          // Explicitly include node_modules/cleanhaus-calendar
          include: [/node_modules\/cleanhaus-calendar/],
        });
      } else {
        // Update existing rule to include node_modules
        const existingRule = config.module.rules[assetRuleIndex];
        if (existingRule) {
          // Ensure it includes our package
          if (!existingRule.include) {
            existingRule.include = [/node_modules\/cleanhaus-calendar/];
          } else if (Array.isArray(existingRule.include)) {
            if (!existingRule.include.some((inc) => 
              inc.toString().includes("cleanhaus-calendar")
            )) {
              existingRule.include.push(/node_modules\/cleanhaus-calendar/);
            }
          }
        }
      }

      return config;
    },
    transpilePackages: [
      ...(nextConfig.transpilePackages || []),
      "cleanhaus-calendar",
    ],
  };
};

module.exports = withCalendar;
