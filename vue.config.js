module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js",
      builderOptions: {
        productName: "Quill",
        win: {
          artifactName: "${productName} ${version}.${ext}"
        },
        publish: [
          {
            provider: "github",
            owner: "quilllol",
            repo: "quill-app"
          }
        ]
      }
    }
  }
};
