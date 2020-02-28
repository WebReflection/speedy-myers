const {NOOP, REPLACE, INSERT, DELETE, diff} = require('../cjs');

console.assert(
  diff([1, 2, 3, 4, 5, 6, 7, 8], [1, 7, 3, 4, 5, 6, 2, 8], Object.is).join(" ") === [
    NOOP, REPLACE, NOOP, NOOP, NOOP, NOOP, REPLACE, NOOP
  ].join(" "),
  "diffing via Object.is"
);

console.assert(
  diff([1, 2, 3, 4, 5, 6, 7, 8], [1, 7, 3, 4, 5, 6, 2, 8]).join(" ") === [
    NOOP, REPLACE, NOOP, NOOP, NOOP, NOOP, REPLACE, NOOP
  ].join(" "),
  "diffing without helper"
);

let i = 0;
console.assert(
  diff([1, 2, 3, 4, 5], [9, 2, 7, 8]).join(" ") === [
    REPLACE, NOOP, REPLACE, REPLACE, DELETE
  ].join(" "),
  `diff ${++i}`
);

console.assert(
  diff([1, 2, 3, 4], [1, 5, 3, 6, 7]).join(" ") === [
    NOOP, REPLACE, NOOP, REPLACE, INSERT
  ].join(" "),
  `diff ${++i}`
);

console.assert(
  diff([4, 6, 9, 1, 3, 2, 5], [8, 6, 9, 5, 3, 1, 2]).join(" ") === [
    REPLACE, NOOP, NOOP, INSERT, INSERT, NOOP, DELETE, NOOP, DELETE
  ].join(" "),
  `diff ${++i}`
);
