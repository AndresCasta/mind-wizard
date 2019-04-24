// mind sdk classes
// import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';
import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';

import { GlowableObject } from './GlowableObject';
import { VALIDATE } from '../VALIDATE';
import { COLOR } from '../../Constants';

const ZERO = 0;
const ONE = 1;
const TWO = 2;
const DEFAULT_GLOW_IN_TIME = 0.4;
const DEFAULT_GLOW_OUT_TIME = 0.01;

const GLOW_OUT_FINAL_ALPHA = 1;

// const SIGN_MAGNITUDE_DISPLACEMENT_X = 1.2;
const SIGN_MAGNITUDE_DISPLACEMENT_Y = 4.2;

// const getSignDisplacementX = (fontSize) => {
// 	const originalFontSize = 18;
// 	// originalFontSize -> SIGN_MAGNITUDE_DISPLACEMENT_Y
// 	// newFontSize -> x
// 	const newSignDisplacement = SIGN_MAGNITUDE_DISPLACEMENT_X * fontSize / originalFontSize;
// 	return newSignDisplacement;
// };

const getSignDisplacementY = (fontSize) => {
	const originalFontSize = 18;
	// originalFontSize -> SIGN_MAGNITUDE_DISPLACEMENT_Y
	// newFontSize -> x
	const newSignDisplacement = SIGN_MAGNITUDE_DISPLACEMENT_Y * fontSize / originalFontSize;
	return newSignDisplacement;
};

let idx = -1;
const uniqueObject = () => {
	idx++;
	return { uid: idx };
};

const numOfDecimals = (string) => {
	let isDecimalStarted = false;
	let decimalDigitCounter = 0;
	for (let i = 0; i < string.length; i++) {
		const char = string[i];

		const isPointChar = char === '.';
		if (isPointChar) {
			isDecimalStarted = true;
		}

		// calculate decimal precision
		if (isDecimalStarted) {
			if (!isPointChar) decimalDigitCounter++;
		}
	}
	return decimalDigitCounter;
};

/**
 * Glowable text.
 * @export
 * @class GlowableText
 * @extends {GlowableObject}
 */
export class GlowableText extends GlowableObject {
    /**
     * Add copied object to mainView hierarchy and returns a reference of new created object (frick blue text)
     * @param {GlowableText} glowableObject Current glowableText object for copying
     * @param {object} glowableOptions Object for optional configs for using in the copy instance
     * @returns {GlowableText} reference to copied glowableText object
     */
	static getCopy (glowableObject, glowableOptions = {}) {
		VALIDATE.isType(glowableObject, GlowableObject);
		VALIDATE.isType(glowableObject, GlowableText);

		let copy = new GlowableText(glowableObject.text, glowableObject.blackStyle, glowableObject.mainView);
		let x = VALIDATE.defaultArg(glowableOptions.x, glowableObject.x);
		let y = VALIDATE.defaultArg(glowableOptions.y, glowableObject.y);
		let parent = VALIDATE.defaultArg(glowableOptions.parent, glowableObject.parent);
		copy.x = x;
		copy.y = y;
		copy.finalPosition = glowableObject.finalPosition;

		if (glowableObject.isInGlowState) copy.glowIn(Number.EPSILON);
		parent.addChild(copy);
		return copy;
	}

	/**
     * Returns width of bounding box for current glowableObject
     */
	get colliderWidth () {
		let leftMostX = this.isSignMagnitude ? this.signLabel.x : ZERO;
		let rightMostX = this.textLabel.x + this.textLabel.width;
		return rightMostX - leftMostX;
	}

    /**
     * Returns width of bounding box for current glowableObject
     */
	get colliderHeight () {
		return this.textLabel.height;
	}

