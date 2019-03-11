/* eslint-disable no-mixed-spaces-and-tabs */
import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { MindPixiContainer } from 'mind-sdk/mindPixi/MindPixiContainer';
import { MindPixiSprite } from 'mind-sdk/mindPixi/MindPixiSprite';
import { MindGradient } from 'mind-sdk/MindGradient';
import { MindTextureManager } from 'mind-sdk/MindTextureManager';
import { checkLineIntersection } from 'mind-game-components/utils/MathLib';
import { STROKE, COLOR, COMMON_NUMBERS } from '../Constants';

const NO_ALPHA = 1;
const BLACK = 0x000000;
const FIRST_POSITION = 0;
const SECOND_POSITION = 1;
const THIRD_POSITION = 2;

/**
*
* Draw a graphic using dashed lines
*
*/

export function drawDashedPolygon (polygons, x, y, rotation, dash, gap, offsetPercentage) {
	let LinesGraphics = new MindPixiGraphics();
	LinesGraphics.lineStyle(STROKE.STROKE_THIN, BLACK, NO_ALPHA);
	let p1;
	let p2;
	let dashLeft = 0;
	let gapLeft = 0;

	let MIN_OFFSET_PORCENTAJE = 0;
	if (offsetPercentage > MIN_OFFSET_PORCENTAJE) {
		let progressOffset = (dash + gap) * offsetPercentage;
		if (progressOffset < dash) dashLeft = dash - progressOffset;
		else gapLeft = gap - (progressOffset - dash);
	}

	var rotatedPolygons = [];
	let ONE_POSITION = 1;
	let ZERO = 0;

	for (let i = 0; i < polygons.length; i++) {
		let p = { x: polygons[i].x, y: polygons[i].y };
		let cosAngle = Math.cos(rotation);
		let sinAngle = Math.sin(rotation);
		let dx = p.x;
		let dy = p.y;
		p.x = (dx * cosAngle - dy * sinAngle);
		p.y = (dx * sinAngle + dy * cosAngle);
		rotatedPolygons.push(p);
	}
	for (let i = 0; i < rotatedPolygons.length; i++) {
		p1 = rotatedPolygons[i];
		if (i === rotatedPolygons.length - ONE_POSITION) p2 = rotatedPolygons[FIRST_POSITION];
		else p2 = rotatedPolygons[i + ONE_POSITION];
		let dx = p2.x - p1.x;
		let dy = p2.y - p1.y;
		let len = Math.sqrt(dx * dx + dy * dy);
		let normal = { x: dx / len, y: dy / len };
		let progressOnLine = 0;
		LinesGraphics.moveTo(x + p1.x + gapLeft * normal.x, y + p1.y + gapLeft * normal.y);
		while (progressOnLine <= len) {
    		progressOnLine += gapLeft;
			if (dashLeft > ZERO) progressOnLine += dashLeft;
			else progressOnLine += dash;
			if (progressOnLine > len) {
				dashLeft = progressOnLine - len;
				progressOnLine = len;
			} else {
				dashLeft = ZERO;
			}
			LinesGraphics.lineTo(x + p1.x + progressOnLine * normal.x, y + p1.y + progressOnLine * normal.y);
			progressOnLine += gap;
			if (progressOnLine > len && dashLeft === ZERO) {
				gapLeft = progressOnLine - len;
			} else {
				gapLeft = ZERO;
				LinesGraphics.moveTo(x + p1.x + progressOnLine * normal.x, y + p1.y + progressOnLine * normal.y);
			}
		}
	}

	return LinesGraphics;
}

/**
*
* Generate polygons to create a circle using dashed lines
*
*/

export function generateCircle (nSegments, rad) {
	let polygons = [];
	let multByTwo = 2;
	let PI2 = multByTwo * Math.PI;
	let nAngleSeg = PI2 / nSegments;
	for (let i = 0; i < nSegments; i++)		{
		polygons.push({ x: Math.cos(i * nAngleSeg) * rad, y: Math.sin(i * nAngleSeg) * rad });
	}
	return polygons;
}

/**
*
* Generate polygons to create a Rect using dashed lines
*
*/

