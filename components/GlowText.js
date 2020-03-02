/**
 * I would put a license here, but no need, because you can do wathever you want with this chunk of code
 * @author Romualdo Villalobos
 */

import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';

const ZERO = 0;
const HALF = 0.5;
const DEFAULT_GLOW_IN_TIME = 0.4;
const DEFAULT_GLOW_OUT_TIME = 0.01;

const LEADING_CHARACTERS = ['+', '-', '×']; // class will separate a number from a sign/leading character
const LEADING_CHAR_Y_OFFSETS = [-1, -3, -3]; // some arbitrary offset to move the leading character sign

/**
 * Space between possible sign and number magnitude
 * @type {number}
 */
export const SPACING = 0;

/**
 * Class used to create 'glowable' text and manage `MindPixiText` instances smoothly through composition,
 * this class tries to instance as much as necessary and as little as possible `MindPixiText` objects,
 * `GlowText` also manages theme updating using mind ThemeEngine 2.0, for this you must define `fontStyle` object
 * on theme file and add an entry/property called `styleID` whose value is the name of the `fontStyle` or the JSON notation
 * location of the `fontStyle` inside a container style object, below you can check `fontStyle` definition examples.
 * 
 * **Font style definition examples:**
 * Note the use of `styleID`, the other properties are standard `PIXI.TextStyle` properties, also consider that
 * blueGlow, whiteGlow and incorrectGlow, etc, styles are generated automatically from this original style.
 * ```js
 * // At themeFile.js fontStyle is directly inside gameStyles object
 * 'someFontStyle': {
 *     'styleID': 'someFontStyle',
 *     'fontSize': 43,
 *     'fill': '::styles.colorPalette.raw.colors.BLACK',
 *     'alpha': '::styles.colorPalette.raw.alpha.SOLID'
 * }
 * // At themeFile.js fontStyle is inside some component style object
 * 'componentStyle': {
 *     'componentPart': {
 *         'someFontStyle': {
 *             'styleID': 'componentStyle.componentPart.someFontStyle',
 *             'fontSize': 43,
 *             'fill': '::styles.colorPalette.raw.colors.BLACK',
 *             'alpha': '::styles.colorPalette.raw.alpha.SOLID'
 *         }
 *     }  
 * }
 * ```
 * @class
 * @extends MindPixiContainer
 */
export class GlowText extends MindPixiContainer {
    constructor(text = undefined, style = {}) {
        super(text, style);

        /**
         * Text string that this display is showing
         * @type {string}
         */
        this._text = text + '';

        /**
         * Tracks the sign char that is represented in this signed number, e.g.: '-1' will return  '-'; '+1' will return '+'; '4' will return '';
         * use the accessor textSign instead of this 'private' property
         * @type {string}
         */
        this._textSign = '';

        /**
         * Tracks the string of number that is represented in this signed number, e.g.: '-18' will return  '18'; '+18' will return '18'; '18' will return '18';
         * use the accessor textMagnitude instead of this 'private' property
         * @type {string}
         */
        this._textMagnitude = '';

        /**
         * Tracks if this text is representing a number with leadign sign/character
         * @type {boolean}
         */
        this.isNumber = false;

        /**
         * Reference to original font style passed by user at constructor
         * @type {object}
         */
        this.originalStyle = Object.assign({}, style);

        /**
         * Mind Pixi text that is showing defined text
         * @type {MindPixiText}
         */
        this.mainTextLabel = new MindPixiText('', style);
        
        /**
         * Possibly the MindPixiText that is showing sign for mainTextLabel
         * @type {MindPixiText?}
         */
        this.mainTextSignLabel = null;

        /**
         * Possibly the blue text used at blueGlow, this is generated only
         * if fadeInBlueGlow() is called
         * @type {MindPixiText?}
         */
        this.blueTextLabel = null;

        /**
         * Possibly the MindPixiText that is showing sign for blueTextLabel
         * @type {MindPixiText?}
         */
        this.blueTextSignLabel = null;

        /**
         * Possibly the red text used for incorrect text, this is generated only
         * if fadeInIncorrect() is called
         * @type {MindPixiText?}
         */
        this.redTextLabel = null;

        /**
         * Possibly the MindPixiText that is showing sign for redTextLabel
         * @type {MindPixiText?}
         */
        this.redTextSignLabel = null;

        /**
         * Possibly the white glow text, this is generated only
         * if fadeInWhiteGlow() is called
         * @type {MindPixiText?}
         */
        this.whiteTextLabel = null;

        /**
         * Possibly the MindPixiText that is showing sign for whiteTextLabel
         * @type {MindPixiText?}
         */
        this.whiteTextSignLabel = null;

        // assign text
        this.text = this._text;

        // setup main text
        this._setupMainText();
    }

