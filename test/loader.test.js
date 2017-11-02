import path from 'path'
import test from 'ava';
import webpack from 'webpack'
import fs from 'fs'
import createTestDirectory from './helpers/createTestDirectory'

const loader = require('../index'),
      requireRegexp = loader.requireRegexp,
      importRegexp = loader.importRegexp,
      methodNameRegexp = loader.methodNameRegexp

const removeDebugLoader = path.join(__dirname, '../');
const OUTPUT_DIR = path.join(__dirname, 'output/loader');

test('remove require debug(var)', t => {
  t.is(loader("var d = require('debug')"), '\n')
  t.is(loader('var d = require("debug")'), '\n')
})

test('remove require debug(const)', t => {
  t.is(loader("const d = require('debug')"), '\n')
  t.is(loader('const d = require("debug")'), '\n')
})

test('won\'t remove other requires', t => {
  t.is(loader('const d = require("otherModule")'), 'const d = require("otherModule")')
})

// Create a separate directory for each test so that the tests
// can run in parallel
test.cb.beforeEach(t => {
  createTestDirectory(OUTPUT_DIR, t.title, (err, directory) => {
    if (err) return t.end(err);
    t.context.directory = directory;
    t.end();
  });
});

test.cb('remove requiring debug', t => {
  let config = {
    entry: path.join(__dirname, 'fixtures/require.js'),
    output: {
      path: t.context.directory,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{
            loader: removeDebugLoader,
          }]
        }
      ]
    }
  }
  webpack(config, (err) => {
    t.is(err, null)
    fs.readdir(t.context.directory, (err, files) => {
      t.is(err, null)
      fs.readFile(path.resolve(t.context.directory, files[0]), (err, data) => {
        t.is(err, null)
        const subject = data.toString()
        t.true(subject.indexOf('const a') === -1)
        t.true(subject.indexOf('const b') === -1)
        t.true(subject.indexOf('const c') === -1)
        t.true(subject.indexOf('const d') === -1)
        t.true(subject.indexOf('const e') === -1)
        t.true(subject.indexOf('const f') !== -1)
        t.true(subject.indexOf('const g') !== -1)
        t.true(subject.indexOf('const h') !== -1)
        t.end()
      })
    })
  })
})

test.cb('remove custom requiring modules', t => {
  const config = {
    entry: path.join(__dirname, 'fixtures/require.js'),
    output: {
      path: t.context.directory,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{
            loader: removeDebugLoader,
            options: {
              moduleName: ['customModule', 'anotherCustomModule']
            }
          }]
        }
      ]
    }
  }
  webpack(config, (err) => {
    t.is(err, null)
    fs.readdir(t.context.directory, (err, files) => {
      t.is(err, null)
      fs.readFile(path.resolve(t.context.directory, files[0]), (err, data) => {
        t.is(err, null)
        const subject = data.toString()
        t.true(subject.indexOf('const a') === -1)
        t.true(subject.indexOf('const f') === -1)
        t.true(subject.indexOf('const g') !== -1)
        t.true(subject.indexOf('const h') === -1)
        t.end()
      })
    })
  })
})

test.cb('remove importing debug', t => {
  const config = {
    entry: path.join(__dirname, 'fixtures/import.js'),
    output: {
      path: t.context.directory,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{
            loader: removeDebugLoader,
          }]
        }
      ]
    }
  }
  webpack(config, (err) => {
    fs.readdir(t.context.directory, (err, files) => {
      fs.readFile(path.resolve(t.context.directory, files[0]), (err, data) => {
        const subject = data.toString()
        t.true(subject.indexOf('__customModule___default') !== -1)
        t.true(subject.indexOf('__shouldnotremove___default') !== -1)
        t.end()
      })
    })
  })
})

test.cb('remove importing custom modules', t => {
  const config = {
    entry: path.join(__dirname, 'fixtures/import.js'),
    output: {
      path: t.context.directory,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{
            loader: removeDebugLoader,
            options: {
              moduleName: ['customModule', 'anotherCustomModule']
            }
          }]
        }
      ]
    }
  }
  webpack(config, (err) => {
    fs.readdir(t.context.directory, (err, files) => {
      fs.readFile(path.resolve(t.context.directory, files[0]), (err, data) => {
        const subject = data.toString()
        t.true(subject.indexOf('__customModule___default') === -1) // syntax of import
        t.true(subject.indexOf('REMOVE_DEBUG_LOADER_customModule') === -1) // content of customModule
        t.true(subject.indexOf('__anotherCustomModule___default') === -1) // syntax of import
        t.true(subject.indexOf('REMOVE_DEBUG_LOADER_anotherCustomModule') === -1) // content of customModule
        t.true(subject.indexOf('__shouldnotremove___default') !== -1)
        t.end()
      })
    })
  })
})

