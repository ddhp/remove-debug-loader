import test from 'ava';
import loader from '../';

const { methodInvocationRegexp, methodDefinitionRegexp } = loader;
const invocationRegexp = methodInvocationRegexp(['debug']);
const definitionRegexp = methodDefinitionRegexp(['debug']);

test('methodInvocationRegexp', (t) => {
  t.false(methodInvocationRegexp().test('  debuganything'));
  t.is('  debug("test")'.replace(invocationRegexp, ''), '  ');
  t.is('debug("test")'.replace(invocationRegexp, ''), '');
  t.is('  debug("test")'.replace(invocationRegexp, ''), '  ');
  t.is('debug();'.replace(invocationRegexp, ''), '');

  t.is('anythingdebug("test")'.replace(invocationRegexp, ''), 'anythingdebug("test")');

  console.log(methodInvocationRegexp().exec('debug("test");'));
  t.true(methodInvocationRegexp().test('debug("test");'));

  console.log(methodDefinitionRegexp().exec('debug = anything;'));
  t.true(methodDefinitionRegexp().test('debug = anything;'));

  console.log(methodDefinitionRegexp().exec('debug = anything;'));
  t.true(methodDefinitionRegexp().test('debug = anything;'));

  console.log(methodDefinitionRegexp().exec('notdebug = anything;'));
  t.false(methodDefinitionRegexp(['debug']).test('notdebug = anything;'));

  console.log(methodDefinitionRegexp().exec('  debug = anything;'));
  t.true(methodDefinitionRegexp().test('  debug = anything;'));

  console.log(methodDefinitionRegexp().exec('debug=anything;'));
  t.true(methodDefinitionRegexp().test('debug=anything;'));

  console.log(methodDefinitionRegexp().exec('const debug=anything;'));
  t.is('const debug=anything;'.replace(definitionRegexp, ''), '');
  t.is('  const debug=anything;'.replace(definitionRegexp, ''), '  ');
});