    render () {
        // this.updateStyles();
    }

    _setupMainText () {
		this.mainTextLabel.name = 'Main text layer';
		this.mainTextLabel.anchor.set(HALF);
		this.addChild(this.mainTextLabel);
    }

    _setupMainSignText () {
        if (!this.mainTextSignLabel) {
            this.mainTextSignLabel = new MindPixiText(this.textSign, this.mainStyle);
            this.mainTextSignLabel.name = 'Main text sign layer';
            this.mainTextSignLabel.anchor.set(HALF);
        }
		this.addChild(this.mainTextSignLabel);
		this.updateMainStyle();
    }
    
    _setupBlueText () {
        this.blueTextLabel = new MindPixiText(this.textMagnitude || this.text, this.blueStyle);
        this.blueTextLabel.name = 'Blue text layer';
		this.blueTextLabel.anchor.set(HALF);
        this.blueTextLabel.alpha = ZERO;
        this.blueTextLabel.position = this.mainTextLabel.position;
		this.addChild(this.blueTextLabel);
		this.updateBlueStyle();
    }

    _setupBlueSignText () {
        if (!this.blueTextSignLabel) {
            this.blueTextSignLabel = new MindPixiText(this.textSign, this.blueStyle);
            this.blueTextSignLabel.name = 'Blue text sign layer';
            this.blueTextSignLabel.anchor.set(HALF);
            this.blueTextSignLabel.alpha = ZERO;
            this.blueTextSignLabel.position = this.mainTextSignLabel.position;
        }
		this.addChild(this.blueTextSignLabel);
		this.updateBlueStyle();
    }
    
    _setupRedText () {
        this.redTextLabel = new MindPixiText(this.textMagnitude || this.text, this.redStyle);
        this.redTextLabel.name = 'Red text layer';
		this.redTextLabel.anchor.set(HALF);
        this.redTextLabel.alpha = ZERO;
        this.redTextLabel.position = this.mainTextLabel.position;
		this.addChild(this.redTextLabel);
		this.updateRedStyle();
    }

    _setupRedSignText () {
        if (!this.redTextSignLabel) {
            this.redTextSignLabel = new MindPixiText(this.textSign, this.redStyle);
            this.redTextSignLabel.name = 'Red text sign layer';
            this.redTextSignLabel.anchor.set(HALF);
            this.redTextSignLabel.alpha = ZERO;
            this.redTextSignLabel.position = this.mainTextSignLabel.position;
        }
		this.addChild(this.redTextSignLabel);
		this.updateRedStyle();
    }
    
    _setupWhiteText () {
        this.whiteTextLabel = new MindPixiText(this.textMagnitude || this.text, this.whiteStyle);
        this.whiteTextLabel.name = 'White text layer';
		this.whiteTextLabel.anchor.set(HALF);
        this.whiteTextLabel.alpha = ZERO;
        this.whiteTextLabel.position = this.mainTextLabel.position;
		this.addChildAt(this.whiteTextLabel, 0);
		this.updateWhiteStyle();
    }

    _setupWhiteSignText () {
        if (!this.whiteTextSignLabel) {
            this.whiteTextSignLabel = new MindPixiText(this.textSign, this.whiteStyle);
            this.whiteTextSignLabel.name = 'White text sign layer';
            this.whiteTextSignLabel.anchor.set(HALF);
            this.whiteTextSignLabel.alpha = ZERO;
            this.whiteTextSignLabel.position = this.mainTextSignLabel.position;
        }
		this.addChildAt(this.whiteTextSignLabel, 0);
		this.updateWhiteStyle();
    }

    updateStyles () {
        this.updateMainStyle();
        this.updateBlueStyle();
        this.updateRedStyle();
        this.updateWhiteStyle();
    }

    updateMainStyle () {
        this.mainTextLabel.style = this.mainStyle;
        if (this.mainTextSignLabel) this.mainTextSignLabel.style = this.mainStyle;
    }

    updateBlueStyle () {
        if (!this.blueTextLabel) return;
        this.blueTextLabel.style = this.blueStyle;
        if (this.blueTextSignLabel) this.blueTextSignLabel.style = this.blueStyle;
    }

