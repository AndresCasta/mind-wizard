import { MixinThemable } from './MixinThemable';
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { ThemableSprite } from './ThemableSprite';
import { MindTextureManager } from 'mind-sdk/MindTextureManager';

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

	scaleGraphic (scaleX = undefined, scaleY = undefined) {
		const ZERO = 0;
		if (this.graphicsData.length > ZERO) {
			for (let i = 0; i < this.graphicsData.length; i++) {
				const graphData = this.graphicsData[i];				
				const points = graphData.shape.points;
				// moves graphic points to origin and applies the button scale.
				for (let i = 0; i < points.length; i++) {
					if ((i & ONE) === 1) { // odd (y component)
						if (typeof scaleY === 'undefined') continue;
						const y = points[i];
						points[i] = y * scaleY;
					} else { // even (x component)
						if (typeof scaleX === 'undefined') continue;
						const x = points[i];
						points[i] = x * scaleX;
					}
				}
			}
		}
		// points is an array in the following format: [x1, y1, x2, y2, x3, y3]
	}

	convertToSprite () {
		let newSprite = new ThemableSprite(undefined);
		let defaultCopy = new MindPixiGraphics();
		let tactileCopy = new MindPixiGraphics();

		let styleObj = this.arena.theme.getStyles(this._styleName);
		let defaultStyle = styleObj['default'];
		let tactileStyle = styleObj['tactile'];

		defaultCopy.beginFill(defaultStyle.fillColor, defaultStyle.fillAlpha);
		defaultCopy.lineStyle(defaultStyle.lineWidth, defaultStyle.lineColor, defaultStyle.lineAlpha);

		tactileCopy.beginFill(tactileStyle.fillColor, tactileStyle.fillAlpha);
		tactileCopy.lineStyle(tactileStyle.lineWidth, tactileStyle.lineColor, tactileStyle.lineAlpha);

		const TEXTURE_RES = 2;

		for (let i = 0; i < this.graphicsData.length; i++) {
			let currGraphicsData = this.graphicsData[i];
			defaultCopy.drawShape(currGraphicsData.shape);
			tactileCopy.drawShape(currGraphicsData.shape);
		}

		let defaultTextureId = 'defaultGraph' + JSON.stringify(defaultCopy.graphicsData);
		let defaultTexture = MindTextureManager.getTexture(defaultTextureId);

		if (!defaultTexture) {
			defaultTexture = MindTextureManager.generateTextureFromDisplayObject(defaultCopy, undefined, undefined, TEXTURE_RES, true);
			MindTextureManager.saveTexture(defaultTextureId, defaultTexture);
		}

		let tactileTextureId = 'tactileGraph' + JSON.stringify(tactileCopy.graphicsData);
		let tactileTexture = MindTextureManager.getTexture(tactileTextureId);

		if (!tactileTexture) {
			tactileTexture = MindTextureManager.generateTextureFromDisplayObject(tactileCopy, undefined, undefined, TEXTURE_RES, true);
			MindTextureManager.saveTexture(tactileTextureId, tactileTexture);
		}

		newSprite.themeOptions = {
			default: {
				texture: defaultTexture
			},
			tactile: {
				texture: tactileTexture
			}
		};

		return newSprite;
	}

	updateGraphic () {
		this.dirty++;
		this.clearDirty++;
	}
}
