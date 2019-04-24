import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
// import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { MindTextureManager } from 'mind-sdk/MindTextureManager';
import { MathUtils } from './MathUtils';
import { TextUtils } from './TextUtils';
import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';

const ENGLISH = 'en-US';
const SPANISH = 'es';
const PORTUGUESE = 'pt';
let currentLocale = ENGLISH;

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

// const SIGN_WIDTH = 15;
const SIGN_SIZE_FACTOR = 0.75;
const SIGN_LINE_SPACING = 3;

// numeric constants
const ZERO = 0;
const ONE = 1;
const TWO = 2;

// corrections
const OPERATION_SIGN_Y_CORRECTION_FACTOR = 0.06; // since font set has no the character centered, this is needed for solve some artifacts in y positionation
const FRACTION_LINE_CORRECTION = 0.15; // displaces the fraction line 4 (/) 5

export class SimpleFractionText extends MindPixiContainer {
	constructor (num, denom, shouldDrawWhite, mindObjectOptions) {
		super(mindObjectOptions);

		const USE_DEBUG = true;
		if (USE_DEBUG) {
			this.dbgGraphic = new MindPixiGraphics();
			this.addChild(this.dbgGraphic);
		}

		this.isFirstOnFontSizeInvocation = true;

		// graphics for calculate the bounding box of current expression
		this.bbGraphic = new MindPixiGraphics();
		this.addChild(this.dbgGraphic);
		this.shouldDrawWhite = shouldDrawWhite;

		this.usePercent = false; // usePercent;
		// this.currentOperation = OPERATION_TYPES.MULTIPLICATION;
		this.currentSign = SIGN.POSITIVE; // the sign is defined when user user numerator and dneominator property
		this.currentRepresentation = REPRESENTATION.FRACTION;

		this._absNumerator = Math.abs(num); // numerator absolute value
		this._absDenominator = Math.abs(denom); // denominator absolute value
		this._numerator = num; // denominator conserving sign magnitude
		this._denominator = denom; // numerator conserving sign magnitude

		this._style = this.arena.theme.getStyles('fractionText');
		let fontSize = shouldDrawWhite ? this._style.tooltipFontSize : this._style.fontSize;
		this.finalFontSize = fontSize; // store last defined font size

		this._numeratorText = new MindPixiText(num.toString(), { fontSize: fontSize });
		this._numeratorText.anchor.x = this._numeratorText.anchor.y = 0.5;

		this._denominatorText = new MindPixiText(denom.toString(), { fontSize: fontSize });
		this._denominatorText.anchor.x = this._denominatorText.anchor.y = 0.5;

		let ADDITIONAL_FONT_SIZE_FACTOR = this._style.additionalFontSizeFactorForOperationSigns;
		this._operationSign = TextUtils.genOperationLabel('*', { fontSize: fontSize * ADDITIONAL_FONT_SIZE_FACTOR });

		this._magnitudeSign = new MindPixiGraphics();
		this._magnitudeSign.y = 1;

		this._line = new MindPixiGraphics();
		this._line.y = FRACTION_LINE_CORRECTION;

		this._periodBar = new MindPixiGraphics();
		this._periodBar.x = this._periodBar.y = 0;

		this._characterReference = new MindPixiText('8', { fontSize: fontSize });
		this._characterReference.alpha = 0;
		this._characterReference.anchor.x = this._characterReference.anchor.y = 0.5;

		this._displayableObjects = [];

		this.addChild(this._numeratorText); this._displayableObjects.push(this._numeratorText);
		this.addChild(this._denominatorText); this._displayableObjects.push(this._denominatorText);
		// this.addChild(this._operationSign); this._displayableObjects.push(this._operationSign);
		this.addChild(this._line); this._displayableObjects.push(this._line);
		this.addChild(this._magnitudeSign); this._displayableObjects.push(this._magnitudeSign);
		this.addChild(this._periodBar); this._displayableObjects.push(this._periodBar);
		// this.addChild(this._characterReference); this._displayableObjects.push(this._characterReference);

		// // is the denominator or numerator wider?
		// let maxWidth = Math.max(this._numeratorText.textMeasurements.width, this._denominatorText.textMeasurements.width);

		// // draw line from max width
		// this._line.lineStyle(ONE, ZERO, ONE);
		// this._line.moveTo(-maxWidth / TWO, ZERO);
		// this._line.lineTo(maxWidth / TWO, ZERO);

		// set text label positions
		this._numeratorText.y = -this._numeratorText.height / TWO;
		this._denominatorText.y = this._numeratorText.height / TWO;

		// set operation sign position
		// this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
		// this._operationSign.x = maxWidth / TWO + this._operationSign.width / TWO;

		this._updateOriginalPositions();
		this._setXPosition(ZERO);

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
		this._periodBar.originalPos = { x: this._periodBar.x, y: this._periodBar.y };
		// this._characterReference.originalPos = { x: this._characterReference.x, y: this._characterReference.y };
		// this._operationSign.originalPos = { x: this._operationSign.x, y: this._operationSign.y };
	}