    updateRedStyle () {
        if (!this.redTextLabel) return;
        this.redTextLabel.style = this.redStyle;
        if (this.redTextSignLabel) this.redTextSignLabel.style = this.redStyle;
    }

    updateWhiteStyle () {
        if (!this.whiteTextLabel) return;
        this.whiteTextLabel.style = this.whiteStyle;
        if (this.whiteTextSignLabel) this.whiteTextSignLabel.style = this.whiteStyle;
    }

    fadeInBlueGlow (duration, labelGlow) {
        if (!this.blueTextLabel) this._setupBlueText();
        this._setSignText(this.textSign);

		const t = duration || DEFAULT_GLOW_IN_TIME;
		this.arena.tween.to([this.blueTextLabel, this.blueTextSignLabel], t, { alpha: 1 }, labelGlow);
	}

	fadeOutBlueGlow (duration, labelGlow) {
		const t = duration || DEFAULT_GLOW_OUT_TIME;
		this.arena.tween.to([this.blueTextLabel, this.blueTextSignLabel], t, { alpha: 0 }, labelGlow);
    }

    fadeInIncorrect (duration, labelGlow) {
        if (!this.redTextLabel) this._setupRedText();
        this._setSignText(this.textSign);

		const t = duration || DEFAULT_GLOW_IN_TIME;
		this.arena.tween.to([this.redTextLabel, this.redTextSignLabel], t, { alpha: 1 }, labelGlow);
	}

	fadeOutIncorrect (duration, labelGlow) {
		const t = duration || DEFAULT_GLOW_OUT_TIME;
		this.arena.tween.to([this.redTextLabel, this.redTextSignLabel], t, { alpha: 0 }, labelGlow);
    }

    fadeInWhiteGlow (duration, labelGlow) {
        if (!this.whiteTextLabel) this._setupWhiteText();
        this._setSignText(this.textSign);

		const t = duration || Number.EPSILON;
		this.arena.tween.to([this.whiteTextLabel, this.whiteTextSignLabel], t, { alpha: 1 }, labelGlow);
	}

	fadeOutWhiteGlow (duration, labelGlow) {
		const t = duration || DEFAULT_GLOW_OUT_TIME;
		this.arena.tween.to([this.whiteTextLabel, this.whiteTextSignLabel], t, { alpha: 0 }, labelGlow);
    }

    fitTextHorizontally (newWidth) {
        // this is a proportion rule
        // originalFontSize = this.width
        // unknowFontSize   = newWidth
        // unknowFontSize   = originalFontSize * newWidth / this.width
        const scale = newWidth / this.width;
        this.fontSize = this.fontSize * scale;
    }
    
    fitTextVertically (newHeight) {
        // this is a proportion rule
        // originalFontSize = this.height
        // unknowFontSize   = newHeight
        // unknowFontSize   = originalFontSize * newHeight / this.height
        const scale = newHeight / this.height;
        this.fontSize = this.fontSize * scale;
    }

    calculateEmptySpace () {
		const pText = this.mainTextLabel;
		const visibleBounds = pText.getVisibleBounds();
		const emptySpaceTop = visibleBounds.minY;
		const emptySpaceBottom = pText.height - visibleBounds.maxY;
		const emptySpaceLeft = visibleBounds.minX;
		const emptySpaceRight = pText.width - visibleBounds.maxX;

		// calculate empty space at left, top, right, bottom sides of text
		return {
			emptySpaceTop,
			emptySpaceBottom,
			emptySpaceLeft,
			emptySpaceRight,
			visibleHeight: pText.height - emptySpaceTop - emptySpaceBottom
			// visibleWidth: this.width - emptySpaceLeft - emptySpaceRight
		};
    }

    _destroySignLabels () {
        // don't destroy since we want to recycle and avoid tweening problems
        // just remove from container so the width of this container gets updated

        if (this.mainTextSignLabel) {
            this.removeChild(this.mainTextSignLabel);
            // this.mainTextSignLabel.destroy(true);
            // this.mainTextSignLabel = null;
        }

        if (this.blueTextSignLabel) {
            this.removeChild(this.blueTextSignLabel);
            // this.blueTextSignLabel.destroy(true);
            // this.blueTextSignLabel = null;
        }

        if (this.redTextSignLabel) {
            this.removeChild(this.redTextSignLabel);
            // this.redTextSignLabel.destroy(true);
            // this.redTextSignLabel = null;
        }

        if (this.whiteTextSignLabel) {
            this.removeChild(this.whiteTextSignLabel);
            // this.whiteTextSignLabel.destroy(true);
            // this.whiteTextSignLabel = null;
        }
    }

