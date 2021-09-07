import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { MathUtils } from './MathUtils';

const TAG_RADIUS = 5;
const PADDING = 4;
const ZERO = 0;
const ONE = 1;
const DIV_2 = 0.5;
const MULT_2 = 2;
const MULT_100 = 100;

export class NumberTag extends MindPixiContainer {
	constructor (numerator, denominator, usePercent, mindObjectOptions, useSingleValue = false, roundRect = false) {
		super(mindObjectOptions);
		let shouldDeprecate = true;
		if (shouldDeprecate) throw new Error('Avoid using this component, instead use the mind standard Tooltip component available from mind@components 0.5.4\nread more at: https://confluence.mindresearch.org/display/WP/Tooltip');

		this._numerator = numerator;
		this._denominator = denominator;
		this.usePercent = usePercent;

		this.useSingleValue = useSingleValue;

		this._roundRect = roundRect;

		this.graphics = undefined;
		this.textContainer = undefined;
		this.numeratorText = undefined;
		this.denominatorText = undefined;
		this.fractionLine = undefined;

		this.pointer = undefined;

		this.setup();
	}

	setup () {
		let _textStyle = this.arena.theme.getStyles('tagFont');
		let _style = this.arena.theme.getStyles('numberTag');

		this.pointer = new MindPixiGraphics();

		this.graphics = new MindPixiGraphics();
		this.addChild(this.graphics);

		this.textContainer = new MindPixiContainer({ Rng: this.arena.Rng });
		this.graphics.addChild(this.textContainer);

		this.numeratorText = new MindPixiText('00', _textStyle);
		this.textContainer.addChild(this.numeratorText);
		this.numeratorText.anchor.set(DIV_2, ZERO);

		this.denominatorText = new MindPixiText('00', _textStyle);
		this.textContainer.addChild(this.denominatorText);

		this.fractionLine = new MindPixiGraphics();
		this.textContainer.addChild(this.fractionLine);

		if (this.usePercent) {
			let percent = (this._numerator / this._denominator) * MULT_100;

			this.numeratorText.text = '100%';
			this.denominatorText.text = '';

			this.denominatorText.y = 0;

			this.numeratorText.x = this.textContainer.width * DIV_2;

			let roundRectWidth = this.textContainer.width + PADDING * MULT_2;
			let roundRectHeight = this.textContainer.height + PADDING * MULT_2;

			if (percent % ONE > ZERO) {
				let percObj = MathUtils.getRepeatingDecimal(this._numerator * MULT_100, this._denominator);

				if (percObj.repeat) {
					let strToShow = percObj.integerPart + '.';
					if (percObj.nonRepeatingPart.length > ZERO) {
						strToShow += percObj.nonRepeatingPart[ZERO];
						this.fractionLine.clear();
						this.numeratorText.text = strToShow + '%';
					} else {
						this.numeratorText.text = strToShow;
						let posX = this.numeratorText.x = this.numeratorText.textMeasurements.width;

						this.numeratorText.text = percObj.repeatingPart;
						let len = this.numeratorText.textMeasurements.width;

						let _style = this.arena.theme.getStyles('numberTag');
						this.fractionLine.clear();
						this.fractionLine.lineStyle(_style.stroke, _style.fill);
						this.fractionLine.moveTo(ZERO, ZERO);
						this.fractionLine.lineTo(len, ZERO);
						this.addChild(this.fractionLine);
						this.fractionLine.x = PADDING + posX;
						this.fractionLine.y = PADDING;

						strToShow += percObj.repeatingPart;
						this.numeratorText.text = strToShow + '%';
					}
				} else {
					this.fractionLine.clear();
					this.numeratorText.text = percent.toFixed(ONE).toString() + '%';
				}
			} else {
				this.fractionLine.clear();
				this.numeratorText.text = percent.toFixed(ZERO).toString() + '%';
			}
			this.denominatorText.text = '';

			this.graphics.beginFill(_style.background, ONE);
			if (this._roundRect) {
				this.graphics.drawRoundedRect(ZERO, ZERO, roundRectWidth, roundRectHeight, TAG_RADIUS);
			} else {
				this.graphics.drawRect(ZERO, ZERO, roundRectWidth, roundRectHeight);
			}
		} else if (this.useSingleValue) {
			this.denominatorText.text = '';

			this.denominatorText.y = ZERO;

			this.denominatorText.y = 0;

			this.numeratorText.x = this.textContainer.width * DIV_2;

			let roundRectWidth = this.textContainer.width + PADDING * MULT_2;
			let roundRectHeight = this.textContainer.height + PADDING * MULT_2;

			this.numeratorText.text = this._numerator.toString();

			this.graphics.beginFill(_style.background, ONE);
			if (this._roundRect) {
				this.graphics.drawRoundedRect(ZERO, ZERO, roundRectWidth, roundRectHeight, TAG_RADIUS);
			} else {
				this.graphics.drawRect(ZERO, ZERO, roundRectWidth, roundRectHeight);
			}
		} else {
			this.denominatorText.y = this.numeratorText.textMeasurements.height;

			let roundRectWidth = this.textContainer.width + PADDING * MULT_2;
			let roundRectHeight = this.textContainer.height + PADDING * MULT_2;

			this.graphics.beginFill(_style.background, ONE);

			if (this._roundRect) {
				this.graphics.drawRoundedRect(ZERO, ZERO, roundRectWidth, roundRectHeight, TAG_RADIUS);
			} else {
				this.graphics.drawRect(ZERO, ZERO, roundRectWidth, roundRectHeight);
			}

			this.numeratorText.text = this._numerator.toString();
			this.denominatorText.text = this._denominator.toString();

			let lineWidth = Math.max(this.numeratorText.textMeasurements.width, this.denominatorText.textMeasurements.width);
			this.fractionLine.lineStyle(_style.stroke, _style.fill);
			this.fractionLine.moveTo(ZERO, ZERO);
			this.fractionLine.lineTo(lineWidth, ZERO);

			this.fractionLine.y = this.numeratorText.textMeasurements.height + this.fractionLine.height * DIV_2;

			this.numeratorText.x = this.textContainer.width * DIV_2;
			this.denominatorText.x = this.textContainer.width * DIV_2 - this.denominatorText.textMeasurements.width * DIV_2;
		}

		this.textContainer.x = this.graphics.width * DIV_2 - this.textContainer.width * DIV_2;
		this.textContainer.y = this.graphics.height * DIV_2 - this.textContainer.height * DIV_2;

		this.anchor = { x: DIV_2, y: DIV_2 };
	}

