const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withUnityLevelPlay(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const additions = [
        "implementation 'com.google.android.gms:play-services-appset:16.0.2'",
        "implementation 'com.google.android.gms:play-services-ads-identifier:18.0.1'",
      ];
      const missing = additions.filter((line) => !config.modResults.contents.includes(line));
      if (missing.length) {
        config.modResults.contents = config.modResults.contents.replace(/dependencies\s*\{/, (match) => `${match}\n        ${missing.join('\n        ')}`);
      }
    }
    return config;
  });
};
