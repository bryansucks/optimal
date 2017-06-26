import Builder from '../src/Builder';

describe('Builder', () => {
  let builder;

  beforeEach(() => {
    builder = new Builder('string', 'foo');
  });

  describe('constructor()', () => {
    it('errors if default value is undefined', () => {
      expect(() => {
        builder = new Builder('string');
      }).toThrowError('A default value for type "string" is required.');
    });

    it('sets the type and default value', () => {
      expect(builder.type).toBe('string');
      expect(builder.defaultValue).toBe('foo');
    });

    it('adds a type of check', () => {
      expect(builder.checks).toEqual([
        {
          func: builder.checkTypeOf,
          args: [],
        },
      ]);
    });
  });

  describe('addCheck()', () => {
    it('enqueues a function with arguments', () => {
      const func = () => {};

      expect(builder.checks).toHaveLength(1);

      builder.addCheck(func, 'foo', 'bar', 'baz');

      expect(builder.checks[1]).toEqual({
        func,
        args: ['foo', 'bar', 'baz'],
      });
    });
  });

  describe('checkTypeOf()', () => {
    describe('array', () => {
      it('allows arrays', () => {
        builder.type = 'array';

        expect(() => {
          builder.checkTypeOf('key', []);
        }).not.toThrowError('Invalid option "key". Must be an array.');
      });

      it('errors on non-arrays', () => {
        builder.type = 'array';

        expect(() => {
          builder.checkTypeOf('key', 123);
        }).toThrowError('Invalid option "key". Must be an array.');
      });
    });

    describe('boolean', () => {
      it('allows booleans', () => {
        builder.type = 'boolean';

        expect(() => {
          builder.checkTypeOf('key', true);
        }).not.toThrowError('Invalid option "key". Must be a boolean.');
      });

      it('errors on non-booleans', () => {
        builder.type = 'boolean';

        expect(() => {
          builder.checkTypeOf('key', 123);
        }).toThrowError('Invalid option "key". Must be a boolean.');
      });
    });

    describe('function', () => {
      it('allows functions', () => {
        builder.type = 'function';

        expect(() => {
          builder.checkTypeOf('key', () => {});
        }).not.toThrowError('Invalid option "key". Must be a function.');
      });

      it('errors on non-functions', () => {
        builder.type = 'function';

        expect(() => {
          builder.checkTypeOf('key', 'foo');
        }).toThrowError('Invalid option "key". Must be a function.');
      });
    });

    describe('number', () => {
      it('allows numbers', () => {
        builder.type = 'number';

        expect(() => {
          builder.checkTypeOf('key', 123);
        }).not.toThrowError('Invalid option "key". Must be a number.');
      });

      it('errors on non-numbers', () => {
        builder.type = 'number';

        expect(() => {
          builder.checkTypeOf('key', 'foo');
        }).toThrowError('Invalid option "key". Must be a number.');
      });
    });

    describe('object', () => {
      it('allows objects', () => {
        builder.type = 'object';

        expect(() => {
          builder.checkTypeOf('key', {});
        }).not.toThrowError('Invalid option "key". Must be a plain object.');
      });

      it('errors on non-objects', () => {
        builder.type = 'object';

        expect(() => {
          builder.checkTypeOf('key', 123);
        }).toThrowError('Invalid option "key". Must be a plain object.');
      });

      it('errors on arrays', () => {
        builder.type = 'object';

        expect(() => {
          builder.checkTypeOf('key', []);
        }).toThrowError('Invalid option "key". Must be a plain object.');
      });

      it('errors on nulls', () => {
        builder.type = 'object';

        expect(() => {
          builder.checkTypeOf('key', null);
        }).toThrowError('Invalid option "key". Must be a plain object.');
      });
    });

    describe('string', () => {
      it('allows strings', () => {
        builder.type = 'string';

        expect(() => {
          builder.checkTypeOf('key', 'foo');
        }).not.toThrowError('Invalid option "key". Must be a string.');
      });

      it('errors on non-strings', () => {
        builder.type = 'string';

        expect(() => {
          builder.checkTypeOf('key', 123);
        }).toThrowError('Invalid option "key". Must be a string.');
      });
    });
  });

  describe('required()', () => {
    it('marks a field as non-nullable', () => {
      expect(builder.nullable).toBe(true);

      builder.required();

      expect(builder.nullable).toBe(false);
    });
  });

  describe('runChecks()', () => {
    it('returns valid value', () => {
      expect(builder.runChecks('key', 'bar')).toBe('bar');
    });

    it('returns default value if value passed is undefined', () => {
      expect(builder.runChecks('key')).toBe('foo');
    });

    it('returns null if value passed is null and builder is nullable', () => {
      expect(builder.runChecks('key', null)).toBe(null);
    });

    it('runs checks if value passed is null and builder is non-nullable', () => {
      builder.required();

      expect(() => {
        builder.runChecks('key', null);
      }).toThrowError('Invalid option "key". Must be a string.');
    });

    it('runs default type of check', () => {
      expect(() => {
        builder.runChecks('key', 123);
      }).toThrowError('Invalid option "key". Must be a string.');
    });
  });
});
