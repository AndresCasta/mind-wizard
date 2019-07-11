import { drawSVGOutlineToGraphic } from 'mind-game-components/utils/SVGLib';

const ONE = 1;

export function svgOutlineToGraphicScalable (resource, id, graphic, finalWidth, finalHeight) {
	drawSVGOutlineToGraphic(resource, id, graphic);
	// points is an array in the following format: [x1, y1, x2, y2, x3, y3]
	const points = graphic.graphicsData[0].shape.points;
	let minX = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;
	// Gets min and max points
	for (let i = 0; i < points.length; i++) {
		if ((i & ONE) === 1) { // odd (y component)
			const y = points[i];
			minY = Math.min(y, minY);
			maxY = Math.max(y, maxY);
		} else { // even (x component)
			const x = points[i];
			minX = Math.min(x, minX);
			maxX = Math.max(x, maxX);
		}
	}
	const width = maxX - minX;
	const height = maxY - minY;
	if (typeof finalWidth === 'undefined') finalWidth = width;
	const scaleX = finalWidth / width;
	let scaleY;
	if (typeof finalHeight === 'undefined') {
		scaleY = scaleX;
	} else {
		scaleY = finalHeight / height;
	}
	// moves graphic points to origin and applies the button scale.
	for (let i = 0; i < points.length; i++) {
		if ((i & ONE) === 1) { // odd (y component)
			const y = points[i];
			points[i] = (y - minY) * scaleY;
		} else { // even (x component)
			const x = points[i];
			points[i] = (x - minX) * scaleX;
		}
	}

	return {
		width: width,
		height: height,
		scaleX: scaleX,
		scaleY: scaleY,
		graphic: graphic
	};
}

export function scaleGraphic (graphic, scaleX = undefined, scaleY = undefined) {
	// points is an array in the following format: [x1, y1, x2, y2, x3, y3]
	const points = graphic.graphicsData[0].shape.points;
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
