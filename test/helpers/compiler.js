import path from 'path';
import webpack from 'webpack';
import Memoryfs from 'memory-fs';

const removeDebugLoader = path.join(__dirname, '../../');

export default (fixture, options = {}) => {
  const compiler = webpack({
    context: path.resolve(__dirname, '../'),
    entry: fixture,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [{
        test: /\.js/,
        use: {
          loader: removeDebugLoader,
          options,
        },
      }],
    },
  });

  compiler.outputFileSystem = new Memoryfs();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);

      resolve(stats);
    });
  });
};
