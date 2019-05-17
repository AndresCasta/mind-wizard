// import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';
import { MindUtils } from 'mind-sdk/MindUtils';
// import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';

// import { COMMON_NUMBERS, COLOR } from '../Constants';

// const ZERO = 0;
// const ONE = 1;
// const HALF = 0.5;

export class ThemableSprite extends MindPixiSprite {
	constructor (...args) {
		super(...args);

		// Default styleName
		this._styleName = 'basicThemableSprite';
		// instance style.
		this._styleObj = null; // initialized as null

		this.eventEmitter.on(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChangeMain, this);
		this._onThemeChangeMain();
	}

	set themeOptions (value) {
		// check the value is an object
		if (MindUtils.isObject(value)) {
			const styleName = value.stryleName;
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
		// Changes the srite tint.
		this.tint = styles.tint;

		// Change the sprite texture.
		if (styles.resourceId) {
			let textureToUse = this.resources[styles.resourceId].texture;
			if (!textureToUse) throw new Error('It seems like the high contrast texture is not defined.');
			this.texture = textureToUse;
		} else {
			console.warn('The ThemableSprite does not has a resourceId property.');
		}
		// console.log(styles);
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
