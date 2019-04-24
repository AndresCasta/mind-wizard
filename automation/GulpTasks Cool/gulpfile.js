/*
 * gulpfile.js
 *
 * gulpfile.js should split tasks into multiple files to keep things small. Here is a tutorial on how
 * to do so. http://macr.ae/article/splitting-gulpfile-multiple-files.html
 *
 * gulp-load-plugins - is used to store available plugins.
 * gulp-tasks/utils/utils.js are utility functions that could be used.
*/
/* eslint-disable no-console */

const Utils = require('./gulp_tasks/utils/Utils');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const gulpIf = require('gulp-if');
const eslint = require('gulp-eslint');
const beep = require('beepbeep');
const jspm = require('jspm');
const exec = require('child_process').execSync; // from node
const libAws = require('aws-sdk'); // from aws sdk
const libToJson = require('generate-schema'); // from 'generate-schema' // Convert JSON Objects to JSON Schema.
const fs = require('fs'); // from node
const utils = require('./gulp_tasks/utils/Utils') // from ./
const nectar = require('nectar');
const packageJson = require('./package.json');
const replace = require('gulp-replace'); // Simple string replace
const rename = require("gulp-rename"); // plugin to rename files easily.
var watch = require('gulp-watch'); // File watcher that uses super-fast chokidar and emits vinyl objects.
const path = require('path'); // from node

const srcWatch = 'PixiArenas/**/*.js';
const mindCmdPrefix = Utils.MIND_COMMAND_PREFIX; // must have atleast one '-' at the beginning.
const mindSdkLibsToInstallLibs = ['mind:mind-sdk@0.0.11', 'mind:mind-game-components@0.0.11'];
jspm.setPackagePath('.');

/*
 *********************
 * TASKS
 *********************
 */

