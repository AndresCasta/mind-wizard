// import { GlowableText } from '../GlowableText';
// import { OPERATIONS } from './SingleMathExpression'
import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';

export class TextUtils {
    /**
	 * Copy a text label given an original label, and replace some of its current values in the new copied instance
	 * @param {MindPixiText} original Original text label
	 * @param {{text:string, x:number, y:number, anchorX:number, anchorY:number, alpha:number, style}} options Replace original text label values by new values provided, this options are optional
	 * @returns {MindPixiText} Copy of mind pixi text
	 */
	static copyTextLabel (original, options = {}) {
		let text = options.text || original.text;
		let x = options.x || original.x;
		let y = options.y || original.y;
		// let width = options.width || original.width;
		// let height = options.height || original.height;
		let anchorX = options.anchorX || original.anchor.x;
		let anchorY = options.anchorY || original.anchor.y;
		let alpha = options.alpha || original.alpha;
		let style = options.style; // || { fontSize: style.fontSize, fill: style.fillColor, align: 'center' }; ;

		let copyText = new MindPixiText(text, style);
		copyText.x = x;
		copyText.y = y;
		// copyText.width = width;
		// copyText.height = height;
		copyText.anchor.x = anchorX;	copyText.anchor.y = anchorY;
		copyText.alpha = alpha;
		return copyText;
	}

	/**
	 * Create a simple MindPixiText label
	 * @param {string} text string for current text label
	 * @param {*} style style object
	 * @returns {MindPixiText} Reference to currently created text label
	 */
	static createTextLabel (text, style) {
		let textLabel = new MindPixiText(text, style);
		textLabel.x = 0;			    textLabel.y = 0;
		textLabel.anchor.x = 0.5;		textLabel.anchor.y = 0.5;
		return textLabel;
	}

	static unicodeMultiplication () {
		return '\u00d7';
	}

	static unicodeDivision () {
		return '\u00F7';
	}

	/**
	 *
	 * @param {OPERATIONS} _operation Generate a text label for multiplication or sum
	 * @param {*} style The style of expected operation
	 * @returns {MindPixiText} Text label containing a math operation character
	 */
	static genOperationLabel (_operation, style) {
		let opChar = '';
		let _style = Object.assign({}, style);
		if (_operation === '*') { // standard ascii asterisk
			opChar = '\u00d7'; // unicode multiplication sign
			_style.fontSize *= 1.08;
		} else if (_operation === '+') { // standard ascii sum
			opChar = '+'; // standard ascii sum
		} else if (_operation === '/') { // standars ascii slash
			opChar = '\u00F7';
		}

		let _opTextLabel = new MindPixiText(opChar, _style);
		_opTextLabel.x = 0;			    _opTextLabel.y = 0;
		_opTextLabel.anchor.x = 0.5;	_opTextLabel.anchor.y = 0.5;
		return _opTextLabel;
        // this.addChild(this._opTextLabel);
	}

	// /**
	//  *
	//  * @param {OPERATIONS} operation Generate a text label for multiplication or sum using GlowableText labels
	//  * @param {*} style The style of expected operation
	//  */
	// static genGlowableOperationLabel (_operation, style, mainView) {
	// 	let opChar = '';
	// 	let _style = Object.assign({}, style);
    //     if (_operation === OPERATIONS.MUL) {
    //         opChar = '\u00d7';
    //         _style.fontSize *= 1.08;
    //     } else if (_operation === OPERATIONS.ADD) {
    //         opChar = '+';
	// 	}

	// 	let _opTextLabel = new GlowableText(opChar, _style, mainView);
	// 	return _opTextLabel
	// }

	/**
	 * Returns a style object for a MindPixiText given a theme object
	 * @param {object} themObj object for extracting theme data
	 * @returns {object} Font theme object
	 */
	static styleFromTheme (themObj) {
		return { fontSize: themObj.fontSize, fill: themObj.fillColor, align: 'center' };
	}
}
