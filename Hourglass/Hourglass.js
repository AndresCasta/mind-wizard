import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';

const INTERVAL_DURATION = 0.1;
const HOURGLASS_SIZE = { x: 17, y: 28 };
// const HOURGLASS_SAND_WIDTH = 1;
const HALF_FACTOR = 0.5;
const ZERO = 0;
const ONE = 1;

/**
* This class is used to represent the game hourglass.
* (ADAPTATION FROM ALIENCAPTURE GAME)
* @export
* @class Hourglass
* @extends {MindPixiContainer}
*/
export class Hourglass extends MindPixiContainer {
    /**
     * Creates an instance of the Hourglass.
     *
     * @param {number} duration				For how long will the timer execute
     * @param {function} callback			Callback for whenever the timer is finished running
     * @param {object} theme				Game theme
     * @param {object} mindObjectOptions	MindGameObject property
     * @memberof Hourglass
     */
	constructor (duration, callback, theme, mindObjectOptions) {
		super(mindObjectOptions);
        // Store basic values
		this._PIXI = this.arena.PIXI;

        // Store variables
		this._duration = duration;
		this._callback = callback;
		this._progress = 1;
		this._timer = 0;

		this.interactive = false;

        // Extract style.
		this._style = this._extractStyle(theme);

		// hourglass properties
		this._hourglass = null;
		this._droppingSandLine = null;
		this._hourglassSandTop = null;
		this._hourglassSandBottom = null;
		this._hourglassSandBottomMask = null;

		// collider sizes
		this.colliderWidth = 0;
		this.colliderHeight = 0;
	}

    /**
     * Render the object. Called when is added to a container or when the theme is changed.
     *
     * @returns {undefined}
     * @memberof Hourglass
     */
	render () {
		super.render();
		
		let scale = this._style.scale;
		const HOURGLASS_SAND_WIDTH = this._style.doppingSandLineWidth;
		const AT_BACK_OF_EVERYTHING = ZERO;
		const INVERTED_SCALE = -1;

		// Instance hourglass
		if (!this._hourglass) {

			// main hourglass sprite
			//#region 
			this._hourglass = new MindPixiSprite(this.resources['hourglassSVG'].texture);
			this._hourglass.scale.set(scale);
			this.addChild(this._hourglass);
			this.colliderWidth = this._hourglass.width;
			this.colliderHeight = this._hourglass.height;
			//#endregion
			
			// dropping sand line
			//#region 
			const HOURGLASS_TOP_BORDER_COMPESATION = 2;
			this._droppingSandLine = new MindPixiGraphics();
			this._droppingSandLine.position.set(this.colliderWidth * HALF_FACTOR - HOURGLASS_SAND_WIDTH * HALF_FACTOR,
				this._hourglass.y + HOURGLASS_TOP_BORDER_COMPESATION);
			this.addChildAt(this._droppingSandLine, AT_BACK_OF_EVERYTHING);
			//#endregion

			// top sand
			//#region 
			this._hourglassSandTop = new MindPixiSprite(this.resources['hourglassSandSVG'].texture);
			this._hourglassSandTop.position.set(ZERO, ZERO);
			this._hourglassSandTop.scale.set(scale);
			this.addChildAt(this._hourglassSandTop, AT_BACK_OF_EVERYTHING);
			//#endregion

			// top sand mask
			//#region 
			this._hourglassSandTopMask = new MindPixiGraphics();
			this._hourglassSandTopMask.position.set(ZERO, this.colliderHeight * HALF_FACTOR);
			this._hourglassSandTopMask.scale.y = INVERTED_SCALE;
			this.addChild(this._hourglassSandTopMask);
			this._hourglassSandTop.mask = this._hourglassSandTopMask;
			//#endregion

			// bottom sand
			//#region 
			this._hourglassSandBottom = new MindPixiSprite(this.resources['hourglassSandSVG'].texture);
			this._hourglassSandBottom.position.set(ZERO, ZERO);
			this._hourglassSandBottom.scale.set(scale);
			this.addChildAt(this._hourglassSandBottom, AT_BACK_OF_EVERYTHING);
			//#endregion

			// bottom sand mask
			//#region 
			this._hourglassSandBottomMask = new MindPixiGraphics();
			this._hourglassSandBottomMask.position.set(this._hourglass.x, this._hourglass.height);
			this._hourglassSandBottomMask.scale.y = INVERTED_SCALE;
			this.addChild(this._hourglassSandBottomMask);
			this._hourglassSandBottom.mask = this._hourglassSandBottomMask;
			//#endregion

			// debug
			// #region 
			// let dbgRect = new MindPixiGraphics();
			// dbgRect.beginFill(0xff0000);	
			// dbgRect.drawRect(0, 0, 5, 5);
			// dbgRect.beginFill(0xff0000, 0.3);
			// dbgRect.drawRect(0, 0, this.colliderWidth, this.colliderHeight);
			// this.addChild(dbgRect);
			//#endregion
		}
		// Draw hourglass graphics

		// dropping sand line
		//#region 
		this._droppingSandLine.clear(0x000000);
		this._droppingSandLine.beginFill(0x000000);
		// const MAGIC_PERCENTAGE = 0.43; // this works, just believe me
		const MAGIC_COMPENSATION = 4; // this works, just believe me
		this._droppingSandLine.drawRect(ZERO,
				Math.min(this.colliderHeight * HALF_FACTOR, this.colliderHeight * HALF_FACTOR * (ONE - this._progress)),
				HOURGLASS_SAND_WIDTH,
				this.colliderHeight - MAGIC_COMPENSATION - this.colliderHeight * HALF_FACTOR * (ONE - this._progress));
		//#endregion

		// update bottom mask drawing
		//#region 
		const TOP_MASK_FILL = 0x00ff00;
		this._hourglassSandTopMask.clear();
		this._hourglassSandTopMask.beginFill(TOP_MASK_FILL);
		this._hourglassSandTopMask.drawRect(ZERO, ZERO, this.colliderWidth, this.colliderHeight * HALF_FACTOR * this._progress);
		this._hourglassSandTopMask.endFill();
		//#endregion

		// update bottom mask drawing
		//#region 
		const BOTTOM_MASK_FILL = 0xffffff;
		this._hourglassSandBottomMask.clear();
		this._hourglassSandBottomMask.beginFill(BOTTOM_MASK_FILL);
		this._hourglassSandBottomMask.drawRect(ZERO, ZERO, this.colliderWidth, this.colliderHeight * HALF_FACTOR * (ONE - this._progress));
		this._hourglassSandBottomMask.endFill();
		//#endregion
	}

