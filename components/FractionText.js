import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer'
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';
import { MathUtils } from './MathUtils';

export class FractionText extends MindPixiContainer {
	constructor (num, denom, usePercent, mindObjectOptions) {
		super(mindObjectOptions);

		this.usePercent = usePercent;

		this._numerator = num;
		this._denominator = denom;

		this._style = this.arena.theme.getStyles('fractionText');
		this._numeratorText = new MindPixiText(num.toString(), this._style);
		this._denominatorText = new MindPixiText(denom.toString(), this._style);

		this.addChild(this._numeratorText);
		this.addChild(this._denominatorText);

		this.line = new MindPixiGraphics();

		/**
		* Usually the fractions could be represented as a porcentage
		*/

		if (this.usePercent) {
			let value = (this._numerator / this._denominator) * 100;
			if (value % 1 > 0) {
				let percObj = MathUtils.getRepeatingDecimal(this._numerator * 100, this._denominator);

				let strToShow = percObj.integerPart + '.';
				if (percObj.repeat) {
					if (percObj.nonRepeatingPart.length > 0) {
						strToShow += percObj.nonRepeatingPart[0];
						this.line.clear();
						this._numeratorText.text = strToShow + '%';
					} else {
						this._numeratorText.text = strToShow;
						let posX = this._numeratorText.x + this._numeratorText.textMeasurements.width;

						this._numeratorText.text = percObj.repeatingPart;
						let len = this._numeratorText.textMeasurements.width;

						strToShow += percObj.repeatingPart;
						this._numeratorText.text = strToShow + '%';

						this.line.clear();
						this.line.lineStyle(1, 0x000000, 1);
						this.line.moveTo(0, 0);
						this.line.lineTo(len, 0);
						this.addChild(this.line);
						this.line.x = posX;
					}
				} else {
					this.line.clear();
					this._numeratorText.text = value.toFixed(1).toString() + '%';
				}
			} else {
				this.line.clear();
				this._numeratorText.text = value.toFixed(0).toString() + '%';
			}
			this._denominatorText.text = '';
		} else {
			this.line.lineStyle(1, 0x000000, 1);
			this.line.moveTo(0, 0);
			this.line.lineTo(this._numeratorText.textMeasurements.width, 0);
			this.addChild(this.line);

			let maxWidth = Math.max(this._numeratorText.textMeasurements.width, this._denominatorText.textMeasurements.width);

			this._numeratorText.x = (maxWidth - this._numeratorText.textMeasurements.width) / 2;
			this._denominatorText.y = this._numeratorText.height;

			this.line.x = (maxWidth - this.line.width) / 2;
			this.line.y = this._numeratorText.height;
		}

		this.eventEmitter.on(this.mindEvents.EVENT_FONTSIZE_CHANGED, this._onFontSizeChange, this);
	}

	setPosition (x, y) {
		this.x = x - this.width / 2;
		this.y = y - this.height / 2;
	}

	setNumerator (value) {
		this._numerator = value;
		if (this.usePercent) {
			let percentVal = (this._numerator / this._denominator) * 100;
			if (percentVal % 1 > 0) {
				let percObj = MathUtils.getRepeatingDecimal(this._numerator * 100, this._denominator);

				let strToShow = percObj.integerPart + '.';
				if (percObj.repeat) {
					if (percObj.nonRepeatingPart.length > 0) {
						strToShow += percObj.nonRepeatingPart[0];
						this.line.clear();
					} else {
						this._numeratorText.text = strToShow;
						let posX = this._numeratorText.x + this._numeratorText.width;

						this._numeratorText.text = percObj.repeatingPart;
						let len = this._numeratorText.width;

						strToShow += percObj.repeatingPart;

						this.line.clear();
						this.line.lineStyle(1, 0x000000, 1);
						this.line.moveTo(0, 0);
						this.line.lineTo(len, 0);
						this.addChild(this.line);
						this.line.x = posX;
						this.line.y = this.line.height;
					}
					this._numeratorText.text = strToShow + '%';
				} else {
					this.line.clear();
					this._numeratorText.text = percentVal.toFixed(1).toString() + '%';
				}				
			} else {
				this.line.clear();
				this._numeratorText.text = percentVal.toFixed(0).toString() + '%';
			}
			this._denominatorText.text = '';
		} else {
			this._numeratorText.text = value.toString();

			this.line.clear();
			this.line.lineStyle(1, 0x000000, 1);
			this.line.moveTo(0, 0);
			this.line.lineTo(this._numeratorText.width, 0);
			this.addChild(this.line);

			let maxWidth = Math.max(this._numeratorText.width, this._denominatorText.width);

			this._numeratorText.x = (maxWidth - this._numeratorText.width) / 2;
			this._denominatorText.y = this._numeratorText.height;

			this.line.x = (maxWidth - this.line.width) / 2;
			this.line.y = this._numeratorText.height;
		}
	}

