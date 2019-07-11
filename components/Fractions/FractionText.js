import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
// import { MathUtils } from './MathUtils';
import { TextUtils } from './TextUtils';
import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';

const ENGLISH = 'en-US';
const SPANISH = 'es';
const PORTUGUESE = 'pt';
let currentLocale = ENGLISH;

export const OPERATION_TYPES = {
	MULT: 'mult',
	DIV: 'div'
};

const SIGN = {
	POSITIVE: 'positive',
	NEGATIVE: 'negative'
};

export const REPRESENTATION = {
	FRACTION: {
		id: 'fraction',
		lines: 2 // need two lines for representation
	},
	DECIMAL: {
		id: 'decimal',
		lines: 1 // need two lines for representation
	}
};

const SIGN_SIZE_FACTOR = 1.3;
// const SIGN_WIDTH = 15;
const SIGN_LINE_SPACING = 3;
const MINUS_SIGN_LINE_WIDTH = 2.5;

// numeric constants
const ZERO = 0;
const ONE = 1;
const TWO = 2;

// corrections
const OPERATION_SIGN_Y_CORRECTION_FACTOR = 0.06; // since font set has no the character centered, this is needed for solve some artifacts in y positionation

export class FractionText extends MindPixiContainer {
	constructor (num, denom, usePercent, mindObjectOptions) {
		super(mindObjectOptions);

		const USE_DEBUG = true;
		if (USE_DEBUG) {
			this.dbgGraphic = new MindPixiGraphics();
			this.addChild(this.dbgGraphic);
		}

		this.isAnimationFeedbackStarted = false;

		this.currentColor = 0x000000;
		this.usePercent = usePercent;
		this.currentOperation = OPERATION_TYPES.MULTIPLICATION;
		this.currentSign = SIGN.POSITIVE; // the sign is defined when user user numerator and dneominator property
		this.currentRepresentation = REPRESENTATION.FRACTION;

		this._absNumerator = Math.abs(num); // numerator absolute value
		this._absDenominator = Math.abs(denom); // denominator absolute value
		this._numerator = num; // denominator conserving sign magnitude
		this._denominator = denom; // numerator conserving sign magnitude

		this._style = this.arena.theme.getStyles('fractionText');
		let fontSize = this._style.fontSize;

		this._numeratorText = new MindPixiText(num.toString(), { fontSize: fontSize });
		this._numeratorText.anchor.x = this._numeratorText.anchor.y = 0.5;

		this._denominatorText = new MindPixiText(denom.toString(), { fontSize: fontSize });
		this._denominatorText.anchor.x = this._denominatorText.anchor.y = 0.5;

		let ADDITIONAL_FONT_SIZE_FACTOR = this._style.additionalFontSizeFactorForOperationSigns;
		this._operationSign = TextUtils.genOperationLabel('*', { fontSize: fontSize * ADDITIONAL_FONT_SIZE_FACTOR });

		this._magnitudeSign = new MindPixiGraphics();
		this._magnitudeSign.y = 1;

		this._line = new MindPixiGraphics();
		this._line.y = 1;

		this._characterReference = new MindPixiText('8', { fontSize: fontSize });
		this._characterReference.anchor.x = this._characterReference.anchor.y = 0.5;

		this._displayableObjects = [];

		this.addChild(this._numeratorText); this._displayableObjects.push(this._numeratorText);
		this.addChild(this._denominatorText); this._displayableObjects.push(this._denominatorText);
		this.addChild(this._operationSign); this._displayableObjects.push(this._operationSign);
		this.addChild(this._line); this._displayableObjects.push(this._line);
		this.addChild(this._magnitudeSign); this._displayableObjects.push(this._magnitudeSign);

		/**
		* Usually the fractions could be represented as a porcentage
		*/

		if (this.usePercent) {
			// let value = (this._absNumerator / this._absDenominator) * 100;
			// if (value % 1 > 0) {
			// 	let percObj = MathUtils.getRepeatingDecimal(this._absNumerator * 100, this._absDenominator);

			// 	let strToShow = percObj.integerPart + '.';
			// 	if (percObj.repeat) {
			// 		if (percObj.nonRepeatingPart.length > 0) {
			// 			strToShow += percObj.nonRepeatingPart[0];
			// 			this._line.clear();
			// 			this._numeratorText.text = strToShow + '%';
			// 		} else {
			// 			this._numeratorText.text = strToShow;
			// 			let posX = this._numeratorText.x + this._numeratorText.textMeasurements.width;

			// 			this._numeratorText.text = percObj.repeatingPart;
			// 			let len = this._numeratorText.textMeasurements.width;

			// 			strToShow += percObj.repeatingPart;
			// 			this._numeratorText.text = strToShow + '%';

			// 			this._line.clear();
			// 			this._line.lineStyle(1, 0x000000, 1);
			// 			this._line.moveTo(0, 0);
			// 			this._line.lineTo(len, 0);
			// 			this.addChild(this._line);
			// 			this._line.x = posX;
			// 		}
			// 	} else {
			// 		this._line.clear();
			// 		this._numeratorText.text = value.toFixed(1).toString() + '%';
			// 	}
			// } else {
			// 	this._line.clear();
			// 	this._numeratorText.text = value.toFixed(0).toString() + '%';
			// }
			// this._denominatorText.text = '';
		} else {
			// is the denominator or numerator wider?
			let maxWidth = Math.max(this._numeratorText.textMeasurements.width, this._denominatorText.textMeasurements.width);

			// draw line from max width
			this._line.lineStyle(ONE, ZERO, ONE);
			this._line.moveTo(-maxWidth / TWO, ZERO);
			this._line.lineTo(maxWidth / TWO, ZERO);

			// set text label positions
			this._numeratorText.y = -this._numeratorText.height / TWO;
			this._denominatorText.y = this._numeratorText.height / TWO;

			// set operation sign position
			this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
			this._operationSign.x = maxWidth / TWO + this._operationSign.width / TWO;

			this._updateOriginalPositions();
			this._setXPosition(ZERO);
		}

		// debug button content
		// const USE_DEBUG = false;
		if (USE_DEBUG) {
			// // debug origin coordinates
			// let gOrigin = new MindPixiGraphics();
			// gOrigin.lineStyle(1, 0, 1);
			// gOrigin.beginFill(0xcc0000, 0.3);
			// gOrigin.drawRect(0, 0, 5, 5);
			// this.addChild(gOrigin);
		}

		this.eventEmitter.on(this.mindEvents.EVENT_FONTSIZE_CHANGED, this._onFontSizeChange, this);
		this.eventEmitter.on(this.mindEvents.EVENT_LOCALE_CHANGED, this._onLocaleChange, this);
	}

