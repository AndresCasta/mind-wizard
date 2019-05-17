import { VALIDATE } from './VALIDATE';

// further reading:
// How to build a math expression tokenizer using JavaScript (or any other language): https://medium.freecodecamp.org/how-to-build-a-math-expression-tokenizer-using-javascript-3638d4e5fbe9
// Parsing math expressions with JavaScript: https://medium.freecodecamp.org/parsing-math-expressions-with-javascript-7e8f5572276e
// Shunting-yard algorithm:https://en.wikipedia.org/wiki/Shunting-yard_algorithm

/**
 * package the types of math tokens:
 */
export const TOKEN_TYPES = {
	LITERAL: 'LITERAL',
	OPERATOR: 'OPERATOR',
	LEFT_PARENTHESIS: 'LEFT_PARENTHESIS',
	RIGHT_PARENTHESIS: 'RIGHT_PARENTHESIS'
};

export const OPERATOR_VALUES_ARR = [
	'^', '*', '/', '+', '-'
];

/**
 * package the associativities of the operators:
 */
const ASSOC = {
	'^': 'right',
	'*': 'left',
	'/': 'left',
	'+': 'left',
	'-': 'left'
};

// /**
//  * package the precedence of the operators:
//  */
// const PREC = {
// 	'(': 7, // (P)arenthesis <- this is not needed for the parser but is useful outside at OperatorMoviesFactory::playMovie method
// 	'^': 6, // (E)xponent
// 	'*': 5, // (M)ultiplication
// 	'/': 4, // (D)ivision
// 	'+': 3, // (A)ddition
// 	'-': 2	// (S)ubstraction
// };

/**
 * Another precedence rule, here M D and A S uses the same precedence value,
 * this precedence is used for most standard calculators
 */
const PREC = {
	'(': 5, // (P)arenthesis <- this is not needed for the parser but is useful outside at OperatorMoviesFactory::playMovie method
	'^': 4, // (E)xponent
	'*': 3, // (M)ultiplication
	'/': 3, // (D)ivision
	'+': 2, // (A)ddition
	'-': 2	// (S)ubstraction
};

const ZERO = 0;
const ONE = 1;
const TWO = 2;

export class MathParser {
	static tokenArrToString (rpn) {
		return rpn.map(token => token.value).join(' ');
	}

