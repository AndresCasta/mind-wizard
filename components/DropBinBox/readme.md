# DropBinBox
DropBinBox no es una clase, se debe pegar el codigo de DropBinBox.js en la vista y en la plantilla.

Paste this in your View class:
```javascript
_createDropBinBox (position, width, height, radius, alignment) {
    // asserts width and height
    if (!width || !height || !radius) throw new Error('Rectangle width or height or radius is unespecified.');
    let styleName = 'dropBinBoxMode1';

    let container = new MindPixiContainer();
    this.addChild(container);

    // color stops with alpha: '#4D4D4D26', '#23232314'
    // create gradient bg
    let background = new MindPixiSprite();
    container.addChild(background);

    // Mask shape.
    let shape = new MindPixiGraphics();
    container.addChild(shape);
    shape.clear();
    let shapeAlpha = 1;
    let x = 0;
    let y = 0;
    shape.beginFill(COLOR.WHITE, shapeAlpha);
    shape.drawRoundedRect(x, y, width, height, radius);
    shape.endFill();

    // Border
    let border = new MindPixiGraphics();
    container.addChild(border);
    border._drawBorder = (borderWidth, borderColor, borderAlpha) => {
        border.clear();
        border.lineStyle(borderWidth, borderColor, borderAlpha);
        border.drawRoundedRect(x, y, width, height, radius);
        border.endFill();
    };

    container._drawState = (state = DROP_BIN_STATES.UP) => {
        let style = ThemeUtils.extractStyleStatic(this.arena.theme, styleName);
        let styleState = style[state];

        // Draw Drop Zone
        let radix = 16; // hex
        //  Loads the background color from style.
        let startColor = styleState.fill.start.color;
        // Computes the alpha in hex
        let maxVal = 255; // [0, 255]
        let startAlphaInHex = (Math.round(styleState.fill.start.alpha * maxVal)).toString(radix);
        startColor = startColor + startAlphaInHex; // #00000026

        // Computes the end color
        let endColor = styleState.fill.end.color;
        let endAlphaInHex = (Math.round(styleState.fill.end.alpha * maxVal)).toString(radix);
        endColor = endColor + endAlphaInHex; // #00000014

        // Background.
        background.texture = this.createGradient(width, height, [startColor, endColor]).texture;

        // Aply shape mask
        background.mask = shape;

        // Border
        let borderWidth = styleState.stroke.width;
        let borderColor = styleState.stroke.color;
        let borderAlpha = styleState.stroke.alpha;
        border._drawBorder(borderWidth, borderColor, borderAlpha);
    };
    container._drawState(DROP_BIN_STATES.UP);
    this._onThemeChangeInvocationList.push(container._drawState); // By default use the UP state.
    // Positionate container aplying alignment.
    container.position.x = -alignment.x * container.width + position.x;
    container.position.y = -alignment.y * container.height + position.y;
    return container;
}
```

Paste this in your theme file:
```
'dropBinBoxMode1': {
    'styleToUse': 'default',
    'default': {
        // The idle state
        'up': {
            'stroke': {
                'width': STROKE.STROKE_THICK,
                'color': '#000000', // is not required to specify it as string.
                'alpha': COLOR.ALPHA_BLACK_1 // 0.33
            },
            'fill': { // this is a gradient color
                'start': {
                    'color': '#000000', // Required to specify the color in string hex notation
                    'alpha': 0.15
                },
                'end': {
                    'color': '#000000', // Required to specify the color in string hex notation
                    'alpha': 0.08
                }
            }
        },
        // The down state occurs when an object is being dragged, but not currently hovering over the dropZone.
        'down': {
            'stroke': {
                'width': STROKE.STROKE_THICK,
                'color': '#000000', // is not required to specify it as string.
                'alpha': COLOR.ALPHA_BLACK_1 // 0.33
            },
            'fill': { // this is a gradient color
                'start': {
                    'color': '#000000', // Required to specify the color in string hex notation
                    'alpha': 0.15
                },
                'end': {
                    'color': '#FFFFFF', // Required to specify the color in string hex notation
                    'alpha': 0.33
                }
            }
        },
        // Occurs when an object is being dragged over a drop zone.
        'hover': {
            'stroke': {
                'width': STROKE.STROKE_THICK,
                'color': '#000000', // is not required to specify it as string.
                'alpha': COLOR.ALPHA_BLACK_1 // 0.33
            },
            'fill': { // this is a gradient color
                'start': {
                    'color': '#000000', // Required to specify the color in string hex notation
                    'alpha': 0.33
                },
                'end': {
                    'color': '#000000', // Required to specify the color in string hex notation
                    'alpha': 0.33
                }
            }
        }
    },
    'tactile': {
        // The idle state
        'up': {
            'stroke': {
                'width': STROKE.STROKE_THICK,
                'color': COLOR.FILL_DARK_GRAY, // is not required to specify it as string.
                'alpha': COLOR.NO_ALPHA // 1
            },
            'fill': { // this is a gradient color
                'start': {
                    'color': '#C0C0C0', // Required to specify the color in string hex notation
                    'alpha': 1
                },
                'end': {
                    'color': '#C0C0C0', // Required to specify the color in string hex notation
                    'alpha': 1
                }
            }
        },
        // The down state occurs when an object is being dragged, but not currently hovering over the dropZone.
        'down': {
            'stroke': {
                'width': STROKE.STROKE_THICK,
                'color': COLOR.FILL_DARK_GRAY, // is not required to specify it as string.
                'alpha': COLOR.NO_ALPHA // 1
            },
            'fill': { // this is a gradient color
                'start': {
                    'color': '#FFFFFF', // Required to specify the color in string hex notation
                    'alpha': 1
                },
                'end': {
                    'color': '#FFFFFF', // Required to specify the color in string hex notation
                    'alpha': 1
                }
            }
        },
        // Occurs when an object is being dragged over a drop zone.
        'hover': {
            'stroke': {
                'width': STROKE.STROKE_THICK,
                'color': COLOR.FILL_DARK_GRAY, // is not required to specify it as string.
                'alpha': COLOR.NO_ALPHA // 1
            },
            'fill': { // this is a gradient color
                'start': {
                    'color': '#808080', // Required to specify the color in string hex notation
                    'alpha': 1
                },
                'end': {
                    'color': '#808080', // Required to specify the color in string hex notation
                    'alpha': 1
                }
            }
        }
    }
},
```