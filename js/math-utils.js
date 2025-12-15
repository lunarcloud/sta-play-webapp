export class Interpolate {
  static style = {
    identity: (/** @type {number} */ t) => Interpolate.identity(t),
    cubic: (/** @type {number} */ t) => Interpolate.cubic(t),
    elastic: (/** @type {number} */ t) => Interpolate.elastic(t)
  }

  /**
   * Identity interpolation
   * @param {number} amount     value to interpolate
   * @returns {number}          interpolated value
   */
  static identity (amount) {
    return clamp(amount, 0, 1)
  }

  /**
   * Cubic interpolation
   * @param {number} amount     value to interpolate
   * @returns {number}          interpolated value
   */
  static cubic (amount) {
    amount = clamp(amount, 0, 1)
    if (2 * amount < 1) {
      return 4 * Math.pow(amount, 3)
    } else {
      return 1 - 4 * Math.pow(1 - amount, 3)
    }
  }

  /**
   * Elastic interpolation
   * @param {number} amount     value to interpolate
   * @returns {number}          interpolated value
   */
  static elastic (amount) {
    amount = clamp(amount, 0, 1)
    if (amount === 0) return 0
    const range = 10.5 * Math.PI
    return (range - Math.sin(range * amount) / amount) / (range - 1)
  }
};

/**
 * Clamp the value
 * @param {number} value    value to clamp
 * @param {number} [min]    smallest value (inclusive)
 * @param {number} [max]    largest value (inclusive)
 * @returns {number}        value, min, or max
 */
export function clamp (value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

/**
 * Linear Interpolate
 * @param {number} start    initial value
 * @param {number} end      final value
 * @param {number} t        normalized percent of how close from start to end we are
 * @param {(arg0: number) => number} [style]    interpolation type
 * @returns {number}        a value that is t distance from start to end
 */
export function lerp (start, end, t, style = Interpolate.identity) {
  const progress = style(t)
  return (1 - progress) * start + progress * end
}
