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

#### A DOM Based Example

As this module is general purpose, it is possible to use it to update a tree in the DOM too.

[uhtml](https://github.com/WebReflection/uhtml#readme), [lighterhtml](https://github.com/WebReflection/lighterhtml#readme), and [hyperHTML](https://github.com/WebReflection/hyperHTML#readme) use a very similar strategy through [udomdiff](https://github.com/WebReflection/udomdiff#readme) and [domdiff](https://github.com/WebReflection/domdiff#readme).

```js
const {NOOP, REPLACE, INSERT, DELETE, diff} = Myers;
const parentNode = document.body;
const source = [].slice.call(document.body.childNodes);
const target = source.append(document.createElement('myers'));
const changes = diff(source, target);
let sourceIndex = 0;
let targetIndex = 0;
const comments = new Map;
for (let i = 0, {length} = changes; i < length; i++) {
  switch (changes[i]) {

    case REPLACE:
      // as a node cannot exists simultaneously in two parts of the tree
      // we cannot append directly the target[targetIndex] unless
      // its parentNode is different, or non-existent
      if (target[targetIndex].parentNode !== parentNode)
        parentNode.replaceChild(
          target[targetIndex],
          source[sourceIndex]
        );
      // otherwise we need to use a placeholder to keep the position
      // and replace it only once all operations are completed
      else {
        const comment = document.createComment('');
        comments.set(comment, target[targetIndex]);
        parentNode.replaceChild(comment, source[sourceIndex]);
      }
    // remember to move forward both indexes, with NOOP and REPLACE
    case NOOP:
      sourceIndex++;
      targetIndex++;
      break;

    case DELETE:
      // it is always safe to remove a live node from its deleted position
      parentNode.removeChild(source[sourceIndex]);
      // remember in this case to move the sourceIndex forward
      sourceIndex++;
      break;

    case INSERT:
      // similarly with the REPLACE case, we cannot insert the target node
      // right away, unless its parent is different
      if (target[targetIndex].parentNode !== parentNode)
        // INSERT can happen outside the source boundaries
        // however, `null` or `undefined`, with insertBefore
        // means `appendChild`, so since this is a root container
        // it is OK to just use insertBefore
        parentNode.insertBefore(
          target[targetIndex],
          source[sourceIndex]
        );
      // use the same comment strategy
      else {
        const comment = document.createComment('');
        comments.set(comment, target[targetIndex]);
        parentNode.insertBefore(comment, source[sourceIndex]);
      }
      // always move forward targetIndex++; on INSERT
      targetIndex++;
      break;
  }
}

// once the loop is completed, we can replace all placeholders
comments.forEach((node, comment) => {
  parentNode.replaceChild(node, comment);
});
```

### Compatibility

This module is compatible with IE11 and every other Mobile or Desktop engine that supports `Int8Array`.

## P.S.

This algorithm was created to solve text diffing. If applied to not so common, but widely possible, Web/UI cases, this algorithm easily perform pretty badly.

Some [explanation and benchmark screenshots in twitter](https://twitter.com/WebReflection/status/1233472356544368641).