	/**
	 * Set the text for the pin
	 */
	set text (value) {
		let textStr = value + '';
		this._text = textStr;

		// is there a negative sign magnitude character?
		let isSignMagnitude = this._text.indexOf('-') > -ONE;
		this.isSignMagnitude = isSignMagnitude;
		if (isSignMagnitude) {
			textStr = textStr.replace('-', '');
			this.signLabel.alpha = ONE;
			this.glowSignLabel.alpha = ZERO;
		} else {
			this.signLabel.alpha = ZERO;
		}

		const textNumber = Number(textStr);
		const isNumber = !isNaN(textNumber);

		// Number​.prototype​.toLocale​String() https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Number/toLocaleString
		const formatOptions = {};
		if (isNumber) formatOptions.minimumFractionDigits = numOfDecimals(textStr);
		const formatedTextString = isNumber ? textNumber.toLocaleString(this.arena.theme.locale, formatOptions) : textStr;

		// default text
		this.textLabel.text = formatedTextString;

		// glow label
		this.glowLabel.text = formatedTextString;
		this.glowLabel.alpha = ZERO;

		// update positions
		this.calculateChildPositions();

		this.calculateSize();
	}

	get text () {
		return this._text;
	}

	get style () {
		return this.blackStyle;
	}

	set style (val) {
		this.blackStyle = val;

		this.textLabel.style = val;
		this.glowLabel.style = val;
	}

	constructor (text, fontStyle, mindObjectOptions) {
		super(mindObjectOptions);
		this._text = text + '';
		this.isInGlowState = false;

		// generate automatic styles
		this.blackStyle = Object.assign(uniqueObject(), fontStyle);
		this.blackStyle.fill = 0x0;
		this.blackStyle.strokeThickness = 0;
		this.blackStyle.stroke = 0x0;

		// stroke style
		this.strokeStyle = Object.assign(uniqueObject(), this.blackStyle);
		this.strokeStyle.strokeThickness = 1;
		this.strokeStyle.fill = 'rgba(0,0,0,0)';

		// red style
		this.redStyle = Object.assign(uniqueObject(), fontStyle);
		this.redStyle.fill = COLOR.INCORRECT_RED;
		this.redStyle.stroke = COLOR.INCORRECT_RED_STROKE;
		this.redStyleHC = Object.assign(uniqueObject(), this.redStyle);
		// red when high contrast
		this.redStyleHC.fill = 0x0;
		this.redStyleHC.stroke = 0x0;

		const getRGBA = (c) => {
			return 'rgba(' + (c.r * c.i) + ',' + (c.g * c.i) + ',' + (c.b * c.i) + ',255)';
		};

		// texture used for highlighted text inside parenthesis
		this.colorStyle = Object.assign(uniqueObject(), this.blackStyle);
		this.colorStyle.fill = 0xbe72ff;
		this.colorStyle.strokeThickness = 2.6;// 2.6;
		this.colorStyle.stroke = getRGBA({ r: 87, g: 45, b: 109, i: 1.4 });
		// highlight color when high contrast
		this.colorStyleHC = Object.assign(uniqueObject(), this.colorStyle);
		this.colorStyleHC.strokeThickness = 0;
		this.colorStyleHC.fill = 0x0;
		this.colorStyleHC.stroke = 0x0;

		// track the currently used color style
		this.currentStyle = null;

		// glow style
		let style = this.extractStyleStatic(this.arena.theme, 'glowableText');
		this.glowStyle = Object.assign(uniqueObject(), this.colorStyle);
		this.glowStyle.fill = style.glowFillColor; // COLOR.FRICK_BLUE;
		this.glowStyle.stroke = 0xffffff;

		this.initLayers();
		this.text = this._text;

		this.eventEmitter.on(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChange, this);
	}

	initLayers () {
		this.signLabel = new MindPixiText('-', this.blackStyle);
		this.glowSignLabel = new MindPixiText('-', this.glowStyle);
		this.signLabel.alpha = ZERO;
		this.glowSignLabel.alpha = ZERO;

		// default text
		this.textLabel = new MindPixiText('', this.blackStyle);

		// glow label
		this.glowLabel = new MindPixiText('', this.glowStyle);
		this.glowLabel.alpha = ZERO;

		this.addChild(this.glowSignLabel);
		this.addChild(this.glowLabel);

		this.addChild(this.signLabel);
		this.addChild(this.textLabel);
	}

