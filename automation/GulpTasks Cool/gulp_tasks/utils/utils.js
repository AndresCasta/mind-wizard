const gulp = require('gulp');
const eslint = require('gulp-eslint');
const exec = require('child_process').execSync; // from node
const fs = require('fs'); // from node
const path = require('path'); // from node

const STRING_MIN_INDEX_ALLOWED = 0;
const NODE_ENUM = {};
NODE_ENUM.ELEMENT_NODE = 1;
NODE_ENUM.TEXT_NODE = 3;
NODE_ENUM.PROCESSING_INSTRUCTION_NODE = 7;
NODE_ENUM.COMMENT_NODE = 8;
NODE_ENUM.DOCUMENT_NODE = 9;
NODE_ENUM.DOCUMENT_TYPE_NODE	 = 10;
NODE_ENUM.DOCUMENT_FRAGMENT_NODE	 = 11;

module.exports = (function () {
	var utilsNameSpace = {};

	utilsNameSpace.MIND_COMMAND_PREFIX = '---';

	function _visitNode (node, callback) {
		if (callback(node)) {
			return true;
		}

		node = node.firstChild;
		if (node) {
			do {
				if (_visitNode(node, callback)) { return true; }
				node = node.nextSibling;
			} while (node);
		}
	}

	utilsNameSpace.getNodesByTagName = function (tagName, base) {
		var ls = [];

		_visitNode(base, (node) => {
			if (node !== base && node.nodeType && (tagName === '*' || node.tagName === tagName)) {
				ls.push(node);
			}
		});
		return ls;
	};

	utilsNameSpace.cropSvg = function (src, isRelative = true) {
		if (src) {
			let pathNames = [];
			let isDirectory = fs.lstatSync(src).isDirectory();
			if (isDirectory) {
				let files = fs.readdirSync(src);
				files.forEach((fileName) => {
					if (path.extname(fileName) === '.svg') {
						// spritesheets can get large lets skip these.
						// also spritesheets determine whether or not they
						// should crop during generation, lets not overwrite that.
						if (!fileName.endsWith('_spriteSheet.svg')) {
							let pathName = path.join(src, fileName);
							if (isRelative) {
								pathName = path.resolve(pathName);
							}
							pathNames.push(pathName);
						}
					}
				});
			} else {
				if (path.extname(src) === '.svg') {
					let pathName;
					if (isRelative) {
						pathName = path.resolve(src);
					} else {
						pathName = src;
					}
					pathNames.push(pathName);
				}
			}

			if (pathNames.length) {
				pathNames.forEach((pathName) => {
					let formattedName = utilsNameSpace.replaceAll(pathName, '\\', '/'); // forward slash supported by all OS's.

					if (path.extname(formattedName) === '.svg') {
						let osvar = process.platform;

						if (osvar === 'darwin') {
							exec(`/Applications/Inkscape.app/Contents/Resources/bin/inkscape --verb=FitCanvasToDrawing --verb=FileSave --verb=FileQuit ${pathName}`);
						} else if (osvar === 'linux') {
							exec(`inkscape --verb=FitCanvasToDrawing --verb=FileSave --verb=FileQuit ${pathName}`);
						} else if (osvar === 'win32') {
							exec(`"C:/Progra~1/Inkscape/inkscape.exe" --verb=FitCanvasToDrawing --verb=FileSave --verb=FileQuit ${pathName}`);
						} else {
							console.log('Not sure what OS you are running. Let us know if you get this error.');
						}
					}
				});
			} else {
				console.error('Could not format the src path. Was a valid src path provided.');
			}
		}
	};

	utilsNameSpace.esLintFix = function (inSrc) {
		return gulp.src(inSrc)
			.pipe(eslint({
				fix: true
			}))
			.pipe(eslint.format());
	};

	utilsNameSpace.getMindCommands = function () {
		const out = {};
		var args = process.argv;
		var argLength = args.length;
		var currArg = '';
		var nextArg = '';
		for (var iArg = 0; iArg < argLength; iArg++) {
			currArg = args[iArg].trim();
			console.log(currArg);
			nextArg = (iArg < (argLength - 1)) ? args[iArg + 1].trim() : '';
			if (currArg.startsWith(utilsNameSpace.MIND_COMMAND_PREFIX) && !nextArg.startsWith('-')) {
				out[currArg] = nextArg;
			}
		}
		return out;
	};

	utilsNameSpace.isFixed = function (file) {
		// Has ESLint fixed the file contents?
		return file.eslint != null && file.eslint.fixed;
	};

	utilsNameSpace.replaceAll = function (wholeString, strToReplace, strToReplaceWith) {
		while (wholeString.indexOf(strToReplace) >= STRING_MIN_INDEX_ALLOWED) {
			var newStr = wholeString.replace(strToReplace, strToReplaceWith);
			wholeString = newStr;
		}

		return wholeString;
	};

	return utilsNameSpace;
})();
