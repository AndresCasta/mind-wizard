import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';

const ZERO = 0;
const TWO = 2;
const DEFAULT_GLOW_IN_TIME = 0.4;
const DEFAULT_GLOW_OUT_TIME = 0.01;

export class GlowLine extends MindPixiContainer {
	constructor (referenceGlowText, mindObjectOptions) {
		super(mindObjectOptions);

        // Data
		this._rectWidth = 20;
		this._fontSize = referenceGlowText.fontSize;
		this._rectHeight = this.proportionalLineWidth;
		this._referenceGlowText = referenceGlowText; // Used to extract distinct glow styles

        // Visuals
		this._mainGraphic = new this.arena.PIXI.Graphics();
		this._blueGraphic = null;
		this._redGraphic = null;
		this._whiteGraphic = null;

        // setup main graphic
		this._setupMainGraphic();
	}

	render () {
		this.updateLines(); // re-draw all lines
	}

	updateLines (width) {
		this._rectWidth = width !== undefined ? width : this._rectWidth;
		this._rectHeight = this.proportionalLineWidth;

		this.drawLine(this._mainGraphic, this.mainStyle);

		if (this._blueGraphic) {
			this.drawLine(this._blueGraphic, this.blueStyle);
		}

		if (this._redGraphic) {
			this.drawLine(this._redGraphic, this.redStyle);
		}

		if (this._whiteGraphic) {
			this.drawLine(this._whiteGraphic, this.whiteStyle);
		}
	}

	drawLine (graphics, fontStyle) {
        // clear graphic
		graphics.clear();

        // use style
		this.useStyle(graphics, fontStyle);

        // draw rect
		graphics.drawRect(-this._rectWidth / TWO, -this._rectHeight / TWO, this._rectWidth, this._rectHeight);
	}

	useStyle (graphics = this, fontStyle) {
        // translate a basic text style to a graphics lineStyle

        // font style defines strokeThickness?
		if (fontStyle.strokeThickness !== undefined) {
			graphics.lineStyle(fontStyle.strokeThickness, fontStyle.stroke);
		}

        // font styles defines fill?
		if (fontStyle.fill !== 'transparent') {
			graphics.beginFill(fontStyle.fill);
		}
	}

	_setupMainGraphic () {
		this._mainGraphic.name = 'Main graphic layer';
		this.addChild(this._mainGraphic);
	}

	_setupBlueGraphic () {
		this._blueGraphic = new this.arena.PIXI.Graphics();
		this._blueGraphic.name = 'Blue graphic layer';
		this._blueGraphic.alpha = ZERO;
		this.addChild(this._blueGraphic);
		this.drawLine(this._blueGraphic, this.blueStyle);
	}

	_setupRedGraphic () {
		this._redGraphic = new this.arena.PIXI.Graphics();
		this._redGraphic.name = 'Red graphic layer';
		this._redGraphic.alpha = ZERO;
		this.addChild(this._redGraphic);
		this.drawLine(this._redGraphic, this.redStyle);
	}

	_setupWhiteGraphic () {
		this._whiteGraphic = new this.arena.PIXI.Graphics();
		this._whiteGraphic.name = 'White graphic layer';
		this._whiteGraphic.alpha = ZERO;
		this.addChildAt(this._whiteGraphic, ZERO);
		this.drawLine(this._whiteGraphic, this.whiteStyle);
	}

	fadeInBlueGlow (duration, labelGlow) {
		if (!this._blueGraphic) this._setupBlueGraphic();

		const t = duration || DEFAULT_GLOW_IN_TIME;
		this.arena.tween.to(this._blueGraphic, t, { alpha: 1 }, labelGlow);
	}

	fadeOutBlueGlow (duration, labelGlow) {
		const t = duration || DEFAULT_GLOW_OUT_TIME;
		this.arena.tween.to(this._blueGraphic, t, { alpha: 0 }, labelGlow);
	}

	fadeInIncorrect (duration, labelGlow) {
		if (!this._redGraphic) this._setupRedGraphic();

		const t = duration || DEFAULT_GLOW_IN_TIME;
		this.arena.tween.to(this._redGraphic, t, { alpha: 1 }, labelGlow);
	}

	fadeOutIncorrect (duration, labelGlow) {
		const t = duration || DEFAULT_GLOW_OUT_TIME;
		this.arena.tween.to(this._redGraphic, t, { alpha: 0 }, labelGlow);
	}

	fadeInWhiteGlow (duration, labelGlow) {
		if (!this._whiteGraphic) this._setupWhiteGraphic();

		const t = duration || Number.EPSILON;
		this.arena.tween.to(this._whiteGraphic, t, { alpha: 1 }, labelGlow);
	}

	fadeOutWhiteGlow (duration, labelGlow) {
		const t = duration || DEFAULT_GLOW_OUT_TIME;
		this.arena.tween.to(this._whiteGraphic, t, { alpha: 0 }, labelGlow);
	}

	clone (parent) {
		const line = new GlowLine(this._referenceGlowText);
		const global = this.toGlobal({ x: 0, y: 0 });
		line.fontSize = this.fontSize;

		if (parent) {
			const finalPos = parent.toLocal(global);
			line.position.set(finalPos.x, finalPos.y);
			parent.addChild(global);
			return line;
		}

		line.position.set(global.x, global.y);
		return line;
	}

	get proportionalLineWidth () {
        // ORIGINAL_FONT_SIZE   -> 3px line width
        // this.fontSize        -> newLineWidth
		const ORIGINAL_FONT_SIZE = 44; // this test was arbitrary made with font size = 44
		const ORIGINAL_LINE_WIDTH = 3;
		return ORIGINAL_LINE_WIDTH * this.fontSize / ORIGINAL_FONT_SIZE;
	}

	get mainStyle () {
		return this._referenceGlowText.mainStyle;
	}

	get blueStyle () {
		return this._referenceGlowText.blueStyle;
	}

	get redStyle () {
		return this._referenceGlowText.redStyle;
	}

	get whiteStyle () {
		return this._referenceGlowText.whiteStyle;
	}

	set fontSize (value) {
		this._fontSize = value;

        // update all lines after changing font size
		this.updateLines();
	}

	get fontSize () {
		return this._fontSize;
	}

	set rectWidth (value) {
		this.updateLines(value);
	}

	get rectWidth () {
		return this._rectWidth;
	}
}
