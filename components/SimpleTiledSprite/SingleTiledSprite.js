import { ThemableSprite } from "./ThemableSprite";
import { MindTextureManager } from 'mind-sdk/MindTextureManager';
import { VALIDATE } from "./VALIDATE";

export class SingleTiledSprite extends ThemableSprite {
	constructor (options = {}, mindObjectOptions) {
		super(undefined, mindObjectOptions);
		this._style = {};
		if (options.hasOwnProperty('style')) { // dont look in the prototype chain.
			this._style = options.style;
			VALIDATE._ASSERT(this._style.resourceId, 'Resource id should be defined in the style object.');
		}
		this._initialWidth = this._style.width || 100;
		this._initialHeight = this._style.height || 100;
		this._setup();
	}

	_setup () {
		const tiledTexture = this.createTillingTexture(this._style.resourceId, this._initialWidth, this._initialHeight);
		this.texture = tiledTexture;
	}

	get width () {
		return super.width;
	}

	set width (value) {
		const newWidth = value;
		const tiledTexture = this.createTillingTexture(this._style.resourceId, newWidth);
		this.texture = tiledTexture;
	}

	get height () {
		return super.height;
	}

	set height (value) {
		const newHeight = value;
		const tiledTexture = this.createTillingTexture(this._style.resourceId, undefined, newHeight);
		this.texture = tiledTexture;
	}

	createTillingTexture (resourceId, width = this.width, height = this.height) {
		let id = `${resourceId}_w${width}_h${height}`;
		let texture = MindTextureManager.getTexture(id);
		if (!texture) {
			let tilingStartTexture = this.resources[resourceId].texture;
			let _PIXI = this.arena.PIXI;
			let tilingSprite = new _PIXI.extras.TilingSprite(
				tilingStartTexture,
				width,
				height
			);

			const RESOLUTION_SCALE = 2;
			let renderTexture = _PIXI.RenderTexture.create(width, height, undefined, RESOLUTION_SCALE);
			this.arena.app.renderer.render(tilingSprite, renderTexture);

			texture = renderTexture;
			MindTextureManager.saveTexture(id, texture);
		}

		return texture;
	}
}