gulp.task('configureProject', async () => {
	const cmd = _getMindCommands();
	const cmdName = cmd[Utils.MIND_COMMAND_PREFIX + 'name'];
	const xmlLevel = cmd[Utils.MIND_COMMAND_PREFIX + 'xmlLevelSrc']; // the puzzle deffinition in xml
	const templateName = cmd[Utils.MIND_COMMAND_PREFIX + 'template'] || 'ExampleGame'; // The name of the template project located in PixiArenas folder by default ExampleGame

	// assert name is defined.
	if (!cmdName) throw new Error('---name is required.');

	// converts xml to js
	gulp.start('xmlToJs');

	let src = `./PixiArenas/${templateName}/`;
	let dst = `./PixiArenas/${cmdName}/`;

	// if the xml file was defined then generated the schema
	if (xmlLevel) {
		const jsonSrc = `tmp/xmlToJson/${xmlLevel}.js`;
		let puzzleJs = await System.import(jsonSrc);

		let schema = libToJson.json(cmdName, puzzleJs.default);
		let outFileData = (typeof schema === 'string') ? schema : JSON.stringify(schema, null, 2);

		// Creates folder for level schema
		if (!fs.existsSync(dst)) {
			fs.mkdirSync(dst);
		}

		const schemaDest = `${dst}${cmdName}Level.schema.js`;
		fs.writeFileSync(schemaDest, `export default ${outFileData}`, (inError) => {
			if (inError) {
				console.log(inError.message);
			} else {
				_esLintFix(schemaDest);
					// if fixed, write the file to dest
					// .pipe(gulpIf(utils.isFixed, gulp.dest(schemaDest + '/..')));
				console.log('Check ' + schemaDest + ' for new schema created.');
			}
		});

		// Updates the puzzle info in GameName.json file
		let rawdata = fs.readFileSync(`${src}${templateName}.json`);
		let jsonFile = JSON.parse(rawdata);
		jsonFile.puzzle.puzzles = puzzleJs.default.puzzles;
		let outJsonFile = JSON.stringify(jsonFile, null, 2);
		let regexp = new RegExp(templateName, 'gi');
		outJsonFile = outJsonFile.replace(regexp, cmdName)
		const jsonDest = `${dst}${cmdName}.json`;
		fs.writeFileSync(jsonDest, outJsonFile, (inError) => {
			if (inError) {
				console.log(inError.message);
			} else {
				_esLintFix(jsonDest);
				// if fixed, write the file to dest
				// .pipe(gulpIf(utils.isFixed, gulp.dest(schemaDest + '/..')));
				console.log('Check ' + jsonDest + ' for new schema created.');
			}
		});

		// Updates package.json to support travis-ci
		fs.writeFileSync('./package-old.json', JSON.stringify(packageJson, null, 2), (inError) => {
			if (inError) {
				console.log(inError.message);
			} else {
				_esLintFix(jsonDest);
				// if fixed, write the file to dest
				// .pipe(gulpIf(utils.isFixed, gulp.dest(schemaDest + '/..')));
				console.log('Check ' + jsonDest + ' for new schema created.');
			}
		});
		let updatedPackageJson = Object.assign({}, packageJson);
		let mindObject = {
			name: cmdName,
			overrides: {},
			webAppOptions: {
				transition: {
					intro: 'NONE',
					outro: 'NONE',
					jijiPos: 'CUSTOM'
				}
			},
			testHarnessOptions: {
				locale: jsonFile.locale,
				font: jsonFile.font,
				themes: jsonFile.themes,
				puzzle: jsonFile.puzzle
			}
		};

		mindObject['bundle-assets'] = {
			output: `${cmdName}.tar`,
			assets: [
				`assets/${cmdName}/**/*`,
				'assets/shapes/*',
				'assets/shapes/fruits/*',
				'assets/background/*'
			]
		}

		updatedPackageJson.mind = mindObject;

		let outPackageJson = JSON.stringify(updatedPackageJson, null, 2).replace(regexp, cmdName);
		console.log(outPackageJson);
		fs.writeFileSync('./package.json', outPackageJson, (inError) => {
			if (inError) {
				console.log(inError.message);
			} else {
				_esLintFix(jsonDest);
				// if fixed, write the file to dest
				// .pipe(gulpIf(utils.isFixed, gulp.dest(schemaDest + '/..')));
				console.log('Check ' + jsonDest + ' for new schema created.');
			}
		});
	}

	// Configure test levels
	gulp.start('configureTestLevels');

	// Copy assets folder
	gulp.start('copyAssetFolder');

	return gulp
	.src([`${src}**/*`, `!${src}${templateName}Level.schema.js`, `!${src}${templateName}.json`]) // ignore the orignial schema to prevent overwrittes the previously generated schema.
		.pipe(rename(function (file) { // rename files name
			let regexp = new RegExp(templateName, 'g');
			file.dirname = file.dirname.replace(regexp, cmdName);
			file.basename = file.basename.replace(regexp, cmdName);
		}))
		.pipe(replace(templateName, cmdName)) // replace strings
		.pipe(gulp.dest(dst));
});

gulp.task('copyAssetFolder', () => {
	const cmd = _getMindCommands();
	const cmdName = cmd[Utils.MIND_COMMAND_PREFIX + 'name'];
	const templateName = cmd[Utils.MIND_COMMAND_PREFIX + 'template'] || 'ExampleGame';
	let regexp = new RegExp(templateName, 'gi');

	return gulp
		.src([`assets/${templateName}/**/*`])
		.pipe(rename(function (file) { // rename files name
			// let regexp = new RegExp(templateName, 'gi');
			file.dirname = file.dirname.replace(regexp, cmdName);
			file.basename = file.basename.replace(regexp, cmdName);
		}))
		.pipe(replace(regexp, cmdName)) // replace strings
		.pipe(gulp.dest(`assets/${cmdName}/`));
});

