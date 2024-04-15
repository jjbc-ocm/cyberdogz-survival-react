module.exports = {
    webpack: {
      configure: (webpackConfig, { env, paths }) => {
        webpackConfig.resolve.fallback = {
          ...(webpackConfig.resolve.fallback || {}),
          "crypto": require.resolve("crypto-browserify"),
        };
        return webpackConfig;
      },
    },
  };