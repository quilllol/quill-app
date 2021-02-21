module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js",
      builderOptions: {
        productName: "Quill",
        win: {
          artifactName: "${productName} ${version}.${ext}"
        }
      }
    }
  }
};