	get numerator () {
		return this._numerator;
	}

	set numerator (value) {
		this._numerator = value;
		this.reDraw();
	}

	get denominator () {
		return this._denominator;
	}

	set denominator (value) {
		this._denominator = value;
		this.reDraw();
	}

	reDraw () {
		if (this.usePercent) {
			let percent = (this._numerator / this._denominator) * MULT_100;

			if (percent % ONE > ZERO) {
				let percObj = MathUtils.getRepeatingDecimal(this._numerator * MULT_100, this._denominator);

				if (percObj.repeat) {
					let strToShow = percObj.integerPart + '.';
					if (percObj.nonRepeatingPart.length > ZERO) {
						strToShow += percObj.nonRepeatingPart[ZERO];
						this.numeratorText.text = strToShow + '%';
						this.fractionLine.clear();
					} else {
						this.numeratorText.text = strToShow;
						let posX = this.numeratorText.x = this.numeratorText.textMeasurements.width;

						this.numeratorText.text = percObj.repeatingPart;
						let len = this.numeratorText.textMeasurements.width;

						let _style = this.arena.theme.getStyles('numberTag');
						this.fractionLine.clear();
						this.fractionLine.lineStyle(_style.stroke, _style.fill);
						this.fractionLine.moveTo(ZERO, ZERO);
						this.fractionLine.lineTo(len, ZERO);
						this.addChild(this.fractionLine);
						this.fractionLine.x = PADDING + posX;
						this.fractionLine.y = PADDING;

						strToShow += percObj.repeatingPart;
						this.numeratorText.text = strToShow + '%';
					}
				} else {
					this.fractionLine.clear();
					this.numeratorText.text = percent.toFixed(ONE).toString() + '%';
				}
			} else {
				this.fractionLine.clear();
				this.numeratorText.text = percent.toFixed(ZERO).toString() + '%';
			}
			this.denominatorText.text = '';

			this.denominatorText.y = ZERO;

			this.numeratorText.x = this.textContainer.width * DIV_2;
		} else if (this.useSingleValue) {
			this.numeratorText.text = this._numerator.toString();
			this.denominatorText.text = '';

			this.denominatorText.y = ZERO;

			this.numeratorText.x = this.textContainer.width * DIV_2;
		} else {
			this.numeratorText.text = this._numerator.toString();
			this.denominatorText.text = this._denominator.toString();
			let _style = this.arena.theme.getStyles('numberTag');

			let lineWidth = Math.max(this.numeratorText.textMeasurements.width, this.denominatorText.textMeasurements.width);
			this.fractionLine.clear();
			this.fractionLine.lineStyle(_style.stroke, _style.fill);
			this.fractionLine.moveTo(ZERO, ZERO);
			this.fractionLine.lineTo(lineWidth, ZERO);

			this.fractionLine.y = this.numeratorText.textMeasurements.height + this.fractionLine.height * DIV_2;
			this.denominatorText.y = this.numeratorText.textMeasurements.height;

			this.numeratorText.x = this.textContainer.width * DIV_2;
			this.denominatorText.x = this.textContainer.width * DIV_2 - this.denominatorText.textMeasurements.width * DIV_2;
		}

		this.textContainer.x = this.graphics.width * DIV_2 - this.textContainer.width * DIV_2;
		this.textContainer.y = this.graphics.height * DIV_2 - this.textContainer.height * DIV_2;
	}

