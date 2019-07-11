import { MixinThemable } from './MixinThemable';
import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';

export class ThemableText extends MixinThemable(MindPixiText) {
	constructor (...args) {
		super(...args);

		this.styleName = 'basicThemableText';
	}

	/**
	 * Overrides MixinThemable::_onThemeChangeMain() method.
	 */
	_onThemeChangeMain () {
		// MindPixiText inherits hrom PIXI.text.
		let dummySprite = new MindPixiSprite(); // dummy sprite to the the current arena.
		let styles = this.extractStyleStatic(dummySprite.arena.theme, this.styleName, this._styleObj);
		if (styles.hasOwnProperty('fill')) {
			this.style.fill = styles.fill;
		}

		dummySprite.destroy();
	}
}

// default name:
// basicThemableText
export const styles = {
	'styleToUse': 'default',
	'default': {
		'fill': 0x000000
	},
	'tactile': {
		// the resource id to use in high contrast
		// 'resourceId': undefined,
		// sprite tint in high contrast.
		'fill': 0x000000
	}
}
