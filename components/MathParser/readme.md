# MathParser
**Creado por:** Romualdo Villalobos.

![](https://imgur.com/jobly9X.gif)

Evaluador de expresiónes matematicas minimalista, te ayudará a renderizar operaciones matematicas en multiples pasos, ademas te permitira conocer la presedencia fácilmente.

## Uso
Imaginemos que tenemos la siguiente expresión:
```javascript
const expressionStr = '2[(3+4)^2*5]';
```

Y debemos renderizar las operaciones paso por paso desde la mas interna hasta la mas externa.

Ingenuamente podriamos aproximarnos a una solución utilizando expresiones regulares y la peligrosa eval(). Pero este enfoque llevará a un sinfin de dolores de cabeza a la hora de evaluar la precedencia de los operadores, ademas, probablemente se termine en una situación en la que un pequeño cambio en la forma de la expresión necesite un monton de cambios al código fuente.

### La solución recomendada
Utilizar alguna variante de analizador (parser) de expresiones matematicas.

![](https://imgur.com/nBioxJT.gif)

Source: [CodeProject](https://www.codeproject.com/Articles/50377/Create-Your-Own-Programming-Language)

```javascript
const expressionStr = '2[(3+4)^2*5]';
let expressionTokenized = MathParser.tokenize(expressionStr); // Toqueniza el string original para que sea entendible por el parser.
let expressionEvaluated = MathParser.evaluate(expressionTokenized); // El resultado de la expresión matematica.
let expressionInfo = MathParser.extractTokensInfo(expressionTokenized); 

/* expressionInfo es un objeto de la forma: {
    groupTokensPrecedence: groupsPrecedenceTokens, // what parenthesis should be evaluated first groupsPrecedence[0][0]
    tokensPrecedence: currentExprTokens, // what expression should be evaluated first, excludes parenthesis
    majorTokenPrecedence: majorTokenPrecedence,
    tokensAST: currentExprAST, // (A)bstract (S)intax (T)ree representing operator precedence of current expression
    numOfOperatorsAtCurrentExpr: numOfOperatorsAtCurrentExpr // how many operators are at current expression being evaluated
};*/
```

Entre los datos que regresa MathParser.extractTokensInfo() esta el tokensAST, que es un arbol de sintaxis abstracta normalmente utilizado para renderizar las operaciónes en función de la precedencia.

El MathParser permite cambiar el orden de precedencia de los operadores fácilmente, Cuanto mas grande el numero asociado al operador, mayor sera la precedencia del mismo:
```javascript
// En MathParser.js
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
```

### ¿Que es un token?
Esto se entiende mas fácil con ejemplos:

```javascript
const expressionStr = '2[(3+4)^2*5]';
let expressionTokenized = MathParser.tokenize(expressionStr); // Devuelve un array de tokens, algo como: [ '2', '[', '(', '3', '+', '4', ',', ')', '^', '2', '*', '5', ']'  ]
```

Este arreglo de tokens no es muy util por si solo, para eso utilizamos el metodo estatico **MathParser::extractTokensInfo()** que nos dará información util de la expresión y de cada token por ejemplo: la precedencia del token, si esta agrupado en algun parentesis, si es un token redundante, o un token implicito.

### La clase Token
La clase toeken se inicializa en los metodos estaticos de la clase MathParser, distintos campos de Token se inicializan en distintons metodos de MathParser.
```javascript
// Donde tokenInstance es una instancia de un token
let precedence = tokenInstance.precedence; // get the precedence of token, higher precedence it is evaluated first


let associativity = tokenInstance.associativity; // in what order an expression containing several operations of the same kind are grouped in the absence of parentheses. Compare that to 2 ^ 3 ^ 4, which is evaluated as 2 ^81, not 8 ^4. Thus ^ has a right associativity.


// is inside parenthesis or group.
let parenthesisToken = anotherTokenInstance; // type of this token is TOKEN_TYPES.LEFT_PARENTHESIS, see TOKEN_TYPES for a full list of supported types.
let isInsideParenthesis = tokenInstance.isInsideGroup (parenthesisToken); // Check if current token is inside an specified group


let type = tokenInstance.type; // type of current token. could be a: LITERAL, OPERATOR, LEFT_PARENTHESIS or a RIGHT_PARENTHESIS


let value = tokenInstance.value; // value of current token


let uid = tokenInstance.uid; // token unique identifier


let insideGroups = tokenInstance.insideGroups; // Array of parenthesis that are grouping this token


let isImplicit = tokenInstance.isImplicit; // this token was added automatically by the tokenizer (lexical analize engine) example in the expression: 2(3+5) the * implicit token is added between 2 and ( resulting in: 2*(3+5)


let isRedundant = tokenInstance.isRedundant; // a redundant token is a token that is 'wasting' space, for example at (6), the left and right parenthesis are redundant, so those tokens will be marked as redundant but they aren't going to be removed.


let operateOrder = tokenInstance.operateOrder; // number indicating the order in which should be evluated the current expression (should be positive)
```


## Ejemplo de la vida real
1. [OperationRace](https://github.com/stmath/mind-games-OperationRace/blob/939286fe3c61925d38955624f315ccfc13f104dd/PixiArenas/OperationRace/views/MainView.js#L2032). En este ejemplo no se eutilizó el arbol de sintaxis abstracta para renderizar las operaciones.

## Lecturas adicionales
1. [Parsing math expressions with JavaScript](https://medium.freecodecamp.org/parsing-math-expressions-with-javascript-7e8f5572276e)
2. [Shunting-yard algorithm](https://en.wikipedia.org/wiki/Shunting-yard_algorithm)