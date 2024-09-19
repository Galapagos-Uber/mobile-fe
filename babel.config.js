module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@assets": "./app/assets",
            "@components": "./app/components",
            "@screens": "./app/screens",
            "@utils": "./app/utils",
          },
        },
      ],
      "react-native-paper/babel",
    ],
  };
};
