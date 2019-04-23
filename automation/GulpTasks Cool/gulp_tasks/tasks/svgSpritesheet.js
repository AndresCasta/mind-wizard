
const Utils = require('../utils/Utils');
// const exec = require('child_process').execSync; // from node
const fs = require('fs'); // from node
const path = require('path'); // from node
const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;
const ERROR_EXIT = 1;

module.exports = function (gulp, plugins, cmds, packageJson) {
	let src = cmds[Utils.MIND_COMMAND_PREFIX + 'src'];
	let shouldCrop = Boolean(cmds[Utils.MIND_COMMAND_PREFIX + 'shouldCrop']);

	function _runTask () {
		if (src) {
			if (shouldCrop) {
				Utils.cropSvg(src);
			}

			if (fs.lstatSync(src).isDirectory()) {
				if (!src.endsWith('/')) {
					src = src + '/';
				}

				let themObj = {};
				let storedUseStrs = [];
				let storedSymbolsStrs = [];
				let totalHeight = 0;
				let maxWidth = 0;
				let files = fs.readdirSync(src);
				// get folder name
				const folderName = path.basename(src);
				const outSvgName = folderName + '_spriteSheet.svg';
				files.forEach((fileName, index) => {
					if (path.extname(fileName) === '.svg') {
						if (fileName.endsWith('_spriteSheet.svg')) {
							return;
						}
						let parser = new DOMParser();
						let filePath = path.join(src, fileName);

						// read the file
						const fileBuffer = fs.readFileSync(filePath, 'utf8');
						// white spaces generate too many text elems, lets remove them before parsing to xmldom.
						const svgDom = parser.parseFromString(fileBuffer.replace(/\s\s+/g, ' '));

						// finding out the dimensions
						let viewBoxAttr = svgDom.documentElement.getAttribute('viewBox');
						let viewBox = {
							x: 0,
							y: 0,
							width: 0,
							height: 0
						};

						if (viewBoxAttr) {
							const viewBoxArr = viewBoxAttr.replace(/\s\s+/g, ' ').split(' ');
							const xIndex = 0;
							const yIndex = 1;
							const wIndex = 2;
							const hIndex = 3;
							viewBox.x = Number(viewBoxArr[xIndex]);
							viewBox.y = Number(viewBoxArr[yIndex]);
							viewBox.width = Number(viewBoxArr[wIndex]);
							viewBox.height = Number(viewBoxArr[hIndex]);
						} else {
							const DEFAULT_X = 0;
							const DEFAULT_Y = 0;
							const DEFAULT_WIDTH = 0;
							const DEFAULT_HEIGHT = 0;

							viewBox.x = Number(svgDom.documentElement.getAttribute('x').replace('px', '')) || DEFAULT_X;
							viewBox.y = Number(svgDom.documentElement.getAttribute('y').replace('px', '')) || DEFAULT_Y;
							viewBox.width = Number(svgDom.documentElement.getAttribute('width').replace('px', '')) || DEFAULT_WIDTH;
							viewBox.height = Number(svgDom.documentElement.getAttribute('height').replace('px', '')) || DEFAULT_HEIGHT;
						}

						// store that info into jsobj
						let name = fileName.replace('.svg', '');
						let spriteSheetPos = { x: 0, y: totalHeight };
						let url;

						// no relative paths
						if (src.startsWith('./')) {
							url = src.replace('./', '');
						} else if (src.startsWith('../')) {
							url = src.replace('../', '');
						}

						// ensure it grabs /assets from the root '/'
						url = url.replace('../', '').replace('./', '') + outSvgName;
						if (!url.startsWith('/')) {
							url = '/' + url;
						}

						// store the info
						themObj[name] = {
							name,
							url,
							metadata: {
								spriteSheetSvg: {
									frame: {
										x: spriteSheetPos.x,
										y: spriteSheetPos.y,
										width: viewBox.width,
										height: viewBox.height
									}
								}
							}
						};

						if (cmds.defer) {
							themObj[name].defer = true;
						}

						// xml does not like having multiple xml tags in one doc, lets remove them.
						let allTags = Utils.getNodesByTagName('xml', svgDom);
						for (let i in allTags) {
							let xmlTag = allTags[i];
							let parentNode = xmlTag.parentNode;
							parentNode.removeChild(xmlTag);
							// removeChild on xmldom library has a bug with updating children whose parent do not have ownerdocument.
							if (parentNode && !parentNode.ownerDocument) {
								let cs = parentNode.childNodes;

								let child = parentNode.firstChild;
								let i = 0;
								while (child) {
									cs[i++] = child;
									child = child.nextSibling;
								}
								cs.length = i;
							}
						}
						let xmlSerializer = new XMLSerializer();
						let svgToString = xmlSerializer.serializeToString(svgDom);
						let symbolId = `---SYMBOL---${fileName}`;
						let symbolStr = `<symbol id="${symbolId}">${svgToString.replace(/\s\s+/g, ' ')}</symbol>`;
						storedSymbolsStrs.push(symbolStr);

						// store the <use> tag. This will allow to translate each svg within the spritesheet.
						let useStr = `<use href="#${symbolId}" transform="translate(0, ${totalHeight})" />`;
						storedUseStrs.push(useStr);

						// update totalHeight and maxWidth
						totalHeight = totalHeight + viewBox.height;
						maxWidth = Math.max(maxWidth, viewBox.width);
					}
				});

				// stored strings in an array so we can join them with newlines.
				let startSvgString = `<svg x="0" y="0" width="${Math.ceil(maxWidth)}" height="${Math.ceil(totalHeight)}" viewBox="0 0 ${Math.ceil(maxWidth)} ${Math.ceil(totalHeight)}" xmlns="http://www.w3.org/2000/svg" >`;
				let endSvgString = '</svg>';
				let finalDocArr = [startSvgString].concat(storedSymbolsStrs).concat(storedUseStrs).concat([endSvgString]);
				let finalDocStr = `${finalDocArr.join(`
`)}`;

				// store themeInfo in json
				const prettyPrintLevel = 4;
				let themObjJson = JSON.stringify(themObj, null, prettyPrintLevel);

				// write the xml
				fs.writeFileSync(src + outSvgName, finalDocStr);
				fs.writeFileSync(src + folderName + '_spriteSheet.json', themObjJson);
				fs.writeFileSync(src + folderName + '_spriteSheet.js', `export default ${themObjJson.replace(/"/g, '\'')}`);
				process.exit();
			} else {
				console.error('Sorry, this command only works with directories.');
				process.exit(ERROR_EXIT);
			}
		} else {
			console.error('Please provide a source.');
			process.exit(ERROR_EXIT);
		}
	};

	function _help () {
		console.log('---');
		console.log('svgSpriteSheet ' + Utils.MIND_COMMAND_PREFIX + 'src <./path/to/svg/folder/> ' + Utils.MIND_COMMAND_PREFIX + 'shouldCrop <Boolean> ' + Utils.MIND_COMMAND_PREFIX + 'defer <Boolean>');
		console.log('  Will get all svgs in a folder and combine them to one large svg file. Also generates a sprite sheet js object for theming.');
		console.log('');
		console.log('    src: Name of your game must be included. Must be the same name as your GameName.js file.');
		console.log('');
		console.log('');
		process.exit();
	}

	// give user help on the command if requested
	if (cmds.hasOwnProperty('help') || cmds.hasOwnProperty(Utils.MIND_COMMAND_PREFIX + 'help')) {
		return _help;
	}

	// else return task function
	return _runTask;
};
