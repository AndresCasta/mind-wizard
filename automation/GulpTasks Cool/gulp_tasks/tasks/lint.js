
const Utils = require('../utils/Utils');

module.exports = function (gulp, plugins, cmds) {
	const eslint = plugins.eslint;
	const srcWatch = cmds[Utils.MIND_COMMAND_PREFIX + 'src'] || 'PixiArenas/**/*.js';

	function _runTask () {
		return gulp.src(srcWatch)
			// eslint() attaches the lint output to the "eslint" property
			// of the file object so it can be used by other modules.
			.pipe(eslint())
			// eslint.format() outputs the lint results to the console.
			// Alternatively use eslint.formatEach() (see Docs).
			.pipe(eslint.format())
			// To have the process exit with an error code (1) on
			// lint error, return the stream and pipe to failAfterError last.
			.pipe(eslint.failAfterError());
	};

	function _help () {
		console.log('---');
		console.log('lint <no commands>');
		console.log('  Check files against linter.');
		console.log('');
		console.log('');
	}

	// give user help on the command if requested
	if (cmds.hasOwnProperty('help') || cmds.hasOwnProperty(Utils.MIND_COMMAND_PREFIX + 'help')) {
		return _help;
	}

	// else return task function
	return _runTask;
};
