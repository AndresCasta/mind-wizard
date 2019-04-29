import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';

import { COMMON_NUMBERS, COLOR } from '../Constants';

const ZERO = 0;
const ONE = 1;
const HALF = 0.5;

export class SimpleTiledSprite extends MindPixiSprite {
	constructor (options = {}, mindObjectOptions) {
		super(undefined, mindObjectOptions);

		this.cartWidth = options.tileWidth || 64;

		this.textureManager = undefined;

		this.cartContainer = undefined;
		this.cartStart = undefined;
		this.cartEnd = undefined;
		this.cartMiddle = undefined;
		this.cartMidMask = undefined;

		this.eventEmitter.on(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChanged, this);
		this.maxWidth = 800;

		// store arguments and extract styles
		this._options = options;
		this._style = options.styles || this.extractStyleStatic(this.arena.theme, options.styleId || 'simpleTiledSprite');

		this._state = SimpleTiledSprite.STATE_UP;

		this.anchor.set(HALF, HALF);

		this.createCart();
	}

	createCart () {
		let mindOptions = { Rng: this.arena.rng };
		this.cartContainer = new MindPixiContainer();

		let cartStartTexture = this.resources[this._style.resourceIdInit].texture;
		this.cartStart = new MindPixiSprite(cartStartTexture, mindOptions);
		this.cartStart.anchor.set(ONE, HALF);

		let cartEndTexture = this.resources[this._style.resourceIdEnd].texture;
		this.cartEnd = new MindPixiSprite(cartEndTexture, mindOptions);
		this.cartEnd.anchor.set(ZERO, HALF);

		this.cartMiddle = this.createTillingSprite(this._style.resourceIdMid, this.maxWidth, this.cartEnd.height);
		this.cartMiddle.anchor.set(HALF, HALF);

		this.cartMidMask = new MindPixiGraphics();
		this.cartMidMask.drawRect(-this.cartWidth * COMMON_NUMBERS.DIV_2, -this.cartMiddle.height * COMMON_NUMBERS.DIV_2, this.cartWidth, this.cartMiddle.height);
		this.cartMiddle.mask = this.cartMidMask;

		this.cartContainer.addChild(this.cartMiddle);
		this.cartContainer.addChild(this.cartMidMask);
		this.cartContainer.addChild(this.cartStart);
		this.cartContainer.addChild(this.cartEnd);

		this.drawCart();
	}

	set state (val) {
		this._state = val;
		let idCartStartTexture = this._state === SimpleTiledSprite.STATE_UP ? this._style.resourceIdInit : this._style.resourceIdInit_hover;
		let cartStartTexture = this.resources[idCartStartTexture].texture;
		this.cartStart.texture = cartStartTexture;

		let idCartEndTexture = this._state === SimpleTiledSprite.STATE_UP ? this._style.resourceIdEnd : this._style.resourceIdEnd_hover;
		let cartEndTexture = this.resources[idCartEndTexture].texture;
		this.cartEnd.texture = cartEndTexture;

		let idCartMiddleTexture = this._state === SimpleTiledSprite.STATE_UP ? this._style.resourceIdMid : this._style.resourceIdMid_hover;
		let cartMiddleTexture = this.createTillingSprite(idCartMiddleTexture, this.maxWidth, this.cartEnd.height, true);
		this.cartMiddle.texture = cartMiddleTexture;
		this.drawCart();
	}

	get state () {
		return this._state;
	}

	drawCart () {
		this.cartMidMask.clear();
		this.cartMidMask.beginFill(COLOR.BLACK);
		this.cartMidMask.drawRect(-this.cartWidth * COMMON_NUMBERS.DIV_2, -this.cartMiddle.height * COMMON_NUMBERS.DIV_2, this.cartWidth, this.cartMiddle.height);
		let maskBounds = this.cartMidMask.getLocalBounds();
		let offsetStartX = 0;
		let offsetEndX = 0;

		this.cartStart.x = maskBounds.left + offsetStartX;
		this.cartEnd.x = maskBounds.right + offsetEndX;

		this.renderCart();
	}

	set newWidth (val) {
		this.cartWidth = Math.floor(val);
		this.drawCart();
	}

	_onThemeChanged (event) {
		// store arguments and extract styles
		const options = this._options;
		this._style = options.styles || this.arena.ExtractStyle(options.styleId || 'simpleTiledSprite') || style;

		let cartStartTexture = this.resources[this._style.resourceIdInit].texture;
		this.cartStart.texture = cartStartTexture;
		let cartEndTexture = this.resources[this._style.resourceIdEnd].texture;
		this.cartEnd.texture = cartEndTexture;

		let defaultCartMiddleTexture = this.resources[this._style.resourceIdMid].texture;
		let cartMiddleTexture = this.createTillingSprite(this._style.resourceIdMid, this.maxWidth, defaultCartMiddleTexture.height, true);
		this.cartMiddle.texture = cartMiddleTexture;
		this.renderCart();
	}

	destroy (options) {
		this.cartStart.destroy(options);
		this.cartEnd.destroy(options);
		this.cartMiddle.destroy(options);
		this.cartMidMask.destroy(options);

		this.eventEmitter.removeListener(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChanged, this);

		// continue destroying this container
		super.destroy(options);
	}

	createTillingSprite (resourceId, width, height, returnTexture = false) {
		let cartStartTexture = this.resources[resourceId].texture;
		let _PIXI = this.arena.PIXI;
		let tilingSprite = new _PIXI.extras.TilingSprite(
			cartStartTexture,
			width,
			height
		);

		const RESOLUTION_SCALE = 2;
		let renderTexture = new _PIXI.RenderTexture.create(width, height, undefined, RESOLUTION_SCALE);
		this.arena.app.renderer.render(tilingSprite, renderTexture);

		if (returnTexture) {
			return renderTexture;
		} else {
			let mindOptions = { Rng: this.arena.rng };
			let sprite = new MindPixiSprite(renderTexture, mindOptions);
			return sprite;
		}
	}

	renderCart () {
		let _PIXI = this.arena.PIXI;

		this.cartContainer.x = this.cartContainer.width * COMMON_NUMBERS.DIV_2;
		this.cartContainer.y = this.cartContainer.height * COMMON_NUMBERS.DIV_2;
		const RESOLUTION_SCALE = 2;
		let renderTexture = new _PIXI.RenderTexture.create(this.cartContainer.width, this.cartContainer.height, undefined, RESOLUTION_SCALE);
		this.arena.app.renderer.render(this.cartContainer, renderTexture);

		this.texture = renderTexture;
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

SimpleTiledSprite.STATE_UP = 'up';
SimpleTiledSprite.STATE_HOVER = 'hover';


export const styles = {
	'styleToUse': 'default',
	'default': {
		// default resources id
		'resourceIdInit': '3d_platform_init',
		'resourceIdMid': '3d_platform_mid',
		'resourceIdEnd': '3d_platform_end',
		// hover resources id
		'resourceIdInit_hover': 'resourceIdInit_hover',
		'resourceIdEnd_hover': 'resourceIdEnd_hover',
		'resourceIdMid_hover': 'resourceIdMid_hover'
	},
	'tactile': {
		// default resources id
		'resourceIdInit': '3d_platform_init',
		'resourceIdMid': '3d_platform_mid',
		'resourceIdEnd': '3d_platform_end',
		// hover resources id
		'resourceIdInit_hover': 'resourceIdInit_hover_hc',
		'resourceIdEnd_hover': 'resourceIdEnd_hover_hc',
		'resourceIdMid_hover': 'resourceIdMid_hover_hc'
	}
}