	_updateOriginalPositions () {
		// store original positions
		this._line.originalPos = { x: this._line.x, y: this._line.y };
		this._magnitudeSign.originalPos = { x: this._magnitudeSign.x, y: this._magnitudeSign.y };
		this._numeratorText.originalPos = { x: this._numeratorText.x, y: this._numeratorText.y };
		this._denominatorText.originalPos = { x: this._denominatorText.x, y: this._denominatorText.y };
		this._operationSign.originalPos = { x: this._operationSign.x, y: this._operationSign.y };
	}

	set operation (val) {
		if (!OPERATION_TYPES[val.toUpperCase()]) {
			this.currentOperation = OPERATION_TYPES.MULTIPLICATION;
			this._operationSign.text = TextUtils.unicodeMultiplication();
			console.warn('Undefined operation type, setting multiplication as default');
		}
		this.currentOperation = OPERATION_TYPES[val.toUpperCase()];
		if (this.currentOperation === OPERATION_TYPES.MULT) {
			this._operationSign.text = TextUtils.unicodeMultiplication(); // unicode multiplication character
		} else if (this.currentOperation === OPERATION_TYPES.DIV) {
			this._operationSign.text = TextUtils.unicodeDivision(); // unicode division character
		}
	}

	get operation () {
		return this.currentOperation;
	}

