/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/**
 * Return true if the value is a plain object.
 */
export default function isObject(value: any): value is object {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