gulp.task('configureTestLevels', async () => {
	const cmd = _getMindCommands();
	const cmdName = cmd[Utils.MIND_COMMAND_PREFIX + 'name'];
	const templateName = cmd[Utils.MIND_COMMAND_PREFIX + 'template'] || 'ExampleGame';
	const xmlLevel = cmd[Utils.MIND_COMMAND_PREFIX + 'xmlLevelSrc']; // the puzzle deffinition in xml

	let regexp = new RegExp(templateName, 'gi');

	const testLevelDir = `testgen/${cmdName}Level.js`;
	// add converted puzzle into test file.
	if (xmlLevel) {
		const puzzleSrc = `tmp/xmlToJson/${xmlLevel}.js`;
		let puzzleJs = await System.import(puzzleSrc);
		let outdata = JSON.stringify(puzzleJs.default, null, 2);

		// Creates folder for level schema
		if (!fs.existsSync('testgen/')) {
			fs.mkdirSync('testgen/');
		}

		fs.writeFileSync(testLevelDir, `export default ${outdata}`, (inError) => {
			if (inError) {
				console.log(inError.message);
			} else {
				_esLintFix(testLevelDir);
				// if fixed, write the file to dest
				// .pipe(gulpIf(utils.isFixed, gulp.dest(schemaDest + '/..')));
				console.log('Check ' + testLevelDir + ' for new schema created.');
			}
		});
	}

	return gulp
		.src([`test/*`, `!test/${templateName}Level.js`])
		.pipe(rename(function (file) { // rename files name
			// let regexp = new RegExp(templateName, 'gi');
			file.dirname = file.dirname.replace(regexp, cmdName);
			file.basename = file.basename.replace(regexp, cmdName);
		}))
		.pipe(replace(regexp, cmdName)) // replace strings
		.pipe(gulp.dest('testgen/'));
});

/**
 * Modified task of schema
 * Using to-json-schema to generate schema. {@link https://www.npmjs.com/package/to-json-schema}
 *
 * The following params require the MindCommandPrefix to work.
 * @param {string} src [What file to import. Usese System.Import]
 * @param {string} dest [Location to write file to. Defaults to /validation/default.schema.json]
 */
gulp.task('schema-wizard3d', () => {
	_newTaskHeader('Creating Json Schemas');

	let mindCmds = _getMindCommands();
	let cmdSrc = mindCmds['' + mindCmdPrefix + 'src'];
	let cmdDest = mindCmds['' + mindCmdPrefix + 'dest'] || 'tmp/default.schema.js';
	let filepathSplit = cmdDest.split('/');
	let fileName = (filepathSplit.length <= 0) ? 'default' : filepathSplit[filepathSplit.length - 1];

	return System.import(cmdSrc).then((inResp) => {
		let objectToSchema = inResp.default;
		let jsonCreated = libToJson.json(fileName, objectToSchema);
		let outFileData = (typeof jsonCreated === 'string') ? jsonCreated : JSON.stringify(jsonCreated, null, 2);
		return fs.writeFile(cmdDest, 'export default ' + outFileData, (inError) => {
			if (inError) {
				console.log(inError.message);
			} else {
				_esLintFix(cmdDest)
					// if fixed, write the file to dest
					.pipe(gulpIf(utils.isFixed, gulp.dest(cmdDest + '/..')));
				console.log('Check ' + cmdDest + ' for new schema created.');
			}
		});
	});
});

