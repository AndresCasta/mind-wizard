# AnimatedSprite
Permite reproducir secuencias de imagenes en una animación, esta versión modificada soporta playback en la animación de feedback.

![](https://imgur.com/7toFrWq.gif)

```javascript
/**
 * AnimatedSprite::fromResources() docs:
 * A short hand way of creating a movieclip from the singleton resources object
 *
 * @static
 * @param {string} frameNameTemplate A coomon name of a set of resources, each one ending with a different number, for example at res1, res2, res3, ... res14, the alias would be res
 * @param {number} minFrame the min index to start fetching frames
 * @param {number} maxFrame the max index to start fetching frames
 * @param {number} majorIndex total of frames less one
 * @param {Resources} resources the resources object
 * @param {boolean} isPingPong specify if this is a ping pong animation
 * @returns {AnimatedSprite}
 */
const clip = AnimatedSprite.fromResources('[@', 0, 6, 6, parent.resources); // bracket parenthesis
clip.scale.set(SCALE_FACTOR, SCALE_FACTOR);
clip.anchor.y = ANCHOR_Y;
clip.anchor.x = ANCHOR_X;
clip.loopTimes = 1;
clip.alpha = INITIAL_ALPHA;
parent.addChild(clip);
clip.position.set(0, 240);

const label = 'customLabel';
const time = 5;
clip.play (time, label)
```

## Ejemplo de la vida real
[OperationRace](https://test.stmath.com/test.html#/game-test/OperationRace/): Feedback negativo. [ver codigo fuente](https://github.com/stmath/mind-games-OperationRace/blob/master/PixiArenas/OperationRace/components/OperatorMoviesFactory.js).