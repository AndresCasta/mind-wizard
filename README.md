# Mind-Wizard Steroids
Utilidades, componentes, clases, snnipets y macros para acelerar el tiempo necesario para terminar un proyecto.

*NOTA: Se pide disculpas por los probables errores de ortografia que encuentres en este documento.*

# Componentes
## [BackButton](https://github.com/AndresCasta/mind-wizard/tree/master/components/BackButton)
![](https://imgur.com/OYJtlNB.gif)

## [Hourglass](https://github.com/AndresCasta/mind-wizard/tree/master/components/Hourglass)
Reloj de arena animado, recibe el tiempo y un callback que se invocara cuando termine. Y permite cambiar el tamaño facilmente.

![](https://imgur.com/bGNHvTA.gif)

## [FractionText](https://github.com/AndresCasta/mind-wizard/tree/master/components/Fractions)
Posiciona textos dentro de un contenedor para generar una fracción.

![](https://imgur.com/XMLDkEK.gif)

## [SimpleFractionText](https://github.com/AndresCasta/mind-wizard/tree/master/components/Fractions)
Posiciona textos dentro de un contenedor para generar una fracción.

![](https://imgur.com/4Gyqnzn.gif)

## [AnimatedSprite](https://github.com/AndresCasta/mind-wizard/tree/master/components/AnimatedSprite)
Permite reproducir secuencias de imagenes en una animación, esta versión modificada soporta playback en la animación de feedback.

## [MathParser](https://github.com/AndresCasta/mind-wizard/tree/master/components/MathParser)
![](https://imgur.com/jobly9X.gif)

Evaluador de expresiónes matematicas minimalista, te ayudará a renderizar operaciones matematicas en multiples pasos, ademas te permitira conocer y configurar la precedencia fácilmente.

## [VALIDATE](https://github.com/AndresCasta/mind-wizard/tree/master/components/VALIDATE)

Libreria minimalista de aserttions, puede validar:
1. Tipos de datos
2. Asignar valores por defecto a variables undefined.
3. Assert conditions.

## [GraphUtils](https://github.com/AndresCasta/mind-wizard/tree/master/components/GraphUtils)

Coleccion de funciones para dibujar figuras.


# Utilidades
## [BashScripts](https://github.com/AndresCasta/mind-wizard/tree/master/automation/BashScripts)
Scripts del bash para:
1. Hacer push a develop con un solo comando.
2. Iniciar el servidor de pruebas comodamente.

## [Cool GulpTasks](https://github.com/AndresCasta/mind-wizard/tree/master/automation/GulpTasks%20Cool)
Version mejorada de las tareas definidas por mind. Encontraras tareas para:

1. Crear una nueva arena a partir de una plantilla.
2. Importar/quitar recursivamente y automaticamente los assets del juego.
3. Tarea para recortar los assets que se encuentran en una carpeta.

## [vsSnippets](https://github.com/AndresCasta/mind-wizard/tree/master/automation/vsSnippets)
Snippets donde esta la recopilación de soluciones a problemas comunes.

## [vsSnippets](https://github.com/AndresCasta/mind-wizard/tree/master/automation/vsSnippets)

# Algunas soluciones a problemas comunes.

## Algunos elementos pierden su posicionamiento en el test harness
En el test harness se llama el evento onResize y el metodo .render() de los componentes de mind cada vez que se interactua con el menu de la izquierda, esto puede llevar a que algunos elementos pierdan el posicionamiento deseado en el viewport.

## Aparece un cuadro negro en la esquina cuando se cambia de tema.
Puede ocurrir que cuando se cambia de tema en un juego, aparezca un pequeño cuadrado negro en la esquina superior
izquierda de la pantalla, esto se debe a que hay una discrepancia entre los estilos declarados en el theme, y en el
json del juego (donde se declara styleToUse = 'tactile'), un elemento existe en el json, pero no existe en el theme.

## Posicionar en una region definida elementos que no tienen la misma dimension.
![](https://imgur.com/6uKUk4h.gif)
Este algoritmo simple se inspira en el [box-model](https://www.w3schools.com/css/css_boxmodel.asp) descrito en la especificacion de CSS2.

*NOTA: Este snippet se encuentra definido en el [archivo de snippets](https://github.com/AndresCasta/mind-wizard/tree/master/automation/vsSnippets)*

Usa el siguiente diagrama para entender las variables:
![](https://imgur.com/kysY9IY.gif)

```javascript
let cellSidesPadding = 10;
// Defines the region in which we are goig to positionate the elements.
let layoutX = 100; // layout origin (tope-left corner)
let layoutY = 100; // layout origin (tope-left corner)
let layoutWidth = 128;
let layoutHeight = 58;

// Define box dimensions.
// a box represents an item.
let cols = 5;
let boxWidth = layoutWidth / cols;
let rows = 2; // the number of rows to fit the boxes
let boxHeight = layoutHeight / rows; // the height of each row.

let contentWidth = boxWidth - cellSidesPadding;

// Where sprites is an array of MindPixiSprite instances.
for (let i = 0; i < sprites.length; i++) {
    let sprite = sprites[i];

    // adjust the sprite scale
    // Adjust critter width to box's content width
    let scaleFactor = contentWidth / sprite.width;
    // Check critter height is not outside of box's content height
    if ((sprite.width * scaleFactor) > contentHeight) {
        scaleFactor = contentHeight / sprite.height;
    }

    // The position, this supports multirow positioning inside the layout area.
    let thePosition = {
        x: initX + (i % cols) * boxWidth,
        y: initY + boxHeight * Math.floor(i / cols)
    };

    // Apply the computed scale factor.
    sprite.scale.set(scaleFactor);

    // Apply the computed position.
    sprite.position.x = thePos.x;
    sprite.position.y = thePos.y;

}
```
Como se puede entender en el algoritmo los sprites agregados al arreglo **sprites** se posicionaran automaticamente dentro del layout sin importar si su tamaño es distinto.

**Lecturas adicionales:**
1. [box-model specification](https://www.w3.org/TR/CSS2/box.html)

## Problemas de referencias