let themeObj = {};
// Image importer
gulp.task('assetImporter', () => {
	const cmd = _getMindCommands();
	const src = cmd[Utils.MIND_COMMAND_PREFIX + 'src'];

	const isDirectory = source => fs.lstatSync(source).isDirectory()
	if (src) {
		// In Node.js, __dirname is always the directory in which the currently executing script resides
		let fullSrc = path.resolve(__dirname, src);
		if (isDirectory(fullSrc)) {
			const filter = '.svg';

			themeObj = {};
			recursiveSearch(fullSrc, filter, function (filename) {
				let basename = path.basename(filename);
				let posixFilename = filename.replace(/\\/g, '/');
				let startIndex = posixFilename.indexOf('/assets');
				let fileUri = posixFilename.substring(startIndex);
				console.log(fileUri);
				themeObj[basename] = {
					name: basename,
					type: 'image',
					url: fileUri,
					metadata: {
						mipmap: true,
						resolution: 2
					}
				}
			});
			let themeObjJson = JSON.stringify(themeObj, null, 4);
			let folderName = path.basename(fullSrc); // gets the folder name
			fs.writeFileSync(path.join(fullSrc, `${folderName}_assets.json`), themeObjJson);
			fs.writeFileSync(path.join(fullSrc, `${folderName}_assets.js`), `export default ${themeObjJson.replace(/"/g, '\'')}`);
		} else {
			console.error('Sorry, this command only works with directories.');
		}
	} else {
		console.error('Please provide a source.');
	}

	watch(src, function (event) {
		console.log('change event fired ' + event.event);
		// console.log(event);
		// when a file is renamed it's fired the add and the unlink event.
		if (event.event === 'add') { // renamed or new file
			let filename = event.history[0];
			let basename = path.basename(filename);
			console.log(basename);
			let posixFilename = filename.replace(/\\/g, '/');
			let startIndex = posixFilename.indexOf('/assets');
			let fileUri = posixFilename.substring(startIndex);

			themeObj[basename] = {
				name: basename,
				type: 'image',
				url: fileUri,
				metadata: {
					mipmap: true,
					resolution: 2
				}
			}

			let fullSrc = path.resolve(__dirname, src);
			let themeObjJson = JSON.stringify(themeObj, null, 4);
			let folderName = path.basename(fullSrc); // gets the folder name
			fs.writeFileSync(path.join(fullSrc, `${folderName}_assets.json`), themeObjJson);
			fs.writeFileSync(path.join(fullSrc, `${folderName}_assets.js`), `export default ${themeObjJson.replace(/"/g, '\'')}`);
		} else if (event.event === 'unlink') { // renamed or removed
			let filename = event.history[0];
			let basename = path.basename(filename);
			console.log(basename);
			delete themeObj[basename]; // if not defined, then this does nothing.

			let fullSrc = path.resolve(__dirname, src);
			let themeObjJson = JSON.stringify(themeObj, null, 4);
			let folderName = path.basename(fullSrc); // gets the folder name
			fs.writeFileSync(path.join(fullSrc, `${folderName}_assets.json`), themeObjJson);
			fs.writeFileSync(path.join(fullSrc, `${folderName}_assets.js`), `export default ${themeObjJson.replace(/"/g, '\'')}`);
		} else if (event.event === 'change') { // file content change
			// this dont require action from gulp
		}
	});
});

function recursiveSearch (startPath, filter, callback) {
	if (!fs.existsSync(startPath)) {
		console.log('no dir ', startPath);
		return;
	}

	var files = fs.readdirSync(startPath);
	for (var i = 0; i < files.length; i++) {
		var filename = path.join(startPath, files[i]);
		var stat = fs.lstatSync(filename);
		if (stat.isDirectory()) {
			let folderName = path.basename(filename);
			const folderCommands = folderName.split('_');
			let shouldIgnore = false;
			folderCommands.forEach(command => {
				if (command === 'watchignore' || command === 'ignore') {
					shouldIgnore = true;
				}
			});
			// Execute only if shouldn't ignore this filename
			if (!shouldIgnore) recursiveSearch(filename, filter, callback); // recurse
		} else if (filename.indexOf(filter) >= 0) {
			callback(filename);
		};
	};
}

gulp.task('latest', () => {
	_newTaskHeader('Installing libs...');

	try {
		let command = 'npm install';
		exec(command, {stdio: 'inherit'});
	}	catch (e) {
		console.log(e);
	}
});

gulp.task('bundle', _getTask('bundle'));
gulp.task('svgSpritesheet', _getTask('svgSpritesheet'));

