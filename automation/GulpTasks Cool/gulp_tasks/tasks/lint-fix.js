
const Utils = require('../utils/Utils');

module.exports = function (gulp, plugins, cmds) {
	const eslint = plugins.eslint;
	const gulpIf = plugins.if;
	const fixSrc = cmds[Utils.MIND_COMMAND_PREFIX + 'fixSrc'] || 'PixiArenas/**/*.js';
	const writeSrc = cmds[Utils.MIND_COMMAND_PREFIX + 'writeSrc'] || 'PixiArenas';
	const resultsCb = cmds.resultsCb;

	function _runTask () {
		let gulpChain = gulp
		if (typeof fixSrc === 'string') {
			gulpChain = gulpChain.src(fixSrc)
				.pipe(eslint({
					fix: true
				}))
				.pipe(eslint.format())

			if (typeof resultsCb === 'function') {
				gulpChain = gulpChain.pipe(eslint.results(resultsCb));
			}

			if ((typeof writeSrc === 'string')) {
				// if fixed, write the file to dest
				gulpChain = gulpChain.pipe(gulpIf(Utils.isFixed, gulp.dest(writeSrc)));
			}

			return gulpChain;
		} else {
			console.error('please provide a fixSrc.');
		}
	};

	function _help () {
		console.log('---');
		console.log('lint-fix ---fixSrc /path/to/fix/ ---writeSrc /path/to/write/the/fixes/to/');
		console.log('  Auto fix lint issues. Fixes a majority of issues not all.');
		console.log('  If not flags are provided, it defaults to PixiArenas/')
		console.log('  Check console logs to see if all lint issues are resolved.');
		console.log('  Warnings may be ok to ignore, but errors must be fixed.');
		console.log('');
		console.log('');
	};

	// give user help on the command if requested
	if (cmds.hasOwnProperty('help') || cmds.hasOwnProperty(Utils.MIND_COMMAND_PREFIX + 'help')) {
		return _help;
	}

	// else return task function
	return _runTask;
};
