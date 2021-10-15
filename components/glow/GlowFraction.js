import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
import { GlowLine } from './GlowLine';
import { GlowText } from './GlowText';

// some magic numbers
const ZERO = 0;
const TWO = 2;
const DEFAULT_GLOW_IN_TIME = 0.4;
const DEFAULT_GLOW_OUT_TIME = 0.01;

// bound related
const DEBUG_BOUNDS = false;

export class GlowFraction extends MindPixiContainer {
	constructor (numerator = '1', denominator = '1', themeStyleId = 'defaultFontStyle', mindObjectOptions) {
		super(mindObjectOptions);

        // Data
		this._numerator = '';
		this._denominator = '';
		this._themeStyleId = themeStyleId;
		this._isGlowFraction = true;

        // Visuals
		this._numeratorLabel = new GlowText('1', themeStyleId);
		this._denominatorLabel = new GlowText('1', themeStyleId);
		this._line = new GlowLine(this._numeratorLabel);
		this._boundsLayer = null;
		this._setupLayers();

        // assign numerator and denominator
		this.numerator = numerator;
		this.denominator = denominator;
	}

	_setupLayers () {
		if (DEBUG_BOUNDS) {
			this._boundsLayer = new this.arena.PIXI.Graphics();
			this.addChild(this._boundsLayer);
		}

		this._numeratorLabel.anchor = this._denominatorLabel.anchor = { x: 0.5, y: 0.5 };
		this.addChild(this._numeratorLabel);
		this.addChild(this._denominatorLabel);
		this.addChild(this._line);

		this._numeratorLabel.name = 'Numerator label';
		this._denominatorLabel.name = 'Denominator label';
		this._line.name = 'Line Graphic';
	}

	_updateTextLabels () {
		this._numeratorLabel.text = this._numerator;
		this._denominatorLabel.text = this._denominator;

		this._updateChildrenPosition();
		this._drawBoundsLayer();
	}

	_updateChildrenPosition () {
        // Positionate vertically numerator and denominator
		const wider = Math.max(this._numeratorLabel.width, this._denominatorLabel.width);
		this._numeratorLabel.y = -this._numeratorLabel.height / TWO;
		this._denominatorLabel.y = this._denominatorLabel.height / TWO;

        // Re-draw the fraction line
		this._line.updateLines(wider);
	}

	_calcProportionalOffset (yOffset) {
        // ORIGINAL_FONT_SIZE   -> yOffset
        // this.fontSize        -> newOffset
		const ORIGINAL_FONT_SIZE = 44; // this test was arbitrary made with font size = 44
		return yOffset * this.fontSize / ORIGINAL_FONT_SIZE;
	}

	_drawBoundsLayer () {
		if (!DEBUG_BOUNDS) return;
		const bound = this._boundsLayer;
		const lineWidth = 1;
		const lineColor = 0xff0000;
		const THREE = 3;

		// remove from container so bounds not contributes width to this container
		this.removeChild(bound);

		bound.name = 'Bounds layer';
		bound.position.set(ZERO);

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

	fadeInBlueGlow (duration, labelGlow) {
		duration = duration || DEFAULT_GLOW_IN_TIME;
		labelGlow = labelGlow === undefined ? this.arena.tween.addUniqueLabel('fadeInBlueGlow') : labelGlow;

		this._numeratorLabel.fadeInBlueGlow(duration, labelGlow);
		this._denominatorLabel.fadeInBlueGlow(duration, labelGlow);
		this._line.fadeInBlueGlow(duration, labelGlow);
	}

	fadeOutBlueGlow (duration, labelGlow) {
		duration = duration || DEFAULT_GLOW_OUT_TIME;
		labelGlow = labelGlow === undefined ? this.arena.tween.addUniqueLabel('fadeOutBlueGlow') : labelGlow;

		this._numeratorLabel.fadeOutBlueGlow(duration, labelGlow);
		this._denominatorLabel.fadeOutBlueGlow(duration, labelGlow);
		this._line.fadeOutBlueGlow(duration, labelGlow);
	}

	fadeInIncorrect (duration, labelGlow) {
		duration = duration || DEFAULT_GLOW_IN_TIME;
		labelGlow = labelGlow === undefined ? this.arena.tween.addUniqueLabel('fadeInIncorrect') : labelGlow;

		this._numeratorLabel.fadeInIncorrect(duration, labelGlow);
		this._denominatorLabel.fadeInIncorrect(duration, labelGlow);
		this._line.fadeInIncorrect(duration, labelGlow);
	}

	fadeOutIncorrect (duration, labelGlow) {
		duration = duration || DEFAULT_GLOW_OUT_TIME;
		labelGlow = labelGlow === undefined ? this.arena.tween.addUniqueLabel('fadeOutIncorrect') : labelGlow;

		this._numeratorLabel.fadeOutIncorrect(duration, labelGlow);
		this._denominatorLabel.fadeOutIncorrect(duration, labelGlow);
		this._line.fadeOutIncorrect(duration, labelGlow);
	}

	fadeInWhiteGlow (duration, labelGlow) {
		duration = duration || DEFAULT_GLOW_IN_TIME;
		labelGlow = labelGlow === undefined ? this.arena.tween.addUniqueLabel('fadeInWhiteGlow') : labelGlow;

		this._numeratorLabel.fadeInWhiteGlow(duration, labelGlow);
		this._denominatorLabel.fadeInWhiteGlow(duration, labelGlow);
		this._line.fadeInWhiteGlow(duration, labelGlow);
	}

	fadeOutWhiteGlow (duration, labelGlow) {
		duration = duration || DEFAULT_GLOW_OUT_TIME;
		labelGlow = labelGlow === undefined ? this.arena.tween.addUniqueLabel('fadeOutWhiteGlow') : labelGlow;

		this._numeratorLabel.fadeOutWhiteGlow(duration, labelGlow);
		this._denominatorLabel.fadeOutWhiteGlow(duration, labelGlow);
		this._line.fadeOutWhiteGlow(duration, labelGlow);
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

	clone (parent) {
		const fraction = new GlowFraction(this.numerator, this.denominator, this.originalStyle);
		const globalPos = this.toGlobal({ x: 0, y: 0 });
		fraction.fontSize = this.fontSize;

		if (parent) {
			const finalPos = parent.toLocal(globalPos);
			fraction.position.set(finalPos.x, finalPos.y);
			parent.addChild(fraction);
			return fraction;
		}

		fraction.position.set(globalPos.x, globalPos.y);
		return fraction;
	}

	set numerator (value) {
		// Update fields (the drawing will be updated only when denominator gets updated)
		this._numerator = value;
	}

	get numerator () {
		return this._numerator;
	}

	set denominator (value) {
        // Update fields
		this._denominator = value;

        // Update all text labels, the fraction gets updated only when denominator setter is used
		this._updateTextLabels();
	}

	get denominator () {
		return this._denominator;
	}

	set fontSize (value) {
		this._numeratorLabel.fontSize = value;
		this._denominatorLabel.fontSize = value;
		this._line.fontSize = value;

        // calculate positions and update debug layer
		this.denominator = this._denominator;
	}

	get fontSize () {
		return this._numeratorLabel.fontSize;
	}

	get emptySpaceBottom () {
		return this._denominatorLabel.emptySpaceBottom;
	}
}