export function generateRect (w, h) {
	let polygons = [];

	polygons.push({ x: 0, y: 0 });
	polygons.push({ x: w, y: 0 });
	polygons.push({ x: w, y: h });
	polygons.push({ x: 0, y: h });

	return polygons;
}

/**
*
* Generate polygons to create a roundedRect using dashed lines
*
*/

export function generateRoundRect (w, h, rad) {
	let polygons = [];

	let multBy11 = 11;
	let multBy7 = 7;
	let multBy5 = 5;
	let multBy4 = 4;
	let multBy3 = 3;
	let multBy2 = 2;

	let divBy6 = 6;
	let divBy4 = 4;
	let divBy3 = 3;

	let PI7_6 = Math.PI * multBy7 / divBy6;
	let PI5_4 = Math.PI * multBy5 / divBy4;
	let PI4_3 = Math.PI * multBy4 / divBy3;

	let PI5_3 = Math.PI * multBy5 / divBy3;
	let PI7_4 = Math.PI * multBy7 / divBy4;
	let PI11_6 = Math.PI * multBy11 / divBy6;

	let PI1_6 = Math.PI / divBy6;
	let PI1_4 = Math.PI / divBy4;
	let PI1_3 = Math.PI / divBy3;

	let PI2_3 = Math.PI * multBy2 / divBy3;
	let PI3_4 = Math.PI * multBy3 / divBy4;
	let PI5_6 = Math.PI * multBy5 / divBy6;

	polygons.push({ x: 0, y: rad });
	polygons.push({ x: rad + Math.cos(PI7_6) * rad, y: rad + Math.sin(PI7_6) * rad });
	polygons.push({ x: rad + Math.cos(PI5_4) * rad, y: rad + Math.sin(PI5_4) * rad });
	polygons.push({ x: rad + Math.cos(PI4_3) * rad, y: rad + Math.sin(PI4_3) * rad });
	polygons.push({ x: rad, y: 0 });

	polygons.push({ x: w - rad, y: 0 });
	polygons.push({ x: w - rad + Math.cos(PI5_3) * rad, y: rad + Math.sin(PI5_3) * rad });
	polygons.push({ x: w - rad + Math.cos(PI7_4) * rad, y: rad + Math.sin(PI7_4) * rad });
	polygons.push({ x: w - rad + Math.cos(PI11_6) * rad, y: rad + Math.sin(PI11_6) * rad });
	polygons.push({ x: w, y: rad });

	polygons.push({ x: w, y: h - rad });
	polygons.push({ x: w - rad + Math.cos(PI1_6) * rad, y: h - rad + Math.sin(PI1_6) * rad });
	polygons.push({ x: w - rad + Math.cos(PI1_4) * rad, y: h - rad + Math.sin(PI1_4) * rad });
	polygons.push({ x: w - rad + Math.cos(PI1_3) * rad, y: h - rad + Math.sin(PI1_3) * rad });
	polygons.push({ x: w - rad, y: h });

	polygons.push({ x: rad, y: h });
	polygons.push({ x: rad + Math.cos(PI2_3) * rad, y: h - rad + Math.sin(PI2_3) * rad });
	polygons.push({ x: rad + Math.cos(PI3_4) * rad, y: h - rad + Math.sin(PI3_4) * rad });
	polygons.push({ x: rad + Math.cos(PI5_6) * rad, y: h - rad + Math.sin(PI5_6) * rad });
	polygons.push({ x: 0, y: h - rad });

	return polygons;
}

/*
*
* Format color (css format) to hexadecimal
*
*/

export function formatColor (color) {
	let colorIn = color;
	let colorOut = color;

	colorIn = colorIn.replace('rgba(', '').replace(')', '');
	var array = colorIn.split(',').map(Number);
	let ONE_ELEMENT = 1;
	let HEX = 16;
	let sliceValue = -2;
	if (array.length > ONE_ELEMENT) {
		let HexNumber = '0x';
		HexNumber += ('0' + (Number(array[FIRST_POSITION]).toString(HEX))).slice(sliceValue).toUpperCase(); // Red
		HexNumber += ('0' + (Number(array[SECOND_POSITION]).toString(HEX))).slice(sliceValue).toUpperCase(); // Green
		HexNumber += ('0' + (Number(array[THIRD_POSITION]).toString(HEX))).slice(sliceValue).toUpperCase(); // Blue
		colorOut = HexNumber;
	}

	return colorOut;
}

