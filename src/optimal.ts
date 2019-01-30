/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import Builder from './Builder';
import isObject from './isObject';
import typeOf from './typeOf';
import { Blueprint, InferStructure, OptimalOptions } from './types';

function buildAndCheck<Struct extends object>(
  struct: Partial<Struct>,
  blueprint: Blueprint<Struct>,
  options: OptimalOptions = {},
  parentPath: string = '',
): any {
  const unknownFields: any = { ...struct };
  const builtStruct: any = {};

  // Validate using the blueprint
  Object.keys(blueprint).forEach(baseKey => {
    const key = baseKey as keyof Struct;
    const value = struct[key];
    const builder = blueprint[key];
    const path = String(parentPath ? `${parentPath}.${key}` : key);

    // Run validation checks
    if (builder instanceof Builder) {
      builtStruct[key] = builder.runChecks(path, value, struct, options);

      // Builder is a plain object, so let's recursively try again
    } else if (isObject(builder)) {
      builtStruct[key] = buildAndCheck(isObject(value) ? value : {}, builder, options, path);

      // Oops
    } else if (__DEV__) {
      throw new Error('Unknown blueprint. Must be a builder or plain object.');
    }

    // Delete the prop and mark it as known
    delete unknownFields[key];
  });

  // Handle unknown options
  if (options.unknown) {
    Object.assign(builtStruct, unknownFields);
  } else if (__DEV__) {
    const unknownKeys = Object.keys(unknownFields);

    if (unknownKeys.length > 0) {
      throw new Error(`Unknown fields: ${unknownKeys.join(', ')}.`);
    }
  }

  return builtStruct;
}

export default function optimal<Struct extends object>(
  // struct: Construct,
  blueprint: Blueprint<Struct>,
  options: OptimalOptions = {},
): Struct {
  // if (__DEV__) {
  //   if (!isObject(struct)) {
  //     throw new TypeError(`Optimal requires a plain object, found ${typeOf(struct)}.`);
  //   } else if (!isObject(options)) {
  //     throw new TypeError('Optimal options must be a plain object.');
  //   } else if (!isObject(blueprint)) {
  //     throw new TypeError('A blueprint is required.');
  //   }
  // }
  // return buildAndCheck(struct, blueprint, options);
  return {} as any;
}