	set representation (val) {
		if (val === undefined) throw new Error('Representation is undefined');
		let userEspecified = val.toUpperCase();
		this.currentRepresentation = REPRESENTATION[userEspecified];
		// this.buttonContent.operation = val;
	}

	get representation () {
		return this.currentRepresentation.id;
		// return this.buttonContent.representation;
	}

	get sign () {
		return this.currentSign;
	}

	get colliderWidth () {
		// is the denominator or numerator the widest?
		let maxWidth = Math.max(this._numeratorText.width, this._denominatorText.width);
		if (this.currentRepresentation.id === REPRESENTATION.DECIMAL.id) {
			maxWidth = this._numeratorText.width;
		} else if (this.currentRepresentation.id === REPRESENTATION.FRACTION.id) {
			maxWidth = Math.max(this._numeratorText.width, this._denominatorText.width);
		}

		// current expression is negative?
		let signMagnitudeWidth = this.currentSign === SIGN.NEGATIVE ? this._magnitudeSign.width + SIGN_LINE_SPACING : ZERO;
		// let signMagnitudeWidth = 0;
		return maxWidth + this._operationSign.width + signMagnitudeWidth;
	}

	get numeratorTextLabel () {
		return this._numeratorText;
	}

	get denominatorTextLabel () {
		return this._denominatorText;
	}

	_setXPosition (x) {
		let initialWidth = 0; // width of initial element
		if (this.currentOperation === OPERATION_TYPES.MULT) { // when mult. initial objects is the fraction
			if (this.currentSign === SIGN.POSITIVE) initialWidth = Math.max(this._numeratorText.width, this._denominatorText.width);
			else if (this.currentSign === SIGN.NEGATIVE) initialWidth = this._magnitudeSign.width;
		} else if (this.currentOperation === OPERATION_TYPES.DIV) {
			initialWidth = this._operationSign.width;
		}

		// center all displayable objects (without moving container space coordinates)
		for (let i = 0; i < this._displayableObjects.length; i++) {
			this._displayableObjects[i].x = this._displayableObjects[i].originalPos.x + initialWidth / TWO - this.colliderWidth / TWO + x;
		}
	}

	get numerator () {
		return this.getNumerator();
	}

	// chrome debugger can trace easily class
	getNumerator () {
		return this._numerator;
	}

	set numerator (value) {
		this.setNumerator(value);
	}

	setNumerator (value) {
		this._absNumerator = Math.abs(value);
		this._numerator = value;

		// current fraction is positive or negative?
		this.currentSign = (this._numerator * this._denominator >= ZERO) ? SIGN.POSITIVE : SIGN.NEGATIVE;

		if (this.usePercent) {
		} else {
			this._numeratorText.text = this._absNumerator.toString();

			// is the denominator or numerator wider?
			let maxWidth = Math.max(this._numeratorText.textMeasurements.width, this._denominatorText.textMeasurements.width);

			// redraw line from max width
			this._line.clear();
			this._line.lineStyle(ONE, ZERO, ONE);
			this._line.moveTo(-maxWidth / TWO, ZERO);
			this._line.lineTo(maxWidth / TWO, ZERO);

			if (this.currentOperation === OPERATION_TYPES.MULT) {
				// update line position
				this._line.x = 0;
				this._line.y = 1;

				// update text label positions
				this._numeratorText.y = -this._numeratorText.height / TWO;
				this._denominatorText.y = this._numeratorText.height / TWO;
				this._numeratorText.x = 0;
				this._denominatorText.x = 0;

				// set operation sign position
				this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
				this._operationSign.x = maxWidth / TWO + this._operationSign.width / TWO;
			}

			// center all expression
			this._updateOriginalPositions();
			this._setXPosition(ZERO);
		}
	}

	get denominator () {
		return this.getDenominator();
	}

	getDenominator () {
		return this._denominator;
	}

	set denominator (value) {
		this.setDenominator(value);
	}