    _setTextX (x) {
        this.mainTextLabel.x = x;
        if (this.blueTextLabel) this.blueTextLabel.x = x;
        if (this.redTextLabel) this.redTextLabel.x = x;
        if (this.whiteTextLabel) this.whiteTextLabel.x = x;
    }

    _setSignX (x) {
        if (this.mainTextSignLabel) this.mainTextSignLabel.x = x;
        if (this.blueTextSignLabel) this.blueTextSignLabel.x = x;
        if (this.redTextSignLabel) this.redTextSignLabel.x = x;
        if (this.whiteTextSignLabel) this.whiteTextSignLabel.x = x;
    }

    _setSignY (y) {
        if (this.mainTextSignLabel) this.mainTextSignLabel.y = y;
        if (this.blueTextSignLabel) this.blueTextSignLabel.y = y;
        if (this.redTextSignLabel) this.redTextSignLabel.y = y;
        if (this.whiteTextSignLabel) this.whiteTextSignLabel.y = y;
    }

    _updateChildrenPosition () {
        if (!this.isNumber) {
            this._setTextX(0);
            return;
        }

        if (!this.isSign) {
            this._setTextX(0);
            return;
        }

        const signWidth = this.mainTextSignLabel.width;
        const textWidth = this.mainTextLabel.width;
        const signWidthHalf = signWidth / 2;
        const textWidthHalf = textWidth / 2;
        const totalWidth = signWidth + SPACING + textWidth;

        const textX = textWidthHalf + signWidth + SPACING - totalWidth / 2;
        const signX = signWidthHalf - totalWidth / 2;

        // update x position of children
        this._setTextX(textX);
        this._setSignX(signX);

        // calculate y position of sign
        for (let i = 0; i < LEADING_CHAR_Y_OFFSETS.length; i++) {
            const yOffset = LEADING_CHAR_Y_OFFSETS[i];
            this._setSignY(yOffset);
        }
    }

    _setText (textStr) {
        this.mainTextLabel.text = textStr;
        if (this.blueTextLabel) this.blueTextLabel.text = textStr;
        if (this.redTextLabel) this.redTextLabel.text = textStr;
        if (this.whiteTextLabel) this.whiteTextLabel.text = textStr;
    }

    _setSignText (textStr) {
        if (!this.isSign) return

        if (this.mainTextLabel) {
            this._setupMainSignText()
            this.mainTextSignLabel.text = textStr;
        }

        if (this.blueTextLabel) {
            if (this.isSign) this._setupBlueSignText();
            this.blueTextSignLabel.text = textStr;
        }

        if (this.redTextLabel) {
            if (this.isSign) this._setupRedSignText();
            this.redTextSignLabel.text = textStr;
        }

        if (this.whiteTextLabel) {
            if (this.isSign) this._setupWhiteSignText();
            this.whiteTextSignLabel.text = textStr;
        }
    }

    _setAttr (attrName, value) {
        // standard text labels
        this.mainTextLabel[attrName] = value;
        if (this.blueTextLabel) this.blueTextLabel[attrName] = value;
        if (this.redTextLabel) this.redTextLabel[attrName] = value;
        if (this.whiteTextLabel) this.whiteTextLabel[attrName] = value;

        // text labels used for signs when text is representing a 'signed' num
        if (this.mainTextSignLabel) this.mainTextSignLabel[attrName] = value;
        if (this.blueTextSignLabel) this.blueTextSignLabel[attrName] = value;
        if (this.redTextSignLabel) this.redTextSignLabel[attrName] = value;
        if (this.whiteTextSignLabel) this.whiteTextSignLabel[attrName] = value;
    }

    _checkNumber (string) {
        // check if number ignoring leading character
        for (let i = 0; i < LEADING_CHARACTERS.length; i++) {
            const character = LEADING_CHARACTERS[i];
            if (character === string[0]) {
                const possiblyNumString = string.replace(character, '');
                return !isNaN(possiblyNumString);
            }
        }

        // check if number using standard isNaN function
        return !isNaN(string)
    }

    _unpackSignAndTextMagnitude (textStr) {
        // reset current sign string
        this._textSign = '';
        this._textMagnitude = '';

        // Find the leading character
        for (let i = 0; i < LEADING_CHARACTERS.length; i++) {
            const character = LEADING_CHARACTERS[i];
            const isLeadingCharacter = character === textStr[0];
            if (isLeadingCharacter) {
                this._textSign = character;
                this._textMagnitude = textStr.replace(character, '');
                break;
            }
        }

        // current textStr doesn't have leading sign character
        if (this._textMagnitude === '') this._textMagnitude = textStr;
    }

