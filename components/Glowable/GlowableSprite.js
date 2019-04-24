import { GlowableObject } from './GlowableObject';
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { drawSVGOutlineToGraphic } from 'mind-game-components/utils/SVGLib';
import { VALIDATE } from '../VALIDATE';

const GLOW_OUT_FINAL_ALPHA = 1;

const ZERO = 0;
const ONE = 1;
const DEFAULT_GLOW_IN_TIME = 0.4;
const DEFAULT_GLOW_OUT_TIME = 0.01;

/**
 * Glowable sprite.
 * @export
 * @class GlowableSprite
 * @extends {GlowableObject}
 */
export class GlowableSprite extends GlowableObject {
    /**
     * Returns width of bounding box for current glowableObject
     */
	get colliderWidth () {
		return this.defaultLayer.width;
	}

    /**
     * Returns width of bounding box for current glowableObject
    */
	get colliderHeight () {
		return this.defaultLayer.height;
	}

	constructor (texture, mindObjectOptions) {
		super(mindObjectOptions);

		// sprite for white texture
		this.glowLayer = new MindPixiGraphics();
		this.addChild(this.glowLayer);
		this.glowLayer.alpha = ZERO;

		// sprite for black texture
		this.defaultLayer = new MindPixiSprite(texture);
		this.addChild(this.defaultLayer);

		// sprite for color texture
		this.frontLayer = new MindPixiSprite();
		this.addChild(this.frontLayer);

		this.blackTexture = null;
		this.colorTexture = null;
		this.colorGroupTexture = null;

		this._resourceRef = null;

		super.calculateSize();
		this.eventEmitter.on(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChange, this);
	}

	/**
	 * Destroy the shape
	 */
	destroy (options) {
		super.destroy(options);
		this.eventEmitter.removeListener(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChange, this);
	}

	render () {
		super.render();
	}

	// -------------------------------------------------------------------------
	// color helpers
	// -------------------------------------------------------------------------

	useColorTexture (obj = {}) {
		const glowableSettings = this.extractStyleStatic(this.arena.theme, 'glowableSettings');
		const currentAlpha = glowableSettings.glowableSprite.alpha;
		const currentTint = glowableSettings.glowableSprite.tint;

		let useTexture = null;
		if (obj.isInsideGroup) {
			useTexture = this.colorGroupTexture;
		} else {
			useTexture = this.colorTexture;
		}

		// check texture existence
		if (!useTexture) {
			// simply set tint to white
			this.defaultLayer.tint = 0xffffff;
			return;
		}

		this.frontLayer.texture = useTexture;
		this.frontLayer.alpha = ONE;
		this.defaultLayer.alpha = ZERO;

		this.frontLayer.tint = currentTint;
		this.frontLayer.alpha = currentAlpha;
	}

	useBlackTexture () {
		const glowableSettings = this.extractStyleStatic(this.arena.theme, 'glowableSettings');
		const currentTint = glowableSettings.glowableSprite.tint;

		// check texture existence
		if (!this.colorGroupTexture && !this.colorTexture) {
			// simply set tint to white
			this.defaultLayer.tint = 0x0;
			return;
		}

		this.frontLayer.alpha = ZERO;
		this.defaultLayer.alpha = ONE;
		this.frontLayer.tint = currentTint;
	}

	_onThemeChange () {
		const glowableSettings = this.extractStyleStatic(this.arena.theme, 'glowableSettings');
		const currentTint = glowableSettings.glowableSprite.tint;
		this.frontLayer.tint = currentTint;
	}

	// -------------------------------------------------------------------------
	// glow related helpers
	// -------------------------------------------------------------------------

	initGlowLayer (resource) {
		this._resourceRef = resource;
		this.glowLayer.lineStyle(styles.glowWidth, styles.glowColor, styles.glowAlpha);
		this.glowLayer.beginFill(ZERO, ZERO);

		drawSVGOutlineToGraphic(resource, 'outline', this.glowLayer);
	}

	glowIn (time = DEFAULT_GLOW_IN_TIME, _labelGlow, tween) {
		let _tween = VALIDATE.defaultArg(tween, this.arena.tween);
		let _dlabelGlow = VALIDATE.defaultArg(_labelGlow, this.arena.tween.addUniqueLabel('glowInLabel'));

		_tween.to(this.glowLayer, time, { alpha: ONE }, _dlabelGlow);
	}

	glowOut (time = DEFAULT_GLOW_OUT_TIME, _labelGlow, tween) {
		let _tween = VALIDATE.defaultArg(tween, this.arena.tween);
		let _dlabelGlow = VALIDATE.defaultArg(_labelGlow, this.arena.tween.addUniqueLabel('glowInLabel'));

		_tween.to(this.defaultLayer, time, { alpha: GLOW_OUT_FINAL_ALPHA }, _dlabelGlow);
		_tween.to(this.glowLayer, time, { alpha: ZERO }, _dlabelGlow);
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

const styles = {
	glowWidth: 7, // 6
	glowColor: 0xffffff,
	glowAlpha: 1
};
