'use strict';
const deepFreeze = require('./deepFreeze');

describe('deepFreeze', () => {
  describe('prevents modification of', () => {
    it('basic objects', () => {
      let basicObject = deepFreeze({one: 'one', two: 'two'});

      expect(() => basicObject.one = 'three').toThrow();
    });

    it('nested objects', () => {
      let nestedObject = deepFreeze({
        one: 'one',
        two: {
          three: 'three'
        }
      });

      expect(() => nestedObject.three = 'four').toThrow();
    });

    it('object arrays', () => {
      let nestedObject = deepFreeze({
        one: 'one',
        two: {
          three: [{four: 'four'}, {five: 'five'}]
        }
      });

      expect(() => nestedObject.three[1].five = 'six').toThrow();
    });
  });
});
