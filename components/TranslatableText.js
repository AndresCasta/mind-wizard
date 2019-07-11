import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';

export class TranslatableText extends MindPixiText {
	constructor (...args) {
		super(...args);

		this.eventEmitter.on(this.mindEvents.EVENT_LOCALE_CHANGED, this._onLocaleChangeMain, this);
		this._keyStr = 'null';
		this._tmpSprite = new MindPixiSprite();
		this.arena = this._tmpSprite.arena;
		this._localeSizes = {};
		this._localeSizes['en-US'] = this.fontSize;
		this._localeSizes['es'] = this.fontSize;
		this._localeSizes['pt'] = this.fontSize;
	}

	get translationKey () {
		return this._keyStr;
	}

	set translationKey (value) {
		this._keyStr = value;
		// updates text
		this._onLocaleChangeMain();
	}

	_onLocaleChangeMain () {
		this.text = this.extractLocaleTranslation(this._keyStr);
	}

	get currentLocale () {
		return this.arena.theme.locale;
	}

	extractLocaleTranslation (keyStr) {
		const translation = this.arena.LocaleStore.translate(keyStr, this.currentLocale).translation;
		if (translation) return translation;
		else {
			const errorText = `${keyStr} traslation not found!`;
			console.error(errorText);
			return errorText;
		}
	}

	destroy (options) {
		this.eventEmitter.removeListener(this.mindEvents.EVENT_LOCALE_CHANGED, this._onLocaleChangeMain, this);
		this._tmpSprite.destroy();
		super.destroy(options);
	}
}
