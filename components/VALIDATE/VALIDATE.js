export class VALIDATE {
	static defaultArg (_input, _defaultInput) {
		return (_input === undefined || _input === null) ? _defaultInput : _input;
	}

	static defaultStr (_input, _defaultInput) {
		return (_input === undefined || _input === null || _input === '') ? _defaultInput : _input;
	}

	static defaultNum (_input, _defaultInput) {
		const ZERO = 0;
		const current = VALIDATE.defaultArg(Number(_input), Number(_defaultInput));
		return Number.isNaN(current) ? VALIDATE.defaultArg(Number(_defaultInput), ZERO) : Number(_input);
	}

	/**
	 * Checks the _input parameter is not undefined.
	 * @param {*} _input 
	 * @param {*} _mssg 
	 */
	static requiredArg (_input, _mssg) {
		if (typeof(_input) === 'undefined' || _input === null) throw new Error(_mssg);
		else return _input;
	}

	static _ASSERT (condition, message) {
		if (!condition) {
			throw new Error('[ASSERTION] ' + message);
		}
	}

	/**
	 * Checks the input object is of the type specified in type.
	 * @param {object} _input The variable to check its type. 
	 * @param {type} type The type as string or as a type.
	 */
	static isType (_input, type) {
		let isType = null;
		// if type is passed as an string, then compare strings.
		// if type is passed as a type then compare with instanceof.
		if (typeof type === 'string') isType = typeof _input === type; // eslint-disable-line valid-typeof
		else isType = _input instanceof type;
		VALIDATE._ASSERT(isType, _input + ' object is not of type ' + type);
		return _input;
	}
}
