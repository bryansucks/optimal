import ShapeBuilder, { shape } from '../src/ShapeBuilder';
import { bool } from '../src/Builder';
import { number } from '../src/NumberBuilder';
import { string } from '../src/StringBuilder';

describe('shape()', () => {
  let builder: ShapeBuilder<{
    foo: string;
    bar: number;
    baz: boolean;
  }>;

  beforeEach(() => {
    builder = shape({
      foo: string().empty(),
      bar: number(),
      baz: bool(),
    });
  });

  describe('constructor()', () => {
    it('errors if a non-object is not passed', () => {
      expect(() => {
        // @ts-ignore
        shape('foo');
      }).toThrowErrorMatchingSnapshot();
    });

    it('errors if an empty object is passed', () => {
      expect(() => {
        shape({});
      }).toThrowErrorMatchingSnapshot();
    });

    it('errors if an object with non-builders is passed', () => {
      expect(() => {
        // @ts-ignore
        shape({ foo: 123 });
      }).toThrowErrorMatchingSnapshot();
    });

    it('doesnt error if a builder object is passed', () => {
      expect(() => {
        shape({
          foo: string(),
        });
      }).not.toThrowError(
        'A non-empty object of properties to blueprints are required for a shape.',
      );
    });

    it('sets default value', () => {
      const defBuilder = shape({
        foo: string('bar'),
      });

      expect(defBuilder.defaultValue).toEqual({
        foo: 'bar',
      });
    });
  });

  describe('runChecks()', () => {
    it('errors if a non-object is passed', () => {
      expect(() => {
        // @ts-ignore Allow invalid type
        builder.runChecks('key', 'foo', {});
      }).toThrowErrorMatchingSnapshot();
    });

    it('checks each item in the object', () => {
      expect(() => {
        builder.runChecks(
          'key',
          // @ts-ignore Allow invalid type
          {
            foo: 'foo',
            bar: 'bar',
            baz: true,
          },
          {},
        );
      }).toThrowErrorMatchingSnapshot();
    });

    it('errors if an object item is invalid; persists path with index', () => {
      expect(() => {
        builder.runChecks(
          'key',
          // @ts-ignore Allow invalid type
          {
            foo: 123,
          },
          {},
        );
      }).toThrowErrorMatchingSnapshot();
    });

    it('supports shapes of shapes', () => {
      const nestedBuilder = shape({
        foo: shape({
          a: number(),
          b: number(),
          c: string().empty(),
        }),
      });

      const data = {
        foo: {
          a: 123,
          b: 456,
        },
      };

      expect(nestedBuilder.runChecks('key', data, {})).toEqual({
        foo: {
          ...data.foo,
          c: '',
        },
      });
    });

    it('supports nested required', () => {
      const nestedBuilder = shape({
        foo: string(),
        bar: bool().required(),
      });

      expect(() => {
        nestedBuilder.runChecks(
          'key',
          {
            foo: 'abc',
          },
          {},
        );
      }).toThrowErrorMatchingSnapshot();
    });

    it('errors correctly for shapes in shapes', () => {
      const nestedBuilder = shape({
        foo: shape({
          a: number(),
          b: number(),
          c: string(),
        }),
      });

      expect(() => {
        nestedBuilder.runChecks(
          'key',
          // @ts-ignore Allow invalid type
          {
            foo: {
              a: 123,
              b: 456,
              c: 789,
            },
          },
          {},
        );
      }).toThrowErrorMatchingSnapshot();
    });

    it('should be the object with defaults', () => {
      expect(builder.runChecks('key', {}, {})).toEqual({
        bar: 0,
        baz: false,
        foo: '',
      });
    });
  });

  describe('typeAlias()', () => {
    it('returns the type name', () => {
      expect(
        shape({
          a: number(),
          b: number(),
          c: string(),
        }).typeAlias(),
      ).toBe('shape');
    });
  });
});