	calculateChildPositions () {
		if (this.isSignMagnitude) {
			// number
			this.textLabel.x = this.signLabel.width / TWO;
			this.glowLabel.x = this.textLabel.x;

			// sign
			const signDisplacementY = getSignDisplacementY(this.blackStyle.fontSize);
			this.signLabel.x = this.textLabel.x - this.textLabel.width / TWO - this.signLabel.width / TWO;
			this.signLabel.y = -signDisplacementY;

			this.glowSignLabel.position = this.signLabel.position;
		}
	}

	render () {
		super.render();
	}
	// -------------------------------------------------------------------------
	// color helpers
	// -------------------------------------------------------------------------

	useColorTexture () {
		const glowableSettings = this.extractStyleStatic(this.arena.theme, 'glowableSettings');
		const fontAlpha = glowableSettings.glowableText.alpha;
		const colorStyleName = glowableSettings.glowableText.colorStyleName;

		this.signLabel.style = this[colorStyleName];
		this.textLabel.style = this[colorStyleName];

		if (this.isSignMagnitude) this.signLabel.alpha = fontAlpha;
		else this.signLabel.alpha = ZERO;
		this.textLabel.alpha = fontAlpha;
	}

	useBlackTexture () {
		this.signLabel.style = this.blackStyle;
		this.textLabel.style = this.blackStyle;

		if (this.isSignMagnitude) this.signLabel.alpha = ONE;
		else this.signLabel.alpha = ZERO;
		this.textLabel.alpha = ONE;
		// if (!this.blackTexture) return;
		// this.frontSprite.texture = this.blackTexture;
	}

	useStrokeStyle () {
		this.signLabel.style = this.strokeStyle;
		this.textLabel.style = this.strokeStyle;

		if (this.isSignMagnitude) this.signLabel.alpha = ONE;
		else this.signLabel.alpha = ZERO;
		this.textLabel.alpha = ONE;
	}

	useRedTexture () {
		const styleSettings = this.extractStyleStatic(this.arena.theme, 'glowableSettings');
		const redStyleName = styleSettings.glowableText.redStyleName;

		this.signLabel.style = this[redStyleName];
		this.textLabel.style = this[redStyleName];
	}

	// -------------------------------------------------------------------------
	// glow related helpers
	// -------------------------------------------------------------------------

    /**
     * Animate the glow
     */
	glowIn (time = DEFAULT_GLOW_IN_TIME, _labelGlow, tween) {
		this.isInGlowState = true;
		let _tween = VALIDATE.defaultArg(tween, this.arena.tween);
		_labelGlow = VALIDATE.defaultArg(_labelGlow, this.arena.tween.addUniqueLabel('glowInLabel'));
		_tween.to(this.glowLabel, time, { alpha: ONE }, _labelGlow);
		if (this.isSignMagnitude) {
			_tween.to(this.glowSignLabel, time, { alpha: ONE }, _labelGlow);
		}
	}

	setupGlowIn () {
		this.isInGlowState = true;
		this.glowLabel.alpha = ONE;
		if (this.isSignMagnitude) {
			this.glowSignLabel.alpha = ONE;
		}
	}

	glowOut (time = DEFAULT_GLOW_OUT_TIME, _labelGlow, tween, useBlue) {
		this.isInGlowState = false;
		let _tween = VALIDATE.defaultArg(tween, this.arena.tween);
		let _dlabelGlow = VALIDATE.defaultArg(_labelGlow, this.arena.tween.addUniqueLabel('glowOutLabel'));
		if (!useBlue) {
			_tween.to(this.textLabel, time, { alpha: GLOW_OUT_FINAL_ALPHA }, _dlabelGlow);
			if (this.isSignMagnitude) {
				_tween.to(this.signLabel, time, { alpha: GLOW_OUT_FINAL_ALPHA }, _dlabelGlow);
			}
			_tween.to(this.glowLabel, time, { alpha: ZERO }, _dlabelGlow);
			_tween.to(this.glowSignLabel, time, { alpha: ZERO }, _dlabelGlow);
		} else {
			_tween.to(this.textLabel, time, { alpha: ZERO }, _dlabelGlow);
			_tween.to(this.signLabel, time, { alpha: ZERO }, _dlabelGlow);
			_tween.to(this.glowLabel, time, { alpha: GLOW_OUT_FINAL_ALPHA }, _dlabelGlow);
			if (this.isSignMagnitude) {
				_tween.to(this.glowSignLabel, time, { alpha: GLOW_OUT_FINAL_ALPHA }, _dlabelGlow);
			}
		}
	}

