import { MindPixiGraphics } from 'mind-sdk/mindPixi/MindPixiGraphics';
import { GlowableText } from './glowable/GlowableText';
import MindPixiText from 'mind-sdk/mindPixi/text/MindPixiText';
import { COLOR, STROKE } from '../Constants';

// numeric constants
const ZERO = 0;
const ONE = 1;
const TWO = 2;
const AXIS_NAME_SPACING = 4;
const DEFAULT_AXIS_LABEL_FONT_SIZE = 18;
const DEFAULT_AXIS_NAMES_FONT_SIZE = 19;

const AXIS_DIRECTIONS = {
	X_POS: 'x+',
	X_NEG: 'x-',
	Y_POS: 'y+',
	Y_NEG: 'y-'
};

export class Axes extends MindPixiGraphics {
	static get AXIS () {
		return {
			X_AXIS: 'X_AXIS',
			Y_AXIS: 'Y_AXIS'
		};
	}

	constructor (argProp, mindGameObjectOptions) {
		super(undefined, mindGameObjectOptions);
		if (typeof argProp !== 'object' || !argProp) throw new Error('Please specify an argProp object at constructor argument');

		this._xNumLabelsArr = [];
		this._yNumLabelsArr = [];
		this.numberLabels = [];
		this.xLabel = null;
		this.yLabel = null;

		this.argProp = argProp;
		this._style = this.extractStyleStatic(this.arena.theme, 'grid');
		// reload style default values
		this._style.axisLabels.textSyle.fontSize = DEFAULT_AXIS_LABEL_FONT_SIZE;
		this._style.axisNames.axisNametextSyle.fontSize = DEFAULT_AXIS_NAMES_FONT_SIZE;
		this.cellSize = { width: undefined, height: undefined };
		this.draw();
		this.eventEmitter.on(this.mindEvents.EVENT_LOCALE_CHANGED, this._onLocaleChange, this);
	}

	destroy (options) {
		this.eventEmitter.removeListener(this.mindEvents.EVENT_LOCALE_CHANGED, this._onLocaleChange, this);
		super.destroy(options);
	}

	draw () {
		// unpack arguments
		let argProp = this.argProp;
		// required
		let maxXValue = this.requiredArg(argProp.maxXValue, 'missing maxXValue property in object passed as constructor argument');
		let minXValue = this.requiredArg(argProp.minXValue, 'missing minXValue property in object passed as constructor argument');
		let maxYValue = this.requiredArg(argProp.maxYValue, 'missing maxYValue property in object passed as constructor argument');
		let minYValue = this.requiredArg(argProp.minYValue, 'missing minYValue property in object passed as constructor argument');
		let unitLength = this.requiredArg(argProp.unitLength, 'missing unitLength property in object passed as constructor argument');
		// optional
		let xAxisLength = this.defaultArg(argProp.xAxisLength, unitLength * maxXValue);
		let yAxisLength = this.defaultArg(argProp.yAxisLength, unitLength * maxYValue);
		let lineWidth = this.defaultArg(argProp.lineWidth, this._style.mainAxes.lineWidth);
		let lineColor = this.defaultArg(argProp.lineColor, this._style.mainAxes.lineColor);
		let lineAlpha = this.defaultArg(argProp.lineAlpha, this._style.mainAxes.lineAlpha);
		let shouldDrawXpositive = this.defaultArg(argProp.drawXpositive, this._style.mainAxes.drawXpositive);
		let shouldDrawXnegative = this.defaultArg(argProp.drawXnegative, this._style.mainAxes.drawXnegative);
		let shouldDrawYpositive = this.defaultArg(argProp.drawYpositive, this._style.mainAxes.drawYpositive);
		let shouldDrawYnegative = this.defaultArg(argProp.drawYnegative, this._style.mainAxes.drawYnegative);
		let xPositiveAxisName = this.defaultArg(argProp.xPositiveName, this._style.axisNames.xPositiveName);
		let yPositiveAxisName = this.defaultArg(argProp.yPositiveName, this._style.axisNames.yPositiveName);
		let axisNameStyle = this.defaultArg(argProp.axisNametextSyle, this._style.axisNames.axisNametextSyle);

        // // calculate cell size
		// let cellWidth = width / numHorizontalCells;
		// let cellHeight = height / numVerticalCells;
		// this.cellSize.cellWidth = cellWidth;
		// this.cellSize.cellHeight = cellHeight;

		// draw debugs
		this.debugs({ GRID_BOUND: false });

		// set main axes style
		this.lineStyle(lineWidth, lineColor, lineAlpha);

		this._calculateSecureFontSize(unitLength);

		// draw (X+) line
		if (shouldDrawXpositive) {
			this.moveTo(ZERO, ZERO);
			this.lineTo(xAxisLength, ZERO);
			this.moveTo(ZERO, ZERO);
			let tickInfo = this._drawTicks(maxXValue, unitLength, AXIS_DIRECTIONS.X_POS);
			// draw axis name
			if (xPositiveAxisName) {
				let textLabel = this._drawText(xPositiveAxisName, ZERO, ZERO, axisNameStyle);
				this.xLabel = textLabel;
				let xAxisNumber = tickInfo.axisNumberTextPrototypes.xAxis;
				textLabel.x = unitLength * maxXValue / TWO - textLabel.width / TWO;
				textLabel.y = xAxisNumber.y + textLabel.height / TWO + AXIS_NAME_SPACING * TWO;
				textLabel.originalPosition = { x: textLabel.x, y: textLabel.y };
			}
		}

		// draw (X-) line
		if (shouldDrawXnegative) {
			this.moveTo(ZERO, ZERO);
			this.lineTo(-xAxisLength, ZERO);
			this.moveTo(ZERO, ZERO);
			this._drawTicks(Math.abs(minXValue), unitLength, AXIS_DIRECTIONS.X_NEG);
		}

		// draw (Y+) line
		if (shouldDrawYpositive) {
			this.moveTo(ZERO, ZERO);
			this.lineTo(ZERO, -yAxisLength);
			this.moveTo(ZERO, ZERO);
			let tickInfo = this._drawTicks(maxYValue, unitLength, AXIS_DIRECTIONS.Y_POS);
			// draw axis name
			if (yPositiveAxisName) {
				let textLabel = this._drawText(yPositiveAxisName, ZERO, ZERO, axisNameStyle);
				this.yLabel = textLabel;
				// let xAxisNumber = tickInfo.axisNumberTextPrototypes.yAxis;
				textLabel.rotation = -Math.PI / TWO;
				textLabel.x = -textLabel.height - tickInfo.tickLengthHalf - AXIS_NAME_SPACING * TWO;
				textLabel.y = -unitLength * maxYValue / TWO + textLabel.width / TWO;
			}
		}

		// draw (Y-) line
		if (shouldDrawYnegative) {
			this.moveTo(ZERO, ZERO);
			this.lineTo(ZERO, yAxisLength);
			this.moveTo(ZERO, ZERO);
			this._drawTicks(Math.abs(minYValue), unitLength, AXIS_DIRECTIONS.Y_NEG);
		}

		// draw a label at origin
		let originText = this._drawText('0', ZERO, ZERO);
		originText.x = AXIS_NAME_SPACING;
		originText.alpha = ZERO;
		this._yNumLabelsArr[ZERO] = originText;
		this._xNumLabelsArr[ZERO] = originText;
	}

