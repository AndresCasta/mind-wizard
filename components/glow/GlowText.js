import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
import { MindUtils } from 'mind-sdk/MindUtils';

import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';

const ZERO = 0;
const ONE = 1;
const HALF = 0.5;
const DEFAULT_GLOW_IN_TIME = 0.4;
const DEFAULT_GLOW_OUT_TIME = 0.01;

// bound related
const DEBUG_BOUNDS = false;

/**
 * Class used to create 'glowable' and 'themable' text and manage `MindPixiText` instances smoothly through composition,
 * this class tries to instance as much as necessary and as little as possible `MindPixiText` objects,
 * `GlowText` also manages theme updating using the mind ThemeEngine v2.0
 *
 * @class
 * @extends MindPixiContainer
 */
export class GlowText extends MindPixiContainer {
	constructor (text = undefined, themeStyleId = 'defaultFontStyle', mindObjectOptions) {
		super(mindObjectOptions);

        // Unpack
		this._text = text + '';
		this._themeStyleId = themeStyleId;
		this._style = this._extractStyle(this.arena.theme);
		this._originalEmptySpaceBottom = 9; // was calculated using this.text=10 and fontsize=44
		this._isGlowText = true; // used to fast check if a GlowText is... a GlowText!

		// Visuals
		this._mainTextLabel = new MindPixiText('', this.mainStyle);
		this._blueTextLabel = null;
		this._redTextLabel = null;
		this._whiteTextLabel = null;
		this._boundsLayer = null;

        // assign text
		this.text = this._text;

		// Add children
		if (DEBUG_BOUNDS) {
			this._boundsLayer = new this.arena.PIXI.Graphics();
			this.addChild(this._boundsLayer);
		}
		this._setupMainText();
	}

	destroy (options) {
		// Reduce memory usage
		if (this._mainTextLabel) { this._mainTextLabel.destroy(true); this._mainTextLabel = null; }
		if (this._blueTextLabel) { this._blueTextLabel.destroy(true); this._blueTextLabel = null; }
		if (this._redTextLabel) { this._redTextLabel.destroy(true); this._redTextLabel = null; }
		if (this._whiteTextLabel) { this._whiteTextLabel.destroy(true); this._whiteTextLabel = null; }

		super.destroy(options);
	}

	render () {
		this.updateStyles();
	}

	_drawBoundsLayer () {
		if (!DEBUG_BOUNDS) return;
		const lineColor = 0xff0000;
		const lineWidth = 1;
		const ZERO = 0;
		const TWO = 2;
		const THREE = 3;

        // remove from container so bounds not contributes width to this container
		const bound = this._boundsLayer;
		bound.name = 'Bounds layer';
		bound.position.set(ZERO);
		this.removeChild(bound);

		const width = this.width;
		const height = this.height;

        // draw bound again
		bound.clear();
		bound.lineStyle(lineWidth, lineColor, DEBUG_BOUNDS);
		bound.drawRect(-width / TWO, -height / TWO, width, height);
		bound.drawCircle(ZERO, ZERO, THREE);
		bound.moveTo(-width / TWO, ZERO).lineTo(width / TWO, ZERO);

        // add bound layer at index 0, again
		this.addChildAt(bound, ZERO);
	}

	_setupMainText () {
		this._mainTextLabel.name = 'Main text layer';
		this._mainTextLabel.anchor.set(HALF);
		this.addChild(this._mainTextLabel);
	}

	_setupBlueText () {
		this._blueTextLabel = new MindPixiText(this.textMagnitude || this.text, this.blueStyle);
		this._blueTextLabel.name = 'Blue text layer';
		this._blueTextLabel.anchor.set(HALF);
		this._blueTextLabel.alpha = ZERO;
		this._blueTextLabel.position = this._mainTextLabel.position;
		this.addChild(this._blueTextLabel);
		this.updateBlueStyle();
	}

	_setupRedText () {
		this._redTextLabel = new MindPixiText(this.textMagnitude || this.text, this.redStyle);
		this._redTextLabel.name = 'Red text layer';
		this._redTextLabel.anchor.set(HALF);
		this._redTextLabel.alpha = ZERO;
		this._redTextLabel.position = this._mainTextLabel.position;
		this.addChild(this._redTextLabel);
		this.updateRedStyle();
	}

	_setupWhiteText () {
		this._whiteTextLabel = new MindPixiText(this.textMagnitude || this.text, this.whiteStyle);
		this._whiteTextLabel.name = 'White text layer';
		this._whiteTextLabel.anchor.set(HALF);
		this._whiteTextLabel.alpha = ZERO;
		this._whiteTextLabel.position = this._mainTextLabel.position;
		this.addChildAt(this._whiteTextLabel, ZERO);
		this.updateWhiteStyle();
	}

