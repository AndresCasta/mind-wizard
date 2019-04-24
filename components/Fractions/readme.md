Observa que la diferencia entre las dos clases es que SimpleFractionText no muestra los operadores por ejemplo multiplicación o división.

# FractionText

![](https://imgur.com/XMLDkEK.gif)

si la operación es una multiplicación el signo se pondra despues de la fracción, si es una división se pondra antes de la fracción.

Ejemplo de uso basico:
```javascript
const OPERATION_TYPES = {
	MULT: 'mult', // multiplication
	DIV: 'div' // division
};

let textContent = new FractionText(ONE, ONE, false, undefined);
textContent.operation = OPERATION_TYPES.MULT; // this is a required field
textContent.representation = representation; // (decimal, fraction)
textContent.numerator = numerator;
textContent.denominator = denominator;
textContent.fillColor = originalFractionText.fillColor;
```

# SimpleFractionText

![](https://imgur.com/4Gyqnzn.gif)

Ejemplo de uso basico.
```javascript
// In MainView
let textContent = new SimpleFractionText(ONE, ONE, true, undefined); // text or fraction
textContent.representation = representation; // (decimal, fraction)
textContent.numerator = numerator;
textContent.denominator = denominator;
this.addChild(textContent);
```