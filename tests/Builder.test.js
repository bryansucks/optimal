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
          func: builder.checkType,
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

  describe('and()', () => {
    it('errors if no keys are defined', () => {
      expect(() => {
        builder.and();
      }).toThrowError('AND requires a list of option names.');
    });

    it('adds a checker', () => {
      builder.and('bar', 'baz');

      expect(builder.checks[1]).toEqual({
        func: builder.checkAnd,
        args: [['bar', 'baz']],
      });
    });
  });

  describe('checkAnd()', () => {
    it('errors if not all options are defined', () => {
      expect(() => {
        builder.currentOptions = {
          foo: 'a',
          baz: 'c',
        };

        builder.checkAnd('foo', 'a', ['bar', 'baz']);
      }).toThrowError('All of these options must be defined: foo, bar, baz');
    });

    it('doesnt error if all are defined', () => {
      expect(() => {
        builder.currentOptions = {
          foo: 'a',
          bar: 'b',
          baz: 'c',
        };

        builder.checkAnd('foo', 'a', ['bar', 'baz']);
      }).not.toThrowError('Invalid option "foo".');
    });
  });

  describe('checkType()', () => {
    describe('array', () => {
      it('allows arrays', () => {
        builder.type = 'array';

        expect(() => {
          builder.checkType('key', []);
        }).not.toThrowError('Invalid option "key". Must be an array.');
      });

      it('errors on non-arrays', () => {
        builder.type = 'array';

        expect(() => {
          builder.checkType('key', 123);
        }).toThrowError('Invalid option "key". Must be an array.');
      });
    });

    describe('boolean', () => {
      it('allows booleans', () => {
        builder.type = 'boolean';

        expect(() => {
          builder.checkType('key', true);
        }).not.toThrowError('Invalid option "key". Must be a boolean.');
      });

      it('errors on non-booleans', () => {
        builder.type = 'boolean';

        expect(() => {
          builder.checkType('key', 123);
        }).toThrowError('Invalid option "key". Must be a boolean.');
      });
    });

    describe('function', () => {
      it('allows functions', () => {
        builder.type = 'function';

        expect(() => {
          builder.checkType('key', () => {});
        }).not.toThrowError('Invalid option "key". Must be a function.');
      });

      it('errors on non-functions', () => {
        builder.type = 'function';

        expect(() => {
          builder.checkType('key', 'foo');
        }).toThrowError('Invalid option "key". Must be a function.');
      });
    });

    describe('number', () => {
      it('allows numbers', () => {
        builder.type = 'number';

        expect(() => {
          builder.checkType('key', 123);
        }).not.toThrowError('Invalid option "key". Must be a number.');
      });

      it('errors on non-numbers', () => {
        builder.type = 'number';

        expect(() => {
          builder.checkType('key', 'foo');
        }).toThrowError('Invalid option "key". Must be a number.');
      });
    });

    describe('object', () => {
      it('allows objects', () => {
        builder.type = 'object';

        expect(() => {
          builder.checkType('key', {});
        }).not.toThrowError('Invalid option "key". Must be a plain object.');
      });

      it('errors on non-objects', () => {
        builder.type = 'object';

        expect(() => {
          builder.checkType('key', 123);
        }).toThrowError('Invalid option "key". Must be a plain object.');
      });

      it('errors on arrays', () => {
        builder.type = 'object';

        expect(() => {
          builder.checkType('key', []);
        }).toThrowError('Invalid option "key". Must be a plain object.');
      });

      it('errors on nulls', () => {
        builder.type = 'object';

        expect(() => {
          builder.checkType('key', null);
        }).toThrowError('Invalid option "key". Must be a plain object.');
      });
    });

    describe('string', () => {
      it('allows strings', () => {
        builder.type = 'string';

        expect(() => {
          builder.checkType('key', 'foo');
        }).not.toThrowError('Invalid option "key". Must be a string.');
      });

      it('errors on non-strings', () => {
        builder.type = 'string';

        expect(() => {
          builder.checkType('key', 123);
        }).toThrowError('Invalid option "key". Must be a string.');
      });
    });
  });

  describe('invariant()', () => {
    it('does nothing if condition is true', () => {
      expect(() => {
        builder.invariant(true);
      }).not.toThrowError();
    });

    it('errors if condition is false', () => {
      expect(() => {
        builder.invariant(false, 'Failure');
      }).toThrowError('Failure');
    });

    it('includes an option path', () => {
      expect(() => {
        builder.invariant(false, 'Failure', 'foo.bar');
      }).toThrowError('Invalid option "foo.bar". Failure');
    });

    it('includes a class name', () => {
      expect(() => {
        builder.currentConfig.name = 'FooBar';

        builder.invariant(false, 'Failure', 'foo.bar');
      }).toThrowError('Invalid FooBar option "foo.bar". Failure');
    });

    it('includes a class name when no path', () => {
      expect(() => {
        builder.currentConfig.name = 'FooBar';

        builder.invariant(false, 'Failure');
      }).toThrowError('FooBar: Failure');
    });
  });

  describe('key()', () => {
    it('returns as-is if not deep', () => {
      expect(builder.key('foo')).toBe('foo');
    });

    it('returns last part of a deep path', () => {
      expect(builder.key('foo.bar.baz')).toBe('baz');
    });
  });

  describe('message()', () => {
    it('errors for empty value', () => {
      expect(() => {
        builder.message('');
      }).toThrowError('A non-empty string is required for custom messages.');
    });

    it('errors for non-string value', () => {
      expect(() => {
        builder.message(123);
      }).toThrowError('A non-empty string is required for custom messages.');
    });

    it('sets message', () => {
      builder.message('foobar');

      expect(builder.errorMessage).toBe('foobar');
    });
  });

  describe('nullable()', () => {
    it('toggles nullable state', () => {
      expect(builder.isNullable).toBe(false);

      builder.nullable();

      expect(builder.isNullable).toBe(true);

      builder.nullable(false);

      expect(builder.isNullable).toBe(false);
    });
  });

  describe('required()', () => {
    it('toggles required state', () => {
      expect(builder.isRequired).toBe(false);

      builder.required();

      expect(builder.isRequired).toBe(true);

      builder.required(false);

      expect(builder.isRequired).toBe(false);
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
      expect(builder.nullable().runChecks('key', null)).toBe(null);
    });

    it('errors if value passed is undefined and builder is required', () => {
      expect(() => {
        builder.required().runChecks('key');
      }).toThrowError('Invalid option "key". Field is required and must be defined.');
    });

    it('errors if value passed is null and builder is non-nullable', () => {
      expect(() => {
        builder.runChecks('key', null);
      }).toThrowError('Invalid option "key". Null is not allowed.');
    });

    it('runs default type of check', () => {
      expect(() => {
        builder.runChecks('key', 123);
      }).toThrowError('Invalid option "key". Must be a string.');
    });

    it('uses custom message', () => {
      expect(() => {
        builder.message('Oops, something is broken.').runChecks('key', 123);
      }).toThrowError('Invalid option "key". Oops, something is broken.');
    });
  });

  describe('only()', () => {
    it('errors if default value is not the same type', () => {
      builder.defaultValue = 123;

      expect(() => {
        builder.only();
      }).toThrowError('Only requires a default string value.');
    });

    it('adds a checker', () => {
      builder.only();

      expect(builder.checks[1]).toEqual({
        func: builder.checkOnly,
        args: [],
      });
    });
  });

  describe('checkOnly()', () => {
    beforeEach(() => {
      builder.only();
    });

    it('errors if value doesnt match the default value', () => {
      expect(() => {
        builder.checkOnly('key', 'bar');
      }).toThrowError('Invalid option "key". Value may only be "foo".');
    });

    it('doesnt error if value matches default value', () => {
      expect(() => {
        builder.checkOnly('key', 'foo');
      }).not.toThrowError('Invalid option "key". Value may only be "foo".');
    });
  });

  describe('or()', () => {
    it('errors if no keys are defined', () => {
      expect(() => {
        builder.or();
      }).toThrowError('OR requires a list of option names.');
    });

    it('adds a checker', () => {
      builder.or('bar', 'baz');

      expect(builder.checks[1]).toEqual({
        func: builder.checkOr,
        args: [['bar', 'baz']],
      });
    });
  });

  describe('checkOr()', () => {
    it('errors if not 1 option is defined', () => {
      expect(() => {
        builder.currentOptions = {};

        builder.checkOr('foo', 'a', ['bar', 'baz']);
      }).toThrowError('At least one of these options must be defined: foo, bar, baz');
    });

    it('doesnt error if at least 1 option is defined', () => {
      expect(() => {
        builder.currentOptions = {
          foo: 'a',
        };

        builder.checkOr('foo', 'a', ['bar', 'baz']);
      }).not.toThrowError('Invalid option "foo".');
    });
  });

  describe('xor()', () => {
    it('errors if no keys are defined', () => {
      expect(() => {
        builder.xor();
      }).toThrowError('XOR requires a list of option names.');
    });

    it('adds a checker', () => {
      builder.xor('bar', 'baz');

      expect(builder.checks[1]).toEqual({
        func: builder.checkXor,
        args: [['bar', 'baz']],
      });
    });
  });

  describe('checkXor()', () => {
    it('errors if no options are defined', () => {
      expect(() => {
        builder.currentOptions = {};

        builder.checkXor('foo', 'a', ['bar', 'baz']);
      }).toThrowError('Only one of these options may be defined: foo, bar, baz');
    });

    it('errors if more than 1 option is defined', () => {
      expect(() => {
        builder.currentOptions = {
          foo: 'a',
          bar: 'b',
        };

        builder.checkXor('foo', 'a', ['bar', 'baz']);
      }).toThrowError('Only one of these options may be defined: foo, bar, baz');
    });

    it('doesnt error if only 1 option is defined', () => {
      expect(() => {
        builder.currentOptions = {
          foo: 'a',
        };

        builder.checkXor('foo', 'a', ['bar', 'baz']);
      }).not.toThrowError('Invalid option "foo".');
    });
  });
});
