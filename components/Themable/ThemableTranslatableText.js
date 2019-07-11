import { TranslatableText } from './TranslatableText';
import { MixinThemable } from './MixinThemable';
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';

export class ThemableTranslatableText extends MixinThemable(TranslatableText) {
	/**
	 * Overrides MixinThemable::_onThemeChangeMain() method.
	 */
	_onThemeChangeMain () {
		// MindPixiText inherits hrom PIXI.text.
		let dummySprite = new MindPixiSprite(); // dummy sprite to the the current arena.
		let styles = this.extractStyleStatic(dummySprite.arena.theme, this.styleName, this._styleObj);
		this.style = styles.textStyle;

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
