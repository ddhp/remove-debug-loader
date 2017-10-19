# remove-debug-loader

remove [debug](https://github.com/visionmedia/debug) from your code

## Installation
```
$ yarn add remove-debug-loader --dev
```
or
```
$ npm i --save-dev remove-debug-loader
```

## How to use
config `webpack.config.js` with:

```js
...
module: {
  rules: [{
    test: /\.js$/,
    use: [{
      loader: 'remove-debug-loader'
    }]
  }]
}
...
```

this would remove these patterns

requiring dependency:

```js
const debug = require('debug')
```

also removes import:

```js
import debug from 'debug'
```

and debug methods

```js
debug('some log to log', 'stuff')
```

since [debug](https://github.com/visionmedia/debug) is log to stderr by default on server side (see [here](https://github.com/visionmedia/debug#output-streams)), we usually patch debug to an individual module

so you can add extra config to webpack if different log method name is defined

e.g

```js
import patchedToStdout from './patchedToStdout'
const myLog = patchedToStdout('mynamespace')

myLog('some log to log', 'stuffs')
```

set myLog in loader's option `methodName`:
```js
{
  use: [{
    loader: 'remove-debug-loader',
    options: {
      methodName: 'myLog'
    }
  }]
}
```

in this case line with `myLog` would be removed which means `import patchedToStdout from './patchedToStdout'` would stay untouched

this might cause error if eslint is applied afterward since patchedToStdout is defined but never used

so make sure you use this loader **after** [eslint-loader](https://github.com/MoOx/eslint-loader)

## License

The MIT License (MIT)

Copyright (c) 2017 ddhp

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
