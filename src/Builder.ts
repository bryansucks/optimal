/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import isObject from './isObject';
import { SupportedType, CheckerCallback, CustomCallback, OptimalOptions, Struct } from './types';

export interface Check {
  args: any[];
  callback: CheckerCallback;
}

export default class Builder<T> {
  checks: Check[] = [];

  currentStruct: Struct = {};

  defaultValue: T;

  deprecatedMessage: string = '';

  errorMessage: string = '';

  isNullable: boolean = false;

  isRequired: boolean = false;

  options: OptimalOptions = {};

  type: SupportedType;

  constructor(type: SupportedType, defaultValue: T) {
    if (__DEV__) {
      this.invariant(
        typeof defaultValue !== 'undefined',
        `A default value for type "${type}" is required.`,
      );

      this.addCheck(this.checkType);
    }

    this.defaultValue = defaultValue;
    this.type = type;
  }

  /**
   * Add a checking function with optional arguments.
   */
  addCheck(checker: CheckerCallback, ...args: any[]): this {
    if (__DEV__) {
      this.checks.push({
        args,
        callback: checker,
      });
    }

    return this;
  }

  /**
   * Map a list of names that must be defined alongside this field.
   */
  and(...keys: string[]): this {
    if (__DEV__) {
      this.invariant(keys.length > 0, 'AND requires a list of field names.');
    }

    return this.addCheck(this.checkAnd, keys);
  }

  /**
   * Validate that all fields have been defined.
   */
  checkAnd(path: string, value: any, otherKeys: string[]) {
    if (__DEV__) {
      const keys = [this.key(path), ...otherKeys];
      const struct = this.currentStruct;
      const undefs = keys.filter(key => typeof struct[key] === 'undefined' || struct[key] === null);

      // Only error once one of the struct is defined
      if (undefs.length === keys.length) {
        return;
      }

      this.invariant(
        undefs.length === 0,
        `All of these fields must be defined: ${keys.join(', ')}`,
      );
    }
  }

  /**
   * Validate the type of value.
   */
  checkType(path: string, value: any) {
    if (__DEV__) {
      switch (this.type) {
        case 'array':
          this.invariant(Array.isArray(value), 'Must be an array.', path);
          break;

        case 'custom':
        case 'instance':
        case 'union':
          // Handle in the sub-class
          break;

        case 'object':
        case 'shape':
          this.invariant(isObject(value), 'Must be a plain object.', path);
          break;

        default:
          // eslint-disable-next-line valid-typeof
          this.invariant(typeof value === this.type, `Must be a ${this.type}.`, path);
          break;
      }
    }
  }

  /**
   * Set a callback to run custom logic.
   */
  custom(callback: CustomCallback): this {
    if (__DEV__) {
      this.invariant(
        typeof callback === 'function',
        'Custom blueprints require a validation function.',
      );
    }

    return this.addCheck(this.checkCustom, callback);
  }

  /**
   * Validate the value using a custom callback.
   */
  checkCustom(path: string, value: any, callback: CustomCallback) {
    if (__DEV__) {
      try {
        callback(value, this.currentStruct);
      } catch (error) {
        this.invariant(false, error.message, path);
      }
    }
  }

  /**
   * Set a message to log when this field is present.
   */
  deprecate(message: string): this {
    if (__DEV__) {
      this.invariant(
        typeof message === 'string' && !!message,
        'A non-empty string is required for deprecated messages.',
      );

      this.deprecatedMessage = message;
    }

    return this;
  }

  /**
   * Throw an error if the condition is falsy.
   */
  invariant(condition: boolean, message: string, path: string = '') {
    if (__DEV__) {
      if (condition) {
        return;
      }

      const { file, name } = this.options;
      const error = this.errorMessage || message;
      let prefix = '';

      if (path) {
        if (name) {
          prefix += `Invalid ${name} field "${path}"`;
        } else {
          prefix += `Invalid field "${path}"`;
        }
      } else if (name) {
        prefix += name;
      }

      if (file) {
        prefix += ` in ${file}`;
      }

      if (prefix) {
        throw new Error(`${prefix}. ${error}`);
      } else {
        throw new Error(error);
      }
    }
  }

  /**
   * Return the current key from a path.
   */
  key(path: string): string {
    const index = path.lastIndexOf('.');

    return index > 0 ? path.slice(index + 1) : path;
  }

