import NumberBuilder, { number } from '../src/NumberBuilder';

describe('NumberBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new NumberBuilder(123);
  });

  describe('runChecks()', () => {
    it('errors if a non-number value is used', () => {
      expect(() => {
        builder.runChecks('key', 'foo');
      }).toThrowError('Invalid option "key". Must be a number.');
    });

    it('doesnt support null', () => {
      expect(() => {
        builder.runChecks('key', null);
      }).toThrowError('Invalid option "key". Must be a number.');
    });
  });

  describe('between()', () => {
    it('errors if min is a not a number', () => {
      expect(() => {
        builder.between('foo', 5);
      }).toThrowError('number.between() requires a minimum and maximum number.');
    });

    it('errors if max is a not a number', () => {
      expect(() => {
        builder.between(0, 'foo');
      }).toThrowError('number.between() requires a minimum and maximum number.');
    });

    it('adds a checker', () => {
      builder.between(0, 5);

      expect(builder.checks[1]).toEqual({
        func: builder.checkBetween,
        args: [0, 5, false],
      });
    });
  });

  describe('checkBetween()', () => {
    it('errors if value is not a number', () => {
      expect(() => {
        builder.checkBetween('key', 'foo', 0, 5);
      }).toThrowError('Invalid option "key". Number must be between 0 and 5.');
    });

    it('errors if out of range', () => {
      expect(() => {
        builder.checkBetween('key', 10, 0, 5);
      }).toThrowError('Invalid option "key". Number must be between 0 and 5.');
    });

    it('errors if out of range inclusive', () => {
      expect(() => {
        builder.checkBetween('key', 10, 0, 5, true);
      }).toThrowError('Invalid option "key". Number must be between 0 and 5 inclusive.');
    });

    it('doesnt error if in range', () => {
      expect(() => {
        builder.checkBetween('key', 3, 0, 5);
      }).not.toThrowError('Invalid option "key". Number must be between 0 and 5.');
    });

    it('doesnt error if in range inclusive', () => {
      expect(() => {
        builder.checkBetween('key', 5, 0, 5, true);
      }).not.toThrowError('Invalid option "key". Number must be between 0 and 5 inclusive.');
    });
  });

  describe('oneOf()', () => {
    it('errors if not an array', () => {
      expect(() => {
        builder.oneOf(123);
      }).toThrowError('number.oneOf() requires a non-empty array of numbers.');
    });

    it('errors if array is empty', () => {
      expect(() => {
        builder.oneOf([]);
      }).toThrowError('number.oneOf() requires a non-empty array of numbers.');
    });

    it('errors if array contains a non-number', () => {
      expect(() => {
        builder.oneOf(['foo', 123]);
      }).toThrowError('number.oneOf() requires a non-empty array of numbers.');
    });

    it('adds a checker', () => {
      builder.oneOf([123, 456, 789]);

      expect(builder.checks[1]).toEqual({
        func: builder.checkOneOf,
        args: [[123, 456, 789]],
      });
    });
  });

  describe('checkOneOf()', () => {
    it('errors if value is not in the list', () => {
      expect(() => {
        builder.checkOneOf('key', 666, [123, 456, 789]);
      }).toThrowError('Invalid option "key". Number must be one of: 123, 456, 789');
    });

    it('doesnt error if value contains token', () => {
      expect(() => {
        builder.checkOneOf('key', 123, [123, 456, 789]);
      }).not.toThrowError('Invalid option "key". Number must be one of: 123, 456, 789');
    });
  });
});

describe('number()', () => {
  it('returns a builder', () => {
    expect(number('foo')).toBeInstanceOf(NumberBuilder);
  });
});