    /**
     * Do lexical Analysis on input string for generate tokens
     * @param {string} str math expression for lexical analysis
     * @returns {Array<Token>} an array of tokens found on current expression
     */
	static tokenize (str) {
		let tokensArr = [];                 // array of tokens
		let numberBuffer = [];              // buffer for storing nums
		let groupBuffer = [];				// buffer for storing parenthesis uid info
		str = str.replace(/\s+/g, '');      // remove spaces; remember they don't matter?
		let strArr = str.split('');         // convert to array of characters

		let clearNumberBuffer = (obj = { isImplicit: false }) => {
			let tokenVal = numberBuffer.join('');
			let nToken = new Token(TOKEN_TYPES.LITERAL, tokenVal);
			nToken.addGroupInfo(groupBuffer);
			tokensArr.push(nToken);
			numberBuffer = [];
			if (obj.isImplicit) {
				let nToken = new Token(TOKEN_TYPES.OPERATOR, '*');
				nToken.isImplicit = true;
				nToken.addGroupInfo(groupBuffer);
				tokensArr.push(nToken); // conver implicit multiplication to an explicit one
			}
		};

		for (let idx = 0; idx < strArr.length; idx++) {
			const char = strArr[idx];
			const lastChar = strArr[idx - ONE];

			// check if current and prev char are sub (-), ex: --2
			let isSecondSubInRow = false;
			if (lastChar) {
				isSecondSubInRow = (lastChar === '-') && (char === '-');
			}

			// check if no prev char and current char is (-)
			const subIsFirstChar = (lastChar === undefined) && (char === '-');
			// if current char is '-' and prev it wasn't a number, it means that current '-' is part of a negative literal number
			const subIsUnary = isOperator(lastChar) && (char === '-');

			if (isDigit(char) || isSecondSubInRow || subIsFirstChar || subIsUnary) {
				numberBuffer.push(char);
			} else if (isOperator(char)) {
				if (numberBuffer.length) clearNumberBuffer();

				let nToken = new Token(TOKEN_TYPES.OPERATOR, char);
				nToken.addGroupInfo(groupBuffer);
				tokensArr.push(nToken);
			} else if (isLeftParenthesis(char)) {
				if (numberBuffer.length) clearNumberBuffer({ isImplicit: true }); // is implicit multiplication?

				// implicit parenthesis multiplication (4+3)[2-4]
				if (lastChar && isRightParenthesis(lastChar)) {
					let nToken = new Token(TOKEN_TYPES.OPERATOR, '*');
					nToken.isImplicit = true;
					nToken.addGroupInfo(groupBuffer);
					tokensArr.push(nToken);
				}

				// create left parenthesis token
				let nToken = new Token(TOKEN_TYPES.LEFT_PARENTHESIS, char);
				// push new token and group buffer info
				groupBuffer.push(nToken); // nToken.uid
				nToken.addGroupInfo(groupBuffer);
				tokensArr.push(nToken);
			} else if (isRightParenthesis(char)) {
				if (numberBuffer.length) clearNumberBuffer();
				let nToken = new Token(TOKEN_TYPES.RIGHT_PARENTHESIS, char);
				tokensArr.push(nToken);
				nToken.addGroupInfo(groupBuffer);
				groupBuffer.pop(); // pop last left parenthesis uid from the groupBuffer
			} else {
				throw new Error('Unexpected token <<< ' + char + ' >>> at given expression: ' + str + ' please check your math expression at current level');
			}
		}

		if (numberBuffer.length) clearNumberBuffer();

		// performs a second analisis of implicity (exponent operators will be marked as implicit)
		for (let i = 0; i < tokensArr.length; i++) {
			const token = tokensArr[i];
			const prevToken = tokensArr[i - ONE];
			if (token.value === '^') token.isImplicit = true;

			// when exponential expression 2^(2+1) is provided not a single literal 4^2,
			// the exponent operator will be considered as not implicit
			if (prevToken && token.isType(TOKEN_TYPES.LEFT_PARENTHESIS)) {
				if (prevToken.value === '^') prevToken.isImplicit = false;
			} else if (prevToken && token.isType(TOKEN_TYPES.LITERAL)) {
				if (prevToken.value === '^') token.isSingleExponent = true;
			}
		}

		return tokensArr;
	}

