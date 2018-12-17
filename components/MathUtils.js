const DEG_180 = 180;
const ZERO = 0;
const ONE = 1;
const TWO = 2;
const FIVE = 5;
const SIX = 6;
const HEX = 16;
const TEN = 10;

export class MathUtils {
	static polar2cartesian (deg, len) {
		let x = len * Math.cos(MathUtils.deg2rad(deg));
		let y = len * Math.sin(MathUtils.deg2rad(deg));
		return { x: x, y: y };
	}

	static deg2rad (deg) {
		return deg * (Math.PI / DEG_180); // deg to rad
	}

	static rad2deg (rad) {
		return rad * (DEG_180 / Math.PI); // deg to rad
	}

	static vectorPerpendicular (vector) {
		let perpendicular = { x: vector.y, y: -vector.x };
		let unit = MathUtils.vectorUnit(perpendicular);
		return unit;
	}

	static vectorScale (vector, factor) {
		return { x: vector.x * factor, y: vector.y * factor };
	}

	static vectorLen (vector) {	// magnitude
		return Math.sqrt(Math.pow(vector.x, TWO) + Math.pow(vector.y, TWO));
	}

	static vectorDot (a, b) {
		return a.x * b.x + a.y * b.y;
	}

	static vectorUnit (a) {
		let len = MathUtils.vectorLen(a);
		return { x: a.x / len, y: a.y / len };
	}

	// a - b
	static vectorDiff (a, b) {
		return { x: a.x - b.x, y: a.y - b.y };
	}

	// a + b
	static vectorAdd (a, b) {
		return { x: a.x + b.x, y: a.y + b.y };
	}

	// get the slope between two points
	static getSlope (p2, p1) {
		return (p2.y - p1.y) / (p2.x - p1.x);
	}

	static rotatePoint (point, radians) {
		let len = Math.sqrt(Math.pow(point.x, TWO) + Math.pow(point.y, TWO));
		let pointAngle = Math.atan2(point.y, point.x);
		let newPoint = { x: 0, y: 0 };
		newPoint.x = Math.cos(pointAngle + radians) * len;
		newPoint.y = Math.sin(pointAngle + radians) * len;
		return newPoint;
	}

    /**
	 * Calculate the middle point of a number set,
	 * in which half the numbers are above the median and half are below
	 * @param {number} n the nums of elements on a set number
	 */
	static median (n) {
		return (n + ONE) / TWO; // (n/2 + (n/2 + 1)) / 2 for odd nums
	}

	/**
	 * Turn on the bit at given 'index' in the respective 'mask'
	 * @param {number} mask number representing a mask of bits
	 * @param {number} index the index for set as one in the vector of bits
	 */
	static turnOnBit (mask, index) {
		return mask | (ONE << index);
	}

	/**
	 * check if the bit on mask at specified 'index' is 'on'
	 * @param {number} mask number representing a mask of bits
	 * @param {number} index the index of bit for check
	 */
	static isBitOn (mask, index) {
		let itemBit = ONE << index; // Math.pow(2, index);
		return (mask & itemBit) === itemBit;
	}
	/**
	  * Calculate the linear interpolation between vector a and b
	  * in the dir a -> b
	  * @param {number} t interpolation factor
	  * @param {point} a when t = 0 mix() returns a
	  * @param {point} b when t = 1 mix() returns b
	  */
	static vectorMix (t, a, b) {
		// a + (b - a)t = a + bt - at = a - at + bt = a(1 - t) + bt
		let bt = MathUtils.vectorScale(b, t);
		let aInv = MathUtils.vectorScale(a, ONE - t);
		return MathUtils.vectorAdd(aInv, bt);
	}

    /**
	 * Returns a random integer between min (inclusive) and max (inclusive)
	 * Using Math.round() will give you a non-uniform distribution!
	 */
	static getRandomInt (min, max) {
		return Math.floor(Math.random() * (max - min + ONE)) + min;
	}

	/**
	* Convert decimal number in format hexadecimal
	*/

	static decToHex (d) {
		let hex = Number(d).toString(HEX);
		hex = '000000'.substr(ZERO, SIX - hex.length) + hex;
		return hex;
	}

	/**
	*	Version 2, could be useful to convert number to hex with length  < 6
	*/
	static decimalToHex (d, padding) {
		var hex = Number(d).toString(HEX);
		padding = typeof (padding) === 'undefined' || padding === null ? padding = TWO : padding;

		while (hex.length < padding) {
			hex = '0' + hex;
		}

		return hex;
	}

	static getDigitCount (number) {
		return Math.max(Math.floor(Math.log10(Math.abs(number))), ZERO) + ONE;
	}

	static getDigit (number, n, fromLeft) {
		const location = fromLeft ? this.getDigitCount(number) + ONE - n : n;
		return Math.floor((number / Math.pow(TEN, location - ONE)) % TEN);
	}

	static distancePoints (pointA, pointB) {
		var a = pointA.x - pointB.x;
		var b = pointA.y - pointB.y;
		var c = Math.sqrt(a * a + b * b);
		return c;
	}

	static isNear (NumberA, NumberB, error) {
		return (NumberA + error > NumberB && NumberA - error < NumberB);
	}

	/**
	* greater common divisor
	*/
	static gcd (a, b) {
		return b ? this.gcd(b, a % b) : a;
	}