	set representation (val) {
		if (val !== REPRESENTATION.DECIMAL.id && val !== REPRESENTATION.FRACTION.id) throw new Error(`The representation '${val}' is not a valid representation type for SimpleFractionText`);
		let userEspecified = val.toUpperCase();
		this.currentRepresentation = REPRESENTATION[userEspecified];
		// this.buttonContent.operation = val;
	}

	get representation () {
		return this.currentRepresentation.id;
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
		return maxWidth + signMagnitudeWidth;
	}

	get colliderHeight () {
		if (this.currentRepresentation.id === REPRESENTATION.DECIMAL.id) {
			return this.numeratorTextLabel.height;
		} else if (this.currentRepresentation.id === REPRESENTATION.FRACTION.id) {
			let nY = this.numeratorTextLabel.y;
			let nH = this.numeratorTextLabel.height;
			let dY = this.denominatorTextLabel.y;
			let dH = this.denominatorTextLabel.height;
			let topMostPoint = nY - nH / TWO;
			let bottomMostPoint = dY + dH / TWO;
			return Math.abs(bottomMostPoint - topMostPoint);
		}
	}

	get numeratorTextLabel () {
		return this._numeratorText;
	}

	get denominatorTextLabel () {
		return this._denominatorText;
	}

	_setXPosition (x) {
		let initialWidth = 0; // width of initial element
		if (this.currentSign === SIGN.POSITIVE) initialWidth = Math.max(this._numeratorText.width, this._denominatorText.width);
		else if (this.currentSign === SIGN.NEGATIVE) initialWidth = this._magnitudeSign.width;

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
			// not implemented...
			// let percentVal = (this._absNumerator / this._absDenominator) * 100;
			// if (percentVal % 1 > 0) {
			// 	let percObj = MathUtils.getRepeatingDecimal(this._absNumerator * 100, this._absDenominator);

			// 	let strToShow = percObj.integerPart + '.';
			// 	if (percObj.repeat) {
			// 		if (percObj.nonRepeatingPart.length > 0) {
			// 			strToShow += percObj.nonRepeatingPart[0];
			// 			this._line.clear();
			// 		} else {
			// 			this._numeratorText.text = strToShow;
			// 			let posX = this._numeratorText.x + this._numeratorText.width;

			// 			this._numeratorText.text = percObj.repeatingPart;
			// 			let len = this._numeratorText.width;

			// 			strToShow += percObj.repeatingPart;

			// 			this._line.clear();
			// 			this._line.lineStyle(1, 0x0000ff, 1);
			// 			this._line.moveTo(0, 0);
			// 			this._line.lineTo(len, 0);
			// 			this.addChild(this._line);
			// 			this._line.x = posX;
			// 			this._line.y = this._line.height;
			// 		}
			// 		this._numeratorText.text = strToShow + '%';
			// 	} else {
			// 		this._line.clear();
			// 		this._numeratorText.text = percentVal.toFixed(1).toString() + '%';
			// 	}
			// } else {
			// 	this._line.clear();
			// 	this._numeratorText.text = percentVal.toFixed(0).toString() + '%';
			// }
			// this._denominatorText.text = '';
		} else {
			this._numeratorText.text = this._absNumerator.toString();

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
		// this._updateBoundingTexture();
	}