    set fontSize (value) {
       this._setAttr('fontSize', value);

       // redraw text (update positioning)
       this.text = this._text;
    }

    get fontSize () {
        return this.mainTextLabel.fontSize;
    }

    set text (value) {
        // cast value to string
        let textStr = value + '';
        this._text = textStr;

        // value is a number?
        const isNumber = this.isNumber = this._checkNumber(textStr);

        // assign text without special processing since value is not a number
        if (!isNumber) {
            this._setText(textStr);
            this._destroySignLabels();
            this._updateChildrenPosition();
            this._textSign = '';
            this._textMagnitude = '';
            return;
        }

        // unpack text sign and text magnitude of this text string representing a number
        this._unpackSignAndTextMagnitude(textStr);
        if (this._textSign === '') this._destroySignLabels();

        // original labels should be used only to show the magnitude of the num (not the sign)
        this._setText(this._textMagnitude);
        this._setSignText(this._textSign);
        this._updateChildrenPosition();
	}

	get text () {
		return this._text;
    }

    get textSign () {
        return this._textSign;
    }

    get textMagnitude () {
        return this._textMagnitude;
    }

    get isSign () {
        return this.textSign !== '';
    }

    set style (value) {
        this.originalStyle = value;
        this.updateStyles();
    }

    get style () {
        return this.originalStyle;
    }

    get mainStyle () {
        const styleID = this.originalStyle.styleID;
        const styleObj = GlowText.extractStyleStatic(this.arena.theme, styleID);
        if (styleObj.fontSize !== this.mainTextLabel.fontSize) styleObj.fontSize = this.mainTextLabel.fontSize;
        return styleObj;
    }

    get blueStyle () {
        const newStyle = Object.assign({}, this.mainStyle);
        if (newStyle.styleID) delete newStyle.styleID;
        if (newStyle.fill !== 'transparent') newStyle.fill = this.blue;
        if (newStyle.strokeThickness) newStyle.stroke = this.blue;
        return newStyle;
    }

    get redStyle () {
        const newStyle = Object.assign({}, this.mainStyle);
        if (newStyle.styleID) delete newStyle.styleID;
        if (newStyle.fill !== 'transparent') newStyle.fill = this.red;
        if (newStyle.strokeThickness) newStyle.stroke = this.red;
        return newStyle;
    }

    get whiteStyle () {
        const whiteStrokeThickness = 3
        const newStyle = Object.assign({}, this.mainStyle);
        if (newStyle.styleID) delete newStyle.styleID;
        newStyle.fill = this.white;
        newStyle.stroke = this.white;
        newStyle.strokeThickness = whiteStrokeThickness;
        return newStyle;
    }

    get blue () {
        const colorPalette = this.arena.theme.getStyles('colorPalette');
        return colorPalette.raw.colors.FRICK_BLUE;
    }

    get red () {
        const colorPalette = this.arena.theme.getStyles('colorPalette');
        return colorPalette.raw.colors.INCORRECT_RED_STROKE;
    }

    get white () {
        const colorPalette = this.arena.theme.getStyles('colorPalette');
        return colorPalette.raw.colors.WHITE;
    }

    static extractStyleStatic (theme, styleLocation) {
        const vStyleLocation = styleLocation.split('.');

        // some assertions
        if (vStyleLocation.length === 0) throw new Error(`Font styleID ${styleID} not found in theme file!`);

        let styleObj = null;
        if (vStyleLocation.length === 1) { // font style is defined directly at theme file

            // style name is the first
            const name = vStyleLocation[0];
            styleObj = theme.getStyles(name);

        } else { // font style is inside another style object

            // navigate object structure defined at styleLocation until the last object is found
            let lastStyleObj = theme.getStyles(vStyleLocation[0]);
            for (let i = 1; i < vStyleLocation.length; i++) {
                const childStyleName = vStyleLocation[i];

                // check if child style name exists
                if (!lastStyleObj.hasOwnProperty(childStyleName)) {
                    throw new Error(`Font styleID ${styleID} not found in theme file!, ${childStyleName} is not defined as a property object`);
                }
                
                // tracks the last style obj
                lastStyleObj = lastStyleObj[childStyleName];
            }

            styleObj = lastStyleObj;
        }

        // continue style unpacking
        return styleObj;
	}
}