/**
 *
 * @param {*} width
 * @param {*} height
 * @param {*} gradientProperties
 * @param {*} lineWidth
 * @param {*} lineColor
 */
export function drawGradientRect (width, height, gradientProperties, lineWidth, lineColor, lineAlpha = COLOR.ALPHA_BLACK_2) {
	let container = new MindPixiContainer();
	let _arena = container.arena;

	// let GradientBox = new MindPixiSprite(undefined, { Rng: _arena.Rng });
	// const RESOLUTION_SCALE = 2;
	const POSITION_ZERO = 0;

	// create a linear gradient
	let gradientW = width;
	let gradientH = height;

	if (gradientProperties === undefined) {
		gradientProperties = {
			type: 'linear',
			w: gradientW, //     [Linear/Radial: ending radius of gradient]
			h: gradientH, //     [Linear/Radial: ending radius of gradient]
			x0: 25,  //   [Linear/Radial: starting x point of gradient line (direction of gradient, not position of object)]
			y0: 0,  //   [Linear/Radial: starting y point of gradient line (direction of gradient, not position of object)]
			x1: 25,
			y1: gradientH,
			colorStops: COLOR.PLATFORM_GRADIENT
		};
	}

	// we will grab the texture from this container.

	let newGradientGenerator = new MindGradient(gradientProperties);

	let gradientSprite = new MindPixiSprite(newGradientGenerator.Texture(), { Rng: _arena.Rng });

	// let w = gradientSprite.width;
	// let h = gradientSprite.height;

	/*
	let renderNoLineTexture = new _arena.PIXI.RenderTexture.create(w, h, undefined, RESOLUTION_SCALE);
	_arena.app.renderer.render(gradientSprite, renderNoLineTexture);
	GradientBox._textureNoline = renderNoLineTexture;
	*/
	// now draw stroke
	let graphics = new MindPixiGraphics();
	graphics.lineStyle(lineWidth, lineColor, lineAlpha);
	graphics.drawRect(POSITION_ZERO, POSITION_ZERO, gradientSprite.width, gradientSprite.height, COLOR.NO_ALPHA);
	graphics.endFill();

	// add both the gradient and the stroke into the container.
	// if you want to add the stroke on top, addChild it after.
	container.addChild(gradientSprite);
	container.addChild(graphics);
	// strokes are not considered in bounds calculations so we must calculate it ourselves.

	container.gradientSprite = gradientSprite;
	container.border = graphics;

	container.reDraw = (newGadientProperties = gradientProperties, newLineWidth = lineWidth, newLineColor = lineColor, newLineAlpha = lineAlpha) => {
		let gradientGenerator = new MindGradient(newGadientProperties);
		container.gradientSprite.texture = gradientGenerator.Texture();

		container.border.clear();
		container.border.lineStyle(newLineWidth, newLineColor, newLineAlpha);
		container.border.drawRect(POSITION_ZERO, POSITION_ZERO, container.gradientSprite.width, container.gradientSprite.height, COLOR.NO_ALPHA);
		container.border.endFill();
	};

	return container;
}