	updateStyles () {
		this.updateMainStyle();
		this.updateBlueStyle();
		this.updateRedStyle();
		this.updateWhiteStyle();
		this._drawBoundsLayer();
	}

	updateMainStyle () {
		this._mainTextLabel.style = this.mainStyle;
	}

	updateBlueStyle () {
		if (!this._blueTextLabel) return;
		this._blueTextLabel.style = this.blueStyle;
	}

	updateRedStyle () {
		if (!this._redTextLabel) return;
		this._redTextLabel.style = this.redStyle;
	}

	updateWhiteStyle () {
		if (!this._whiteTextLabel) return;
		this._whiteTextLabel.style = this.whiteStyle;
	}

	fadeInBlueGlow (duration, labelGlow) {
		if (!this._blueTextLabel) this._setupBlueText();

		const t = duration || DEFAULT_GLOW_IN_TIME;
		this.arena.tween.to(this._blueTextLabel, t, { alpha: 1 }, labelGlow);
	}

	fadeOutBlueGlow (duration, labelGlow) {
		const t = duration || DEFAULT_GLOW_OUT_TIME;
		this.arena.tween.to(this._blueTextLabel, t, { alpha: 0 }, labelGlow);
	}

	fadeInIncorrect (duration, labelGlow) {
		if (!this._redTextLabel) this._setupRedText();

		const t = duration || DEFAULT_GLOW_IN_TIME;
		this.arena.tween.to(this._redTextLabel, t, { alpha: 1 }, labelGlow);
	}

	fadeOutIncorrect (duration, labelGlow) {
		const t = duration || DEFAULT_GLOW_OUT_TIME;
		this.arena.tween.to(this._redTextLabel, t, { alpha: 0 }, labelGlow);
	}

	fadeInWhiteGlow (duration, labelGlow) {
		if (!this._whiteTextLabel) this._setupWhiteText();

		const t = duration || Number.EPSILON;
		this.arena.tween.to(this._whiteTextLabel, t, { alpha: 1 }, labelGlow);
	}

	fadeOutWhiteGlow (duration, labelGlow) {
		const t = duration || DEFAULT_GLOW_OUT_TIME;
		this.arena.tween.to(this._whiteTextLabel, t, { alpha: 0 }, labelGlow);
	}

	fitTextHorizontally (newWidth) {
        // this is a proportion rule
        // originalFontSize = this.width
        // unknowFontSize   = newWidth
        // unknowFontSize   = originalFontSize * newWidth / this.width
		const scale = newWidth / this.width;
		this.fontSize = this.fontSize * scale;
	}

	fitTextVertically (newHeight) {
        // this is a proportion rule
        // originalFontSize = this.height
        // unknowFontSize   = newHeight
        // unknowFontSize   = originalFontSize * newHeight / this.height
		const scale = newHeight / this.height;
		this.fontSize = this.fontSize * scale;
	}

	calculateEmptySpace () {
		const pText = this._mainTextLabel;
		const visibleBounds = pText.getVisibleBounds();
		const emptySpaceTop = visibleBounds.minY;
		const emptySpaceBottom = pText.height - visibleBounds.maxY;
		const emptySpaceLeft = visibleBounds.minX;
		const emptySpaceRight = pText.width - visibleBounds.maxX;

		// calculate empty space at left, top, right, bottom sides of text
		return {
			emptySpaceTop,
			emptySpaceBottom,
			emptySpaceLeft,
			emptySpaceRight,
			visibleHeight: pText.height - emptySpaceTop - emptySpaceBottom
			// visibleWidth: this.width - emptySpaceLeft - emptySpaceRight
		};
	}

	_setTextX (x) {
		this._mainTextLabel.x = x;
		if (this._blueTextLabel) this._blueTextLabel.x = x;
		if (this._redTextLabel) this._redTextLabel.x = x;
		if (this._whiteTextLabel) this._whiteTextLabel.x = x;
	}

	_calcProportionalOffset (yOffset) {
        // ORIGINAL_FONT_SIZE   -> yOffset
        // this.fontSize        -> newOffset
		const ORIGINAL_FONT_SIZE = 44; // test arbitrary made with font size = 44
		return yOffset * this.fontSize / ORIGINAL_FONT_SIZE;
	}

	_setText (textStr) {
		this._mainTextLabel.text = textStr;
		if (this._blueTextLabel) this._blueTextLabel.text = textStr;
		if (this._redTextLabel) this._redTextLabel.text = textStr;
		if (this._whiteTextLabel) this._whiteTextLabel.text = textStr;
	}

