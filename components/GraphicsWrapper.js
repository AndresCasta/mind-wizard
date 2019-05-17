/* eslint-disable no-unneeded-ternary */
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';

export class GraphicsWrapper extends MindPixiGraphics {
	constructor (styleId = 'defaulGraphicStyle') {
		super();

		this.styleId = styleId;
		this.style = this.ExtractStyle(this.styleId);

		this.eventEmitter.on(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChange, this);
		this.updateFillAlpha = true;
		this.updateFillColor = true;
		this.updateLineAlpha = true;
		this.updateLineColor = true;
		this.updateLineWidth = true;
	}

	destroy (options) {
		this.eventEmitter.removeListener(this.mindEvents.EVENT_THEME_CHANGED, this._onThemeChange, this);

		super.destroy(options);
	}

	_onThemeChange (event) {
		this.style = this.ExtractStyle(this.styleId);

		for (let i = 0; i < this.graphicsData.length; i++) {
			let currGraphicsData = this.graphicsData[i];
			if (this.updateFillAlpha) {
				currGraphicsData.fillAlpha = this.style.fillAlpha;
			}
			if (this.updateFillColor) {
				currGraphicsData.fillColor = this.style.fillColor;
			}
			if (this.updateLineAlpha) {
				currGraphicsData.lineAlpha = this.style.lineAlpha;
			}
			if (this.updateLineColor) {
				currGraphicsData.lineColor = this.style.lineColor;
			}
			if (this.updateLineWidth) {
				currGraphicsData.lineWidth = this.style.lineWidth;
			}
		}

		this.updateGraphic();
	}

	initDrawing () {
		this.lineStyle(this.style.lineWidth, this.style.lineColor, this.style.lineAlpha);
		this.beginFill(this.style.fillColor, this.style.fillAlpha);
	}

	setAttr (key, value) {
		let changed = false;
		for (let i = 0; i < this.graphicsData.length; i++) {
			let currGraphicsData = this.graphicsData[i];
			if (currGraphicsData[key]) {
				currGraphicsData[key] = value;
				changed = true;
			}
		}
		if (changed) {
			this.updateGraphic();
		}
	}

	updateGraphic () {
		this.dirty++;
		this.clearDirty++;
	}

	getattr (key) {
		const POS_ZERO = 0;
		let currGraphicsData = this.graphicsData[POS_ZERO];
		return currGraphicsData[key];
	}

	ExtractStyle (key) {
		let styleObj = this.arena.theme.getStyles(key);
		let currStyle = styleObj ? styleObj[styleObj.styleToUse] : styles;
		return currStyle;
	}
}

export const styles = { // add this to the theme using the key 'backButton'
	'styleToUse': 'default',
	'default': {
		'fillAlpha': 1,
		'fillColor': 0xFFFFFF,
		'lineAlpha': 0.66,
		'lineColor': 0x000000,
		'lineWidth': 1.5
	},
	'tactile': {
		'fillAlpha': 1,
		'fillColor': 0xFFFFFF,
		'lineAlpha': 0.66,
		'lineColor': 0x000000,
		'lineWidth': 1.5
	}
};
