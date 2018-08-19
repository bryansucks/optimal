/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import Builder from './Builder';
import isObject from './isObject';

export type Constructor<T> = new (...args: any[]) => T;

export default class InstanceBuilder<T, Struct extends object> extends Builder<T | null, Struct> {
  refClass: Constructor<T> | null = null;

  constructor(refClass: Constructor<T> | null = null) {
    super('instance', null);

    // Nullable by default
    this.nullable();

    if (process.env.NODE_ENV !== 'production') {
      if (refClass) {
        this.invariant(typeof refClass === 'function', 'A class reference is required.');
      }

      this.refClass = refClass;
      this.addCheck(this.checkInstance, refClass);
    }
  }

  checkInstance(path: string, value: any, refClass: T | null) {
    if (process.env.NODE_ENV !== 'production') {
      if (refClass) {
        this.invariant(
          typeof refClass === 'function' && value instanceof refClass,
          `Must be an instance of "${this.typeAlias()}".`,
          path,
        );
      } else {
        this.invariant(
          isObject(value) && value.constructor !== Object,
          'Must be a class instance.',
          path,
        );
      }
    }
  }

  /**
   * If reference class is defined, return the class name if available.
   */
  typeAlias(): string {
    const { refClass } = this;

    return refClass ? refClass.name || refClass.constructor.name : 'class';
  }
}

export function instance<T, S extends object>(
  refClass: Constructor<T> | null = null,
): InstanceBuilder<T, S> {
  return new InstanceBuilder(refClass);
}

export function regex<S extends object>(): InstanceBuilder<RegExp, S> {
  return instance(RegExp);
}

export function date<S extends object>(): InstanceBuilder<Date, S> {
  return instance(Date);
}