gulp.task('bundle-standalone', () => {
	let cmds = _getMindCommands();
	let deployTo 		= cmds[mindCmdPrefix + 'deployTo'];
	let tmpGameName 	= cmds[mindCmdPrefix + 'gameName'];
	let pathOfBundleDirectory = cmds[mindCmdPrefix + 'bundleDirectory'] || 'standalone/';
	let nameOfGame 		= tmpGameName ? tmpGameName.trim() : '';
	let loadGamePath 	= cmds[mindCmdPrefix + 'loadGamePath'] || './test/' + nameOfGame + '';
	let command 		= '';
	if (!pathOfBundleDirectory.endsWith('/')) { pathOfBundleDirectory = pathOfBundleDirectory + '/' }

	if (nameOfGame) {
		console.log('BUNDLING')
		command = 'jspm bundle PixiArenas/' + nameOfGame + '/' + nameOfGame + ' + ' + loadGamePath + ' ' + pathOfBundleDirectory + nameOfGame + '.min.js';
		exec(command, {stdio: 'inherit'});

		console.log('COPYING SYSTEM JS');
		command = 'cp ./jspm_packages/system.js ' + pathOfBundleDirectory + 'system.js';
		exec(command, {stdio: 'inherit'});

		console.log('COPYING CONFIG.JS');
		command = 'cp ./config.js ' + pathOfBundleDirectory + 'config.js';
		exec(command, {stdio: 'inherit'});

		console.log('COPYING ASSETS');
		command = 'cp -R ./assets/ ' + pathOfBundleDirectory;
		exec(command, {stdio: 'inherit'});

		console.log('CREATING INDEX.HTML FILE');
		const outHtmlFileData = `<html>
		<head>
			<script src="./system.js"></script>
			<script src="./config.js"></script>
			<script>System.baseURL = window.location.href;</script>
			<script src="./` + nameOfGame + `.min.js"></script>
			<script>
			window.onload = () => {System.import("` + loadGamePath + `.js");};
			</script>
			<style>
			canvas { /* it's disable the canvas selection */
				-webkit-touch-callout: none;
				-webkit-user-select: none;
				-khtml-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;
				user-select: none;
				outline: none;
				-webkit-tap-highlight-color: rgba(255, 255, 255, 0); /* mobile webkit */
			}
			</style>
		</head>
		<body>
			<div class="fakeDevice" style="border: solid 2px gray; overflow: hidden; width: 100%; height: 100%;">
				<div class="au-animate">
					<div id="arenaContainer" tabindex="0" class="" style="background-color: transparent;"> </div>
				</div>
			</div>	  
		</body>
		</html>`;

		fs.writeFileSync('' + pathOfBundleDirectory + 'index.html', outHtmlFileData);

		// if user decides to deploy, they need to create credentials.
		if (deployTo) {
			// get server alias
			let regExpDeployToUrl = (deployTo.indexOf(':') >= 0) ? deployTo.split(':') : [];
			const SERVER_ALIAS = (regExpDeployToUrl.length <= 0) ? 'S3' : regExpDeployToUrl[0].replace(':', '');

			// get location in the server.
			regExpDeployToUrl = (deployTo.indexOf('/') >= 0) ? deployTo.split('/') : [];
			const BUCKET_NAME = (regExpDeployToUrl.length <= 0) ? deployTo : regExpDeployToUrl[0];
			const PATH_IN_BUCKET = (regExpDeployToUrl.length <= 0) ? '' : deployTo.replace(BUCKET_NAME + '/', '');

			console.log('DEPLOYING TO [' + SERVER_ALIAS + BUCKET_NAME + PATH_IN_BUCKET + ']');

			// currently only supporting S3.
			if (SERVER_ALIAS === 'S3') {
				// get credentials
				const credentials = new libAws.SharedIniFileCredentials({profile: 'mri-gc-account'});
				libAws.config.credentials = credentials;

				// init s3 after credentials
				const s3 = new libAws.S3();

				// upload files inside directories.
				_uploadFilesRecursive(s3, BUCKET_NAME, PATH_IN_BUCKET, pathOfBundleDirectory);
			}
		} else {
			// alert user about changes that need to be made
			console.log('********IMPORTANT********');
			console.log('Ensure ' + pathOfBundleDirectory + 'config.js has base url of \'./\'');
			console.log('Serve the contents in ' + pathOfBundleDirectory + ' to view stand alone game.');
			console.log('Currently, the \'assets/\' folder must go into the root of the server. This may or may not be the same location as the index.html. If assets do not work in the same location as index.html, try moving it up a directory in the server until you reach the root of the server.');
		}
	} else {
		console.error('Please provide the name of the game. [' + mindCmdPrefix + 'gameName NameOfGame]');
	}
});

 /**
	* Displays list of available tasks and how to use some.
	*/