	destroy (options) {
		this.graphics = undefined;
		this.textContainer = undefined;
		this.numeratorText = undefined;
		this.denominatorText = undefined;
		this.fractionLine = undefined;
	}

	setPointer (x, y) {
		let _style = this.arena.theme.getStyles('numberTag');
		let triangleBase = 5;
		if (this.parent === this.pointer.parent) {
			this.pointer.clear();
		} else {
			this.parent.addChild(this.pointer);
			this.parent.addChild(this);
		}
		this.pointer.beginFill(_style.background, ONE);
		let mPoints = [];
		mPoints.push({ x: ZERO, y: ZERO });
		let mPoint2 = { x: ZERO, y: ZERO };
		let mPoint3 = { x: ZERO, y: ZERO };

		let errorAprox = 0.001;

		let orientation = '';
		if (this.y + this.height * DIV_2 > y + errorAprox) {
			orientation = 'DOWN ';
		} else if (this.y + this.height * DIV_2 < y - errorAprox) {
			orientation = 'UP ';
		}

		if (this.x + this.width * DIV_2 > x + errorAprox) {
			orientation += 'RIGHT';
		} else if (this.x + this.width * DIV_2 < x - errorAprox) {
			orientation += 'LEFT';
		}

		mPoint2.x = (this.x + this.width * DIV_2) - x;
		mPoint2.y = (this.y + this.height * DIV_2) - y;
		mPoint3.x = (this.x + this.width * DIV_2) - x;
		mPoint3.y = (this.y + this.height * DIV_2) - y;

		switch (orientation) {
			case 'DOWN ':
				mPoint2.x += triangleBase;
				mPoint3.x -= triangleBase;
				break;
			case 'UP ':
				mPoint2.x += triangleBase;
				mPoint3.x -= triangleBase;
				break;
			case 'RIGHT':
				mPoint2.y += triangleBase;
				mPoint3.y -= triangleBase;
				break;
			case 'LEFT':
				mPoint2.y += triangleBase;
				mPoint3.y -= triangleBase;
				break;
			case 'DOWN RIGHT':
				mPoint2.x -= triangleBase;
				mPoint2.y += triangleBase;
				mPoint3.x += triangleBase;
				mPoint3.y -= triangleBase;
				break;
			case 'DOWN LEFT':
				mPoint2.x += triangleBase;
				mPoint2.y += triangleBase;
				mPoint3.x -= triangleBase;
				mPoint3.y -= triangleBase;
				break;
			case 'UP RIGHT':
				mPoint2.x += triangleBase;
				mPoint2.y += triangleBase;
				mPoint3.x -= triangleBase;
				mPoint3.y -= triangleBase;
				break;
			case 'UP LEFT':
				mPoint2.x += triangleBase;
				mPoint2.y -= triangleBase;
				mPoint3.x -= triangleBase;
				mPoint3.y += triangleBase;
				break;
		}
		mPoints.push(mPoint2);
		mPoints.push(mPoint3);

		this.pointer.moveTo(mPoints[ZERO].x, mPoints[ZERO].y);
		for (let i = 1; i < mPoints.length; i++) {
			let mPoint = mPoints[i];
			this.pointer.lineTo(mPoint.x, mPoint.y);
		}

		this.pointer.x = x;
		this.pointer.y = y;
	}

	setVisible (value) {
		if (value) {
			this.alpha = 1;
			if (this.pointer) { this.pointer.alpha = 1; }
		} else {
			this.alpha = 0;
			if (this.pointer) { this.pointer.alpha = 0; }
		}
	}
}

export const fontStyles = {
	'fontSize': 16,
	'fill': '::styles.colorPalette.raw.colors.WHITE'
};

export const styles = {
	'fill': '::styles.colorPalette.raw.colors.WHITE',
	'stroke': 1.5,
	'background': '::styles.colorPalette.raw.colors.BLACK'
};
