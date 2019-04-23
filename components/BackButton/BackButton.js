import { Button } from 'mind-game-components/Button/Button';
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';
import MindSVG from 'mind-sdk/MindSVG';
import { MindTextureManager } from 'mind-sdk/MindTextureManager';
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';

const ANCHOR_MIDDLE = 0.5;
const DIV_2 = 0.5;
const ZERO = 0;
const ONE = 1;

export class BackButton extends Button {
	constructor (mindObjectOptions, themeId = 'backButton') {
		super(ONE, ONE, mindObjectOptions);

		let isHC = this.arena.theme.getStyles(themeId).styleToUse === 'tactile';

		this._themeId = themeId;
		this._isHC = isHC;

		let btnDisplay = (isHC) ? BackButton.HIGH_CONTRAST_BUTTON : BackButton.DEFAULT_BUTTON;

		let resourceId = `${btnDisplay}`;
		let resource = this.resources[resourceId];
		let svgButton = MindSVG.fromResource(resource);
		let resourceWidth = svgButton.getWidth();
		let resourceHeight = svgButton.getHeight();
		this._width = resourceWidth * DIV_2;
		this._height = resourceHeight * DIV_2;
		this._btnDisplay = btnDisplay;

		// if there isn't a filters obejct in MindSVG transforms will not work.
		if (MindSVG._SVGFilters === undefined) {
			let filterData = this.resources['filters'].xmlData;
			MindSVG.setFilters(filterData);
		}

		this._btnSprite = new MindPixiSprite(undefined, mindObjectOptions);

		this.addChild(this._content);
		this.addContent(this._btnSprite);
		this.addChild(this._sheenEffect);
		this.addChild(this._sheenMask);

		// intialize the bounds
		this.minX = 0;
		this.minY = 0;
		this.outlineWidth = this._width;
		this.outlineHeight = this._height;

		this._style = this._extractStyle(this.arena.theme, this._themeId);

		this._initDownFilter();
		this._getDisplay();
		this._getHintTexture();
		this._calculateOutlineDimensions();

		this.alpha = BackButton.ACTIVE_STATE;
	}

	_redrawButton () {
		// update the texture on the go button
		this._getDisplay();
		// update the hint around the go button
		this._getHintTexture();
		// calculate the bounds of the button
		this._calculateOutlineDimensions();
	}

	_getDisplay () {
		let resource = this.resources[this._btnDisplay];
		this._applyDisplayTexture(resource.texture);
	}

	_applyDisplayTexture (texture) {
		this._btnSprite.texture = texture;
		this._btnSprite.width = this._width;
		this._btnSprite.height = this._height;
		this._btnSprite.anchor.set(ANCHOR_MIDDLE, ANCHOR_MIDDLE);
	}

	_extractStyle (theme, themeId = 'backButton') {
		var allStyles = theme.getStyles(themeId);
		let styleToUse = allStyles.styleToUse;
		if (allStyles[styleToUse]) {
			return allStyles[styleToUse];
		} else {
			return allStyles['default'];
		}
	}

	/**
	 * Update the theme. The alpha value may need to change based on the button's state.
	 * @param {*} event
	 */
	_onThemeChanged (event) {
		super._onThemeChanged(event);
		this._isHC = this.arena.theme.getStyles(this._themeId).styleToUse === 'tactile';
		this._btnDisplay = (this._isHC) ? BackButton.HIGH_CONTRAST_BUTTON : BackButton.DEFAULT_BUTTON;
		this._redrawButton();
	}

	/**
	 * return the expected bounds the focus indicator should focus on.
	 * Note: due to padding we don't necessarily want to rely on actual bounds
	 */
	getFocusRect () {
		return new this.arena.PIXI.Rectangle(this.minX, this.minY, this.outlineWidth, this.outlineHeight);
	}

	/**
	 * Make the button non-interactive.
	 * For HighContrast this swaps out the texture
	 */
	disable () {
		if (this._isHC) {
			this.interactive = false;
			this._redrawButton();
		} else {
			this._downFilter.visible = this.pressed;
			super.disable();
		}
		this.alpha = BackButton.INACTIVE_STATE;
	}

