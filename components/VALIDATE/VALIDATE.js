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

	static requiredArg (_input, _mssg) {
		if (typeof(_input) === 'undefined' || _input === null) throw new Error(_mssg);
		else return _input;
	}

	static _ASSERT (condition, message) {
		if (!condition) {
			throw new Error('[ASSERTION] ' + message);
		}
	}

	static isType (_input, type) {
		let isType = null;
		if (typeof type === 'string') isType = typeof _input === type; // eslint-disable-line valid-typeof
		else isType = _input instanceof type;
		VALIDATE._ASSERT(isType, _input + ' object is not of type ' + type);
		return _input;
	}
}