export function drawGradientRectTexture (width, height, gradientProperties, lineWidth, lineColor, lineAlpha = COLOR.ALPHA_BLACK_2) {
	let container = new MindPixiContainer();
	let _arena = container.arena;

	const RESOLUTION_SCALE = 2;
	// const POSITION_ZERO = 0;

	// create a linear gradient
	let gradientW = width;
	let gradientH = height;

	if (gradientProperties === undefined) {
		gradientProperties = {
			type: 'linear',
			w: gradientW, //     [Linear/Radial: ending radius of gradient]
			h: gradientH, //     [Linear/Radial: ending radius of gradient]
			x0: 25,  //   [Linear/Radial: starting x point of gradient line (direction of gradient, not position of object)]
			y0: 0,  //   [Linear/Radial: starting y point of gradient line (direction of gradient, not position of object)]
			x1: 25,
			y1: gradientH,
			colorStops: COLOR.PLATFORM_GRADIENT
		};
	}

	// we will grab the texture from this container.

	let newGradientGenerator = new MindGradient(gradientProperties);

	let gradientSprite = new MindPixiSprite(newGradientGenerator.Texture(), { Rng: _arena.Rng });

	let w = gradientSprite.width;
	let h = gradientSprite.height;

	let renderNoLineTexture = new _arena.PIXI.RenderTexture.create(w, h, undefined, RESOLUTION_SCALE);
	_arena.app.renderer.render(gradientSprite, renderNoLineTexture);

	// now draw stroke
	let graphics = new MindPixiGraphics();
	graphics.lineStyle(lineWidth * COMMON_NUMBERS.TWO, lineColor, lineAlpha);
	graphics.drawRect(lineWidth * COMMON_NUMBERS.DIV_2, lineWidth * COMMON_NUMBERS.DIV_2, gradientSprite.width - lineWidth * COMMON_NUMBERS.DIV_2, gradientSprite.height - lineWidth * COMMON_NUMBERS.DIV_2, COLOR.NO_ALPHA);
	graphics.endFill();

	// add both the gradient and the stroke into the container.
	// if you want to add the stroke on top, addChild it after.
	container.addChild(gradientSprite);
	container.addChild(graphics);
	// strokes are not considered in bounds calculations so we must calculate it ourselves.

	// generate the id however, but this is oneway to cache in texture manager.
	let id = JSON.stringify(gradientProperties) + JSON.stringify(graphics.graphicsData);
	let texture = MindTextureManager.getTexture(id);

	if (!texture) {
		let renderTexture = new _arena.PIXI.RenderTexture.create(w, h, undefined, RESOLUTION_SCALE);
		_arena.app.renderer.render(container, renderTexture);
		texture = renderTexture;
		MindTextureManager.saveTexture(id, texture);
	}

	// destroy container
	container.destroy(true);
	if (container.parent) {
		container.parent.removeChild(container);
	}

	return texture;
}

/**
 *
 * @param {*} radius
 * @param {*} gradientProperties
 * @param {*} lineWidth
 * @param {*} lineColor
 * @param {*} lineAlpha
 */
export function drawGradientCircle (radius, gradientProperties, lineWidth, lineColor, lineAlpha) {
	let hotpoint = new MindPixiContainer();
	let _arena = hotpoint.arena;

	// draw circle
	let hotpointShape = new MindPixiGraphics(false, { Rng: _arena.Rng });
	let hotpointBorder = new MindPixiGraphics(false, { Rng: _arena.Rng });
	const CENTER_CIRCLE_ANCHOR = 0.5;

	// create a gradient
	if (gradientProperties === undefined) {
		gradientProperties = {
			type: 'linear',
			w: radius * COMMON_NUMBERS.TWO, // [Linear/Radial: ending radius of gradient]
			h: radius * COMMON_NUMBERS.TWO, // [Linear/Radial: ending radius of gradient]
			x0: CENTER_CIRCLE_ANCHOR, // [Linear/Radial: starting x point of gradient line (direction of gradient, not position of object)]
			x1: CENTER_CIRCLE_ANCHOR,
			colorStops: ['#808080', '#808080']
		};
	}

	// draw the hotpoint shape
	hotpointShape.beginFill(COLOR.BLACK);
	hotpointShape.drawCircle(radius, radius, radius).endFill();
	hotpoint.addChild(hotpointShape);

	// draw gradient
	let gradientSprite = new MindPixiSprite();
	gradientSprite.texture = (new MindGradient(gradientProperties)).Texture();
	gradientSprite.mask = hotpointShape;
	hotpoint.addChild(gradientSprite);

	// draw the hotpoint border
	hotpointBorder.lineStyle(lineWidth, lineColor, lineAlpha);
	hotpointBorder.drawCircle(radius, radius, radius).endFill();
	hotpoint.addChild(hotpointBorder);

	hotpoint.fillObject = gradientSprite;
	hotpoint.fillMaskObject = hotpointShape;
	hotpoint.borderObject = hotpointBorder;

	return hotpoint;
}