	/**
	 * Get decimal digits of a number
	 * @param {*} num
	 */
	static decimalPlaces (num) {
		var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
		if (!match) { return ZERO; }
		return Math.max(
				ZERO,
				// Number of digits right of decimal point.
				(match[ONE] ? match[ONE].length : ZERO) -
				// Adjust for scientific notation.
				(match[TWO] ? +match[TWO] : ZERO));
	}

	/**
	 * Given a fraction with decimals like 62.5/30, obtain an expression equivalent
	 * without decimal part in its terms, returns original fraction if not possible
	 * @param {number} numerator the numerator of the fraction
	 * @param {number} denominator the denominator of the fraction
	 * @returns {object} Numerator and denominator without decimal part
	 */
	static equivalentFractionWithNoDecimals (numerator, denominator) {
		const MAX_FACTOR = 10;
		let currentNumerator = numerator;
		let currentDenominator = denominator;

		// find factor for numerator
		let hasEnteredNumeratorLoop = false;
		let factor = 1;
		while (!Number.isInteger(currentNumerator) && factor <= MAX_FACTOR) {
			currentNumerator = numerator * factor;
			hasEnteredNumeratorLoop = true;
			factor++;
		}
		// if numerator still has decimal part then return false
		if (!Number.isInteger(currentNumerator)) return { isEquivalentWithoutDecimal: false, numerator: numerator, denominator: denominator, factor: undefined };

		if (hasEnteredNumeratorLoop) {
			const BEFORE_LAST_UPDATE = 1;
			currentDenominator = denominator * (factor - BEFORE_LAST_UPDATE);
		}

		// find factor for denominator
		let initialDenominator = currentDenominator;
		let hasEnteredDenominatorLoop = false;
		const ORIGINAL_FACTOR_VALUE = 1;
		factor = ORIGINAL_FACTOR_VALUE;
		while (!Number.isInteger(currentDenominator) && factor <= MAX_FACTOR) {
			currentDenominator = initialDenominator * factor;
			hasEnteredDenominatorLoop = true;
			factor++;
		}
		// if denominator still has decimal part then return false
		if (!Number.isInteger(currentDenominator)) return { isEquivalentWithoutDecimal: false, numerator: numerator, denominator: denominator, factor: undefined };

		if (hasEnteredDenominatorLoop) {
			const BEFORE_LAST_UPDATE = 1;
			currentNumerator = currentNumerator * (factor - BEFORE_LAST_UPDATE); // update numerator
		}

		return { isEquivalentWithoutDecimal: true, numerator: currentNumerator, denominator: currentDenominator, factor: factor };
	}

	/**
	 * Chekc if a ginven number is int or float
	 * @param {number} n number for checking
	 * @returns {boolean} flag indicating if respective number is float or number
	 */
	static isInt (n) {
		const ZERO = 0;
		const ONE = 1;
		return n % ONE === ZERO;
	}

	/**
	 * Find prime factors of a number
	 * @param {number} a number for searching its prime factors
	 * @returns {Array} array containaining a set of prime factor for the given number
	 */
	static primeFactors (a) {
		let primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997]; // eslint-disable-line no-magic-numbers

		var primeFactors = [];

		// Trial division algorithm
		for (var i = ZERO, p = primeNumbers[i]; i < primeNumbers.length && p * p <= a; i++, p = primeNumbers[i]) {
			while (a % p === ZERO) {
				primeFactors.push(p);
				a /= p;
			}
		}

		if (a > ONE) {
			primeFactors.push(a);
		}

		return primeFactors;
	}

	/**
	 * Analyze fraction and check for periodic decimals
	 * @param {number} n numerator of a given fraction
	 * @param {number} d denominator of a given fraction
	 * @returns {{repeat: boolean, integerPart : string, nonRepeatingPart: string, repeatingPart : string}} Object with four properties, where (1) 'repeat': is a boolean flag that indicates if a given fraction has periodic part (2) 'integerPart': is a string representing the integer part of the given fraction (3) 'nonRepeatingPart': is a string number representing the value of the decimal part that is not repeated (4) 'repeatingPart': is a string representing the value of the decimal part that is being repeated
	 */
	static getRepeatingDecimal (n, d) {
		let pFS = MathUtils.primeFactors(d);
		let outpuObj = {
			value: n / d,
			repeat: false
		};

		const MAX_DECIMAL_DIGIT_ANALYSIS = 20;

		for (let i = ZERO; i < pFS.length; i++) { // Go through each of the denominators prime factors
			if (pFS[i] !== TWO && pFS[i] !== FIVE) { // We have a repeating decimal
				let output = [];
				let ns = [];
				let _n = n;

				// Let's find the repeating decimal
				// Repeating decimal algorithm - uses long division
				for (let i = ZERO; i < MAX_DECIMAL_DIGIT_ANALYSIS; i++) { // For now find 20 spots, ideally this should stop after it finds the repeating decimal
					// How many times does the denominator go into the numerator evenly
					let val = _n / d;
					let temp2 = parseInt(val);

					if (ns[_n] === undefined) {
						ns[_n] = i;
					} else {
						outpuObj.repeat = true;
						outpuObj.integerPart = output.slice(ZERO, ONE).join('');
						outpuObj.nonRepeatingPart = output.slice(ONE, ns[_n]).join('');
						outpuObj.repeatingPart = output.slice(ns[_n]).join('');

						return outpuObj;
					}

					output.push(temp2);
					_n = _n % d;
					_n += '0';
				}
				outpuObj.repeat = true;
				return outpuObj;
			}
		}

		// Terminating decimal
		return outpuObj;
	}
}