	setDenominator (value) {
		this._denominator = value;
		if (this.usePercent) {
			let percentVal = (this._numerator / this._denominator) * 100;
			if (percentVal % 1 > 0) {
				let percObj = MathUtils.getRepeatingDecimal(this._numerator * 100, this._denominator);

				let strToShow = percObj.integerPart + '.';
				if (percObj.repeat) {
					if (percObj.nonRepeatingPart.length > 0) {
						strToShow += percObj.nonRepeatingPart[0];
						this.line.clear();
					} else {
						this._numeratorText.text = strToShow;
						let posX = this._numeratorText.x + this._numeratorText.width;

						this._numeratorText.text = percObj.repeatingPart;
						let len = this._numeratorText.width;

						strToShow += percObj.repeatingPart;

						this.line.clear();
						this.line.lineStyle(1, 0x000000, 1);
						this.line.moveTo(0, 0);
						this.line.lineTo(len, 0);
						this.addChild(this.line);
						this.line.x = posX;
					}

					this._numeratorText.text = strToShow + '%';
				} else {
					this.line.clear();
					this._numeratorText.text = percentVal.toFixed(1).toString() + '%';
				}
			} else {
				this.line.clear();
				this._numeratorText.text = percentVal.toFixed(0).toString() + '%';
			}
			this._denominatorText.text = '';
		} else {
			this._denominatorText.text = value.toString();

			this.line.clear();
			this.line.lineStyle(1, 0x000000, 1);
			this.line.moveTo(0, 0);
			this.line.lineTo(this._numeratorText.width, 0);
			this.addChild(this.line);

			let maxWidth = Math.max(this._numeratorText.width, this._denominatorText.width);

			this._numeratorText.x = (maxWidth - this._numeratorText.width) / 2;
			this._denominatorText.y = this._numeratorText.height;

			this.line.x = (maxWidth - this.line.width) / 2;
			this.line.y = this._numeratorText.height;
		}
	}

	_onFontSizeChange (event) {
		if (!this.usePercent) {
			this.line.clear();
			this.line.lineStyle(1, 0x000000, 1);
			this.line.moveTo(0, 0);
			this.line.lineTo(this._numeratorText.width, 0);
			this.addChild(this.line);

			let maxWidth = Math.max(this._numeratorText.width, this._denominatorText.width);

			this._numeratorText.x = (maxWidth - this._numeratorText.width) / 2;
			this._denominatorText.y = this._numeratorText.height;

			this.line.x = (maxWidth - this.line.width) / 2;
			this.line.y = this._numeratorText.height;
		}
	}

	destroy (options) {
		this.eventEmitter.removeListener(this.mindEvents.EVENT_FONTSIZE_CHANGED, this._onFontSizeChange, this);

		this._numeratorText.destroy(options);
		this._denominatorText.destroy(options);
	}

	/**
	* Simplify the function using the greater common divisor between the numerator and denominator
	*/
	simplify () {
		var gcd = function gcd (a, b) {
			return b ? gcd(b, a % b) : a;
		};
		gcd = gcd(this._numerator, this._denominator);
		this._numerator = this._numerator / gcd;
		this._denominator = this._denominator / gcd;

		this._numeratorText.text = this._numerator.toString();
		this._denominatorText.text = this._denominator.toString();

		this.line.clear();
		this.line.lineStyle(1, 0x000000, 1);
		this.line.moveTo(0, 0);
		this.line.lineTo(this._numeratorText.width, 0);
		this.addChild(this.line);

		let maxWidth = Math.max(this._numeratorText.width, this._denominatorText.width);

		this._numeratorText.x = (maxWidth - this._numeratorText.width) / 2;
		this._denominatorText.y = this._numeratorText.height;

		this.line.x = (maxWidth - this.line.width) / 2;
		this.line.y = this._numeratorText.height;
	}
}

export styles = {
	'fontSize': 18
}
