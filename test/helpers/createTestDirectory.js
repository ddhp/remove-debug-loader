import path from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';

function escapeDirectory(directory) {
  return directory.replace(/[/?<>\\:*|"\s]/g, '_');
}

export default function createTestDirectory(baseDirectory, testTitle, cb) {
  const directory = path.join(baseDirectory, escapeDirectory(testTitle));

  rimraf(directory, (err) => {
    if (err) return cb(err);
    return mkdirp(directory, mkdirErr => cb(mkdirErr, directory));
  });
}