	setDenominator (value) {
		this._style = this.arena.theme.getStyles('fractionText'); // load style always
		let shouldUseCustomFontSize = this._style.customFontSize !== -ONE;
		this._absDenominator = Math.abs(value);
		this._denominator = value;

		// current fraction is positive or negative?
		this.currentSign = (this._numerator * this._denominator >= ZERO) ? SIGN.POSITIVE : SIGN.NEGATIVE;

		if (this.usePercent) {
		} else if (this.currentRepresentation.id === REPRESENTATION.FRACTION.id) {
			// set default font size
			let fontSize = shouldUseCustomFontSize ? this._style.customFontSize : this._style.fontSize;
			// set font color
			let fontColor = this.currentColor;
			this._numeratorText.style = { fontSize: fontSize, fill: fontColor };
			this._denominatorText.style = { fontSize: fontSize, fill: fontColor };
			// operation sign color
			let ADDITIONAL_FONT_SIZE_FACTOR = this._style.additionalFontSizeFactorForOperationSigns;
			this._operationSign.style = { fontSize: fontSize * ADDITIONAL_FONT_SIZE_FACTOR, fill: fontColor };
			this._characterReference.style = { fontSize: fontSize };

			// set denominator text
			this._denominatorText.text = this._absDenominator.toString();

			// is the denominator or numerator wider?
			// let maxWidth = Math.max(this._numeratorText.width, this._denominatorText.width);
			let maxWidth = Math.max(this._numeratorText.textMeasurements.width, this._denominatorText.textMeasurements.width);

			// redraw line from max width
			this._line.clear();
			this._line.lineStyle(ONE, this.currentColor, ONE);
			this._line.moveTo(-maxWidth / TWO, ZERO);
			this._line.lineTo(maxWidth / TWO, ZERO);

			// make visible objects that become invisible during decimal representation
			this._denominatorText.alpha = 1;
			this._line.alpha = 1;

			let signWidth = this._characterReference.width * SIGN_SIZE_FACTOR;
			// draw magnitude sign
			if (this.currentSign === SIGN.POSITIVE) {
				this._magnitudeSign.clear(); // if currently the fraction is positive then clear sign graphicc
			} else if (this.currentSign === SIGN.NEGATIVE) {
				const DBG_SIGN_COLOR = this.currentColor;
				this._magnitudeSign.clear();
				this._magnitudeSign.lineStyle(MINUS_SIGN_LINE_WIDTH, DBG_SIGN_COLOR, ONE);
				this._magnitudeSign.moveTo(-signWidth / TWO, ZERO);
				this._magnitudeSign.lineTo(signWidth / TWO, ZERO);
			}

			if (this.currentOperation === OPERATION_TYPES.MULT) { // fraction comes first
				if (this.currentSign === SIGN.NEGATIVE) { // actually the fraction has negative magnitude...
					// update line position
					this._line.x = this._magnitudeSign.width / TWO + maxWidth / TWO + SIGN_LINE_SPACING;
					this._line.y = 1;

					// update text label positions
					this._numeratorText.y = -this._numeratorText.height / TWO;
					this._denominatorText.y = this._numeratorText.height / TWO;
					this._numeratorText.x = this._magnitudeSign.width / TWO + maxWidth / TWO + SIGN_LINE_SPACING;
					this._denominatorText.x = this._magnitudeSign.width / TWO + maxWidth / TWO + SIGN_LINE_SPACING;

					// update sign position
					this._magnitudeSign.x = 0; // -maxWidth / 2 - this._magnitudeSign.width / 2 - SIGN_LINE_SPACING;

					// set operation sign position
					this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
					this._operationSign.x = this._magnitudeSign.width / TWO + SIGN_LINE_SPACING + maxWidth + this._operationSign.width / TWO; // maxWidth / TWO + this._operationSign.width / TWO + this._magnitudeSign.width / TWO + SIGN_LINE_SPACING;
				} else if (this.currentSign === SIGN.POSITIVE) { // actually the fraction has positive magnitude...
					// update line position
					this._line.x = 0;
					this._line.y = 1;

					// update text label positions
					this._numeratorText.y = -this._numeratorText.height / TWO;
					this._denominatorText.y = this._numeratorText.height / TWO;
					this._numeratorText.x = 0;
					this._denominatorText.x = 0;

					// update sign position
					this._magnitudeSign.x = 0; // -maxWidth / 2 - this._magnitudeSign.width / 2 - SIGN_LINE_SPACING;

					// set operation sign position
					this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
					this._operationSign.x = maxWidth / TWO + this._operationSign.width / TWO;
				}
			} else if (this.currentOperation === OPERATION_TYPES.DIV) { // division character comes first
				if (this.currentSign === SIGN.NEGATIVE) {
					// update text label positions
					this._numeratorText.y = -this._numeratorText.height / TWO;
					this._denominatorText.y = this._numeratorText.height / TWO;
					this._numeratorText.x = maxWidth / TWO + this._operationSign.width / TWO + this._magnitudeSign.width + SIGN_LINE_SPACING;
					this._denominatorText.x = maxWidth / TWO + this._operationSign.width / TWO + this._magnitudeSign.width + SIGN_LINE_SPACING;

					// update line position
					this._line.x = maxWidth / TWO + this._operationSign.width / TWO + this._magnitudeSign.width + SIGN_LINE_SPACING;
					this._line.y = 1;

					// update sign position
					this._magnitudeSign.x = this._operationSign.width / TWO + this._magnitudeSign.width / TWO; // -maxWidth / 2 - this._magnitudeSign.width / 2 - SIGN_LINE_SPACING;

					// set operation sign position
					this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
					this._operationSign.x = 0; // maxWidth / 2 + this._operationSign.width / 2;
				} else if (this.currentSign === SIGN.POSITIVE) {
					// update text label positions
					this._numeratorText.y = -this._numeratorText.height / TWO;
					this._denominatorText.y = this._numeratorText.height / TWO;
					// this._numeratorText.x = this._denominatorText.width / 2 + this._operationSign.width / 2;
					// this._denominatorText.x = this._denominatorText.width / 2 + this._operationSign.width / 2;
					this._numeratorText.x = maxWidth / TWO + this._operationSign.width / TWO;
					this._denominatorText.x = maxWidth / TWO + this._operationSign.width / TWO;

					// update line position
					this._line.x = maxWidth / TWO + this._operationSign.width / TWO;
					this._line.y = 1;

					// set operation sign position
					this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
					this._operationSign.x = 0; // maxWidth / 2 + this._operationSign.width / 2;
				}
			}

			// center all expression
			this._updateOriginalPositions();
			this._setXPosition(ZERO);
		} else if (this.currentRepresentation.id === REPRESENTATION.DECIMAL.id) {
			let decimalValue = this._absNumerator / this._absDenominator;
			decimalValue = Number.parseFloat(decimalValue.toFixed(TWO));

			// set denominator text
			this._denominatorText.text = this._absDenominator.toString();

			// make the font size bigger when fraction is in decimal mode
			const FONT_SIZE_SCALE_FACTOR = 1.5;
			let fontSize = shouldUseCustomFontSize ? this._style.customFontSize : this._style.fontSize;
			let fontColor = this.currentColor;
			this._numeratorText.style = { fontSize: fontSize * FONT_SIZE_SCALE_FACTOR, fill: fontColor };

			// operation sign color
			let ADDITIONAL_FONT_SIZE_FACTOR = this._style.additionalFontSizeFactorForOperationSigns;
			this._operationSign.style = { fontSize: fontSize * ADDITIONAL_FONT_SIZE_FACTOR, fill: fontColor };
			this._characterReference.style = { fontSize: fontSize };

			this._numeratorText.text = decimalValue;

			// cehck current locale
			if (currentLocale === ENGLISH) {
				this._numeratorText.text = this._numeratorText.text.replace(',', '.');
			} else if (currentLocale === SPANISH || currentLocale === PORTUGUESE) {
				this._numeratorText.text = this._numeratorText.text.replace('.', ',');
			}

			this._magnitudeSign.x = 0;
			this._denominatorText.x = this._denominatorText.y = this._denominatorText.alpha = 0;
			this._numeratorText.x = this._numeratorText.y = 0;
			this._line.x = this._line.y = this._line.alpha = 0;
			this._operationSign.x = this._operationSign.y = 0;

			let maxWidth = this._numeratorText.width;

			let signWidth = this._characterReference.width * SIGN_SIZE_FACTOR;
			// draw magnitude sign
			if (this.currentSign === SIGN.POSITIVE) {
				this._magnitudeSign.clear(); // if currently the fraction is positive then clear sign graphicc
			} else if (this.currentSign === SIGN.NEGATIVE) {
				const DBG_SIGN_COLOR = this.currentColor;
				this._magnitudeSign.clear();
				this._magnitudeSign.lineStyle(MINUS_SIGN_LINE_WIDTH, DBG_SIGN_COLOR, ONE);
				this._magnitudeSign.moveTo(-signWidth / TWO, ZERO);
				this._magnitudeSign.lineTo(signWidth / TWO, ZERO);
			}

			if (this.currentOperation === OPERATION_TYPES.MULT) { // fraction comes first
				if (this.currentSign === SIGN.NEGATIVE) { // actually the fraction has negative magnitude...
					// // update line position
					// this._line.x = this._magnitudeSign.width / TWO + maxWidth / TWO + SIGN_LINE_SPACING;
					// this._line.y = 1;

					// update text label positions
					// this._numeratorText.y = -this._numeratorText.height / TWO;
					// this._denominatorText.y = this._numeratorText.height / TWO;
					this._numeratorText.x = this._magnitudeSign.width / TWO + maxWidth / TWO + SIGN_LINE_SPACING;
					// this._denominatorText.x = this._magnitudeSign.width / TWO + maxWidth / TWO + SIGN_LINE_SPACING;

					// update sign position
					this._magnitudeSign.x = 0; // -maxWidth / 2 - this._magnitudeSign.width / 2 - SIGN_LINE_SPACING;

					// set operation sign position
					this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
					this._operationSign.x = this._magnitudeSign.width / TWO + SIGN_LINE_SPACING + maxWidth + this._operationSign.width / TWO; // maxWidth / TWO + this._operationSign.width / TWO + this._magnitudeSign.width / TWO + SIGN_LINE_SPACING;
				} else if (this.currentSign === SIGN.POSITIVE) { // actually the fraction has positive magnitude...
					// // update line position
					// this._line.x = 0;
					// this._line.y = 1;

					// update text label positions
					// this._numeratorText.y = -this._numeratorText.height / TWO;
					// this._denominatorText.y = this._numeratorText.height / TWO;
					this._numeratorText.x = 0;
					// this._denominatorText.x = 0;

					// update sign position
					this._magnitudeSign.x = 0; // -maxWidth / 2 - this._magnitudeSign.width / 2 - SIGN_LINE_SPACING;

					// set operation sign position
					this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
					this._operationSign.x = maxWidth / TWO + this._operationSign.width / TWO;
				}
			} else if (this.currentOperation === OPERATION_TYPES.DIV) { // division character comes first
				if (this.currentSign === SIGN.NEGATIVE) {
					// update sign position
					this._magnitudeSign.x = this._operationSign.width / TWO + this._magnitudeSign.width / TWO; // -maxWidth / 2 - this._magnitudeSign.width / 2 - SIGN_LINE_SPACING;

					// update text label positions
					this._numeratorText.x = this._magnitudeSign.x + this._magnitudeSign.width / TWO + this._numeratorText.width / TWO + SIGN_LINE_SPACING;

					// set operation sign position
					this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
					this._operationSign.x = 0; // maxWidth / 2 + this._operationSign.width / 2;
				} else if (this.currentSign === SIGN.POSITIVE) {
					this._numeratorText.x = maxWidth / TWO + this._operationSign.width / TWO;

					// set operation sign position
					this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
					this._operationSign.x = 0; // maxWidth / 2 + this._operationSign.width / 2;
				}
			}

			// center all expression
			this._updateOriginalPositions();
			this._setXPosition(ZERO);
		}

		// debug button content
		const USE_DEBUG = false;
		if (USE_DEBUG) {
			// >>>>> draw origin point
			let gOrigin = this.dbgGraphic; // new MindPixiGraphics();
			gOrigin.clear();
			const ALPHA = 0.3;
			const ORIGIN_COLOR = 0xcc0000;
			const FIVE = 5;
			gOrigin.lineStyle(ONE, ZERO, ONE);
			gOrigin.beginFill(ORIGIN_COLOR, ALPHA);
			gOrigin.drawRect(ZERO, ZERO, FIVE, FIVE);

			// >>>>>  draw operation text bounding box
			// gOrigin.lineStyle(magic('1'), magic('0'), magic('1'));
			// gOrigin.beginFill(magic('0x0000cc'), magic('0.3'));
			// gOrigin.drawRect(this._operationSign.x - this._operationSign.width / TWO, this._operationSign.y - this._operationSign.height / TWO, this._operationSign.width, this._operationSign.height);

			// >>>>> draw bounding box
			gOrigin.lineStyle(ONE, ZERO, ONE);
			const POSITIVE_COLOR = 0x00cc00;
			const NEGATIVE_COLOR = 0xcc0000;
			if (this.currentSign === SIGN.POSITIVE) gOrigin.beginFill(POSITIVE_COLOR, ALPHA);
			else if (this.currentSign === SIGN.NEGATIVE) gOrigin.beginFill(NEGATIVE_COLOR, ALPHA);
			gOrigin.drawRect(-this.colliderWidth / TWO, -this.height / TWO, this.colliderWidth, this.height);

			// >>>>>  draw denominator bounding box
			// const RED = 0xcc0000;
			// let gDenominator = gOrigin; // new MindPixiGraphics();
			// gDenominator.lineStyle(ONE, ZERO, ALPHA);
			// gDenominator.beginFill(RED, ALPHA);
			// let textX = this._denominatorText.x;
			// let textY = this._denominatorText.y;
			// let textWidth = this._denominatorText.width;
			// let textHeight = this._denominatorText.height;
			// gDenominator.drawRect(textX - textWidth / TWO, textY - textHeight / TWO, textWidth, textHeight);

			// >>>>>  draw numerator bounding box
			// const BLUE = 0x0000cc;
			// gDenominator.lineStyle(ONE, ZERO, ALPHA);
			// gDenominator.beginFill(BLUE, ALPHA);
			// textX = this._numeratorText.x;
			// textY = this._numeratorText.y;
			// textWidth = this._numeratorText.width;
			// textHeight = this._numeratorText.height;
			// gDenominator.drawRect(textX - textWidth / TWO, textY - textHeight / TWO, textWidth, textHeight);
		}
	}

