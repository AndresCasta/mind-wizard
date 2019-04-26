import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { VALIDATE } from './VALIDATE';
import { COLOR, STROKE } from '../Constants';

// numeric constants
const ZERO = 0;
const ONE = 1;

export class Grid extends MindPixiGraphics {
	constructor (argProp, mindGameObjectOptions) {
		super(undefined, mindGameObjectOptions);
		if (typeof argProp !== 'object' || !argProp) throw new Error('Please specify an argProp object at constructor argument');

		this.argProp = argProp;
		this.cellInfo = { width: undefined, height: undefined, numOfHorizontal: undefined, numOfVertical: undefined };
		this._style = this.extractStyleStatic(this.arena.theme, 'grid');

		this._maskShape = new MindPixiGraphics();
		this.addChild(this._maskShape);
		// this.addChild(maskShape);

		this.draw();
		// this.once('added', this.draw, this);
	}

	draw () {
		// unpack arguments
		let argProp = this.argProp;
		let gridSize = VALIDATE.requiredArg(argProp.gridSize, 'missing gridSize property in object passed as constructor argument');
		// let numCells = this.requiredArg(argProp.numCells, 'missing numCells property in object passed as constructor argument');
		let cellSize = VALIDATE.requiredArg(argProp.cellSize, 'missing cellSize property in object passed as constructor argument');
		let lineWidth = VALIDATE.defaultArg(argProp.lineWidth, this._style.lineWidth);
		let lineColor = VALIDATE.defaultArg(argProp.lineColor, this._style.lineColor);
		let lineAlpha = VALIDATE.defaultArg(argProp.lineAlpha, this._style.lineAlpha);
		let boundLineWidth = VALIDATE.defaultArg(argProp.boundLineWidth, this._style.boundLineWidth);
		let shouldDrawBound = VALIDATE.defaultArg(argProp.drawBound, this._style.drawBound);

        // calculate cell size
		// let cellSize = size / numCells;
		let numCells = gridSize / cellSize;//	VALIDATE._ASSERT(Number.isInteger(numCells), 'For your happiness please make the gridSize a multiple of your cellSize');
		this.cellInfo.size = cellSize;
		this.cellInfo.numCells = numCells;

		// draw debugs
		this.debugs({ GRID_BOUND: false, GRID_ORIGIN: true });

		// draw vertical lines
		this.lineStyle(lineWidth, lineColor, lineAlpha);
		for (let horizontalLineIter = 1; horizontalLineIter < numCells; horizontalLineIter++) {
			this.moveTo(ZERO, cellSize * horizontalLineIter); // start
			this.lineTo(gridSize, cellSize * horizontalLineIter); // end
		}

		// draw horizontal lines
		for (let verticalLineIter = 1; verticalLineIter < numCells; verticalLineIter++) {
			this.moveTo(cellSize * verticalLineIter, ZERO); // start
			this.lineTo(cellSize * verticalLineIter, gridSize); // end
		}

		if (shouldDrawBound) {
			this.lineStyle(boundLineWidth, lineColor, lineAlpha);
			this.beginFill(ZERO, ZERO); // dark gray
			this.drawRect(this.x, this.y, gridSize, gridSize);
		}
	}

	updateDraw (argProp) {
		this.draw(argProp);
	}

	get colliderWidth () {
		return this.argProp.width;
	}

	get colliderHeight () {
		return this.argProp.height;
	}

	debugs (debugOptions) {
		let argProp = this.argProp;
		let width = argProp.width;
		let height = argProp.height;

		// debug grid bound
		const DEBUG_GRID_BOUND = VALIDATE.defaultArg(debugOptions.GRID_BOUND, true);
		if (DEBUG_GRID_BOUND) {
			const BORDER_COLOR = 0xFF0000;
			const FILL_COLOR = 0x00FF0000;
			this.lineStyle(ONE, BORDER_COLOR, ONE);
			this.beginFill(FILL_COLOR, ZERO); // dark gray
			this.drawRect(this.x, this.y, width, height);
		}

		const DEBUG_GRID_ORIGIN = VALIDATE.defaultArg(debugOptions.GRID_ORIGIN, true);
		if (DEBUG_GRID_ORIGIN) {
			const BORDER_COLOR = 0x0000ff;
			const FILL_COLOR = 0x0000ff;
			const WIDTH = 5;
			const HEIGHT = 5;
			this.lineStyle(ONE, BORDER_COLOR, ONE);
			this.beginFill(FILL_COLOR, ONE); // dark gray
			this.drawRect(this.x, this.y, WIDTH, HEIGHT);
		}
	}

	extractStyleStatic (theme, name) {
		let styleObj = theme.getStyles(name);
		let _style;
		if (!styleObj) {
			styleObj = styles;
			let styleToUse = styles.styleToUse;
			_style = styleObj.hasOwnProperty(styleToUse) ? styleObj[styleToUse] : styleObj['default'];
		} else {
			let styleToUse = styleObj.styleToUse;
			_style = styleObj.hasOwnProperty(styleToUse) ? styleObj[styleToUse] : styleObj['default'];
		}
		return _style;
	}
}

export const styles = {
	'styleToUse': 'default',
	'default': {
		'lineWidth': STROKE.STROKE_THIN,
		'lineColor': COLOR.BLACK,
		'lineAlpha': 0.15,
		'boundLineWidth': 2,
		'drawBound': true // should draw a bound rect for the grid?
	},
	'tactile': {
		'lineWidth': STROKE.STROKE_THIN,
		'lineColor': COLOR.BLACK,
		'lineAlpha': 0.15,
		'boundLineWidth': 2,
		'drawBound': true
	}
};
