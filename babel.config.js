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
            "react-native": "react-native-web",
            "react-native-maps": "react-native-web-maps",
          },
        },
      ],
      "react-native-paper/babel",
    ],
  };
};