	setDenominator (value) {
		this._absDenominator = Math.abs(value);
		this._denominator = value;

		// current fraction is positive or negative?
		this.currentSign = (this._numerator * this._denominator >= ZERO) ? SIGN.POSITIVE : SIGN.NEGATIVE;

		// retart all object positions
		for (let i = 0; i < this.children.length; i++) {
			this.children[i].x = 0;
			this.children[i].y = 0;
		}

		// update and redraw
		if (this.currentRepresentation.id === REPRESENTATION.FRACTION.id) {
			// set default font size
			let fontSize = this.shouldDrawWhite ? this._style.tooltipFontSize : this._style.fontSize;
			let lineWidth = this._calculateLineWidth(fontSize);

			let currStyle = { fontSize: fontSize, fill: 0 };
			if (this.shouldDrawWhite) {
				currStyle.fill = 0xffffff;
			}

			this._numeratorText.style = currStyle;
			this._denominatorText.style = currStyle;
			this._characterReference.style = currStyle;

			this._denominatorText.text = this._absDenominator.toString();

			// is the denominator or numerator wider?
			// let maxWidth = Math.max(this._numeratorText.width, this._denominatorText.width);
			let maxWidth = Math.max(this._numeratorText.textMeasurements.width, this._denominatorText.textMeasurements.width);

			// redraw line from max width
			this._line.clear();
			this._line.lineStyle(lineWidth, currStyle.fill, ONE);
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
				const DBG_SIGN_COLOR = currStyle.fill;
				this._magnitudeSign.clear();
				this._magnitudeSign.lineStyle(lineWidth, DBG_SIGN_COLOR, ONE);
				this._magnitudeSign.moveTo(-signWidth / TWO, ZERO);
				this._magnitudeSign.lineTo(signWidth / TWO, ZERO);
			}

			if (this.currentSign === SIGN.NEGATIVE) { // actually the fraction has negative magnitude...
				// update line position
				this._line.x = this._magnitudeSign.width / TWO + maxWidth / TWO + SIGN_LINE_SPACING;
				this._line.y = FRACTION_LINE_CORRECTION;

				// update text label positions
				this._numeratorText.y = -this._numeratorText.height / TWO;
				this._denominatorText.y = this._numeratorText.height / TWO;
				this._numeratorText.x = this._magnitudeSign.width / TWO + maxWidth / TWO + SIGN_LINE_SPACING;
				this._denominatorText.x = this._magnitudeSign.width / TWO + maxWidth / TWO + SIGN_LINE_SPACING;

				// update sign position
				this._magnitudeSign.x = 0; // -maxWidth / 2 - this._magnitudeSign.width / 2 - SIGN_LINE_SPACING;

				// // set operation sign position
				// this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
				// this._operationSign.x = this._magnitudeSign.width / TWO + SIGN_LINE_SPACING + maxWidth + this._operationSign.width / TWO; // maxWidth / TWO + this._operationSign.width / TWO + this._magnitudeSign.width / TWO + SIGN_LINE_SPACING;
			} else if (this.currentSign === SIGN.POSITIVE) { // actually the fraction has positive magnitude...
				// update line position
				this._line.x = 0;
				this._line.y = FRACTION_LINE_CORRECTION;

				// update text label positions
				this._numeratorText.y = -this._numeratorText.height / TWO;
				this._denominatorText.y = this._numeratorText.height / TWO;
				this._numeratorText.x = 0;
				this._denominatorText.x = 0;

				// update sign position
				this._magnitudeSign.x = 0; // -maxWidth / 2 - this._magnitudeSign.width / 2 - SIGN_LINE_SPACING;

				// // set operation sign position
				// this._operationSign.y = -this._operationSign.height * OPERATION_SIGN_Y_CORRECTION_FACTOR; // this.line.y - this._operationSign.height / 2 - this._operationSign.height * 0.06; //
				// this._operationSign.x = maxWidth / TWO + this._operationSign.width / TWO;
			}

			// center all expression
			this._updateOriginalPositions();
			this._setXPosition(ZERO);
		} else if (this.currentRepresentation.id === REPRESENTATION.DECIMAL.id) {
			let decimalValue = this._absNumerator / this._absDenominator;

			let fractionAnalysis = MathUtils.getRepeatingDecimal(this._absNumerator, this._absDenominator);
			if (fractionAnalysis.repeat) {
				decimalValue = Number.parseFloat(fractionAnalysis.integerPart + '.' + fractionAnalysis.nonRepeatingPart + fractionAnalysis.repeatingPart);
			} else {
				decimalValue = Number.parseFloat(decimalValue.toFixed(TWO));
			}

			// if numerator and denominator are equal, then make the font size bigger
			// let floatEquiv = MathUtils.isFloatEquiv(this._absNumerator, this._absDenominator);
			// if (floatEquiv) {
			// }

			// make the font size bigger when fraction is in decimal mode
			const FONT_SIZE_SCALE_FACTOR = 1.5;
			let fontSize = this.shouldDrawWhite ? (this._style.tooltipFontSize * FONT_SIZE_SCALE_FACTOR) : (this._style.fontSize * FONT_SIZE_SCALE_FACTOR);
			let lineWidth = this._calculateLineWidth(fontSize);

			let currStyle = { fontSize: fontSize, fill: 0 };
			if (this.shouldDrawWhite) {
				currStyle.fill = 0xffffff;
			}

			this._numeratorText.style = currStyle;
			this._denominatorText.style = currStyle;
			this._characterReference.style = currStyle;

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

			// draw magnitude sign
			let signWidth = this._characterReference.width * SIGN_SIZE_FACTOR;
			if (this.currentSign === SIGN.NEGATIVE) {
				const DBG_SIGN_COLOR = currStyle.fill;
				this._magnitudeSign.clear();
				this._magnitudeSign.lineStyle(lineWidth, DBG_SIGN_COLOR, ONE);
				this._magnitudeSign.moveTo(-signWidth / TWO, ZERO);
				this._magnitudeSign.lineTo(signWidth / TWO, ZERO);
			} else if (this.currentSign === SIGN.POSITIVE) {
				this._magnitudeSign.clear(); // if currently the fraction is positive then clear sign graphicc
			}

			// draw period bar
			this._drawPeriodicBar(fractionAnalysis, fontSize, currStyle.fill);

			// update positions
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

				// update periodic bar positions
				if (fractionAnalysis.repeat) {
					// calculate period bar width
					let periodBarWidth, periodBarOffset;
					const MIN_STRING_LEN = ONE;
					if (fractionAnalysis.repeatingPart.length <= MIN_STRING_LEN) {
						const NO_WIDTH = 0;
						const NO_OFFSET = 0;
						periodBarWidth = NO_WIDTH;
						periodBarOffset = NO_OFFSET;
					} else {
						periodBarWidth = fractionAnalysis.repeatingPart.length * this._characterReference.width;
						periodBarOffset = this._characterReference.width / TWO;
					}

					this._characterReference.x = -this._characterReference.width / TWO - this._magnitudeSign.width / TWO + this.colliderWidth - periodBarWidth / TWO + periodBarOffset; // - this._characterReference.width + SIGN_LINE_SPACING;
					this._periodBar.y = -this._characterReference.height / TWO;
					this._periodBar.x = this._characterReference.x;
				}

				this._updateOriginalPositions();
				this._setXPosition(ZERO);
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

				// update periodic bar positions
				if (fractionAnalysis.repeat) {
					// calculate period bar width
					let periodBarWidth, periodBarOffset;
					const MIN_STRING_LEN = ONE;
					if (fractionAnalysis.repeatingPart.length <= MIN_STRING_LEN) {
						const NO_WIDTH = 0;
						const NO_OFFSET = 0;
						periodBarWidth = NO_WIDTH;
						periodBarOffset = NO_OFFSET;
					} else {
						periodBarWidth = fractionAnalysis.repeatingPart.length * this._characterReference.width;
						periodBarOffset = this._characterReference.width / TWO;
					}

					this._characterReference.x = -this._characterReference.width / TWO - this.numeratorTextLabel.width / TWO + this.colliderWidth - periodBarWidth / TWO + periodBarOffset; // - this._characterReference.width + SIGN_LINE_SPACING;
					this._periodBar.y = -this._characterReference.height / TWO;
					this._periodBar.x = this._characterReference.x;
				}
			}
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
			gOrigin.drawRect(-this.colliderWidth / TWO, -this.colliderHeight / TWO, this.colliderWidth, this.colliderHeight);