	glowAsStart (time = DEFAULT_GLOW_OUT_TIME, _labelGlow, tween) {
		let _tween = VALIDATE.defaultArg(tween, this.arena.tween);
		let _dlabelGlow = VALIDATE.defaultArg(_labelGlow, this.arena.tween.addUniqueLabel('glowOutLabel'));
		_tween.to(this.textLabel, time, { alpha: ONE }, _dlabelGlow);
		if (this.isSignMagnitude) {
			_tween.to(this.signLabel, time, { alpha: ONE }, _dlabelGlow);
		}
		_tween.to(this.glowLabel, time, { alpha: ZERO }, _dlabelGlow);
		_tween.to(this.glowSignLabel, time, { alpha: ZERO }, _dlabelGlow);
	}

	setupGlowOut () {
		this.isInGlowState = false;
		this.glowLabel.alpha = ZERO;
		this.glowSignLabel.alpha = ZERO;
		this.textLabel.alpha = ONE / TWO;
		if (this.isSignMagnitude) {
			this.signLabel.alpha = ONE / TWO;
		}
	}

	setupGlowAsStart () {
		this.glowLabel.alpha = ZERO;
		this.glowSignLabel.alpha = ZERO;
		this.textLabel.alpha = ONE;
		if (this.isSignMagnitude) {
			this.signLabel.alpha = ONE;
		}
	}

	// -------------------------------------------------------------------------
	// overrides and sdk related
	// -------------------------------------------------------------------------

	_onThemeChange () {
		// return;
		// const glowableSettings = this.extractStyleStatic(this.arena.theme, 'glowableSettings');
		// const colorStyleName = glowableSettings.glowableText.colorStyleName;
		// const redStyleName = glowableSettings.glowableText.redStyleName;
		// const fontAlpha = glowableSettings.glowableText.alpha;

		// const updateStyles = (style, setAlpha) => {
		// 	this.signLabel.style = style;
		// 	this.textLabel.style = style;
		// 	if (setAlpha) {
		// 		if (this.isSignMagnitude) {
		// 			this.signLabel.alpha = fontAlpha;
		// 		}
		// 		this.textLabel.alpha = fontAlpha;
		// 	}
		// };

		// switch (this.textLabel.style.uid) {
		// 	// if using some color style
		// 	case this.colorStyle.uid:
		// 	case this.colorStyleHC.uid:
		// 		updateStyles(this[colorStyleName], true);
		// 		break;
		// 	// if using some red style
		// 	case this.redStyle.uid:
		// 	case this.redStyleHC.uid:
		// 		updateStyles(this[redStyleName]);
		// 		break;

		// 	default:
		// 		break;
		// }
	}

	/**
	 * Destroy the shape
	 */
	destroy (options) {
		super.destroy(options);
		this.eventEmitter.removeListener(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChange, this);
	}

	extractStyleStatic (theme, name) {
		let styleObj = theme.getStyles(name);
		let _style;
		if (!styleObj) {
			styleObj = styles;
			let styleToUse = styles.styleToUse;
			_style = styleObj.hasOwnProperty(styleToUse) ? styleObj[styleToUse] : styleObj['default'];
		} else {
			let styleToUse = styleObj.styleToUse;
			_style = styleObj.hasOwnProperty(styleToUse) ? styleObj[styleToUse] : styleObj['default'];
		}
		return _style;
	}
}

export const styles = {
	'styleToUse': 'default',
	'default': {
		'glowFillColor': COLOR.WHITE
	},
	'tactile': {
		'glowFillColor': COLOR.BLACK
	}
};
