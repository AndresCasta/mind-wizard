/**
 * If you modify this class, feel free to add an author tag and your name
 * @author Romualdo Villalobos
 * https://github.com/pixijs/pixi.js/tree/dev/packages/sprite-animated/src
 */

import { MindPixiAnimatedSprite } from 'mind-sdk/mindPixi/MindPixiAnimatedSprite';

const ZERO = 0;
const ONE = 1;
const DEFAULT_TIME = 1;

export class AnimatedSprite extends MindPixiAnimatedSprite {
	/**
     * @param {PIXI.Texture[]|PIXI.AnimatedSprite.FrameObject[]} textures - An array of {@link PIXI.Texture} or frame
     *  objects that make up the animation.
     */
	constructor (texturesArr) {
		super(texturesArr);

		/**
		 * Tracks the previousFrame number
		 * @private
		 */
		this.previousFrame = this.currentFrame;

		/**
		 * Set the num of times that the movieclip will be reproduced before finishing the twwen
		 * @default 1
		 * @type {number}
		 */
		this.loopTimes = 1;

		/**
		 * Set if final frame of movieclip should be the first frame or not
		 * @default false
		 * @type {boolen}
		 */
		this.finalFrameIsFirst = false;

		this._onThemeChange();
		// it won't be registered here, since an exception is occuring in arena, this will be add at  the invocation list on MainView instead
		// this.eventEmitter.on(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChange, this);
	}

	/**
	 * @override
     * Plays the AnimatedSprite, originally this method gets registered to a loop
	 * by using the Ticker.shared.add, now it will register this.update to the onUpdate
	 * handler at this.arena.tween.to. Original code is below:
	 * https://github.com/pixijs/pixi.js/blob/dda5fde27741576db7b8ebe6196e2a0552bcdb94/packages/sprite-animated/src/AnimatedSprite.js#L161
     * @returns {void}
     */
	play (time = DEFAULT_TIME, label, delay = ZERO) {
		const deltaTime = time / this.totalFrames;

		this.arena.tween.to(this, time, {
			_currentTime: super.totalFrames * this.loopTimes,
			delay: delay,
			onUpdate: this.update.bind(this, deltaTime)
		}, label);
	}

	/**
	 * @override
	 * Updates the object transform for rendering.
	 * @param {number} deltaTime - Time since last tick.
	 * https://github.com/pixijs/pixi.js/blob/dda5fde27741576db7b8ebe6196e2a0552bcdb94/packages/sprite-animated/src/AnimatedSprite.js#L219
	 * @returns {void}
	 */
	update (deltaTime) {
		const elapsed = this.animationSpeed * deltaTime;
		const previousFrame = this.currentFrame;
		this._currentTime += elapsed;

		// console.log({
		// 	_currentTime: this._currentTime,
		// 	previousFrame: previousFrame
		// });

		if (this.previousFrame !== previousFrame) {
			this.previousFrame = previousFrame;

			// this will make sure that the final frame won't be the first
			const isLastChangeFrame = this._currentTime >= (this.totalFrames * this.loopTimes);
			if (!isLastChangeFrame && !this.finalFrameIsFirst) {
				super.updateTexture();
				// console.log('UPDATED TEXTURE');
			}
		}
	}

	reset (label, delay) {
		this.arena.tween.to(this, Number.EPSILON, {
			_currentTime: 0,
			delay: delay,
			onComplete: () => {
				this.updateTexture();
			}
		}, label);
	}

	/**
	 * Called for mark as ansupported
	 * @returns {void}
	 */
	_notSupported () {
		throw new Error('This object has no support to stop functionality, we are using a shared mind-sdk gsap time line, we cannot interfer with mind-sdk logic stopping the shared timeline, if you need this functionality, feel free to create a new class that uses custom gsap timelines and use this as starting point');
	}

	/**
     * (not supported since using shared mind-sdk timeline) Stops the AnimatedSprite.
     *
	 * @returns {void}
     */
	stop () {
		// this._notSupported();
	}

	/**
	 * @override
     * (not supported since using shared mind-sdk timeline) Goes to a specific frame and begins playing the AnimatedSprite.
     *
     * @param {number} frameNumber - Frame index to start at.
	 * @returns {void}
     */
	gotoAndPlay () {
		this._notSupported();
	}

	_onThemeChange () {
		const glowableSettings = this.extractStyleStatic(this.arena.theme, 'glowableSettings');
		const currentTint = glowableSettings.glowableSprite.tint;

		this.tint = currentTint;
	}

	extractStyleStatic (theme, name) {
		let styleObj = theme.getStyles(name);
		let styleToUse = styleObj.styleToUse;
		let style = styleObj.hasOwnProperty(styleToUse) ? styleObj[styleToUse] : styleObj['default'];
		return style;
	}

	/**
	  * A short hand way of creating a movieclip from the singleton resources object
	  *
	  * @static
	  * @param {string} frameNameTemplate A coomon name of a set of resources, each one ending with a different number, for example at res1, res2, res3, ... res14, the alias would be res
	  * @param {number} minFrame the min index to start fetching frames
	  * @param {number} maxFrame the max index to start fetching frames
	  * @param {number} majorIndex total of frames less one
	  * @param {Resources} resources the resources object
	  * @param {boolean} isPingPong specify if this is a ping pong animation
	  * @returns {AnimatedSprite}
	  */
	static fromResources (frameNameTemplate, minFrame, maxFrame, majorIndex, resources, isPingPong) {		// references to created sprites
		const textureArr = [];
		for (let i = 0; i < majorIndex; i++) {
			const isInRange = (i >= minFrame) && (i <= maxFrame);
			if (!isInRange) continue;

			const resource = resources[frameNameTemplate + i];
			textureArr.push(resource.texture);
		}

		if (isPingPong) {
			const reverseArr = [];
			for (let i = textureArr.length - ONE; i >= ZERO; i--) {
				const texture = textureArr[i];
				reverseArr.push(texture);
			}

			reverseArr.forEach((texture) => {
				textureArr.push(texture);
			});
		}

		return new AnimatedSprite(textureArr);
	}
}

export const styles = {
	'styleToUse': 'default',
	'default': {
		'glowableText': {
			'colorStyleName': 'colorStyle',
			'redStyleName': 'redStyle',
			'alpha': 1
		},
		'glowableSprite': {
			'tint': -1, // white
			'alpha': 1
		}
	},
	'tactile': {
		'glowableText': {
			'colorStyleName': 'colorStyleHC',
			'redStyleName': 'redStyleHC',
			'alpha': 0.5
		},
		'glowableSprite': {
			'tint': 0, // black
			'alpha': 0.5
		}
	}
};