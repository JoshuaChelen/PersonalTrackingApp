module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 57) automatically includes the
    // react-native-worklets/reanimated plugin and tsconfig path support.
    presets: ['babel-preset-expo'],
  };
};
