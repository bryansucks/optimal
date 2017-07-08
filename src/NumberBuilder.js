/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import Builder from './Builder';

function isNumber(value: *): boolean {
  return (typeof value === 'number');
}

export default class NumberBuilder extends Builder<number> {
  constructor(defaultValue: number = 0) {
    super('number', defaultValue);
  }

  between(min: number, max: number, inclusive: boolean = false): this {
    if (__DEV__) {
      this.invariant(
        (isNumber(min) && isNumber(max)),
        'Between requires a minimum and maximum number.',
      );
    }

    return this.addCheck(this.checkBetween, min, max, inclusive);
  }

  checkBetween(path: string, value: *, min: number, max: number, inclusive: boolean = false) {
    if (__DEV__) {
      this.invariant(
        (
          isNumber(value) &&
          (inclusive ? (value >= min && value <= max) : (value > min && value < max))
        ),
        `Number must be between ${min} and ${max}${inclusive ? ' inclusive' : ''}.`,
        path,
      );
    }
  }

  gt(min: number, inclusive: boolean = false): this {
    if (__DEV__) {
      this.invariant(isNumber(min), 'Greater-than requires a minimum number.');
    }

    return this.addCheck(this.checkGreaterThan, min, inclusive);
  }

  gte(min: number): this {
    return this.gt(min, true);
  }

  checkGreaterThan(path: string, value: *, min: number, inclusive: boolean = false) {
    if (__DEV__) {
      if (inclusive) {
        this.invariant(
          (isNumber(value) && value >= min),
          `Number must be greater than or equal to ${min}.`,
          path,
        );
      } else {
        this.invariant(
          (isNumber(value) && value > min),
          `Number must be greater than ${min}.`,
          path,
        );
      }
    }
  }

  lt(max: number, inclusive: boolean = false): this {
    if (__DEV__) {
      this.invariant(isNumber(max), 'Less-than requires a maximum number.');
    }

    return this.addCheck(this.checkLessThan, max, inclusive);
  }

  lte(max: number): this {
    return this.lt(max, true);
  }

  checkLessThan(path: string, value: *, max: number, inclusive: boolean = false) {
    if (__DEV__) {
      if (inclusive) {
        this.invariant(
          (isNumber(value) && value <= max),
          `Number must be less than or equal to ${max}.`,
          path,
        );
      } else {
        this.invariant(
          (isNumber(value) && value < max),
          `Number must be less than ${max}.`,
          path,
        );
      }
    }
  }

  oneOf(list: string[] = []): this {
    if (__DEV__) {
      this.invariant(
        (Array.isArray(list) && list.length > 0 && list.every(isNumber)),
        'One of requires a non-empty array of numbers.',
      );
    }

    return this.addCheck(this.checkOneOf, list);
  }

  checkOneOf(path: string, value: *, list: string[] = []) {
    if (__DEV__) {
      this.invariant(
        (list.indexOf(value) >= 0),
        `Number must be one of: ${list.join(', ')}`,
        path,
      );
    }
  }
}

export function number(defaultValue: number = 0): NumberBuilder {
  return new NumberBuilder(defaultValue);
}