	/**
	 * Make the button interactive.
	 * For HighContrast this swaps out the texture
	 */
	enable () {
		if (this._isHC) {
			this.interactive = true;
			this._redrawButton();
		} else {
			super.enable();
		}
		this.alpha = BackButton.ACTIVE_STATE;
	}

	/**
	 * Show the sheen effect on the button
	 * @param {Number} delay time to wait before the animation starts
	 */
	hover (delay = ZERO) {
		this.alpha = BackButton.HOVER_STATE;
	}

	/**
	 * Create a graphic to overlay the jiji go button when pressed.
	 * This uses the sheenMask as its mask to cover the correct area.
	*/
	_initDownFilter () {
		this._downFilter = new MindPixiGraphics(this._options);
		let downFill = this._style.downFill;
		let downAlpha = this._style.downAlpha;
		this._downFilter.beginFill(downFill, downAlpha);
		this._downFilter.drawRect(ZERO, ZERO, this._width, this._height);
		this._downFilter.endFill();
		this._downFilter.x = -this._width * this._content.anchor.x;
		this._downFilter.y = -this._height * this._content.anchor.y;
		this.addContent(this._downFilter);
		this._downFilter.mask = this._sheenMask;
		this._downFilter.visible = false;
	}

	_getSheen () {
		this._sheenEffect.texture = this.getSheenTexture(this._width, this._height);
	}

	// --------------------------------------------------------------------
	// ----------------ReactToGameInteraction Functions--------------------
	// --------------------------------------------------------------------
	pointerDown () {
		super.pointerDown();
	}

	pointerUp () {
		super.pointerUp();
	}

	pointerOver () {
		super.pointerOver();
		if (this.interactive) {
			this.alpha = BackButton.HOVER_STATE;
		}
	}

	pointerOut () {
		super.pointerOut();
		if (this.interactive) {
			this.alpha = BackButton.ACTIVE_STATE;
		}
	}

	pointerUpOutside () {
		super.pointerUpOutside();
	}

	positionButton (position, coordinateSpace = undefined, buttonAlignment = { x: ANCHOR_MIDDLE, y: ANCHOR_MIDDLE }) {
		let globalPosition = position;
		if (coordinateSpace !== undefined) {
			globalPosition = coordinateSpace.toGlobal(globalPosition);
		}
		let localPosition = this.parent.toLocal(globalPosition);
		this.x = localPosition.x - (buttonAlignment.x - this.anchor.x) * this.outlineWidth;
		this.y = localPosition.y - (buttonAlignment.y - this.anchor.y) * this.outlineHeight;
	}

	_getHintTexture () {
		let hintColorHex = this._style.hintColor;
		let hintPadding = this._style.hintPadding;
		let hintAlpha = this._style.hintAlpha;

		// MIND SVG is particular about the formatting of the hex colors
		let hintColor = hintColorHex.replace('0x', '#');

		let textureId = `${this._btnDisplay}_${hintColor}_${hintPadding}`;
		let hintTexture = MindTextureManager.getTexture(textureId);

		if (hintTexture === undefined || hintTexture === null) {
			// to create the hint texture:
			// fill the outline element
			// expand the size
			let resource = this.resources[this._btnDisplay];
			let svgButton = MindSVG.fromResource(resource);
			svgButton._resolution = 2;
			let stroke = hintPadding + this._style.strokeWidth;
			svgButton.getElementById('outline').setAttribute('stroke-width', stroke);
			svgButton.getElementById('outline').setAttribute('fill', hintColor);
			svgButton.getElementById('outline').setAttribute('stroke', hintColor);
			svgButton.getElementById('outline').setAttribute('stroke-opacity', hintAlpha);
			svgButton.addSize(hintPadding);
			svgButton.getTexture().then((texture) => {
				MindTextureManager.saveTexture(textureId, texture);
				this._hint.texture = texture;
				this._hint.anchor.set(ANCHOR_MIDDLE, ANCHOR_MIDDLE);
			});
		} else {
			this._hint.texture = hintTexture;
			this._hint.anchor.set(ANCHOR_MIDDLE, ANCHOR_MIDDLE);
		}
	}

