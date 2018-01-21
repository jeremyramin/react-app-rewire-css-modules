'use strict';

module.exports = function deepFreeze(value) {
  if (value !== null && typeof value === 'object') {
    // Retrieve the property names defined on value
    const propNames = Object.getOwnPropertyNames(value);
    // Freeze properties before freezing self
    propNames.forEach((name) => {
      deepFreeze(value[name]);
    });

    // Freeze self (no-op if already frozen)
    return Object.freeze(value);
  } else if (Array.isArray(value)) {
    Array.forEach(deepFreeze);
  }
};
