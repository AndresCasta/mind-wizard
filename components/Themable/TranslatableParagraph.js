import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';
import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';
import { VALIDATE } from './VALIDATE';
// import { COMMON_NUMBERS } from '../Constants';

const args = {
	translationKey: 'null',
	lineSeparation: 1,
	paragraphSeparation: 15,
	circleRadius: 3,
	enableSizeScaling: true
};

export const CONTROL_CHARS = {
	NEW_LINE: '/nl/', // new line
	END_PARAGRAPH: '/p/', // end of paragraph
	LIST_ITEM: '/*/'
}

const HALF = 0.5;
/**
 * Text control characters:
 * /nl/ new line
 * /p/ end of paragraph
 */
export class TranslatableParagraph extends MindPixiContainer {
	constructor ({translationKey = args.translationKey, textStyles, lineSeparation = args.lineSeparation, paragraphSeparation = args.paragraphSeparation, circleRadius = args.circleRadius, enableSizeScaling = args.enableSizeScaling} = args) {
		super(undefined);
		this._translationKey = translationKey;
		this._lineSeparation = lineSeparation;
		this._paragraphSeparation = paragraphSeparation;
		this._circleRadius = circleRadius;
		this._textStyles = textStyles;
		this._enableSizeScaling = enableSizeScaling;

		this._text = this.text;

		this._paragrapContainers = [];
		this._lastFontSizeRatio = 1;

		this.eventEmitter.on(this.mindEvents.EVENT_LOCALE_CHANGED, this._onLocaleChangeMain, this);
		this.eventEmitter.on(this.mindEvents.EVENT_FONTSIZE_CHANGED, this._onFontSizeChange, this);
		this._setup();
	}

	_setup () {
		this._updateTextView(this._lastFontSizeRatio);
	}

	/**
	 * Removes child containers.
	 */
	_cleanTextView () {
		for (let i = 0; i < this._paragrapContainers.length; i++) {
			const container = this._paragrapContainers[i];
			this.removeChild(container);
			container.destroy();
		}

		// resets array
		this._paragrapContainers = [];
	}

	_updateTextView (circleScaleRatio = 1) {
		// removes paragraphs container if is there any
		this._cleanTextView();
		const paragraphs = this.text.split(CONTROL_CHARS.END_PARAGRAPH);
		// iterates paragraphs
		for (let i = 0; i < paragraphs.length; i++) {
			const paragraphStr = paragraphs[i];
			const lines = paragraphStr.split(CONTROL_CHARS.NEW_LINE);
			const pContainer = new MindPixiContainer();
			this._paragrapContainers.push(pContainer);
			this.addChild(pContainer);
			// TODO: Change y of paragraph
			// iterates lines
			// let lineIsList = false;
			const listRegex = /\s*\/\*\/\s*/;
			const linesInfo = [];
			for (let j = 0; j < lines.length; j++) {
				let lineStr = lines[j];
				let lineIsList = listRegex.test(lineStr);

				let listCircle = null;
				if (lineIsList) {
					lineStr = lineStr.replace(listRegex, '');
					listCircle = this._drawListCircle({
						radius: this._circleRadius
					});
					listCircle.scale.x = circleScaleRatio;
					listCircle.scale.y = circleScaleRatio;
					pContainer.addChild(listCircle);
				}

				// line text is mind pixi text instance
				const lineText = new MindPixiText(lineStr, this._textStyles);
				pContainer.addChild(lineText);
				// change lineText.enableSizeScaling only if the new value is false
				lineText.enableSizeScaling = this._enableSizeScaling;
				const lineHeight = lineText.height;
				// applies line spacing to all lines but the first
				const lineSpacing = Math.min(j, 1) * this._lineSeparation;
				lineText.y = lineHeight * j + lineSpacing;

				if (listCircle) {
					lineText.x = listCircle.width + 6;
				}

				linesInfo.push({
					text: lineText,
					listCircle: listCircle,
					isList: lineIsList
				});
			}

			let prevBounds = null;
			for (let j = 0; j < linesInfo.length; j++) {
				const lineInfo = linesInfo[j];
				const lineIsList = lineInfo.isList;
				const lineText = lineInfo.text;
				const listCircle = lineInfo.listCircle;

				// if line is circle then positionate circle
				if (lineIsList) {
					const textBounds = Object.assign({}, lineText.getVisibleBounds());
					if (prevBounds) {
						textBounds.height = lineText.height;
						textBounds.width = lineText.width;
						textBounds.minY = prevBounds.height + textBounds.minY;
						textBounds.maxY = prevBounds.height + textBounds.maxY;
					}
					// const verticalMiddlePos = (textBounds.minY + textBounds.maxY) / 2;
					// const verticalMiddleOffset = (verticalMiddlePos - lineText.y) / lineText.height;

					listCircle.x = 0;
					listCircle.y = lineText.y + lineText.height * HALF; // + verticalMiddleOffset * lineText.height;
					prevBounds = Object.assign({}, textBounds); // clone the object
				}
			}

			// moves down all paragraphps but first
			if (i > 0) {
				const prevPContainer = this._paragrapContainers[i - 1];
				pContainer.y = prevPContainer.y + prevPContainer.height + this._paragraphSeparation;
			}
		}
	}

	/**
	 * Get the line at the give index
	 * @param {number} paragraphIndex
	 * @param {number} lineIndex
	 */
	getLineAt (paragraphIndex, lineIndex) {
		VALIDATE._ASSERT((paragraphIndex <= (this._paragrapContainers.length - 1)) || paragraphIndex > 0, 'paragraphIndex out of range');
		const paragraph = this._paragrapContainers[paragraphIndex];
		VALIDATE._ASSERT((lineIndex <= (paragraph.children.length - 1)) || lineIndex > 0, 'lineIndex out of range');
		const line = paragraph.children[lineIndex];
		return line;
	}

	_drawListCircle (options) {
		const { radius } = options;
		let graphic = new MindPixiGraphics();
		let color = 0x000000;
		graphic.beginFill(color);
		let _x = 0;
		let _y = 0;
		graphic.drawCircle(_x, _y, radius);
		graphic.endFill();

		// TODO: use a themable sprite here.
		// graphic is destroyed inside the sprite.
		let sprite = new MindPixiSprite(graphic, { Rng: this.arena.Rng }, {
			resolution: 2
		});
		// sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;

		return sprite;
	}

	_onFontSizeChange (event) {
		this._lastFontSizeRatio = event.ratio;
		this._updateTextView(event.ratio);
	}

	_onLocaleChangeMain (event) {
		this._updateTextView(this._lastFontSizeRatio);
	}

	get text () {
		const translation = this.extractLocaleTranslation(this._translationKey);
		// \s: space
		// * zero or more matches
		// + one or more matches
		// console.log(translation);
		return translation.replace(/\s*\n+\s*/gi, ''); // removes unnintended \n chars because we are using template strings (``)
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
		this.eventEmitter.removeListener(this.mindEvents.EVENT_FONTSIZE_CHANGED, this._onFontSizeChange, this);
	}
}