  /**
   * Set a custom error message for all checks.
   */
  message(message: string): this {
    if (__DEV__) {
      this.invariant(
        typeof message === 'string' && !!message,
        'A non-empty string is required for custom messages.',
      );

      this.errorMessage = message;
    }

    return this;
  }

  /**
   * Allow null values.
   */
  nullable(state: boolean = true): this {
    if (__DEV__) {
      this.isNullable = state;
    }

    return this;
  }

  /**
   * Mark a field as only the default value can be used.
   */
  only(): this {
    if (__DEV__) {
      this.invariant(
        // eslint-disable-next-line valid-typeof
        typeof this.defaultValue === this.type,
        `Only requires a default ${this.type} value.`,
      );
    }

    return this.addCheck(this.checkOnly);
  }

  /**
   * Validate the value matches only the default value.
   */
  checkOnly(path: string, value: any) {
    if (__DEV__) {
      this.invariant(
        value === this.defaultValue,
        `Value may only be "${String(this.defaultValue)}".`,
        path,
      );
    }
  }

  /**
   * Map a list of field names that must have at least 1 defined.
   */
  or(...keys: string[]): this {
    if (__DEV__) {
      this.invariant(keys.length > 0, 'OR requires a list of field names.');
    }

    return this.addCheck(this.checkOr, keys);
  }

  /**
   * Validate that at least 1 field is defined.
   */
  checkOr(path: string, value: any, otherKeys: string[]) {
    if (__DEV__) {
      const keys = [this.key(path), ...otherKeys];
      const struct = this.currentStruct;
      const defs = keys.filter(key => typeof struct[key] !== 'undefined' && struct[key] !== null);

      this.invariant(
        defs.length > 0,
        `At least one of these fields must be defined: ${keys.join(', ')}`,
      );
    }
  }

  /**
   * Disallow undefined values.
   */
  required(state: boolean = true): this {
    if (__DEV__) {
      this.isRequired = state;
    }

    return this;
  }

  /**
   * Run all validation checks that have been enqueued.
   */
  runChecks(path: string, initialValue: any, struct: Struct, options: OptimalOptions = {}): any {
    this.currentStruct = struct;
    this.options = options;

    let value = initialValue;

    // Handle undefined
    if (typeof value === 'undefined') {
      if (!this.isRequired) {
        value = this.defaultValue;
      } else if (__DEV__) {
        this.invariant(false, 'Field is required and must be defined.', path);
      }
    } else if (this.deprecatedMessage) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.info(`Field "${path}" is deprecated. ${this.deprecatedMessage}`);
      }
    }

    // Handle null
    if (value === null) {
      if (this.isNullable) {
        return value;
      }

      if (__DEV__) {
        this.invariant(false, 'Null is not allowed.', path);
      }
    }

    // Run all checks against the value
    if (__DEV__) {
      this.checks.forEach(checker => {
        checker.callback.call(this, path, value, ...checker.args);
      });
    }

    return value;
  }

  /**
   * Return a human readable type name.
   */
  typeAlias(): string {
    return this.type;
  }

  /**
   * Map a list of field names that must not be defined alongside this field.
   */
  xor(...keys: string[]): this {
    if (__DEV__) {
      this.invariant(keys.length > 0, 'XOR requires a list of field names.');
    }

    return this.addCheck(this.checkXor, keys);
  }

  /**
   * Validate that only 1 field is defined.
   */
  checkXor(path: string, value: any, otherKeys: string[]) {
    if (__DEV__) {
      const keys = [this.key(path), ...otherKeys];
      const struct = this.currentStruct;
      const defs = keys.filter(key => typeof struct[key] !== 'undefined' && struct[key] !== null);

      this.invariant(
        defs.length === 1,
        `Only one of these fields may be defined: ${keys.join(', ')}`,
      );
    }
  }
}

export function bool(defaultValue: boolean | null = false): Builder<boolean | null> {
  return new Builder('boolean', defaultValue);
}

export function custom<T>(
  callback: CustomCallback,
  defaultValue: T | null = null,
): Builder<T | null> {
  return new Builder('custom', defaultValue).custom(callback);
}

export function func(defaultValue: Function | null = null): Builder<Function | null> {
  return new Builder('function', defaultValue).nullable();
}