	/**
	 * Extract useful info for working with expressions (this, method will set Token::isRedundant field to tokens at specified array of tokens)
	 * @param {Array<Token>} tokensArr An array of tokens
	 * @return {{}} tokens info, as precedence, num of groups and others; obj.groupsPrecedence is
	 * an array of arrays specifing precedence order of major parenthesis and parenthesis contained inside major parentesis
	 * the zero index always means that should be evaluated first
	 */
	static extractTokensInfo (tokensArr)/* : no-const */ {
		console.assert(tokensArr, 'Provide a tokens arr for extracting info');

		// --------------------------------------------------------------------------------
		// calculate parenthesis that should be evaluated first (precedence of parenthesis)
		let groupsPrecedenceTokens = []; // what parenthesis should be evaluated first groupsPrecedence[0][0]
		let groupsBufferStack = [];
		for (let i = 0; i < tokensArr.length; i++) {
			const token = tokensArr[i];

			if (token.isType(TOKEN_TYPES.LEFT_PARENTHESIS)) {
				// first parenthesis of a nested-group
				if (groupsBufferStack.length === ZERO) {
					groupsPrecedenceTokens.push([]); // create an array for another major group
				}
				groupsBufferStack.push(token);
			} else if (token.isType(TOKEN_TYPES.RIGHT_PARENTHESIS)) {
				groupsPrecedenceTokens[groupsPrecedenceTokens.length - ONE].push(groupsBufferStack.pop());
			}
		}

		// check that parenthesis has an expression inside
		let emptyGroupsCounter = 0;
		groupsPrecedenceTokens.forEach((majorGroup) => {
			for (let i = 0; i < majorGroup.length; i++) {
				const groupToken = majorGroup[i];
				const ignoreParenthesis = false;
				const exprInsideCurrentGroup = MathParser.getExpressionInsideGroup(groupToken, tokensArr, ignoreParenthesis);
				const isAnEvaluableExpressionInside = exprInsideCurrentGroup.numOfOperatorsAtCurrentExpr > ZERO;
				if (!isAnEvaluableExpressionInside) {
					emptyGroupsCounter++;
					// mark selection as redundant, a redundant expression is an expression that could be
					// written using less tokens, for example (3) can be written as 3,
					// redundancy Informally, it is the amount of wasted "space" used to transmit certain data.
					// here we don't want to remove redundancy but simply mark the tokens as redundant, these tokens
					// are generated by the user when it finishes the evaluation of an expression inside a parenthesis
					// ex: (1+2+3) will become at some point (6), althoug reundant, we don't wan't to delete redundant tokens
					exprInsideCurrentGroup.expressionTokens.forEach((token) => {
						if (token.isParenthesis()) token.isRedundant = true; // only parenthesis can be redundant
						// else token.insideGroups = []; // this token is wrapped by redundant parenthesis

						const isOperator = token.isType(TOKEN_TYPES.OPERATOR);
						const wasRemovedFromGroup = !token.insideGroups.length;
						if (wasRemovedFromGroup) VALIDATE._ASSERT(!isOperator, 'Inside a redundant parenthesis no makes sence to have an operator, this is an invalid expression, there should be a literal number instead');
					});
				}
			}
		});

		// remove parenthesis without an expression inside ex: (4) or ()
		groupsPrecedenceTokens.splice(ZERO, emptyGroupsCounter);

		// --------------------------------------------------------------------------------
		// calculate expression that should be evaluated first (excluding parenthesis)
		// and current num of operators
		let currentExprTokens = [];
		let numOfOperatorsAtCurrentExpr = 0;
		let isParenthesis = groupsPrecedenceTokens.length > ZERO;

		// check if major precendence parenthesis has an expression inside
		// if (isParenthesis) {
		// 	let currentParenthesisToken = groupsPrecedenceTokens[ZERO][ZERO];
		// 	let exprInsideCurrentGroup = MathParser.getExpressionInsideGroup(currentParenthesisToken, tokensArr);
		// 	isParenthesis &= exprInsideCurrentGroup.expressionTokens.length;
		// }

		if (isParenthesis) {
			let currentParenthesisToken = groupsPrecedenceTokens[ZERO][ZERO];
			let exprInsideCurrentGroup = MathParser.getExpressionInsideGroup(currentParenthesisToken, tokensArr);
			currentExprTokens = exprInsideCurrentGroup.expressionTokens;
			numOfOperatorsAtCurrentExpr = exprInsideCurrentGroup.numOfOperatorsAtCurrentExpr;
		} else {
			for (let i = 0; i < tokensArr.length; i++) {
				const token = tokensArr[i];
				// is current token an operator token?
				const isOperatorType = token.isType(TOKEN_TYPES.OPERATOR);
				currentExprTokens.push(token);
				if (isOperatorType) numOfOperatorsAtCurrentExpr++;
			}
		}

		// --------------------------------------------------------------------------------
		// calculate current expression AST
		let currentExprAST = MathParser.parseInfix2AST(currentExprTokens);

		// --------------------------------------------------------------------------------
		// get the token with major precedence at current expression

		// evaluate for calculate the min Token::operateOrder value
		MathParser.evaluate(currentExprTokens);

		// tokens with operateOrder set as zero, are operands and operators of first evaluated sub-expression
		const firstEvaluatedTokens = [];

		// WBC-7087: make sure that the first evaluated expression has the greater precedence
		// find the token with minor operate order and major precedence
		let majorPrecedence = -1;
		let minorOperateOrder = Number.MAX_SAFE_INTEGER;
		for (let i = 0; i < currentExprTokens.length; i++) {
			const token = currentExprTokens[i];
			majorPrecedence = token.precedence > majorPrecedence ? token.precedence : majorPrecedence;
		}

		// find the minor operate order of the major precedence token set
		for (let i = 0; i < currentExprTokens.length; i++) {
			const token = currentExprTokens[i];
			if (token.precedence === majorPrecedence) {
				minorOperateOrder = token.operateOrder < minorOperateOrder ? token.operateOrder : minorOperateOrder;
			}
		}

		for (let i = 0; i < currentExprTokens.length; i++) {
			const token = currentExprTokens[i];
			if (token.operateOrder === minorOperateOrder) {
				firstEvaluatedTokens.push(token);
			}
		}
		// we can assume the second token at first evaluated tokens is an operator since we are using inifix notation here
		const majorTokenPrecedence = firstEvaluatedTokens[ONE];

		return {
			groupTokensPrecedence: groupsPrecedenceTokens, // what parenthesis should be evaluated first groupsPrecedence[0][0]
			tokensPrecedence: currentExprTokens, // what expression should be evaluated first, excludes parenthesis
			majorTokenPrecedence: majorTokenPrecedence,
			tokensAST: currentExprAST, // (A)bstract (S)intax (T)ree representing operator precedence of current expression
			numOfOperatorsAtCurrentExpr: numOfOperatorsAtCurrentExpr // how many operators are at current expression being evaluated
		};
	}

