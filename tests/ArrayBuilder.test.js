import ArrayBuilder, { array } from '../src/ArrayBuilder';
import { string } from '../src/StringBuilder';

describe('ArrayBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new ArrayBuilder(string());
  });

  describe('constructor()', () => {
    it('errors if a builder is not passed', () => {
      expect(() => {
        builder = new ArrayBuilder();
      }).toThrowError('A blueprint is required for array contents.');
    });

    it('errors if a non-builder is passed', () => {
      expect(() => {
        builder = new ArrayBuilder(123);
      }).toThrowError('A blueprint is required for array contents.');
    });

    it('doesnt error if a builder is passed', () => {
      expect(() => {
        builder = new ArrayBuilder(string());
      }).not.toThrowError('A blueprint is required for array contents.');
    });

    it('sets default value', () => {
      builder = new ArrayBuilder(string(), ['foo']);

      expect(builder.defaultValue).toEqual(['foo']);
    });
  });

  describe('runChecks()', () => {
    it('returns an empty array for no data', () => {
      expect(builder.runChecks('key')).toEqual([]);
    });

    it('errors if a non-array is passed', () => {
      expect(() => {
        builder.runChecks('key', 'foo');
      }).toThrowError('Invalid option "key". Must be an array.');
    });

    it('checks each item in the array', () => {
      expect(() => {
        builder.runChecks('key', ['foo', 'bar', 'baz', 123]);
      }).toThrowError('Invalid option "key[3]". Must be a string.');
    });

    it('errors if an array item is invalid; persists path with index', () => {
      expect(() => {
        builder.runChecks('key', [123]);
      }).toThrowError('Invalid option "key[0]". Must be a string.');
    });

    it('supports arrays of arrays', () => {
      builder = new ArrayBuilder(array(string()));

      const data = [
        ['foo', 'bar'],
        ['baz', 'qux'],
      ];

      expect(builder.runChecks('key', data)).toEqual(data);
    });

    it('errors correctly for arrays in arrays', () => {
      builder = new ArrayBuilder(array(string()));

      expect(() => {
        builder.runChecks('key', [
          ['foo', 'bar'],
          ['baz', 123],
        ]);
      }).toThrowError('Invalid option "key[1][1]". Must be a string.');
    });
  });

  describe('notEmpty()', () => {
    it('adds a checker', () => {
      builder.notEmpty();

      expect(builder.checks[2]).toEqual({
        func: builder.checkNotEmpty,
        args: [],
      });
    });
  });

  describe('checkNotEmpty()', () => {
    it('errors if value is empty', () => {
      expect(() => {
        builder.checkNotEmpty('key', []);
      }).toThrowError('Invalid option "key". Array cannot be empty.');
    });

    it('doesnt error if not empty', () => {
      expect(() => {
        builder.checkNotEmpty('key', [123]);
      }).not.toThrowError('Invalid option "key". Array cannot be empty.');
    });
  });
});

describe('array()', () => {
  it('returns a builder', () => {
    expect(array(string())).toBeInstanceOf(ArrayBuilder);
  });

  it('sets default value', () => {
    const builder = array(string(), ['foo']);

    expect(builder.defaultValue).toEqual(['foo']);
  });
});