			// make all the children of current container visible
			// for (let i = 0; i < this.children.length; i++) {
			// 	this.children[i].alpha = 1;
			// 	this.children[i].visible = true;
			// 	this.children[i].x = 0;
			// 	this.children[i].y = 0;
			// }

			// // >>>>> draw reference text bounding box}
			// const REF_COLOR = 0xffffff;
			// const REF_ALPHA = 0.5;
			// gOrigin.lineStyle(ONE, ONE, ONE);
			// gOrigin.beginFill(REF_COLOR, REF_ALPHA);
			// gOrigin.drawRect(this._characterReference.x - this._characterReference.width / TWO, this._characterReference.y - this._characterReference.height / TWO, this._characterReference.width, this._characterReference.height);

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

	_drawPeriodicBar (fractionAnalysis, fontSize, color = ZERO) {
		// draw the period bar if needed
		if (fractionAnalysis.repeat) {
			let periodBarWidth = fractionAnalysis.repeatingPart.length * this._characterReference.width;
			let lineWidth = this._calculateLineWidth(fontSize);
			const PERIOD_BAR_COLOR = color;
			this._periodBar.clear();
			this._periodBar.lineStyle(lineWidth, PERIOD_BAR_COLOR, ONE);
			this._periodBar.moveTo(-periodBarWidth / TWO, ZERO);
			this._periodBar.lineTo(periodBarWidth / TWO, ZERO);
		} else {
			this._periodBar.clear();
		}
	}