	static getNumOfOperators (tokensArr, ignoreRedundant) {
		let totalParenthesis = 0;
		let redundantParenthesis = 0;
		let totalExp = 0;
		let totalMult = 0;
		let totalDiv = 0;
		let totalAdd = 0;
		let totalSub = 0;

		for (let i = 0; i < tokensArr.length; i++) {
			const token = tokensArr[i];
			if (token.isParenthesis()) {
				totalParenthesis += ignoreRedundant ? !token.isRedundant : ONE;
				if (token.isRedundant) redundantParenthesis++;
			} else if (token.value === '^') {
				totalExp++;
			} else if (token.value === '*') {
				totalMult++;
			} else if (token.value === '/') {
				totalDiv++;
			} else if (token.value === '+') {
				totalAdd++;
			} else if (token.value === '-') {
				totalSub++;
			}
		}

		return {
			'!(': redundantParenthesis,
			'(': totalParenthesis,
			'^': totalExp,
			'*': totalMult,
			'/': totalDiv,
			'+': totalAdd,
			'-': totalSub,
			total: totalParenthesis + totalExp + totalMult + totalDiv + totalAdd + totalSub
		};
	}

	static getExpressionInsideGroup (groupToken, tokensArr, ignoreParenthesis = true) {
		VALIDATE.requiredArg(groupToken, 'required @ groupToken arg at getExpressionInsideGroup');
		VALIDATE.requiredArg(groupToken, 'required @ tokensArr arg at getExpressionInsideGroup');
		let currentExprTokens = [];
		let numOfOperatorsAtCurrentExpr = 0;
		for (let i = 0; i < tokensArr.length; i++) {
			const token = tokensArr[i];
			// is current token inside the first group that should be evaluated?
			const isInsideGroup = token.isInsideGroup(groupToken);
			// is current token a parenthesis?
			const isParenthesis = token.isParenthesis() && ignoreParenthesis;
			// is current token an operator token?
			const isOperatorType = token.isType(TOKEN_TYPES.OPERATOR);
			// push tokens to currentExprTokens arr
			if (isInsideGroup && !isParenthesis) {
				currentExprTokens.push(token);
				if (isOperatorType) numOfOperatorsAtCurrentExpr++;
			} else if (isInsideGroup && !ignoreParenthesis) {
				currentExprTokens.push(token);
				if (isOperatorType) numOfOperatorsAtCurrentExpr++;
			}
		}
		return {
			expressionTokens: currentExprTokens,
			numOfOperatorsAtCurrentExpr: numOfOperatorsAtCurrentExpr
		};
	}

	/**
	 * Fin a token in a given array of tokens by using the uid
	 * @param {*} uid uid of token for fetching
	 * @param {*} tokenArr array of tokens for fetching on
	 * @returns {Token} Found token, if no token is found, returns null
	 */
	static getTokenByUid (uid, tokenArr) {
		let fetch = null;
		for (let i = 0; i < tokenArr.length; i++) {
			const token = tokenArr[i];
			if (token.uid === uid) {
				fetch = token;
				break;
			}
		}
		if (!fetch) VALIDATE._ASSERT(false, 'Provided token for fetching is not inside the token arr');
		return fetch;
	}

	/**
	 * Find the nearest literal token at righ and left of specified token, this method will ignore near redundant tokens
	 * @param {Token} token A token for start fetching
	 * @param {Array<Token>} tokenArr An array of tokens in which will be searched specified token and its left and right nearest literal tokens
	 */
	static getNearLiteralTokens (token, tokenArr) {
		// get index of token at tokenArr
		let indexOf = -1;
		for (let i = 0; i < tokenArr.length; i++) {
			const qToken = tokenArr[i];
			if (qToken.uid === token.uid) {
				indexOf = i;
				break;
			}
		}

		VALIDATE._ASSERT(indexOf !== -ONE, 'token not found inside tokenArr');

		let leftToken = null;
		let rightToken = null;
		let leftTokenIndex = indexOf - ONE;
		let rightTokenIndex = indexOf + ONE;

		const MAX_ITER = 516;
		let secureIterator = 0;
		do {
			tokenArr.forEach((token, i) => {
				if (leftTokenIndex === i) leftToken = token;
				if (rightTokenIndex === i) rightToken = token;
			});
			if (leftToken.isRedundant) leftTokenIndex--;
			if (rightToken.isRedundant) rightTokenIndex++;
			if (secureIterator >= MAX_ITER) {
				throw new Error('Something was wrong when finding near literal tokens of specified token, maybe is there a parenthesis error, or a bad typed expression');
			}
			secureIterator++;
		} while (leftToken.isRedundant || rightToken.isRedundant);

		VALIDATE._ASSERT(leftToken && rightToken && token, 'Left or right token not found');
		return {
			leftToken: leftToken,
			centerToken: token,
			rightToken: rightToken
		};
	}