export function drawGradientCircleTexture (radius, gradientProperties, lineWidth, lineColor, lineAlpha) {
	let hotpoint = new MindPixiContainer();
	let _arena = hotpoint.arena;

	// draw circle
	let hotpointShape = new MindPixiGraphics(false, { Rng: _arena.Rng });
	let hotpointBorder = new MindPixiGraphics(false, { Rng: _arena.Rng });
	const CENTER_CIRCLE_ANCHOR = 0.5;
	const RESOLUTION_SCALE = 4;

	// create a gradient
	if (gradientProperties === undefined) {
		gradientProperties = {
			type: 'linear',
			w: radius * COMMON_NUMBERS.TWO, // [Linear/Radial: ending radius of gradient]
			h: radius * COMMON_NUMBERS.TWO, // [Linear/Radial: ending radius of gradient]
			x0: CENTER_CIRCLE_ANCHOR, // [Linear/Radial: starting x point of gradient line (direction of gradient, not position of object)]
			x1: CENTER_CIRCLE_ANCHOR,
			colorStops: ['#808080', '#808080']
		};
	}

	// draw the hotpoint shape
	hotpointShape.beginFill(COLOR.BLACK);
	hotpointShape.drawCircle(radius, radius, radius).endFill();
	hotpoint.addChild(hotpointShape);

	// draw gradient
	let gradientSprite = new MindPixiSprite();
	gradientSprite.texture = (new MindGradient(gradientProperties)).Texture();
	gradientSprite.mask = hotpointShape;
	hotpoint.addChild(gradientSprite);

	// draw the hotpoint border
	hotpointBorder.lineStyle(lineWidth, lineColor, lineAlpha);
	hotpointBorder.drawCircle(radius, radius, radius).endFill();
	hotpoint.addChild(hotpointBorder);

	hotpoint.fillObject = gradientSprite;
	hotpoint.fillMaskObject = hotpointShape;
	hotpoint.borderObject = hotpointBorder;

	let id = JSON.stringify(gradientProperties) + JSON.stringify(hotpointShape.graphicsData);
	let texture = MindTextureManager.getTexture(id);

	if (!texture) {
		let renderTexture = new _arena.PIXI.RenderTexture.create(hotpoint.width, hotpoint.height, undefined, RESOLUTION_SCALE);
		_arena.app.renderer.render(hotpoint, renderTexture);
		texture = renderTexture;
		MindTextureManager.saveTexture(id, texture);
	}

	return texture;
}

/**
 * Draw minus block
 * @param {*} width
 * @param {*} height
 */