	set fillColor (color) {
		this.currentColor = color;
		// redraw the expression
		this.operation = this.operation;
		this.representation = this.representation;
		this.numerator = this.numerator;
		this.denominator = this.denominator;
	}

	get fillColor () {
		return this.currentColor;
	}

	_calculateLineWidth () {
		// 25 -> SIGN_SIZE_LINE_WIDTH
		// fontSize -> X
		const DEFAULT_FONT_SIZE = 25;
		const SIGN_SIZE_LINE_WIDTH = 2;
		return SIGN_SIZE_LINE_WIDTH * this.fontSize / DEFAULT_FONT_SIZE;
	}

	_onFontSizeChange (event) {}

	_onLocaleChange (event) {
		// if (this.currentRepresentation !== REPRESENTATION.DECIMAL) return;
		currentLocale = event.locale;
		if (currentLocale === ENGLISH) {
			this.numeratorTextLabel.text = this.numeratorTextLabel.text.replace(',', '.');
		} else if (currentLocale === SPANISH || currentLocale === PORTUGUESE) {
			this.numeratorTextLabel.text = this.numeratorTextLabel.text.replace('.', ',');
		}
	}

	destroy (options) {
		this.eventEmitter.removeListener(this.mindEvents.EVENT_FONTSIZE_CHANGED, this._onFontSizeChange, this);
		this.eventEmitter.removeListener(this.mindEvents.EVENT_LOCALE_CHANGED, this._onLocaleChange, this);

		this._numeratorText.destroy(options);
		this._denominatorText.destroy(options);
	}
}