	static isMinimalExpression (arr) {
		const minimalExpressionLen = 3;
		let isMinimalExpression = minimalExpressionLen === arr.length;
		isMinimalExpression &= arr[ZERO].isType(TOKEN_TYPES.LITERAL);
		isMinimalExpression &= arr[ONE].isType(TOKEN_TYPES.OPERATOR);
		isMinimalExpression &= arr[TWO].isType(TOKEN_TYPES.LITERAL);
		return isMinimalExpression;
	}

	/**
	 * Evaluate an array of tokens and set the Token.operateOrder field value
	 * @param {Array<Token>} tokens array of tokens on In-Fix Notation to be evaluated
	 * @param {boolean} _castToRPN default as true, used for converting an infix token arr to RPN token arr
	 * @returns {number} Number representing the evaluated expression
	 */
	static evaluate (tokens, _castToRPN = true) {
		let rpnArr = [];
		if (_castToRPN) rpnArr = MathParser.parseInfix2RPN(tokens);
		else			rpnArr = tokens;

		let setNumberTokenAtExpr = (i, newNumber) => {
			const nToken = new Token(TOKEN_TYPES.LITERAL, newNumber);
			const exprLen = 3;
			const startReplacing = i - (exprLen - ONE);
			rpnArr.splice(startReplacing, exprLen, nToken);
		};

		// // check if receiving a single literal token
		// if (tokens.length === ONE) {
		// 	return Number(tokens[ZERO].value);
		// }

		let shouldContinueEvaluating = true;
		let operationOrder = 0;
		const MAX_ITER = 516;
		let whileIterator = 0;
		let n = 0;
		while (shouldContinueEvaluating) {
			let x = 0;
			let y = 0;
			if (whileIterator >= MAX_ITER) {
				// avoid infinite loops if occurs
				throw new Error('[MathParser::evaluate()] Math expressions is taking too much to be evaluated, could be extraordinarily large, a missing parenthesis problem, or a not supported expression by the internal parser');
			}
			whileIterator++;

			for (let i = 0; i < rpnArr.length; i++) {
				const token = rpnArr[i];
				const isOperator = token.isType(TOKEN_TYPES.OPERATOR);

				// console.log(MathParser.tokenArrToString(rpnArr) + '');
				if (isOperator) {
					// get prev and prev-prev token
					const pToken = rpnArr[i - ONE];
					const ppToken = rpnArr[i - TWO];
					x = +ppToken.value; // cast no num
					y = +pToken.value; // cast to num

					// set operateOrder to implied tokens
					token.operateOrder = operationOrder;
					pToken.operateOrder = operationOrder;
					ppToken.operateOrder = operationOrder;
					// increment the operate order
					operationOrder++;

					if (token.value === '^') {
						n = x ** y;
					} else if (token.value === '*') {
						n = x * y;
					} else if (token.value === '/') {
						n = x / y;
					} else if (token.value === '+') {
						n = x + y;
					} else if (token.value === '-') {
						n = x - y;
					}
					// replace prev tokens with a new one
					setNumberTokenAtExpr(i, n);
					if (rpnArr.length === ONE) {
						// there is nothing more to evaluate
						shouldContinueEvaluating = false;
					}
					break; // restart the for loop
				}
			}
		}

		// formats the number using fixed-point notation.
		const fixedDigits = 6; // number of digits to appear after the decimal point; this may be a value between 0 and 20, inclusive
		return Number(n.toFixed(fixedDigits));
	}