test.cb('webpack moduleName config support string type (require)', t => {
  const config = {
    entry: path.join(__dirname, 'fixtures/require.js'),
    output: {
      path: t.context.directory,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{
            loader: removeDebugLoader,
            options: {
              moduleName: 'customModule'
            }
          }]
        }
      ]
    }
  }
  webpack(config, (err) => {
    t.is(err, null)
    fs.readdir(t.context.directory, (err, files) => {
      t.is(err, null)
      fs.readFile(path.resolve(t.context.directory, files[0]), (err, data) => {
        t.is(err, null)
        const subject = data.toString()
        t.true(subject.indexOf('const a') === -1)
        t.true(subject.indexOf('const f') === -1)
        t.true(subject.indexOf('const g') !== -1)
        t.true(subject.indexOf('const h') !== -1)
        t.end()
      })
    })
  })
})

test.cb('webpack moduleName config support string type (import)', t => {
  const config = {
    entry: path.join(__dirname, 'fixtures/import.js'),
    output: {
      path: t.context.directory,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{
            loader: removeDebugLoader,
            options: {
              moduleName: 'customModule'
            }
          }]
        }
      ]
    }
  }
  webpack(config, (err) => {
    fs.readdir(t.context.directory, (err, files) => {
      fs.readFile(path.resolve(t.context.directory, files[0]), (err, data) => {
        const subject = data.toString()
        t.true(subject.indexOf('__customModule___default') === -1) // syntax of import
        t.true(subject.indexOf('REMOVE_DEBUG_LOADER_customModule') === -1) // content of customModule
        t.true(subject.indexOf('__anotherCustomModule___default') !== -1) // syntax of import
        t.true(subject.indexOf('REMOVE_DEBUG_LOADER_anotherCustomModule') !== -1) // content of customModule
        t.true(subject.indexOf('__shouldnotremove___default') !== -1)
        t.end()
      })
    })
  })
})

test.cb('remove debug method', t => {
  const config = {
    entry: path.join(__dirname, 'fixtures/method.js'),
    output: {
      path: t.context.directory,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{
            loader: removeDebugLoader,
          }]
        }
      ]
    }
  }
  webpack(config, (err) => {
    fs.readdir(t.context.directory, (err, files) => {
      fs.readFile(path.resolve(t.context.directory, files[0]), (err, data) => {
        const subject = data.toString()
        t.true(subject.indexOf('debug()') === -1)
        t.true(subject.indexOf("debug('some log to log')") === -1)
        t.true(subject.indexOf("myLog('some log to log from myLog', 'stuffs')") !== -1)
        t.end()
      })
    })
  })
})

test.cb('remove custom method both definition and invocation', t => {
  const config = {
    entry: path.join(__dirname, 'fixtures/method.js'),
    output: {
      path: t.context.directory,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{
            loader: removeDebugLoader,
            options: {
              moduleName: 'patchedToStdout',
              methodName: ['myLog']
            }
          }]
        }
      ]
    }
  }
  webpack(config, (err) => {
    fs.readdir(t.context.directory, (err, files) => {
      fs.readFile(path.resolve(t.context.directory, files[0]), (err, data) => {
        const subject = data.toString()
        t.true(subject.indexOf('debug()') === -1)
        t.true(subject.indexOf("REMOVE_DEBUG_LOADER_patchedToStdout") === -1)
        t.true(subject.indexOf('const myLog') === -1)
        t.true(subject.indexOf("myLog('some log to log from myLog', 'stuffs')") === -1)
        t.true(subject.indexOf("customLog('some log to log from customLog', 'stuffs')") !== -1)
        t.end()
      })
    })
  })
})

test.cb('remove custom methodName config support string', t => {
  const config = {
    entry: path.join(__dirname, 'fixtures/method.js'),
    output: {
      path: t.context.directory,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{
            loader: removeDebugLoader,
            options: {
              moduleName: 'patchedToStdout',
              methodName: 'myLog'
            }
          }]
        }
      ]
    }
  }
  webpack(config, (err) => {
    fs.readdir(t.context.directory, (err, files) => {
      fs.readFile(path.resolve(t.context.directory, files[0]), (err, data) => {
        const subject = data.toString()
        t.true(subject.indexOf("REMOVE_DEBUG_LOADER_patchedToStdout") === -1)
        t.true(subject.indexOf('const myLog') === -1)
        t.true(subject.indexOf("myLog('some log to log from myLog', 'stuffs')") === -1)
        t.end()
      })
    })
  })
})

test.cb('remove custom methodNames', t => {
  const config = {
    entry: path.join(__dirname, 'fixtures/method.js'),
    output: {
      path: t.context.directory,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{
            loader: removeDebugLoader,
            options: {
              moduleName: 'patchedToStdout',
              methodName: ['myLog', 'customLog']
            }
          }]
        }
      ]
    }
  }
  webpack(config, (err) => {
    fs.readdir(t.context.directory, (err, files) => {
      fs.readFile(path.resolve(t.context.directory, files[0]), (err, data) => {
        const subject = data.toString()
        t.true(subject.indexOf("REMOVE_DEBUG_LOADER_patchedToStdout") === -1)
        t.true(subject.indexOf('const myLog') === -1)
        t.true(subject.indexOf("myLog('some log to log from myLog', 'stuffs')") === -1)
        t.true(subject.indexOf("customLog('some log to log from customLog', 'stuffs')") === -1)
        t.end()
      })
    })
  })
})