	_setAttr (attrName, value) {
        // standard text labels
		this._mainTextLabel[attrName] = value;
		if (this._blueTextLabel) this._blueTextLabel[attrName] = value;
		if (this._redTextLabel) this._redTextLabel[attrName] = value;
		if (this._whiteTextLabel) this._whiteTextLabel[attrName] = value;
	}

	clone (parent) {
		const text = new GlowText(this.text, this._themeStyleId);
		const globalPos = this.toGlobal({ x: 0, y: 0 });
		text.fontSize = this.fontSize;

		if (parent) {
			const finalPos = parent.toLocal(globalPos);
			text.position.set(finalPos.x, finalPos.y);
			parent.addChild(text);
			return text;
		}

		text.position.set(globalPos.x, globalPos.y);
		return text;
	}

	set fontSize (value) {
		this._setAttr('fontSize', value);

		// redraw text (update positioning)
		this.text = this._text;
	}

	get fontSize () {
		return this._mainTextLabel.fontSize;
	}

	set text (value) {
        // cast value to string
		let textStr = value + '';
		this._text = textStr;
		this._setText(textStr);
	}

	get text () {
		return this._text;
	}

	get emptySpaceBottom () {
		// calculate transparent height at bottom using a proportion rule
		// test using this.text = 10;
		const ORIGINAL_FONT_SIZE = 44;	const ORIGINAL_EMPTY_SPACE = this._originalEmptySpaceBottom;
		return this.fontSize * ORIGINAL_EMPTY_SPACE / ORIGINAL_FONT_SIZE;
	}

	set style (value) {
		const errMessage = `You should not change style of text after instanced,
		instead instance another text with the desired style,
		this will solve a lot of tweening issues and avoid
		the use of tween callbacks.`;
		throw new Error(errMessage);
		// this.originalStyle = Object.assign({}, value);
		// this.updateStyles();
	}

	get style () {
		return this._mainTextLabel.style;
	}

	get mainStyle () {
		const styleObj = this._style;

		// if mainTextLabel is not yet created let's use theme defined fontSize
		if (this._mainTextLabel) {
			// theme defined fontSize is different than current mainTextLabel.fontSize,
			// so let's ignore theme font size and use current mainTextLabel.fontSize instead
			if (styleObj.fontSize !== this._mainTextLabel.fontSize) styleObj.fontSize = this._mainTextLabel.fontSize;
		}

		return styleObj;
	}

	get blueStyle () {
		const newStyle = Object.assign({}, this.mainStyle);
		if (newStyle.fill !== 'transparent') newStyle.fill = this.blue;
		if (newStyle.strokeThickness) newStyle.stroke = this.blue;
		return newStyle;
	}

	get redStyle () {
		const newStyle = Object.assign({}, this.mainStyle);
		if (newStyle.fill !== 'transparent') newStyle.fill = this.red;
		if (newStyle.strokeThickness) newStyle.stroke = this.red;
		return newStyle;
	}

	get whiteStyle () {
		const whiteStrokeThickness = 3;
		const newStyle = Object.assign({}, this.mainStyle);
		newStyle.fill = this.white;
		newStyle.stroke = this.white;
		newStyle.strokeThickness = whiteStrokeThickness;
		return newStyle;
	}

	get blue () {
		const colorPalette = this.arena.theme.getStyles('colorPalette');
		return colorPalette.raw.colors.FRICK_BLUE;
	}

	get red () {
		const colorPalette = this.arena.theme.getStyles('colorPalette');
		return colorPalette.raw.colors.INCORRECT_TEXT;
	}

	get white () {
		const colorPalette = this.arena.theme.getStyles('colorPalette');
		return colorPalette.raw.colors.WHITE;
	}

	_extractStyle (theme) {
		// Does nothing if _styleId is not defined... this occurs when the
		// MindGameObject super.constructor tries to extract the styles for this component.
		if (!this._themeStyleId) return;

		let styleId = this._themeStyleId;
		const styleIdSeparatorIndex = styleId.indexOf('/');
		if (styleIdSeparatorIndex > ZERO) {
			styleId = this._themeStyleId.substring(ZERO, styleIdSeparatorIndex);
			const fontStylePath = this._themeStyleId.substring(styleIdSeparatorIndex + ONE);
			const style = theme.getStyles(styleId);
			const fontStyle = MindUtils.getValSlashIterator(fontStylePath, style);
			return fontStyle;
		} else {
			return theme.getStyles(styleId);
		}
	}

	static getDefaultThemeData () {
		return styles;
	}
}

// Default styles for this component.
export const styles = {
	'fontSize': 42,
	'fill': '::styles.colorPalette.raw.colors.BLACK',
	'alpha': '::styles.colorPalette.raw.alpha.SOLID'
};