    /**
     * converts an array representing infix tokens to an array representing postfix (RPN) expression,
     * this methos is an implementation to the Shunting-yard algorithm
     * @param {Array<Token>} tokens array of tokens for be converted to Reversed Polish Notation
     * @returns {Array} Array on RPN notation
     */
	static parseInfix2RPN (tokens) {
		let outQueue = [];
		let opStack = [];

		for (let i = 0; i < tokens.length; i++) {
			const v = tokens[i];
            // if the token is a number, then push it to the output queue
			switch (v.type) {
                // if the token is a number, then push it to the output queue
				case TOKEN_TYPES.LITERAL:
					outQueue.push(v);
					break;
                // if the token is an operator, o1, then:
				case TOKEN_TYPES.OPERATOR:
                    // while there is an operator token o2, at the top of the operator stack and either
					let isPeek = false;
					let isPeekOperator = false;

                    // o1 is left-associative and its precedence is less than or equal to that of o2, or
					let isLeftAssociativity = false;
					let isO1LessEqPrecedence = false;
					let isLeft = false;

                    // o1 is right associative, and has precedence less than that of o2,
					let isRightAssociativity = false;
					let isO1LessPrecedemce = false;
					let isRight = false;

					let updateFlags = () => {
                        // while there is an operator token o2, at the top of the operator stack and either
						isPeek = peekArr(opStack); // opStack.peek();
						if (!isPeek) return false;
						isPeekOperator = peekArr(opStack).type === TOKEN_TYPES.OPERATOR;

                        // o1 is left-associative and its precedence is less than or equal to that of o2, or
						isLeftAssociativity = v.associativity === 'left';
						isO1LessEqPrecedence = v.precedence <= peekArr(opStack).precedence;
						isLeft = isLeftAssociativity && isO1LessEqPrecedence;

                        // o1 is right associative, and has precedence less than that of o2,
						isRightAssociativity = v.associativity === 'right';
						isO1LessPrecedemce = v.precedence < peekArr(opStack).precedence;
						isRight = isRightAssociativity && isO1LessPrecedemce;

						return isPeek && isPeekOperator && (isLeft || isRight);
					};

					while (updateFlags()) {
						outQueue.push(opStack.pop());
					}

                    // at the end of iteration push o1 onto the operator stack
					opStack.push(v);
					break;
                // if the token is a left parenthesis (i.e. "("), then push it onto the stack.
				case TOKEN_TYPES.LEFT_PARENTHESIS:
					opStack.push(v);
					break;
                // if the token is a right parenthesis (i.e. ")"):
				case TOKEN_TYPES.RIGHT_PARENTHESIS:
                    // until the token at the top of the stack is a left parenthesis, pop operators off the stack onto the output queue.
					let _isPeek = false; // opStack.peek();
					let isNotLeftParenthesis = false; // opStack.peek().type !== TOKEN_TYPES.LEFT_PARENTHESIS;
					let _updateFlags = () => {
						_isPeek = peekArr(opStack);
						if (!_isPeek) return false;
						isNotLeftParenthesis = peekArr(opStack).type !== TOKEN_TYPES.LEFT_PARENTHESIS;
						return _isPeek && isNotLeftParenthesis;
					};
					while (_updateFlags()) {
						outQueue.push(opStack.pop());
					}

                    // pop the left parenthesis from the stack, but not onto the output queue.
					opStack.pop();
					break;
			};
		}

		return outQueue.concat(opStack.reverse());  // list of tokens in RPN
	}