		// KLUDGE: refactor at a later date
	// it's important for the hit area of the button to match the visual indicator.
	// To match the pentagonal shape of the jiji go button it's necessary to get the
	// points that define it's outline. This issue is conflated by the local transforms within the svg
	// _calculateOutlineDimensions and _tranformPoints were created to calculate the bounds desipite this.
	// at a later it would be beneficial to determine a cleaner way to define the hit area of the button
	_calculateOutlineDimensions () {
		let pathStr = this._getPathFromResource();
		let pathArr = pathStr.split(' ');
		let minX = Number.MAX_SAFE_INTEGER;
		let maxX = Number.MIN_SAFE_INTEGER;
		let minY = Number.MAX_SAFE_INTEGER;
		let maxY = Number.MIN_SAFE_INTEGER;
		let pts = [];

		// iterate over all elements in the path str, and calcualte the set of points that defines the path
		for (let iter = 0; iter < pathArr.length; iter++) {
			let val = pathArr[iter];
			let x = 0;
			let y = 0;
			let isValNum = !isNaN(parseInt(val, 10));
			if (isValNum) {
				x = parseInt(val, 10);
				y = parseInt(pathArr[++iter]);
			} else if (val === 'M' || val === 'L') {
				x = parseInt(pathArr[++iter]);
				y = parseInt(pathArr[++iter]);
			} else if (val === 'Z' || val === 'z') {
				break;
			} else {
				continue;
			}

			pts.push(new this.arena.PIXI.Point(x, y));
		}

		minX = -this._width * DIV_2;
		maxX = this._width * DIV_2;
		minY = -this._height * DIV_2;
		maxY = this._height * DIV_2;

		this.minX = minX;
		this.minY = minY;
		this.outlineWidth = maxX - minX;
		this.outlineHeight = maxY - minY;

		this._tranformPoints(pts);

		this.boundaryPolygon = new this.arena.PIXI.Polygon(...pts);
		this.hitArea = this.boundaryPolygon;
	}

	_getPathFromResource () {
		// get the path that defines the resource's outline
		// let resourceDoc = this.resources[this._btnDisplay].xmlData;
		// let elem = resourceDoc.getElementById('outline');

		// let pathStr = elem.getAttribute('d');
		let pathDefafult = 'M 314.05 318.35 L 302.05 318.35 282.05 342.35 302.05 366.35 314.05 366.35 314.05 318.35 Z';
		let pathTactile = 'M 16 -24  L 4 -24 -16 0 4 24 16 24 16 -24 Z';
		let pathStr = (this._isHC) ? pathTactile : pathDefafult;

		return pathStr;
	}

	/**
	 *
	 */
	_tranformPoints (points) {
		let outlineTrasnform = (this._isHC) ? { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 } : { a: 1, b: 0, c: 0, d: 1, e: -298.05, f: -342.35 };

		let strokeWidth = this._style.strokeWidth;
		let offsetX = outlineTrasnform.e - (this._width - this.outlineWidth) * DIV_2 + strokeWidth * DIV_2;
		let offsetY = outlineTrasnform.f - (this._height - this.outlineHeight) * DIV_2 + strokeWidth * DIV_2;

		points.forEach(point => {
			point.x += offsetX;
			point.y += offsetY;
		});
	}
}

BackButton.DEFAULT_BUTTON = 'asset_backButton';
BackButton.HIGH_CONTRAST_BUTTON = 'asset_backButton_hc';

BackButton.ACTIVE_STATE = 0.33;
BackButton.INACTIVE_STATE = 0.15;
BackButton.HOVER_STATE = 0.66;

export const styles = { // add this to the theme using the key 'backButton'
	'styleToUse': 'default',
	'default': {
		'hintColor': '0xFFFFFF',
		'hintPadding': 5,
		'hintAlpha': 1,
		'downFill': '0x000000',
		'downAlpha': 0.3,
		'strokeWidth': 2,
		'showSheen': true
	},
	'tactile': {
		'hintColor': '0xC0C0C0',
		'hintPadding': 5,
		'hintAlpha': 1,
		'downFill': '0x000000',
		'downAlpha': 0.3,
		'strokeWidth': 2,
		'showShee': false
	}
};