	_drawTicks (maxValue, unitLength, axisDirection) {
		let argProp = this.argProp;

		let tickLengthHalf = this.defaultArg(argProp.tickLength, this._style.axisLabels.tickLength) / TWO;
		let shoulShowText = this._style.axisLabels.showText;

		let prototypeA = new MindPixiText('9');

		let lastTextNumberXaxis = null;
		let lastTextNumberYaxis = null;
		for (let i = 1; i <= maxValue; i++) {
			let counter;

			let x = 0;
			let isDrawingXpos = axisDirection === AXIS_DIRECTIONS.X_POS;
			let isDrawingXneg = axisDirection === AXIS_DIRECTIONS.X_NEG;
			if (isDrawingXpos)			{ x = i * unitLength; counter = i; }			else if (isDrawingXneg) 	{ x = -i * unitLength; counter = -i; }

			let y = 0;
			let isDrawingYpos = axisDirection === AXIS_DIRECTIONS.Y_POS;
			let isDrawingYneg = axisDirection === AXIS_DIRECTIONS.Y_NEG;
			if (isDrawingYpos)			{ y = -i * unitLength; counter = i; }			else if (isDrawingYneg) 	{ y = i * unitLength; counter = -i; }

			let text = null;
			if (isDrawingXpos || isDrawingXneg) {
				this.moveTo(x, -tickLengthHalf);
				this.lineTo(x, tickLengthHalf);

				text = this._drawText(counter, x, tickLengthHalf);
				text.x = text.x - text.width / TWO;
				lastTextNumberXaxis = text;
				if (shoulShowText) {
					text.alpha = ZERO;
				}
				this._xNumLabelsArr[counter] = text;
			}

			if (isDrawingYpos || isDrawingYneg) {
				this.moveTo(-tickLengthHalf, y);
				this.lineTo(tickLengthHalf, y);
				const SPACING_FACTOR = 0.4;
				text = this._drawText(counter, tickLengthHalf, y);
				// const nSpaces = 3;
				let spacing = prototypeA.width * SPACING_FACTOR;
				let xDispl = -1;
				if (isDrawingYneg) spacing += xDispl;
				text.x = text.x + spacing;
				text.y = text.y - text.height / TWO;
				lastTextNumberYaxis = text;
				if (shoulShowText) {
					text.alpha = ZERO;
				}
				this._yNumLabelsArr[counter] = text;
			}
			this.numberLabels.push(text);
		}

		return {
			tickLengthHalf: tickLengthHalf,
			axisNumberTextPrototypes: {
				xAxis: lastTextNumberXaxis,
				yAxis: lastTextNumberYaxis
			}
		};
	}