gulp.task('help', () => {
	// this command should activate the functions help function.
	let cmds = {};
	cmds[mindCmdPrefix + 'help'] = true

	_newTaskHeader('MindSDK GULP HELP');
	console.log('');
	console.log('***Available Tasks***');
	exec('gulp --tasks', {stdio: 'inherit'});
	console.log('');

	console.log('***Task Commands***');
	console.log('');

	// bundle task info
	_getTask('bundle', {cmds})();

	// bundle task info
	console.log('---');
	console.log('bundle-standalone ' + mindCmdPrefix + 'gameName <GameName> ' + mindCmdPrefix + 'loadGamePathName <test/GameName> ' + mindCmdPrefix + 'bundleDirectory <PixiGames/NameOfGame/NameOfGame> ' + mindCmdPrefix + 'deployTo <SERVER:root-location-in-server/key/location/> ');
	console.log('  Will bundle the game and create a GameName.js file in the root folder of your game.');
	console.log('');
	console.log('    gameName: 					 Name of your game must be included. Must be the same name as your GameName.js file.');
	console.log('    loadGamePathName: 			 Path to loadgame.js file, NO ENDING EXTENSIONS such as \'.js\'');
	console.log('    bundleDirectory [optional]: Location to bundle the game to within your project. [Deafult: standalone/].');
	console.log(`    deployTo [optional]: 		 i.e. ( 'S3:mri-game-conversion/standalone/examplegame/latest/' ) Currently only supports S3.
						Credentials are needed for this to work. On adding credentials for S3.
						https://aws.amazon.com/sdk-for-node-js/
						Don't forget to change [default] to [mri-gc-account]`);
	console.log('');
	console.log('');

	// schema task info
	console.log('---');
	console.log('schema ' + mindCmdPrefix + 'src <relativePath> ' + mindCmdPrefix + 'dest <relativePath>');
	console.log('  Create a Json Schema for a JS object.');
	console.log('');
	console.log('    src: location of file to grab.');
	console.log('    dest: location to write json schema to.');
	console.log('');
	console.log('');

	// lint task info
	_getTask('lint', {cmds})();

	// lint-fix info
	_getTask('lint-fix', {cmds})();

	// svg spritesheet info
	_getTask('svgSpritesheet', {cmds})();

	// watch info
	console.log('---');
	console.log('watch  ' + mindCmdPrefix + 'install--links ' + mindCmdPrefix + 'selfLink');
	console.log('  Auto fix lint issues. Fixes a majority of issues not all.');
	console.log('  Run \'lint\' task again to ensure all lint issues are resolved.');
	console.log('');
	console.log('    install--links: When ever a file is saved in ' + srcWatch + ' successfully, will run <jspm install --link ');
	console.log('    selfLink: When ever a file is saved in ' + srcWatch + ' successfully, the package will run <jspm link> automatically.');
	console.log('');
});

gulp.task('cropSvg', (gulp, plugins, cmds, packageJson) => {
	let cmd = _getMindCommands();
	console.log(cmd);
	let cmdSrc = cmd[Utils.MIND_COMMAND_PREFIX + 'src'];
	Utils.cropSvg(cmdSrc);
});

gulp.task('lint', _getTask('lint'));

gulp.task('lint-fix', _getTask('lint-fix'));

