var libFs = require('fs');
var utils = require('../utils/Utils');
var DOMParser = require('xmldom').DOMParser;
var libToJson = require('generate-schema'); // from 'generate-schema'

module.exports = function (gulp, plugins) {
	var Node = {};
	Node.ELEMENT_NODE = 1;
	Node.TEXT_NODE = 3;
	Node.PROCESSING_INSTRUCTION_NODE = 7;
	Node.COMMENT_NODE = 8;
	Node.DOCUMENT_NODE = 9;
	Node.DOCUMENT_TYPE_NODE	 = 10;
	Node.DOCUMENT_FRAGMENT_NODE	 = 11;
	var _xmlToJsNameSpace = {};
	_xmlToJsNameSpace._xmlTagsToIgnoreList = ['resourceRefs', 'defaultOptions', 'embed', 'metaData', '#comment'];
	_xmlToJsNameSpace._xmlAttributesToIgnore = {type: ['puzzleFactory']};

	function _taskFunction (gulp, plugins) {
		var cmds = utils.getMindCommands();
		var filePath = cmds['' + utils.MIND_COMMAND_PREFIX + 'src'] || cmds['' + utils.MIND_COMMAND_PREFIX + 'xmlLevelSrc'];
		var shouldReturnJson = cmds.hasOwnProperty('' + utils.MIND_COMMAND_PREFIX + 'toJson') === true;
		var shouldJsonSchema = cmds.hasOwnProperty('' + utils.MIND_COMMAND_PREFIX + 'jsonSchema') === true;
		var shouldFilter = cmds['' + utils.MIND_COMMAND_PREFIX + 'xmlLevelSrc'] !== 'false';
		var writeDest = 'tmp/xmlToJson/';
		var filePathSplit = (filePath.includes('/')) ? filePath.split('/') : filePath.split('\\');
		// eslint-disable-next-line no-magic-numbers
		var lastIndex = filePathSplit.length - 1;
		var fileName = filePathSplit[lastIndex];
		var fileBuffer = libFs.readFileSync(filePath, 'utf8');
		var newJsObj = _convertXmlToJson(fileBuffer);
		var levelObj = _getPuzzles(newJsObj);
		var outData;

		// by default this is set to true. Only set to false if you want to see the raw xml to js conversion with
		// special characters.
		if (shouldFilter) {
			let newLevelObj = {};
			_filterAttributesProperty(levelObj, newLevelObj);
			levelObj = newLevelObj;
		}

		let currentPath = '';
		let minIndex = 0;
		let pathBrokenDown = (writeDest.indexOf('/') < minIndex) ? writeDest.split('\\') : writeDest.split('/');
		for (let i = minIndex, iLength = pathBrokenDown.length; i < iLength; i++) {
			currentPath = currentPath + pathBrokenDown[i] + '/';
			if (!libFs.existsSync(currentPath)) { libFs.mkdirSync(currentPath); }
		}

		let jsonFormatValue = 2;
		if (shouldReturnJson) {
			outData = JSON.stringify(levelObj, null, jsonFormatValue);
			libFs.writeFileSync(writeDest + fileName + '.json', outData);
		} else {
			outData = JSON.stringify(levelObj, null, jsonFormatValue);
			libFs.writeFileSync(writeDest + fileName + '.js', 'export default ' + outData);
		}
		console.log('Wrote new file into ' + writeDest + fileName);

		if (shouldJsonSchema) {
			var schemaDest = writeDest + fileName + '.schema';
			var jsonCreated = libToJson.json(fileName + '.schema' + '.js', levelObj);
			var outFileData = (typeof jsonCreated === 'string') ? jsonCreated : JSON.stringify(jsonCreated, null, jsonFormatValue);
			outFileData = utils.replaceAll(outData, '"', '\'');

			return libFs.writeFile(schemaDest + '.js', 'export default ' + outFileData, (inError) => {
				if (inError) {
					console.log(inError.message);
				} else {
					console.log('Check ' + schemaDest + ' for new schema created.');
				}
			});
		}
	}

	function _convertXmlToJson (inOpenedFile) {
		let outJson;
		let file = inOpenedFile;
		if (inOpenedFile) {
			let xmlDoc = _formatToXml(file);
			outJson = _recursiveXmlToJson(xmlDoc);

			return outJson;
		} else {
			alert('Xml file not provided.');
		}
	}

	function _formatToXml (inFile) {
		let xmlDoc;

		if (typeof inFile === 'string') {
			let resultParser;
			if (DOMParser) {
				// code for modern browsers
				let parser = new DOMParser();
				resultParser = parser.parseFromString(inFile, 'text/xml');
			}

			// when parsing string, it can return of document type. Ensure to get just the element node
			let firstIndex = 0;
			xmlDoc = (resultParser.nodeType === Node.DOCUMENT_NODE) ? resultParser.childNodes[firstIndex] : resultParser;
		} else if (!inFile) {
			alert('Xml data not provided.');
			return;
		} else {
			xmlDoc = inFile;
		}

		return xmlDoc;
	}

	function _recursiveXmlToJson (xmlDoc) {
		// return object
		let outObj = {};
		let shouldIgnoreTag = false;

		if (xmlDoc.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
			xmlDoc = xmlDoc.ownerDocument.documentElement;
		}

		if (xmlDoc.nodeType === Node.ELEMENT_NODE) {
			let minIndex = 0;
			let attrLength = (xmlDoc.attributes && xmlDoc.attributes.length > minIndex) ? xmlDoc.attributes.length : minIndex;
			let iAttr = 0;
			let attr = null;
			let attrName = null;
			let attrVal = null;

			// get attributes
			// eslint-disable-next-line no-magic-numbers
			if (attrLength > 0) {
				outObj['@attributes'] = {};
				// eslint-disable-next-line no-magic-numbers
				for (iAttr = 0; iAttr < attrLength; iAttr++) {
					attr = xmlDoc.attributes.item(iAttr);
					attrName = attr.nodeName;
					attrVal = attr.nodeValue;

					// if this tag holds an unwanted attribute, do not ignore this tag
					if (_xmlToJsNameSpace._xmlAttributesToIgnore.hasOwnProperty(attrName)) {
						// eslint-disable-next-line no-magic-numbers
						if (_xmlToJsNameSpace._xmlAttributesToIgnore[attrName].indexOf(attrVal) >= 0) {
							shouldIgnoreTag = true;
							break;
						}
					}
					outObj['@attributes'][attrName] = attrVal;
				}
			}
		} else if (xmlDoc.nodeType === Node.TEXT_NODE) {
			outObj = xmlDoc.nodeValue;
		}

		// now add children [recursive call]
		if (xmlDoc.hasChildNodes() && (shouldIgnoreTag === false)) {
			let childrenLength = xmlDoc.childNodes.length;
			let iChildNode = 0;
			for (iChildNode; iChildNode < childrenLength; iChildNode++) {
				let item = xmlDoc.childNodes.item(iChildNode);
				let nodeName = item.nodeName;

				// search ignore list.
				// eslint-disable-next-line no-magic-numbers
				if (_xmlToJsNameSpace._xmlTagsToIgnoreList.indexOf(nodeName) >= 0) {
					continue;
				}

				if (item.nodeType === Node.TEXT_NODE) {
					// in some cases, nodevalue returns whitespaces as a value, lets check against this.
					let whiteSpaceCheck = item.nodeValue.replace(/\s/g, '');

					// if there is no content in this node, go on to next node.
					// eslint-disable-next-line no-magic-numbers
					if (whiteSpaceCheck.length <= 0) { continue; }
				}

				// if childNode is undefined or not an array.
				if (typeof (outObj[nodeName]) === 'undefined') {
					outObj[nodeName] = _recursiveXmlToJson(item);
				} else {
					if (typeof (outObj[nodeName].push) === 'undefined') {
						let temp = outObj[nodeName];
						outObj[nodeName] = [];
						outObj[nodeName].push(temp);
					}
					outObj[nodeName].push(_recursiveXmlToJson(item));
				}
			}
		}

		return shouldIgnoreTag ? {} : outObj;
	}

	function _getPuzzles (jsonData) {
		let puzzles = _filterPuzzlesFromXmlJson(jsonData);
		let data = { puzzle: { puzzles: puzzles.concat() } };
		// eslint-disable-next-line no-magic-numbers
		if (data.puzzle && data.puzzle.puzzles && data.puzzle.puzzles.length > 0) {
			return {puzzles: puzzles};
		} else {
			console.error('invalid puzzles in arena data file');
		}
	}

	function _filterPuzzlesFromXmlJson (inJsonData) {
		let outPuzzles = [];
		let sublevels = (inJsonData && inJsonData.content && inJsonData.content.sublevels && inJsonData.content.sublevels.sublevel) ? Array.isArray(inJsonData.content.sublevels.sublevel) ? inJsonData.content.sublevels.sublevel.concat() : [inJsonData.content.sublevels.sublevel] : [];

		for (let i = 0; i < sublevels.length; i++) {
			let componentsWrap = [];
			if (Array.isArray(sublevels[i].components)) {
				componentsWrap = sublevels[i].components;
			} else if (sublevels[i].components) {
				componentsWrap = [sublevels[i].components];
			}

			for (let iComponentWrap = 0; iComponentWrap < componentsWrap.length; iComponentWrap++) {
				let oneComponentWrap = componentsWrap[iComponentWrap];
				let components = [];
				if (Array.isArray(oneComponentWrap.component)) {
					components = oneComponentWrap.component;
				} else if (oneComponentWrap.component) {
					components = [oneComponentWrap.component];
				}

				for (let iOneComp = 0; iOneComp < components.length; iOneComp++) {
					let oneComponent = components[iOneComp];
					let attrs = oneComponent['@attributes'];

					// if this is a custom puzzle store the <source.def> property
					if (attrs && attrs.type === 'customPuzzle') {
						// our json puzzles definitions use 'def',
						// where as xml conversions use 'def',
						// lets change that name to 'def'.
						let puzzleDef = oneComponent.source.def;
						outPuzzles.push({def: puzzleDef});
					}
				}
			}
		}

		return outPuzzles;
	}

	/**
	 * Traverses the object children. If this children property is name '@attributes', it
	 * moves all its children out and into the parent's properties.
	 *
	 * @param {object} o [Object to traverse]
	 * @param {object} outObj [Referenced object that will be returned with new filtered values.]
	 * @returns {undefined}
	 * @memberof MindLevel
	 */
	function _filterAttributesProperty (o, outObj) {
		outObj = outObj || {};
		for (var i in o) {
			if (o[i] !== null && typeof (o[i]) === 'object') {
				if (i === '@attributes') {
					// resolve naming conflicts
					for (var newI in o[i]) {
						let suffixedName = newI;
						let duplicateCount = 0;

						// if name exists give ithe attribute a prefix
						while (o.hasOwnProperty(suffixedName) === true) {
							suffixedName = '' + suffixedName + String(duplicateCount);
							duplicateCount++;
						}

						// then re-write the parent object with the new name.
						o[suffixedName] = o[newI];
						delete o[newI];
					}

					// after naming conflicts are resolved, go ahead and traverse object
					_filterAttributesProperty(o[i], outObj);
				} else {
					if (Array.isArray(o[i])) {
						outObj[i] = [];
						_traverseArray(o[i], outObj[i]);
					} else {
						outObj[i] = {};
						// going one step down in the object tree!!
						_filterAttributesProperty(o[i], outObj[i]);
					}
				}
			} else {
				outObj[i] = o[i];
			}
		}
	}

	/**
	 * Traverses arrays, if that array is holding an object, then it goes back to traversing object.
	 * Had to use this function because javascripts 'for in Object/Array' treats Arrays as objects so
	 * Values started looking like objects instead of arrays.
	 *
	 * @param {array} arr [Array that will be traversed.]
	 * @param {array} outArr [Referenced Array that will be retunred after traversel ends.]
	 * @returns {undefined}
	 * @memberof MindLevel
	 */
	function _traverseArray (arr, outArr) {
		outArr = outArr || [];
		for (var i in arr) {
			if (arr[i] !== null && typeof (arr[i]) === 'object') {
				if (Array.isArray(arr[i])) {
					outArr.push([]);
					// eslint-disable-next-line no-magic-numbers
					_traverseArray(arr[i], outArr[outArr.length - 1]);
				} else {
					outArr.push({});
					// going one step down in the object tree!!
					// eslint-disable-next-line no-magic-numbers
					_filterAttributesProperty(arr[i], outArr[outArr.length - 1]);
				}
			} else {
				outArr.push(arr[i]);
			}
		}
	}

	return _taskFunction;
}
