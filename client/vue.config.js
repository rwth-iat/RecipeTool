//change the build output of the vue project to flask folders 
//inspired by this tutorial: https://www.youtube.com/watch?v=CQv5ESecsG4
//NOTE: in the tutorial the folder "server" does not exist
const path = require('path');

if(process.env.Node_ENV === "production"){
  module.exports={
    assetDir: '../../server/static',
    publicPath: '',
    outputDir: path.resolve(__dirname, '../server/templates/vue_template'),
    runtimeCompiler: undefined,
    productionSourceMap: undefined,
    parallel: undefined,
    css: undefined
  };
}