/**
 * Using to-json-schema to generate schema. {@link https://www.npmjs.com/package/to-json-schema}
 *
 * The following params require the MindCommandPrefix to work.
 * @param {string} src [What file to import. Usese System.Import]
 * @param {string} dest [Location to write file to. Defaults to /validation/default.schema.json]
 */
gulp.task('schema', () => {
	_newTaskHeader('Creating Json Schemas');

	let mindCmds = _getMindCommands();
	let cmdSrc = mindCmds['' + mindCmdPrefix + 'src'];
	let cmdDest = mindCmds['' + mindCmdPrefix + 'dest'] || 'tmp/default.schema.js';
	let filepathSplit = cmdDest.split('/');
	let fileName = (filepathSplit.length <= 0) ? 'default' : filepathSplit[filepathSplit.length - 1];

	return System.import(cmdSrc).then((inResp) => {
		let objectToSchema = inResp.default;
		let jsonCreated = libToJson.json(fileName, objectToSchema);
		let outFileData = (typeof jsonCreated === 'string') ? jsonCreated : JSON.stringify(jsonCreated, null, 2);
		return fs.writeFile(cmdDest, 'export default ' + outFileData, (inError) => {
			if (inError) {
				console.log(inError.message);
			} else {
				_esLintFix(cmdDest)
					// if fixed, write the file to dest
					.pipe(gulpIf(utils.isFixed, gulp.dest(cmdDest + '/..')));
				console.log('Check ' + cmdDest + ' for new schema created.');
			}
		});
	});
});

gulp.task('xmlToJs', _getTask('xmlToJs'));

gulp.task('watch', function () {
	let args = _getMindCommands;
	let shouldInstallLibs = args.hasOwnProperty(mindCmdPrefix + 'install--links');
	let shouldLinkSelf = args.hasOwnProperty(mindCmdPrefix + 'selfLink');
	let watcher = gulp.watch(srcWatch);
	watcher.on('change', function (event) {
		gulp.src(event.path).pipe(eslint()).pipe(eslint.format()).pipe(eslint.result((result) => {
			if (result.errorCount === 0) {
				_newTaskHeader('No Style Errors [' + result.filePath + '].');
				if (shouldInstallLibs) {
					installLibs();
				}
				if (shouldLinkSelf) {
					linkSelf();
				}
			} else {
				beep(2);
			}
		}))
	});
});

 /**
	* Uses nectar to create asset bundles as tar files:
	* https://www.npmjs.com/package/nectar.
	*
	* Uses the following defined in package.json:
	* "mind": {
	* 	"bundle-assets": {
	*    		"output": "assets/ExampleGame.tar",
	*   		"assets": [
	*      		"assets/ExampleGame/*"
	*			]
	*		}
	*	}
	*
	*/
gulp.task('bundle-assets', () => {
	_newTaskHeader('Bundling assets...');
	console.log('');

	// checks if anything is defined in package.json
	if (!packageJson || !packageJson.mind || !packageJson.mind['bundle-assets']) {
		console.log('Skipping Bundling Assets. No bundle config.');
		return;
	}

	let assetPaths = packageJson.mind['bundle-assets'].assets;
	let bundleOutput = packageJson.mind['bundle-assets'].output;

		// console.log('assetPaths', assetPaths);
		// console.log('bundleOutput', bundleOutput);
		// console.log('');

	nectar(assetPaths, bundleOutput);
});

/*
 ********************
 * functions
 *********************
 */
function _uploadFile (s3Ref, bucketName, remoteFilePath, filePath, fileName) {
	let fileBuffer = fs.readFileSync(filePath);
	let metaData = _getContentTypeByFile(filePath);

	s3Ref.putObject({
		ACL: 'public-read',
		Bucket: bucketName,
		Key: remoteFilePath,
		Body: fileBuffer,
		ContentType: metaData
	}, (error, response) => {
		if (error) {
			// if the error contain the word credential, alert the user how to add credentials.
			if (error.message.toLowerCase().split('credential').length > 0) {
				console.log(`
	****************************************************
	Looks like there was an issue with your credentials. 
	
	Use the link below to set up your credentials.
	https://aws.amazon.com/sdk-for-node-js/

	Make sure to change [default] to [mri-gc-account] in 
	your credentials file.
	****************************************************
				`);
			}

			throw (error);
		} else {
			console.log('uploaded file[' + fileName + '] to [' + remoteFilePath + '] as [' + metaData + ']');
		}
	});
}