	_drawText (textString, x, y, fontStyle) {
		let _textStyle = this.defaultArg(fontStyle, this._style.axisLabels.textSyle);
		let text = new GlowableText(textString, _textStyle);
		text.x = x; text.y = y;
		this.addChild(text);
		return text;
	}

	_calculateSecureFontSize (unitLength) {
		let prototypeA = new MindPixiText('-22');
		let prototypeB = new MindPixiText('-88');
		const secureMargin = 0;

		let isColliding = () => {
			// update style
			prototypeA.style = this._style.axisLabels.textSyle;
			prototypeB.style = this._style.axisLabels.textSyle;
			// update position
			prototypeA.x = -prototypeA.width / TWO;
			prototypeB.x = unitLength - prototypeB.width / TWO;
			// check collision
			const _minWidth = 4;
			const _isMinWidth = prototypeA.width <= _minWidth;
			const _isColliding = (prototypeA.x + prototypeA.width + secureMargin) >= prototypeB.x;
			return _isColliding && !_isMinWidth;
		};

		while (isColliding()) {
			this._style.axisLabels.textSyle.fontSize -= 1;
		}
	}

	set numberLabelsAlpha (value) {
		for (let i = 0; i < this.numberLabels.length; i++) {
			const numberLabel = this.numberLabels[i];
			numberLabel.alpha = value;
		}
		// update axis label y position when numbers are hidden
		if (value === ZERO) {
			if (this.xLabel) {
				this.xLabel.y = this._xNumLabelsArr[ONE].y + AXIS_NAME_SPACING * ONE;
			}
		}
	}

	get numberLabelsAlpha () {
		return this.numberLabels[ZERO].alpha;
	}

	debugs (debugOptions) {
		// debug grid bound
		const DEBUG_AXES_ORIGIN = this.defaultArg(debugOptions.AXES_ORIGIN, false);
		if (DEBUG_AXES_ORIGIN) {
			const BORDER_COLOR = 0xFF0000;
			const FILL_COLOR = 0x00FF0000;
			const WIDTH = 5;
			const HEIGHT = 5;
			this.lineStyle(ONE, BORDER_COLOR, ONE);
			this.beginFill(FILL_COLOR, ONE); // dark gray
			this.drawRect(this.x, this.y, WIDTH, HEIGHT);
		}
	}

	defaultArg (_input, _defaultInput) {
		return _input === undefined ? _defaultInput : _input;
	}

	requiredArg (_input, _mssg) {
		if (_input === undefined || _input === null) throw new Error(_mssg);
		else return _input;
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

	_onLocaleChange (data) {
		// let nXstr;
		// let nYstr;
		// if (this.xLabel) nXstr = this.arena.LocaleStore.translate(this.xLabel.text, data.locale).translation;
		// if (this.yLabel) nYstr = this.arena.LocaleStore.translate(this.yLabel.text, data.locale).translation;
		// if (!nXstr || !nYstr) return; // not change locale if no entry on dictionary, so continue using default values
		// this.xLabel.text = nXstr;
		// this.yLabel.text = nYstr;
	}
}

export const styles = {
	'styleToUse': 'default',
	'default': {
		'mainAxes': { // what assets dhould be drawn?
			'lineWidth': STROKE.STROKE_THIN,
			'lineColor': COLOR.BLACK,
			'lineAlpha': 1,
			'drawXpositive': true, // should draw x+ axis
			'drawXnegative': false, // should draw x- axis
			'drawYpositive': true, // should draw y+ axis
			'drawYnegative': false // should draw y- axis
		},
		'axisLabels': { // axis numbers configs
			'tickLength': 15,
			'tickWidth': STROKE.STROKE_THICK,
			'tickColor': COLOR.BLACK,
			'tickAlpha': 1,
			'showText': true,
			'textSyle': {
				'fontSize': DEFAULT_AXIS_LABEL_FONT_SIZE, // 20
				'align': 'center',
				'fontWeight': 'normal'
			}
		},
		'axisNames': { // name for axes, undefined if invisible
			'xPositiveName': '',
			'yPositiveName': '',
			'axisNametextSyle': {
				'fontSize': DEFAULT_AXIS_NAMES_FONT_SIZE,
				'align': 'center'
			}
		}
	},
	'tactile': {
		'mainAxes': {
			'lineWidth': 2,
			'lineColor': COLOR.BLACK,
			'lineAlpha': 1,
			'drawXpositive': true, // should draw x+ axis
			'drawXnegative': true, // should draw x- axis
			'drawYpositive': true, // should draw y+ axis
			'drawYnegative': true // should draw y- axis
		},
		'axisLabels': { // axis numbers configs
			'tickLength': 15,
			'tickWidth': 3,
			'tickColor': COLOR.BLACK,
			'tickAlpha': 1,
			'showText': true,
			'textSyle': {
				'fontSize': 14,
				'align': 'center',
				'fontWeight': 'normal'
			}
		}
	}
};
