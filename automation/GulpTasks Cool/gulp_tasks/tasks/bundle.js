
const Utils = require('../utils/Utils');
const exec = require('child_process').execSync; // from node
const fs = require('fs'); // from node

module.exports = function (gulp, plugins, cmds, packageJson) {
	let tmpGameName = cmds[Utils.MIND_COMMAND_PREFIX + 'gameName'];
	let shouldServer = cmds[Utils.MIND_COMMAND_PREFIX + 'serve'];
	let shouldIgnoreLint = cmds[Utils.MIND_COMMAND_PREFIX + 'ignoreLint'];
	let nameOfGame = tmpGameName ? tmpGameName.trim() : '';

	function _runTask () {
		if (nameOfGame) {
			if (shouldIgnoreLint) {
				_jspmBundle();
			} else {
				// fix any linting errors.
				let eslintCmds = { cmds: {} };
				eslintCmds.cmds.resultsCb = (results) => {
					// eslint-disable-next-line no-magic-numbers
					if (results.errorCount === 0) {
						if (results.warningCount > 0) {
							console.log('Warning are ok no worries, will start bundling now.');
						}

						_jspmBundle();
					} else {
						console.error(`Found ${results.errorCount} errors. Please fix before bundling file.`);
					}
				};
				let eslintFix = require('./lint-fix')(gulp, plugins, eslintCmds.cmds);
				eslintFix();
			}
		} else {
			console.error('Please provide the name of the game. [' + Utils.MIND_COMMAND_PREFIX + 'gameName NameOfGame]');
		}
	};

	function _jspmBundle () {
		console.log('Strating jspm bundle.');
		let command = '';
		command = 'jspm bundle PixiArenas/' + nameOfGame + '/' + nameOfGame + ' - mind-sdk/**/* ' + nameOfGame + '.js';
		exec(command, { stdio: 'inherit' });

		if (shouldServer) {
			command = 'http-server -c-1 --cors';
			exec(command, { stdio: 'inherit' });
		}
		_writeManifest(nameOfGame);
	};

	function _help () {
		console.log('---');
		console.log('bundle ' + Utils.MIND_COMMAND_PREFIX + 'gameName <GameName> ' + Utils.MIND_COMMAND_PREFIX + 'ignoreLint <Boolean> ' + Utils.MIND_COMMAND_PREFIX + 'serve <Boolean>');
		console.log('  Will bundle the game and create a GameName.js file in the root folder of your game.');
		console.log('');
		console.log('    gameName: Name of your game must be included. Must be the same name as your GameName.js file.');
		console.log('');
		console.log('');
	}

	function _writeManifest (gameName) {
		var sdkVersion = packageJson.jspm.dependencies['mind-sdk'];
		var dump = `{
			"module": "${gameName}",
			"arenaKey": "PixiArenas/${gameName}/${gameName}",
			"sdkBundleFile": "/pilot/sdk/mind-sdk-${sdkVersion}.js",
			"gameBundleFile": "/pilot/arenas/${gameName}.js",
			"assetsBaseUrl": "/pilot",
			"systemJsConfig": {
				"map": {
					"mind-sdk": "mind:mind-sdk@${sdkVersion}"
				}
			}
		}`;

		fs.writeFileSync(`PixiArenas/${gameName}/${gameName}.manifest.json`, dump);
	}

	// give user help on the command if requested
	if (cmds.hasOwnProperty('help') || cmds.hasOwnProperty(Utils.MIND_COMMAND_PREFIX + 'help')) {
		return _help;
	}

	// else return task function
	return _runTask;
};