	_updateBoundingTexture () {
		let bbGraphic = this.bbGraphic;
		const ALPHA = 1;
		bbGraphic.clear();
		bbGraphic.lineStyle(ONE, ZERO, ONE);
		const POSITIVE_COLOR = 0x00cc00;
		const NEGATIVE_COLOR = 0xcc0000;
		if (this.currentSign === SIGN.POSITIVE) bbGraphic.beginFill(POSITIVE_COLOR, ALPHA);
		else if (this.currentSign === SIGN.NEGATIVE) bbGraphic.beginFill(NEGATIVE_COLOR, ALPHA);
		bbGraphic.drawRect(-this.colliderWidth / TWO, -this.height / TWO, this.colliderWidth, this.height);
		let boundinBoxTexture = MindTextureManager.generateTextureFromGraphic(bbGraphic);
		this.texture = boundinBoxTexture;
		super.calculateBounds();
	}

	_calculateLineWidth () {
		// 25 -> SIGN_SIZE_LINE_WIDTH
		// fontSize -> X
		const DEFAULT_FONT_SIZE = 25;
		const SIGN_SIZE_LINE_WIDTH = 2;
		return SIGN_SIZE_LINE_WIDTH * this.fontSize / DEFAULT_FONT_SIZE;
	}

	set fontSize (val) {
		this._style.fontSize = val;
		this.finalFontSize = val;
		this.representation = this.currentRepresentation.id;
		this.numerator = this.numerator;
		this.denominator = this.denominator;
	}

	get fontSize () {
		return this._style.fontSize;
	}

	_forceRedraw () {
		this.representation = this.representation;
		this.numerator = this.numerator;
		this.denominator = this.denominator;
	}

	_onFontSizeChange (event) {
		// re-set all properties for forcing redraw
		// this._forceRedraw();
		if (this.isFirstOnFontSizeInvocation) {
			this.isFirstOnFontSizeInvocation = false; // the next won't be the first
			return; // ignore invocation of this handler when game just starts
		}
		this.denominator = this.denominator;
	}

	_onLocaleChange (event) {
		// the reference to the style is lost when changing locale so restore it
		this._style = this.arena.theme.getStyles('fractionText');
		this._style.fontSize = this.finalFontSize;

		// if (this.currentRepresentation.id !== REPRESENTATION.DECIMAL.id) return;

		currentLocale = event.locale;
		if (currentLocale === ENGLISH) {
			this._numeratorText.text = this._numeratorText.text.replace(',', '.');
		} else if (currentLocale === SPANISH || currentLocale === PORTUGUESE) {
			this._numeratorText.text = this._numeratorText.text.replace('.', ',');
		}
	}

	destroy (options) {
		this.eventEmitter.removeListener(this.mindEvents.EVENT_FONTSIZE_CHANGED, this._onFontSizeChange, this);
		this.eventEmitter.removeListener(this.mindEvents.EVENT_LOCALE_CHANGED, this._onLocaleChange, this);

		this._numeratorText.destroy(options);
		this._denominatorText.destroy(options);
	}
}