// mind sdk classes
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { MindTextureManager } from 'mind-sdk/MindTextureManager';
import { VALIDATE } from '../VALIDATE';

const ZERO = 0;
// const HALF = 0.5;
const DEFAULT_GLOW_IN_TIME = 0.4;
const DEFAULT_GLOW_OUT_TIME = 0.48;

// calculate a new height based on an arbitrary width
const calculateNewHeight = (sprite, width) => {
	let originalWidth = sprite.width;
	let originalHeight = sprite.height;
	let refWidth = width;

	// originalWidth -> refWidth
	// originalHeight -> nHeight
	const nHeight = refWidth * originalHeight / originalWidth;
	return nHeight;
};

// calculate a new witdh based on an arbitrary height
const calculateNewWidth = (sprite, height) => {
	let originalWidth = sprite.width;
	let originalHeight = sprite.height;
	let refHeight = height;

	// originalHeight -> refHeight
	// originalWidth -> nWidth
	let nWidth = refHeight * originalWidth / originalHeight;

	return nWidth;
};

/**
 * Abstract class for represent glowable objects
 * @export
 * @class Arrow
 * @extends {MindPixiSprite}
 */
export class GlowableObject extends MindPixiSprite {
    /**
     * Copy a glowable object, add it to mainView graph hierarchy and returns a reference to the copy
     * @param {GlowableObject} glowableObject Current glowableObject for copying
     * @param {object} glowableOptions Object for optional configs for using in the copy instance
     */
	static getCopy (glowableObject, glowableOptions = {}) {
		throw new Error(`getCopy(${glowableObject}, ${glowableOptions}) Abstract method not implemented`);
	}

	constructor (mindObjectOptions) {
		super(undefined, mindObjectOptions);
		this.finalPosition = { x: undefined, y: undefined };
		this._mathParents = []; // store math expression parents
		this.token = null; // current token that is representing
		this.a = -1; // created for what line?
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
	}

	set createdForLine (value) {
		this.a = value;
	}

	get createdForLine () {
		return this.a;
	}

	/**
	 * When a tokenRenderer is copied from a tokenRenderer, its parents will be defined
	 * as all tokenRenderers implied on the creation of the new object
	 * @param {Array<GlowableObject>} arr array of glowable object from which this renderer was generated
	 * @param {*} obj Obj defining parent politic of new object
	 * @returns {void}
	 *
	 */
	setExpressionParents (arr, obj = {}) {
		// hint: first generation of renderers is the initial exprassion drawn

		// second generation of renderers define as parents, its base object
		// these object were copied directly from another token renderer
		if (!obj.useGrandfathersAsParents) {
			this._mathParents = arr; // at this point is supposed that the renderer has only one parent
		}

		// when a new token renderer R is produced by the evaluation of three parents, ex: 3+2
		// the new token renderer will have as parents its three grandfathers
		// A B C
		// D E F
		//   R			<- parents of R are ABC and not DEF
		if (obj.useGrandfathersAsParents) {
			// store 'original parents'
			const parents = Object.assign([], arr);

			// store 'parents' of 'original parents'
			const grandfathers = [];
			for (let i = 0; i < parents.length; i++) { // iterate current parents
				const parent = parents[i]; // current parent
				if (parent._mathParents.length) { // if parent has parents
					parent._mathParents.forEach((grandFrather) => { // iteratate parents of current parents
						grandfathers.push(grandFrather); // push to the stack of grandfathers
					});
				}
			}
			// set current glowableObject parents to be its granFathers
			this._mathParents = grandfathers;
		}
	}

	/**
	 * The parents of this object have died (removed from the respective parent line), so make the parent of this object
	 * to be the respective parents of the parents
	 * @returns {void}
	 */
	updateParents () {
		// throw new Error('re-implement this method');
		this.setExpressionParents(this._mathParents, { useGrandfathersAsParents: true });
	}

	/**
	 * Get the grand fater of current object
	 * @returns {Array} Array of grand fathers
	 * @readonly
	 */
	get grandfathers () {
		const grandfathersArr = [];
		for (let i = 0; i < this._mathParents.length; i++) {
			const parent = this._mathParents[i];
			parent._mathParents.forEach((grandfather) => {
				grandfathersArr.push(grandfather);
			});
		}

		return grandfathersArr;
	}

	/**
	 * Given an array of token renderers, get a plain array of all renderer parents
	 * @param {Array<GlowableObject>} arr Array of token renderers
	 * @returns {Array<GlowableObject>} array containing all parents of passed expression
	 */
	static getParentsArr (arr) {
		const parentsArr = [];
		arr.forEach((parentRenderer) => {
			VALIDATE.isType(parentRenderer, GlowableObject);
			for (let i = 0; i < parentRenderer._mathParents.length; i++) {
				const renderer = parentRenderer._mathParents[i];
				parentsArr.push(renderer);
			}
		});
		return parentsArr;
	}

	render () {
		super.render();
	}

	/**
	 * Add and object to the hierarchy and set its anchor point
	 * @param {MindPixiObject} gameObject gameObject for adding to hierarchy
	 * @return {void}
	 */
	addChild (gameObject) {
		super.addChild(gameObject);
		gameObject.anchor = this.anchor;
	}

    /**
     * plays the glowIn animation
     * @param {number} time time for animation completion
     * @param {object} _labelGlow tween label for allow concurrencty with external animations
     */
	glowIn (time = DEFAULT_GLOW_IN_TIME, _labelGlow) {
		throw new Error('glowIn() Abstract method not implemented');
	}

    /**
     * plays the glowOut animation
     * @param {number} time time for animation completion
     * @param {object} _labelGlow tween label for allow concurrencty with external animations
     */
	glowOut (time = DEFAULT_GLOW_OUT_TIME, _labelGlow) {
		throw new Error('glowOut() Abstract method not implemented');
	}

    /**
     * Returns width of bounding box for current glowableObject
     */
	get colliderWidth () {
		throw new Error('colliderWidth() Abstract method not implemented');
	}

    /**
     * Returns width of bounding box for current glowableObject
     */
	get colliderHeight () {
		throw new Error('colliderHeight() Abstract method not implemented');
	}

	set proportionalWidth (value) {
		const nWidth = value;
		const nHeight = calculateNewHeight(this, value);

		this.width = nWidth;
		this.height = nHeight;
	}

	get proportionalWidth () {
		return this.width;
	}

	set proportionalHeight (value) {
		const nWidth = calculateNewWidth(this, value);
		const nHeight = value;

		this.width = nWidth;
		this.height = nHeight;
	}

	get proportionalHeight () {
		return this.height;
	}

	calculateSize (showColor = false) {
		let g = new MindPixiGraphics(); // graphic for draw the bacgound rect
		let fillColor = 0x303030;
		const VISIBLE_ALPHA = 0.4;
		let alpha = 0;
		if (showColor) alpha = VISIBLE_ALPHA;
		g.beginFill(fillColor, alpha);
        // g.drawRect (this.x - this.colliderWidth, this.y - this.colliderHeight, this.colliderWidth, this.colliderHeight);
		g.drawRect(ZERO, ZERO, this.colliderWidth, this.colliderHeight);
        // g.drawCircle(0, 0, 5);
		g.endFill(); // draw bounding box
		let texture = MindTextureManager.generateTextureFromGraphic(g); // convert rect graphic to texture

		this.texture = texture;
		this.calculateBounds();
	}

	/**
	 * Destroy the shape
	 */
	destroy (options) {
		super.destroy(options);
	}
}
