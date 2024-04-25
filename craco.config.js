module.exports = {
    webpack: {
      configure: (webpackConfig, { env, paths }) => {
        webpackConfig.resolve.fallback = {
          ...(webpackConfig.resolve.fallback || {}),
          "crypto": require.resolve("crypto-browserify"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "fs": false, // This assumes you do not want to include a polyfill for fs
          "path": false // This assumes you do not want to include a polyfill for path
        };
        return webpackConfig;
      },
    },
  };