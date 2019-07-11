import { MixinThemable } from './MixinThemable';
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';

export class ThemableGraphic extends MixinThemable(MindPixiGraphics) {
	constructor (...args) {
		super(...args);

		this.updateFillAlpha = true;
		this.updateFillColor = true;
		this.updateLineAlpha = true;
		this.updateLineColor = true;
		this.updateLineWidth = true;
	}

	_onThemeChangeMain (event) {
		let style = this.extractStyleStatic(this.arena.theme, this._styleName, this._styleObj);
		for (let i = 0; i < this.graphicsData.length; i++) {
			let currGraphicsData = this.graphicsData[i];
			if (this.updateFillAlpha) {
				currGraphicsData.fillAlpha = style.fillAlpha;
			}
			if (this.updateFillColor) {
				currGraphicsData.fillColor = style.fillColor;
			}
			if (this.updateLineAlpha) {
				currGraphicsData.lineAlpha = style.lineAlpha;
			}
			if (this.updateLineColor) {
				currGraphicsData.lineColor = style.lineColor;
			}
			if (this.updateLineWidth) {
				currGraphicsData.lineWidth = style.lineWidth;
			}
		}

		this.updateGraphic();
	}

	setAttr (key, value) {
		let changed = false;
		for (let i = 0; i < this.graphicsData.length; i++) {
			let currGraphicsData = this.graphicsData[i];
			if (currGraphicsData[key] !== undefined) {
				currGraphicsData[key] = value;
				changed = true;
			}
		}
		if (changed) {
			this.updateGraphic();
		}
	}

	getAttr (key) {
		const POS_ZERO = 0;
		let currGraphicsData = this.graphicsData[POS_ZERO];
		return currGraphicsData[key];
	}

	updateGraphic () {
		this.dirty++;
		this.clearDirty++;
	}
}
