import MindSVG from 'mind-sdk/MindSVG';
import { MindUtils } from 'mind-sdk/MindUtils';
import { VALIDATE } from './VALIDATE';

/**
 * Mixing to implement themable DisplayObjects.
 * Useful for MindPixiSprites, MindPixiTexts and AnimableSprite.
 * @param {*} superclass The class to which apply this mixin
 */
export const MixinThemable = (superclass) => class extends superclass {
	constructor (...args) {
		super(...args);

		// Default styleName
		this._styleName = 'basicThemableSprite';
		// instance style.
		this._styleObj = null; // initialized as null

		this.eventEmitter.on(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChangeMain, this);
		this._onThemeChangeMain();
	}

	get styleName () {
		return this._styleName;
	}

	set styleName (value) {
		// asserts style name is an string.
		VALIDATE.isType(value, 'string');
		this._styleName = value;
		this._onThemeChangeMain();
	}

	set themeOptions (value) {
		// check the value is an object
		if (MindUtils.isObject(value)) {
			const styleName = value.styleName;
			// does not has a defined stylename.
			if (styleName) {
				this._styleName = styleName;
			} else {
				this._styleName = 'basicThemableSprite';
				this._styleObj = value;
			}
		} else if (typeof value === 'string') {
			this._styleName = value;
		}
		// _onThemeChangeMain works differently in function of this._styleName and this._styleObj values.
		this._onThemeChangeMain();
	}

	_onThemeChangeMain (event) {
		let styles = this.extractStyleStatic(this.arena.theme, this._styleName, this._styleObj);

		if (styles.hasOwnProperty('texture')) {
			this.texture = styles.texture;
			this.tint = 0xFFFFFF; // ensures the tint sprite.
			return; // Texture property can only be seted throught the themeOptions property.
		}

		// Changes the srite tint.
		if (styles.hasOwnProperty('tint') && typeof styles.tint === 'number') {
			this.tint = styles.tint;
		}

		// Change the sprite texture.
		// The Object.prototype.hasOwnProperty() method returns a boolean value
		// indicating whether the object on which you are calling it has a property with the name
		// of the argument.
		// However, it does not look at the prototype chain of the object.
		// This way, this could be a faster option that just checking for undefined properties.
		// Full details in ES5 specs: http://es5.github.io/#x15.2.4.5
		if (styles.hasOwnProperty('resourceId')) {
			let resource = this._resourceDeferSync(styles.resourceId);
			let textureToUse = resource.texture;
			if (!textureToUse) throw new Error('It seems like the high contrast texture is not defined.');
			this.texture = textureToUse;
			this.tint = 0xFFFFFF;
		}

		if (styles.hasOwnProperty('alpha')) {
			this.alpha = styles.alpha;
		}

		if (styles.hasOwnProperty('visible')) {
			this.visible = styles.visible;
		}
	}

		/**
	 * Loads an asset that is in defer mode, this ensures the svg and texture gets loaded
	 *
	 * Keep in mind that this method returns an promise.
	 * @param {*} position The part position
	 * @param {*} resourceId Texture name to use for the part
	 * @param {*} isLeg Is this part a leg?
	 * @param {*} alignment Sprite alignment (by default is 0.5)
	 */
	_resourceDeferSync (resourceId) {
		// See about defer loading here: https://confluence.mindresearch.org/display/WP/Defer+Loading+of+SVGs#DeferLoadingofSVGs-IntervalLoadingDeferredAssets
		// See about this work around here: https://confluence.mindresearch.org/display/WP/Defer+loading+known+issues
		// looks like this is an unresolved issue from 2018
		// console.log(`---------------------------------------------------`);
		// console.log(`_createSpriteDefer() ${resourceId}`);
		let resource = this.resources[resourceId];
		// when an asset is loaded in defer mode its svg is not loaded by the AssetLoader
		// then you can't query elements id from that svg until the asset gets loaded (by calling the getTextureSync() method.).
		if (!resource.texture) { // asset hasn't been loaded yet.
			// console.log(`_createSpriteDefer() ${resourceId} not loaded yet, starting defer loading...`);
			let svg = MindSVG.fromResource(this.resources[resourceId]);
			try {
				svg.getTextureSync(); // get texture returns an thenable object
				// Below line is unnecesary, since the svg.getTextureSync() method will register the texture automatically when the svg is in defer loading.
				// to confirm this, uncomment the logs in this method.
				// this.resources[resourceId].texture = texture;
				// console.log(`_createSpriteDefer() ${resourceId} ...loaded.`);
			} catch (err) {
				console.error(`${resourceId} failed!\n${err}`);
			}
		}

		return resource;
	}

	destroy (options) {
		this.eventEmitter.removeListener(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChangeMain, this);

		// continue destroying this container
		super.destroy(options);
	}

	extractStyleStatic (theme, name, instanceStyle) {
		let styleObj = theme.getStyles(name);
		let _style;
		// Use the style defined inside this file if it's not registered in the arena..
		if (!styleObj) {
			styleObj = styles;
		}

		let styleToUse = styleObj.styleToUse;

		if (instanceStyle) {
			_style = instanceStyle.hasOwnProperty(styleToUse) ? instanceStyle[styleToUse] : instanceStyle['default'];
		} else {
			_style = styleObj.hasOwnProperty(styleToUse) ? styleObj[styleToUse] : styleObj['default'];
		}
		return _style;
	}

	_styleToUse (theme, name) {
		let styleObj = theme.getStyles(name);
		// Use the style defined inside this file if it's not registered in the arena..
		if (!styleObj) {
			styleObj = styles;
		}

		let styleToUse = styleObj.styleToUse;
		return styleToUse;
	}
}

// default name:
// basicThemableSprite
export const styles = {
	'styleToUse': 'default',
	'default': {
		// resource id to use in default theme.
		// 'resourceId': undefined,
		// sprite tint in default theme.
		'tint': 0xFFFFFF
	},
	'tactile': {
		// the resource id to use in high contrast
		// 'resourceId': undefined,
		// sprite tint in high contrast.
		'tint': 0x000000
	}
};
