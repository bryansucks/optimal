import Builder from './Builder';
import isObject from './isObject';
import { Blueprint, OptimalOptions } from './types';

export default class ShapeBuilder<Shape extends object> extends Builder<Shape> {
  contents: Blueprint<Shape>;

  isExact: boolean = false;

  constructor(contents: Blueprint<Shape>) {
    super('shape', {} as any);

    if (__DEV__) {
      this.invariant(
        isObject(contents) &&
          Object.keys(contents).length > 0 &&
          Object.keys(contents).every(key => (contents as any)[key] instanceof Builder),
        'A non-empty object of properties to blueprints are required for a shape.',
      );
    }

    this.contents = contents;
  }

  exact(): this {
    this.isExact = true;

    return this;
  }

  runChecks(
    path: string,
    initialValue: Partial<Shape> | undefined,
    struct: object,
    options: OptimalOptions = {},
  ): any {
    const value: any = {};
    const object = initialValue || this.defaultValue || {};

    if (__DEV__) {
      this.invariant(isObject(object), 'Value passed to shape must be an object.', path);
    }

    const unknownFields = { ...object };

    Object.keys(this.contents).forEach(baseKey => {
      const key = baseKey as keyof Shape;
      const builder = this.contents[key];

      if (builder instanceof Builder) {
        value[key] = builder.runChecks(`${path}.${key}`, object[key], object, options);
      } else {
        value[key] = object[key];
      }

      delete unknownFields[key];
    });

    if (this.isExact) {
      const unknownKeys = Object.keys(unknownFields);

      if (unknownKeys.length > 0) {
        throw new Error(`Unknown shape fields: ${unknownKeys.join(', ')}.`);
      }
    }

    return value;
  }
}

export function shape<P extends object>(contents: Blueprint<P>) /* infer */ {
  return new ShapeBuilder<P>(contents);
}
