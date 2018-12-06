import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { STROKE } from './Constants';

/**
*
* Draw a graphic using dashed lines
*
*/

export function drawDashedPolygon (polygons, x, y, rotation, dash, gap, offsetPercentage) {
	let LinesGraphics = new MindPixiGraphics();
	LinesGraphics.lineStyle(STROKE.STROKE_THIN, 0x000000, 1);
	this.addChild(LinesGraphics);
	let p1;
	let p2;
	let dashLeft = 0;
	let gapLeft = 0;
	if (offsetPercentage > 0) {
		let progressOffset = (dash + gap) * offsetPercentage;
		if (progressOffset < dash) dashLeft = dash - progressOffset;
		else gapLeft = gap - (progressOffset - dash);
	}
	var rotatedPolygons = [];
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
		if (i === rotatedPolygons.length - 1) p2 = rotatedPolygons[0];
		else p2 = rotatedPolygons[i + 1];
		let dx = p2.x - p1.x;
		let dy = p2.y - p1.y;
		let len = Math.sqrt(dx * dx + dy * dy);
		let normal = {x: dx / len, y: dy / len};
		let progressOnLine = 0;
		LinesGraphics.moveTo(x + p1.x + gapLeft * normal.x, y + p1.y + gapLeft * normal.y);
		while (progressOnLine <= len) {
    		progressOnLine += gapLeft;
			if (dashLeft > 0) progressOnLine += dashLeft;
			else progressOnLine += dash;
			if (progressOnLine > len) {
				dashLeft = progressOnLine - len;
				progressOnLine = len;
			} else {
				dashLeft = 0;
			}
			LinesGraphics.lineTo(x + p1.x + progressOnLine * normal.x, y + p1.y + progressOnLine * normal.y);
			progressOnLine += gap;
			if (progressOnLine > len && dashLeft === 0) {
				gapLeft = progressOnLine - len;
			} else {
				gapLeft = 0;
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
	let nAngleSeg = 2 * Math.PI / nSegments;
	for (let i = 0; i < nSegments; i++)		{
		polygons.push({x: Math.cos(i * nAngleSeg) * rad, y: Math.sin(i * nAngleSeg) * rad});
	}
	return polygons;
}

/**
*
* Generate polygons to create a roundedRect using dashed lines
*
*/

export function generateRoundRect (w, h, rad) {
	let polygons = [];

	polygons.push({ x: 0, y: rad });
	polygons.push({ x: rad + Math.cos(7 * Math.PI / 6) * rad, y: rad + Math.sin(7 * Math.PI / 6) * rad});
	polygons.push({ x: rad + Math.cos(5 * Math.PI / 4) * rad, y: rad + Math.sin(5 * Math.PI / 4) * rad});
	polygons.push({ x: rad + Math.cos(4 * Math.PI / 3) * rad, y: rad + Math.sin(4 * Math.PI / 3) * rad});
	polygons.push({ x: rad, y: 0 });

	polygons.push({ x: w - rad, y: 0 });
	polygons.push({ x: w - rad + Math.cos(5 * Math.PI / 3) * rad, y: rad + Math.sin(5 * Math.PI / 3) * rad});
	polygons.push({ x: w - rad + Math.cos(7 * Math.PI / 4) * rad, y: rad + Math.sin(7 * Math.PI / 4) * rad});
	polygons.push({ x: w - rad + Math.cos(11 * Math.PI / 6) * rad, y: rad + Math.sin(11 * Math.PI / 6) * rad});
	polygons.push({ x: w, y: rad });

	polygons.push({ x: w, y: h - rad });
	polygons.push({ x: w - rad + Math.cos(Math.PI / 6) * rad, y: h - rad + Math.sin(Math.PI / 6) * rad});
	polygons.push({ x: w - rad + Math.cos(Math.PI / 4) * rad, y: h - rad + Math.sin(Math.PI / 4) * rad});
	polygons.push({ x: w - rad + Math.cos(Math.PI / 3) * rad, y: h - rad + Math.sin(Math.PI / 3) * rad});
	polygons.push({ x: w - rad, y: h });

	polygons.push({ x: rad, y: h });
	polygons.push({ x: rad + Math.cos(2 * Math.PI / 3) * rad, y: h - rad + Math.sin(2 * Math.PI / 3) * rad});
	polygons.push({ x: rad + Math.cos(3 * Math.PI / 4) * rad, y: h - rad + Math.sin(3 * Math.PI / 4) * rad});
	polygons.push({ x: rad + Math.cos(5 * Math.PI / 6) * rad, y: h - rad + Math.sin(5 * Math.PI / 6) * rad});
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
	if (array.length > 1) {
		let HexNumber = '0x';
		HexNumber += ('0' + (Number(array[0]).toString(16))).slice(-2).toUpperCase(); // Red
		HexNumber += ('0' + (Number(array[1]).toString(16))).slice(-2).toUpperCase(); // Green
		HexNumber += ('0' + (Number(array[2]).toString(16))).slice(-2).toUpperCase(); // Blue
		colorOut = HexNumber;
	}

	return colorOut;
}
