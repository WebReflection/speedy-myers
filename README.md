# A Speedy E.Meyers's O(ND) Based Diffing Algorithm

[![Build Status](https://travis-ci.com/WebReflection/speedy-myers.svg?branch=master)](https://travis-ci.com/WebReflection/speedy-myers) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/speedy-myers/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/speedy-myers?branch=master)

This is a re-write of the original [Arpad Borsos's diff](https://github.com/Swatinem/diff#readme) repository.

As there's no single module in npm that doesn't couple Meyers with strings, and all do more than one thing, I've decided to re-publish it with performance improvements and in a modern ECMAScript fashion. [Arpad Borsos](https://github.com/Swatinem/diff/issues/1) agreed so ... here it is.

```js
import {NOOP, REPLACE, INSERT, DELETE, diff} from 'speedy-myers';
// const {NOOP, REPLACE, INSERT, DELETE, diff} = require('speedy-myers');

const changes = diff(
  sourceList, // the list you'd like to diff
  targetList, // against its updated version
  // with an optional callback
  // to diff objects by keys too
  (a, b) => a.id === b.id
);
```

The resulting `Array` of changes will contain all the information to _patch_ the `sourceList` through operations performed via the `targetList`.

### Example

```js
const {NOOP, REPLACE, INSERT, DELETE, diff} = Myers;
const source = [1, 2, 3, 4, 5];
const target = [2, 7, 4, 5, 9, 6];
const changes = diff(source, target);
let sourceIndex = 0;
let targetIndex = 0;
for (let i = 0, {length} = changes; i < length; i++) {
  switch (changes[i]) {

    // in both REPLACE and NOOP cases
    // move forward with both indexes
    case REPLACE:
      // in replace case, you can safely pass the value
      source[sourceIndex] = target[targetIndex];
      // se no break here: the fallthrough in meant to increment
    case NOOP:
      sourceIndex++;
      targetIndex++;
      break;

    case DELETE:
      source.splice(sourceIndex, 1);
      // Note: in this case don't increment the sourceIndex
      // as the length mutated via splice, however,
      // you should increment sourceIndex++ if you are dealing
      // with a parentNode, as example, and the source is a facade
      // never touch the targetIndex during DELETE
      break;

    case INSERT:
      // Note: in this case, as the length is mutated again
      // you need to move forward sourceIndex++ too
      // but if you appending nodes, or inserting before other nodes,
      // you should *not* move sourceIndex forward
      source.splice(sourceIndex++, 0, target[targetIndex]);

      // the targetIndex instead should *always* be incremented on INSERT
      targetIndex++;
      break;
  }
}

// verify everything went fine
console.assert(source.join(',') === target.join(','));
```

This module is compatible with IE11 and every other Mobile or Desktop engine that supports `Int8Array`.
