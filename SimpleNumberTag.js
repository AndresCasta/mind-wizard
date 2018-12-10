// mind sdk classes
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';
import { MindTextureManager } from 'mind-sdk/MindTextureManager';
import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';

/**
 * This class is used to represent a tag or pin normally used in slider.
 * @export
 * @class SimpleNumberTag
 * @extends {MindPixiGraphics}
 */
export class SimpleNumberTag extends MindPixiSprite {
	constructor (textString, mindObjectOptions) {
		super(undefined, mindObjectOptions);

		// store values
		this._PIXI = this.arena.PIXI;

		this._textElement = null; // the text element inside the pin
		this._textString = textString;
		this.setupShape();

		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this.scale.x = 0.55;
		this.scale.y = 0.55;
	}

	/**
	 * Render box object. This function is called when object is added to a container or when the theme is changes.
	 * @memberof Box
	 */
	render () {
		super.render();
	}

	setupShape () {
		let w = 64;
		let h = 44;

		let fontStyle = {fontSize: 32, fill: 0xffffff, align: 'center'};

		// REQUESTED NUM LABEL
		// text label for show the currently requested number
		this._textElement = new MindPixiText(this._textString || '1', fontStyle);
		this._textElement.x = 0;			this._textElement.y = -9; // 0
		this._textElement.anchor.x = 0.5;	this._textElement.anchor.y = 0.5;
		this.addChild(this._textElement);

        // return val
		let texture = null;

        // draw shape fill
		let g = new MindPixiGraphics(); // graphic for draw the bacgound rect
		g.beginFill(0x0).drawRect(0, 0, w, h).endFill(); // draw rect
		g.beginFill(0x0).drawPolygon([2 * w / 5, h, 3 * w / 5, h, w / 2, h * 1.4]).endFill(); // draw triangle
		texture = MindTextureManager.generateTextureFromGraphic(g); // convert rect graphic to texture

		this.texture = texture;
		this.calculateBounds(); // recalculate bounds
	}

	set text (value) {
		this._textString = value;
		this._textElement.text = value;
	}

	/**
	 * Destroy the shape
	 * @memberof shape
	 */
	destroy (options) {
		super.destroy(options);
	}
}