export function drawMinusBlock (width, height) {
	// Set Block
	const POSITION_ZERO = 0;

	let _block = new MindPixiGraphics();
	let _arena = _block.arena;

	let _styleObj = _arena.theme.getStyles('minusBlock');
	let _style = _styleObj[_styleObj.styleToUse];

	let blockHeight = height;
	let blockWidth = width;
	let lineSpace = _style.lineSpace;

	// Draw Lines

	let rightLineStart = { x: blockWidth, y: 0 };
	let rightLineEnd = { x: blockWidth, y: blockHeight };

	let bottomLineStart = { x: 0, y: blockHeight };
	let bottomLineEnd = { x: blockWidth, y: blockHeight };

	let numLines = 0;
	let totalDist = blockWidth + blockHeight;
	let dist = 0;

	while (dist < totalDist - lineSpace) {
		dist += _style.lineWidth + lineSpace;
		numLines++;
	}

	_block.lineStyle(_style.lineWidth, _style.lineColor, NO_ALPHA);

	let resetValue = 0;
	dist = resetValue;
	for (let i = 0; i < numLines; i++) {
		dist += lineSpace;
		let lineStart = { x: 0, y: dist };
		let lineEnd = { x: dist, y: 0 };

		if (dist <= blockWidth && dist >= blockHeight) {
			let intersectBottom = checkLineIntersection(lineStart, lineEnd, bottomLineStart, bottomLineEnd);
			_block.moveTo(intersectBottom.x, intersectBottom.y);
			_block.lineTo(lineEnd.x, lineEnd.y);
		} else if (dist <= blockWidth) {
			//
			_block.moveTo(lineStart.x, lineStart.y);
			_block.lineTo(lineEnd.x, lineEnd.y);
		} else if (dist <= blockHeight) {
			let intersectRight = checkLineIntersection(lineStart, lineEnd, rightLineStart, rightLineEnd);
			_block.moveTo(lineStart.x, lineStart.y);
			_block.lineTo(intersectRight.x, intersectRight.y);
		} else {
			let intersectRight = checkLineIntersection(lineStart, lineEnd, rightLineStart, rightLineEnd);
			let intersectBottom = checkLineIntersection(lineStart, lineEnd, bottomLineStart, bottomLineEnd);
			_block.moveTo(intersectBottom.x, intersectBottom.y);
			_block.lineTo(intersectRight.x, intersectRight.y);
		}

		dist += _style.lineWidth;
	}

	// Draw block

	_block.lineStyle(_style.blockStrokeWidth, _style.blockStrokeColor, COLOR.NO_ALPHA);
	_block.drawRect(POSITION_ZERO, POSITION_ZERO, blockWidth, blockHeight);

	_block.reDraw = () => {
		let _styleObj = _arena.theme.getStyles('minusBlock');
		let _style = _styleObj[_styleObj.styleToUse];

		_block.clear();
		_block.lineStyle(_style.lineWidth, _style.lineColor, NO_ALPHA);

		let resetValue = 0;
		dist = resetValue;
		for (let i = 0; i < numLines; i++) {
			dist += lineSpace;
			let lineStart = { x: 0, y: dist };
			let lineEnd = { x: dist, y: 0 };

			if (dist <= blockWidth && dist >= blockHeight) {
				let intersectBottom = checkLineIntersection(lineStart, lineEnd, bottomLineStart, bottomLineEnd);
				_block.moveTo(intersectBottom.x, intersectBottom.y);
				_block.lineTo(lineEnd.x, lineEnd.y);
			} else if (dist <= blockWidth) {
				//
				_block.moveTo(lineStart.x, lineStart.y);
				_block.lineTo(lineEnd.x, lineEnd.y);
			} else if (dist <= blockHeight) {
				let intersectRight = checkLineIntersection(lineStart, lineEnd, rightLineStart, rightLineEnd);
				_block.moveTo(lineStart.x, lineStart.y);
				_block.lineTo(intersectRight.x, intersectRight.y);
			} else {
				let intersectRight = checkLineIntersection(lineStart, lineEnd, rightLineStart, rightLineEnd);
				let intersectBottom = checkLineIntersection(lineStart, lineEnd, bottomLineStart, bottomLineEnd);
				_block.moveTo(intersectBottom.x, intersectBottom.y);
				_block.lineTo(intersectRight.x, intersectRight.y);
			}

			dist += _style.lineWidth;
		}

		// Draw block

		_block.lineStyle(_style.blockStrokeWidth, _style.blockStrokeColor, COLOR.NO_ALPHA);
		_block.drawRect(POSITION_ZERO, POSITION_ZERO, blockWidth, blockHeight);
	};

	return _block;
}

/**
 * Add this to the theme if you nedd draw a minus block
 */
export const minusBlockStyle = {
	'styleToUse': 'default',
	'default': {
		'blockStrokeColor': COLOR.INCORRECT_RED,
		'blockStrokeWidth': 1.5,
		'lineColor': COLOR.INCORRECT_RED_STROKE,
		'lineWidth': 0.75,
		'lineSpace': 4
	},
	'tactile': {
		'blockStrokeColor': COLOR.FILL_DARK_GRAY,
		'blockStrokeWidth': 1.5,
		'lineColor': COLOR.FILL_DARK_GRAY,
		'lineWidth': 0.75,
		'lineSpace': 4
	}
};