function _uploadFilesRecursive (s3Ref, bucketName, pathInBucket, directoryPath) {
	let getDirectories = true;
	let fileList = _getFileList(directoryPath);
	let directoryList = _getFileList(directoryPath, getDirectories);
	fileList.forEach((entry) => {
		_uploadFile(s3Ref, bucketName, pathInBucket + entry, directoryPath + entry, entry);
	});
	directoryList.forEach((result) => {
		_uploadFilesRecursive(s3Ref, bucketName, pathInBucket + result + '/', directoryPath + result + '/');
	});
}

function _getFileList (inPath, inReturnDirectories = false) {
	let i, fileInfo, filesFound;
	let outFileList = [];

	filesFound = fs.readdirSync(inPath);
	for (i = 0; i < filesFound.length; i++) {
		fileInfo = fs.lstatSync(inPath + filesFound[i]);
		if (inReturnDirectories === false) {
			if (fileInfo.isFile()) outFileList.push(filesFound[i]);
		} else {
			if (fileInfo.isDirectory()) outFileList.push(filesFound[i]);
		}
	}
	return outFileList;
}

function _getContentTypeByFile (fileName) {
	let rc = 'application/octet-stream';
	let fn = fileName.toLowerCase();

	if (fn.indexOf('.html') >= 0) rc = 'text/html';
	else if (fn.indexOf('.css') >= 0) rc = 'text/css';
	else if (fn.indexOf('.json') >= 0) rc = 'application/json';
	else if (fn.indexOf('.js') >= 0) rc = 'application/x-javascript';
	else if (fn.indexOf('.png') >= 0) rc = 'image/png';
	else if (fn.indexOf('.jpg') >= 0) rc = 'image/jpg';
	else if (fn.indexOf('.svg') >= 0) rc = 'image/svg+xml';

	return rc;
}

function _getMindCommands () {
	return Utils.getMindCommands()
}

function _getTask (task, {cmds} = {}) {
	cmds = cmds || Utils.getMindCommands();
	return require('./gulp_tasks/tasks/' + task)(gulp, plugins, cmds, packageJson);
}

function linkSelf () {
	_newTaskHeader('Linking...');
	try {
		let command = 'jspm link -y';
		exec(command, {stdio: 'inherit'});
	} catch (e) {
		console.log(e);
	}
}

function installLibs () {
	_newTaskHeader('Installing links...');
	// jspm install ...[<module@version>]:Object
	try {
		let command = 'jspm install';
		let linksToInstall = ' ';
		for (let i = 0; i < mindSdkLibsToInstallLibs.length; i++) {
			linksToInstall += mindSdkLibsToInstallLibs[i] + ' ';
		}
		command += linksToInstall + '-y';
		exec(command, {stdio: 'inherit'});
	} catch (e) {
		console.log(e);
	}
}

function _esLintFix (inSrc) {
	return gulp.src(inSrc)
		.pipe(eslint({
			fix: true
		}))
		.pipe(eslint.format())
}

function _newTaskHeader (inTaskMessage) {
	let numberOfLineBreaks = 3;
	let lengthOfStarChars = 15;
	let iBreak;
	let starString = '';
	for (iBreak = 0; iBreak < numberOfLineBreaks; iBreak++) {
		console.log('');
	}

	for (iBreak = 0; iBreak < lengthOfStarChars; iBreak++) {
		starString += '*';
	}

	console.log(starString);
	console.log(inTaskMessage);
	console.log(starString);
}

