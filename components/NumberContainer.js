import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';
import { COMMON_NUMBERS } from '../Constants';

var lastlocaleValue = 'en-US';

export const CELL_WIDTH = 14;
export const DEFAULT_DIGIT_NUMBERS = 6;

export class NumberContainer extends MindPixiContainer {
	constructor (number, style, mindObjectOptions, sign = '', numberOfDigits = DEFAULT_DIGIT_NUMBERS, useSeparator = true) {
		super(mindObjectOptions);
		this._style = style;
		this._number = number;
		this._sign = sign;
		this._numberOfDigits = numberOfDigits;
		this._useSeparators = useSeparator;

		this.digits = [];
		this.allElements = [];

		this.eventEmitter.on(this.mindEvents.EVENT_LOCALE_CHANGED, this._onLocaleChanged, this);
		this.eventEmitter.on(this.mindEvents.EVENT_FONTSIZE_CHANGED, this._onFontSizeChanged, this);

		this.setup();
	}

	/**
	 * Setup al elements
	 */
	setup () {
		let maxNumElements = this._numberOfDigits;
		let SEPARATOR_CICLE = 3;
		let ADDITIONAL_SEPARATOR = 1;
		maxNumElements += Math.ceil(maxNumElements / SEPARATOR_CICLE) + ADDITIONAL_SEPARATOR; // Number separators
		let EDGE_SIGNS = 2;
		maxNumElements += EDGE_SIGNS; // first and endSign

		for (let index = 0; index < maxNumElements; index++) {
			let charElemnt = new MindPixiText('', this._style);
			let CHARACTER_ANCHOR_X = 0.5;
			let CHARACTER_ANCHOR_Y = 0.5;
			charElemnt.anchor.set(CHARACTER_ANCHOR_X, CHARACTER_ANCHOR_Y);
			this.addChild(charElemnt);
			this.allElements.push(charElemnt);
		}

		this.Value = this._number;
	}

	set useSeparators (value) {
		this._useSeparators = value;
		this.Value = this._number;
	}

	get useSeparators () {
		return this._useSeparators;
	}

	/**
	 * Update components according to the new value value selected
	 */
	set Value (val) {
		this.digits = [];
		this._number = val;
		// console.log(this._number);
		for (let i = 0; i < this.allElements.length; i++) {
			let element = this.allElements[i];
			element.text = '';
			element.x = 0;
		}

		let iElement = 0;

		let strValue = '';
		if (this._useSeparators) {
			strValue = this._number.toLocaleString(
				lastlocaleValue, // leave undefined to use the browser's locale, or use a string like 'en-US' to override it.
				{ minimumFractionDigits: 0, maximumFractionDigits: 10 }
			);
		} else {
			strValue = this._number.toString();
		}

		let totalWidth = 0;

		if (this._sign !== '') {
			let signToShow = (this._sign === '*') ? '×' : this._sign;
			signToShow = (signToShow === '/') ? '÷' : signToShow;
			this.allElements[iElement].text = signToShow;
			let elementWidth = CELL_WIDTH * this.allElements[iElement]._scaleRatio;
			this.allElements[iElement].x = totalWidth + elementWidth * COMMON_NUMBERS.DIV_2;
			this.allElements[iElement].y = 0;
			totalWidth += elementWidth;
			iElement++;
		}

		let digitSpace = 0;
		for (let i = 0; i < strValue.length; i++) {
			let char = strValue[i];

			this.allElements[iElement].text = char;
			let elementWidth = (char === '.' || char === ',') ? CELL_WIDTH * COMMON_NUMBERS.DIV_2 * this.allElements[iElement]._scaleRatio : CELL_WIDTH * this.allElements[iElement]._scaleRatio;
			this.allElements[iElement].x = totalWidth + elementWidth * COMMON_NUMBERS.DIV_2;
			this.allElements[iElement].y = 0;

			if (char === this.getDecimalSeparator()) {
				digitSpace = totalWidth;
			}

			totalWidth += elementWidth;

			if (char !== '.' && char !== ',') {
				this.digits.push(this.allElements[iElement]);
			}
			iElement++;
		}

		digitSpace = (digitSpace === COMMON_NUMBERS.ZERO) ? totalWidth : digitSpace;

		for (let i = 0; i < this.allElements.length; i++) {
			let element = this.allElements[i];
			element.x -= digitSpace;
		}
	}

	addLeftZeros (numZeros) {
		let wasZero = false;
		if (this._number === COMMON_NUMBERS.ZERO) {
			this._number = COMMON_NUMBERS.ONE;
			wasZero = true;
		}
		let strNumber = this._number.toString();
		let multiplier = Math.pow(COMMON_NUMBERS.TEN, numZeros);
		let tempValue = this._number * multiplier;
		this.Value = tempValue;
		this._number = this._number / multiplier;
		for (let i = 0; i < this.digits.length; i++) {
			let currDigit = this.digits[i];
			if (currDigit.text !== '.' || currDigit.text !== ',' || currDigit.text !== '0') {
				currDigit.text = '0';
			}
		}

		let added = 0;
		for (let i = this.digits.length - COMMON_NUMBERS.ONE; i >= COMMON_NUMBERS.ZERO; i--) {
			let currDigit = this.digits[i];
			if ((currDigit.text !== '.' || currDigit.text !== ',') && added < strNumber.length) {
				if (wasZero) {
					currDigit.text = '0';
				} else {
					currDigit.text = strNumber[strNumber.length - COMMON_NUMBERS.ONE - added];
				}
				added++;
			}
		}
	}

	get style () {
		return this._style;
	}

	set style (newStyle) {
		this._style = newStyle;
		for (let i = 0; i < this.allElements.length; i++) {
			let element = this.allElements[i];
			element.style = this._style;
		}
	}

	reset () {
		for (let i = 0; i < this.allElements.length; i++) {
			let element = this.allElements[i];
			this.addChild(element);
			element.y = 0;
		}
	}

	destroy (options) {
		this.eventEmitter.removeListener(this.mindEvents.EVENT_LOCALE_CHANGED, this._onLocaleChanged, this);
		this.eventEmitter.removeListener(this.mindEvents.EVENT_FONTSIZE_CHANGED, this._onFontSizeChanged, this);

		if (this.allElements) {
			for (let i = 0; i < this.allElements.length; i++) {
				this.allElements[i] = undefined;
			}
			this.allElements = undefined;
		}
		this.digits = undefined;
		super.destroy(options);
	}

	getDecimalSeparator () {
		var n = 1.1;
		let POS_START = 1;
		let POS_END = 2;
		n = n.toLocaleString(lastlocaleValue).substring(POS_START, POS_END);
		return n;
	}

	getStrValue () {
		let strValue = '';
		if (this._useSeparators) {
			strValue = this._number.toLocaleString(
				lastlocaleValue, // leave undefined to use the browser's locale, or use a string like 'en-US' to override it.
				{ minimumFractionDigits: 0, maximumFractionDigits: 10 }
			);
		} else {
			strValue = this._number.toString();
		}
		return strValue;
	}

	_onLocaleChanged (data) {
		lastlocaleValue = data.locale;
		this.Value = this._number;
	}

	_onFontSizeChanged (event) {
		// console.log(event);
		this.Value = this._number;
	}
}
