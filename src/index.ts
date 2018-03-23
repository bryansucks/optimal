/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import optimal from './optimal';
import Builder, { bool, custom, func } from './Builder';
import CollectionBuilder, { array, object } from './CollectionBuilder';
import InstanceBuilder, { instance, date, regex } from './InstanceBuilder';
import NumberBuilder, { number } from './NumberBuilder';
import ShapeBuilder, { shape } from './ShapeBuilder';
import StringBuilder, { string } from './StringBuilder';
import UnionBuilder, { union } from './UnionBuilder';
import {
  Blueprint,
  Checker,
  CustomCallback,
  Options,
  OptimalOptions,
  SupportedType,
} from './types';

export { array, bool, custom, date, func, instance, number, object, regex, shape, string, union };

export {
  Builder,
  CollectionBuilder,
  InstanceBuilder,
  NumberBuilder,
  ShapeBuilder,
  StringBuilder,
  UnionBuilder,
};

export { Blueprint, Checker, CustomCallback, Options, OptimalOptions, SupportedType };

export default optimal;
