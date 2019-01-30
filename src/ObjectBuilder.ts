/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import Builder from './Builder';

export interface ObjectOf<T> {
  [key: string]: T;
}

export default class ObjectBuilder<Struct extends object, T> extends Builder<Struct, ObjectOf<T>> {
  contents: Builder<Struct, T> | null = null;

  constructor(contents: Builder<Struct, T> | null = null, defaultValue: ObjectOf<T> = {}) {
    super('object', defaultValue);

    if (__DEV__) {
      if (contents) {
        if (contents instanceof Builder) {
          this.contents = contents;
          this.addCheck(this.checkContents, contents);
        } else {
          this.invariant(false, 'A blueprint is required for object contents.');
        }
      }
    }
  }

  checkContents(path: string, value: ObjectOf<T>, contents: Builder<Struct, T>) {
    if (__DEV__) {
      Object.keys(value).forEach(key => {
        contents.runChecks(`${path}.${key}`, (value as any)[key], this.currentStruct, this.options);
      });
    }
  }

  notEmpty(): this {
    return this.addCheck(this.checkNotEmpty);
  }

  checkNotEmpty(path: string, value: ObjectOf<T>) {
    if (__DEV__) {
      this.invariant(Object.keys(value).length > 0, 'Object cannot be empty.', path);
    }
  }

  /**
   * If contents are defined, return the type name using generics syntax.
   */
  typeAlias(): string {
    const { contents } = this;
    const alias = super.typeAlias();

    return contents ? `${alias}<${contents.typeAlias()}>` : alias;
  }
}

export function object<S extends object, T = any>(
  contents: Builder<S, T> | null = null,
  defaultValue?: ObjectOf<T>,
) /* infer */ {
  return new ObjectBuilder<S, T>(contents, defaultValue);
}
