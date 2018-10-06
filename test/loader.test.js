import path from 'path';
import test from 'ava';
import loader from '../';
import compiler from './helpers/compiler';

const { requireRegexp, importRegexp } = loader;

test('importRegexp validate "../"s', (t) => {
  t.true(importRegexp().test('import whatever from "debug"'));
  t.true(importRegexp().test('import whatever from "./debug"'));
  t.true(importRegexp().test('import whatever from "../debug"'));
  t.true(importRegexp().test('import whatever from "../../debug"'));
});

test('require validate "../"s', (t) => {
  t.true(requireRegexp().test('const whatever = require("debug")'));
  t.true(requireRegexp().test('const whatever = require("./debug")'));
  t.true(requireRegexp().test('const whatever = require("../debug")'));
  t.true(requireRegexp().test('const whatever = require("../../debug")'));
});

test('remove require debug(var)', (t) => {
  t.is(loader("var d = require('debug')"), '');
  t.is(loader('var d = require("debug")'), '');
});

test('remove require debug(const)', (t) => {
  t.is(loader("const d = require('debug')"), '');
  t.is(loader('const d = require("debug")'), '');
});

test('won\'t remove other requires', (t) => {
  t.is(loader('const d = require("otherModule")'), 'const d = require("otherModule")');
});

test.cb('remove requiring debug', (t) => {
  compiler(path.join(__dirname, 'fixtures/require.js'))
    .then((stats) => {
      const subject = stats.toJson().modules[0].source;
      t.true(subject.indexOf('const a') === -1);
      t.true(subject.indexOf('const b') === -1);
      t.true(subject.indexOf('const c') === -1);
      t.true(subject.indexOf('const d') === -1);
      t.true(subject.indexOf('const e') === -1);
      t.true(subject.indexOf('const f') !== -1);
      t.true(subject.indexOf('const g') !== -1);
      t.true(subject.indexOf('const h') !== -1);
      t.end();
    });
});

test.cb('remove custom requiring modules', (t) => {
  compiler(path.join(__dirname, 'fixtures/require.js'), {
    moduleName: ['customModule', 'anotherCustomModule'],
  })
    .then((stats) => {
      const subject = stats.toJson().modules[0].source;
      t.true(subject.indexOf('const a') === -1);
      t.true(subject.indexOf('const f') === -1);
      t.true(subject.indexOf('const g') !== -1);
      t.true(subject.indexOf('const h') === -1);
      t.end();
    });
});

test.cb('remove importing debug', (t) => {
  compiler(path.join(__dirname, 'fixtures/import.js'))
    .then((stats) => {
      const subject = stats.toJson().modules[0].source;
      t.true(subject.indexOf('./customModule') !== -1);
      t.true(subject.indexOf('./shouldnotremove') !== -1);
      t.end();
    });
});

test.cb('remove importing custom modules', (t) => {
  compiler(path.join(__dirname, 'fixtures/import.js'), {
    moduleName: ['customModule', 'anotherCustomModule'],
  })
    .then((stats) => {
      const subject = stats.toJson().modules[0].source;
      t.true(subject.indexOf('./customModule') === -1);
      t.true(subject.indexOf('./anotherCustomModule') === -1);
      t.true(subject.indexOf('./shouldnotremove') !== -1);
      t.end();
    });
});

test.cb('webpack moduleName config support string type (require)', (t) => {
  compiler(path.join(__dirname, 'fixtures/require.js'), {
    moduleName: 'customModule',
  })
    .then((stats) => {
      const subject = stats.toJson().modules[0].source;
      t.true(subject.indexOf('const a') === -1);
      t.true(subject.indexOf('const f') === -1);
      t.true(subject.indexOf('const g') !== -1);
      t.true(subject.indexOf('const h') !== -1);
      t.end();
    });
});

test.cb('webpack moduleName config support string type (import)', (t) => {
  compiler(path.join(__dirname, 'fixtures/import.js'), {
    moduleName: 'customModule',
  })
    .then((stats) => {
      const subject = stats.toJson().modules[0].source;
      t.true(subject.indexOf('./customModule') === -1);
      t.true(subject.indexOf('./anotherCustomModule') !== -1);
      t.true(subject.indexOf('./shouldnotremove') !== -1);
      t.end();
    });
});

test.cb('remove debug method', (t) => {
  compiler(path.join(__dirname, 'fixtures/method.js'))
    .then((stats) => {
      const subject = stats.toJson().modules[0].source;
      t.false(/\bdebug\(\)/.test(subject));
      t.true(subject.indexOf("debug('some log to log')") === -1);
      t.true(subject.indexOf("myLog('some log to log from myLog', 'stuffs')") !== -1);
      t.true(subject.indexOf("this.debug = require('debug')();") === -1);
      t.true(subject.indexOf("this.debug('should be removed');") === -1);
      t.end();
    });
});

test.cb('remove custom method both definition and invocation', (t) => {
  compiler(path.join(__dirname, 'fixtures/method.js'), {
    moduleName: 'patchedToStdout',
    methodName: ['myLog'],
  })
    .then((stats) => {
      const subject = stats.toJson().modules[0].source;
      t.false(/\bdebug\(\)/.test(subject));
      t.true(subject.indexOf('REMOVE_DEBUG_LOADER_patchedToStdout') === -1);
      t.true(subject.indexOf('const myLog') === -1);
      t.true(subject.indexOf("myLog('some log to log from myLog', 'stuffs')") === -1);
      t.true(subject.indexOf("customLog('some log to log from customLog', 'stuffs')") !== -1);
      t.true(subject.indexOf("mockFunc('this should remain untouched')") !== -1);
      t.end();
    });
});

test.cb('remove custom methodName config support string', (t) => {
  compiler(path.join(__dirname, 'fixtures/method.js'), {
    moduleName: 'patchedToStdout',
    methodName: 'myLog',
  })
    .then((stats) => {
      const subject = stats.toJson().modules[0].source;
      t.true(subject.indexOf('REMOVE_DEBUG_LOADER_patchedToStdout') === -1);
      t.true(subject.indexOf('const myLog') === -1);
      t.true(subject.indexOf("myLog('some log to log from myLog', 'stuffs')") === -1);
      t.end();
    });
});

test.cb('remove custom methodNames', (t) => {
  compiler(path.join(__dirname, 'fixtures/method.js'), {
    moduleName: 'patchedToStdout',
    methodName: ['myLog', 'customLog'],
  })
    .then((stats) => {
      const subject = stats.toJson().modules[0].source;
      t.true(subject.indexOf('REMOVE_DEBUG_LOADER_patchedToStdout') === -1);
      t.true(subject.indexOf('const myLog') === -1);
      t.true(subject.indexOf("myLog('some log to log from myLog', 'stuffs')") === -1);
      t.true(subject.indexOf("customLog('some log to log from customLog', 'stuffs')") === -1);
      t.end();
    });
});