    /**
     * converts an array representing infix tokens to an array representing an AST expression,
     * this methods is an implementation to the Shunting-yard algorithm
     * @param {Array<Token>} tokens array of tokens for be converted to Abstract sintax tree
     * @returns {Array} AST e-
     */
	static parseInfix2AST (tokens) {
		let outStack = [];
		let opStack = [];

		for (let i = 0; i < tokens.length; i++) {
			const v = tokens[i];
            // if the token is a number, then push it to the output queue
			switch (v.type) {
                // if the token is a number, then push it to the output queue
				case TOKEN_TYPES.LITERAL:
					outStack.push(new ASTNode(v, null, null));
					// outStack.push(v);
					break;
                // if the token is an operator, o1, then:
				case TOKEN_TYPES.OPERATOR:
                    // while there is an operator token o2, at the top of the operator stack and either
					let isPeek = false;
					let isPeekOperator = false;

                    // o1 is left-associative and its precedence is less than or equal to that of o2, or
					let isLeftAssociativity = false;
					let isO1LessEqPrecedence = false;
					let isLeft = false;

                    // o1 is right associative, and has precedence less than that of o2,
					let isRightAssociativity = false;
					let isO1LessPrecedemce = false;
					let isRight = false;

					let updateFlags = () => {
                        // while there is an operator token o2, at the top of the operator stack and either
						isPeek = peekArr(opStack); // opStack.peek();
						if (!isPeek) return false;
						isPeekOperator = peekArr(opStack).type === TOKEN_TYPES.OPERATOR;

                        // o1 is left-associative and its precedence is less than or equal to that of o2, or
						isLeftAssociativity = v.associativity === 'left';
						isO1LessEqPrecedence = v.precedence <= peekArr(opStack).precedence;
						isLeft = isLeftAssociativity && isO1LessEqPrecedence;

                        // o1 is right associative, and has precedence less than that of o2,
						isRightAssociativity = v.associativity === 'right';
						isO1LessPrecedemce = v.precedence < peekArr(opStack).precedence;
						isRight = isRightAssociativity && isO1LessPrecedemce;

						return isPeek && isPeekOperator && (isLeft || isRight);
					};

					while (updateFlags()) {
						addNode(outStack, opStack.pop());
						// outStack.push(opStack.pop());
					}

                    // at the end of iteration push o1 onto the operator stack
					opStack.push(v);
					break;
                // if the token is a left parenthesis (i.e. "("), then push it onto the stack.
				case TOKEN_TYPES.LEFT_PARENTHESIS:
					opStack.push(v);
					break;
                // if the token is a right parenthesis (i.e. ")"):
				case TOKEN_TYPES.RIGHT_PARENTHESIS:
                    // until the token at the top of the stack is a left parenthesis, pop operators off the stack onto the output queue.
					let _isPeek = false; // opStack.peek();
					let isNotLeftParenthesis = false; // opStack.peek().type !== TOKEN_TYPES.LEFT_PARENTHESIS;
					let _updateFlags = () => {
						_isPeek = peekArr(opStack);
						if (!_isPeek) return false;
						isNotLeftParenthesis = peekArr(opStack).type !== TOKEN_TYPES.LEFT_PARENTHESIS;
						return _isPeek && isNotLeftParenthesis;
					};
					while (_updateFlags()) {
						addNode(outStack, opStack.pop());
						// outStack.push(opStack.pop());
					}

                    // pop the left parenthesis from the stack, but not onto the output queue.
					opStack.pop();
					break;
			};
		}

		while (peekArr(opStack)) {
			addNode(outStack, opStack.pop());
			// outStack.addNode(opStack.pop());
		}

		return outStack.concat(opStack.reverse());  // list of tokens in RPN
	}
}

let staticTokenUidGen = -1;
export class Token {
	/**
	 * Create a token instance copy
	 * @param {Token} token a token for copying
	 */
	static getCopy (token) {
		let nToken = new Token(token.type, token.value);
		nToken.insideGroups = Object.assign([], token.insideGroups);
		nToken.isImplicit = token.isImplicit;
		nToken.operateOrder = token.operateOrder;
	}

    /**
     * get the precedence of token, higher precedence it is evaluated first
     * @returns {Enumerator<PREC>} number representing the precedence
     */
	get precedence () {
		let precValue = -1;
		if (this.isParenthesis()) precValue = PREC['('];
		else precValue = PREC[this.value];
		return precValue;
	}

    /**
     * in what order an expression containing several operations of the same kind
     * are grouped in the absence of parentheses. Compare that to 2 ^ 3 ^ 4, which is
     * evaluated as 2 ^81, not 8 ^4. Thus ^ has a right associativity.
     * @returns {Enumerator<PREC>} associa
     */
	get associativity () {
		return ASSOC[this.value];
	}