    /**
     * Starts running the timer
     *
     * @returns {undefined}
     * @memberof Hourglass
     */
	start () {
		var _this = this;

		this._intervalId = setInterval(function () {
			_this._timer += INTERVAL_DURATION;
			_this._progress = 1 - _this._timer / _this._duration;
			_this.render();

			if (_this._timer >= _this._duration) {
				_this.stop();
				_this._callback();
			}
		}, INTERVAL_DURATION * 1000);
	}

	stop () {
		clearInterval(this._intervalId);
		this._intervalId = undefined;
	}

    /**
      * Destroy the object.
      *
      * @param {object} options List of destroy options
      * @returns {undefined}
      * @memberof Hourglass
      */
	destroy () {
		if (this._intervalId) {
			clearInterval(this._intervalId);
			this._intervalId = undefined;
		}
	}

    /**
      * Extract the desired theme style.
      *
      * @param {object} theme Current game theme
      * @returns {object} New style
      * @memberof Hourglass
      */
	_extractStyle (theme) {
		return theme.getStyles('hourglass');
	}

    /**
      * Returns the default theme data.
      * @static
      * @returns {object} Default theme data for this component
      * @memberof Hourglass
      */
	getDefaultThemeData () {
		return styles;
	}
}

export const styles = {
	'styleToUse': 'default',
	'scale': 0.6,
	'doppingSandLineWidth': 1,
	'hourglassSVG': { 'type': 'image', 'url': '/assets/MultStacks/hourglass.svg', 'metadata': { 'resolution': 2 } },
	'hourglassSandSVG': { 'type': 'image', 'url': '/assets/MultStacks/hourglass_sand.svg', 'metadata': { 'resolution': 2 } }
};
