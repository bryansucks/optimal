/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import Builder from './Builder';

export default class CollectionBuilder<T, TDefault> extends Builder<TDefault | null> {
  contents: Builder<T> | null = null;

  type: 'array' | 'object' = 'array';

  constructor(
    type: 'array' | 'object',
    contents: Builder<T> | null = null,
    defaultValue: TDefault | null = null,
  ) {
    super(type, defaultValue);

    if (__DEV__) {
      if (contents) {
        if (contents instanceof Builder) {
          this.contents = contents;
          this.addCheck(this.checkContents, contents);
        } else {
          this.invariant(false, `A blueprint is required for ${type} contents.`);
        }
      }
    }
  }

  checkContents(path: string, value: any, contents: Builder<T>) {
    if (__DEV__) {
      if (this.type === 'array') {
        value.forEach((item: T, i: number) => {
          contents.runChecks(`${path}[${i}]`, item, this.currentOptions, this.currentConfig);
        });
      } else if (this.type === 'object') {
        Object.keys(value).forEach(key => {
          contents.runChecks(`${path}.${key}`, value[key], this.currentOptions, this.currentConfig);
        });
      }
    }
  }

  notEmpty(): this {
    return this.addCheck(this.checkNotEmpty);
  }

  checkNotEmpty(path: string, value: any) {
    if (__DEV__) {
      if (this.type === 'array') {
        this.invariant(value.length > 0, 'Array cannot be empty.', path);
      } else if (this.type === 'object') {
        this.invariant(Object.keys(value).length > 0, 'Object cannot be empty.', path);
      }
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

export function array<T>(
  contents: Builder<T> | null = null,
  defaultValue: T[] | null = [],
): CollectionBuilder<T, T[]> {
  return new CollectionBuilder('array', contents, defaultValue);
}

export function object<T>(
  contents: Builder<T> | null = null,
  defaultValue: { [key: string]: T } | null = {},
): CollectionBuilder<T, { [key: string]: T }> {
  return new CollectionBuilder('object', contents, defaultValue);
}