    /**
     * Token object representing an atom inside a math expression
     * @param {TOKEN_TYPES} type type of current token
     * @param {string} value value representing current token
     */
	constructor (type, value) {
		// make the token knows what is its grouper
		// eg: inside_group1, inside_group2, etc..
		// the tokenizer should set this information
		staticTokenUidGen++;

		/**
		 * type of current token, could be literal, operator, left parenthesis or right parenthesis
		 */
		this.type = type;

		/**
		 * string value of current token, eg: +, -, 10, the field is initialized during instancing
		 */
		this.value = value;

		/**
		 * token unique identifier, the field is initialized during instancing
		 */
		this.uid = staticTokenUidGen;

		/**
		 * this token it is grouped by specified uid tokens? array of right parentheses tokens that
		 * are grouping this token, the field is initialized during MathParser::tokenize(string) invocation
		 */
		this.insideGroups = [];

		/**
		 * flag indicating if this token was added automatically by the tokenizer (lexical analize engine)),
		 * the field is initialized during MathParser::tokenize(string) invocation
		 */
		this.isImplicit = false;

		/**
		 * is this token a literal exponent? ex: 2^4 will set isSingleExponent = true on token 4, but not on (2+2) tokens at 2 ^ (2 + 2)
		 * the field is initialized during MathParser::tokenize(string) invocation
		 */
		this.isSingleExponent = false;

		/**
		 * a redundant token is a token that is 'wasting' space, for example at (6), the left and right parenthesis are redundant, so those tokens will be marked as redundant
		 * the field is initialized during MathParser::extractTokensInfo(Token[]) invocation
		 */
		this.isRedundant = false;

		/**
		 * numbar indicating the order in which should be evluated the current expression (should be major equal than zero),
		 * the field is initialized during MathParser::evaluate(Token[]) invocation
		 */
		this.operateOrder = -1;
	}

	/**
	 * Specify if current token is inside a group
	 * @param {boolean} groupBuffer UID of parenthesis tokens that are surrounding this token
	 * @returns {void}
	 */
	addGroupInfo (groupBuffer = []) {
		this.insideGroups = Object.assign([], groupBuffer);
	}

	/**
	 * Check if current token is of an specified token type
	 * @param {TOKEN_TYPES} tokenType a token type
	 * @returns {boolean} flag indicating if current token is of type specified at argument
	 */
	isType (tokenType) {
		return this.type === tokenType;
	}

	/**
	 * Check if current token is a parenthes (could be left or right parenthesis)
	 * @returns {boolean} flag indicating if current token is a parenthesis
	 */
	isParenthesis () {
		const isLeftParenthesis = this.isType(TOKEN_TYPES.LEFT_PARENTHESIS);
		const isRightParenthesis = this.isType(TOKEN_TYPES.RIGHT_PARENTHESIS);
		const isParenthesis = isLeftParenthesis || isRightParenthesis;
		return isParenthesis;
	}

	/**
	 * Check if current token is inside an specified group
	 * @param {Token} groupToken left parenthesis token of some group
	 * @returns {boolean} flag indicating if current token is inside a specified group uid
	 */
	isInsideGroup (groupToken) {
		let isInsideGroup = false;
		for (let i = 0; i < this.insideGroups.length; i++) {
			const currentTokenGroupsUid = this.insideGroups[i].uid;
			isInsideGroup = currentTokenGroupsUid === groupToken.uid;
			if (isInsideGroup) break;
		}
		return isInsideGroup;
	}
}

export class ASTNode {
	constructor (token, leftChildNode, rightChildNode) {
		this._token = token;
		this.token = token.value;
		this.leftChildNode = leftChildNode;
		this.rightChildNode = rightChildNode;
	}

	toString (count) {
		if (!this.leftChildNode && !this.rightChildNode)			{ return this.token + '\t=>null\n' + Array(count + ONE).join('\t') + '=>null'; }
		count = count || ONE;
		count++;
		return this.token + '\t=>' + this.leftChildNode.toString(count) + '\n' + Array(count).join('\t') + '=>' + this.rightChildNode.toString(count);
	}
}

function isDigit (ch) {
	let isDigit = /\d/.test(ch);
	let isPoint = ch === '.';
	return isDigit || isPoint;
}

function isOperator (ch) {
	return /\+|-|\*|\/|\^/.test(ch);
}

function isLeftParenthesis (ch) {
	let isParenthesis = ch === '(';
	let isBracket = ch === '[';
	return isParenthesis || isBracket;
}

function isRightParenthesis (ch) {
	let isParenthesis = ch === ')';
	let isBracket = ch === ']';
	return isParenthesis || isBracket;
}
/**
 * The peek() method returns the element at the front the container.
 * It does not deletes the element in the container.
 * This method returns the head of the queue.
 * @param {array} array array for peeking
 * @returns {any} first element of array
 */
function peekArr (array) {
	let head = array.slice(-ONE)[ZERO];
	return head;
}

function addNode (array, operatorToken) {
	let rightChildNode = array.pop();
	let leftChildNode = array.pop();
	array.push(new ASTNode(operatorToken, leftChildNode, rightChildNode));
}
