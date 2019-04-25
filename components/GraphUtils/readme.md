# GraphUtils

## drawDashedPolygon()

## generateCircle()

## generateRect()

## generateRoundRect()

## formatColor()
Convert color from **rgb(r, g, b)** a **0xRRGGBB**

## drawGradientRect()

## drawGradientRect2()

## drawGradientRectTexture()

## drawGradientCircleTexture()

## createTillingSprite()
En [StimateTotalCost](https://github.com/stmath/mind-games-EstimateTotalCost/blob/16a87fd23ecea56a91960d6b53ed61a043ccf27c/PixiArenas/EstimateTotalCost/components/ShopCart.js#L45) se necesita estirar el sprite del carrito de compras cada vez que se le agrega un nuevo objeto.

![](https://imgur.com/huIpvZc.gif)![](https://imgur.com/RkJe2Eq.gif)

Para esto se utilizara la clase **PIXI.extras.TilingSprite**. Si en lugar de utilizar esta clase decidimos escalar un sprite, se corre el riesgo de que dicho sprite se deforme y/o desenfoque.

El metodo **createTillingSprite()** regresara un MindPixiSprite o un texture, ten en cuenta que si debes rescalar dicho sprite tendras que crear otro tilling sprite ya que no podemos cambiar el width y/o height del sprite para evitar deformar el sprite.

```javascript
let returnTexture = true;
let cartMiddleTexture = createTillingSprite(idCartMiddleTexture, this.maxWidth, this.cartEnd.height, returnTexture);
sprite.texture = cartMiddleTexture;
```


## drawMinusBlock()
![](https://imgur.com/y5BB8mf.gif)

*NOTA: En la imagen anterior se estan dibujando 4 minus blocks.*

```javascript
let minusBlock = drawMinusBlock(width, height);
```

Se utiliza en:
1. [TenFrameFacts](https://test.stmath.com/test.html#/game-test/TenFrameFacts)
2. [LinearTransform](https://test.stmath.com/test.html#/game-test/LinearTransform)

## createPlatform()
![](https://imgur.com/crHSZIF.gif)

```javascript
// the createPlatform method has into account the tactile theme.
let platformSprite = new MindPixiSprite();
platformSprite.texture = this.createPlatform(width, height).texture;
this.addChild(platformSprite);
```

## renderDotsOnBezierPath()
![](https://imgur.com/cbyXGdE.gif)
Dibuja una curva bezier. Permite analizar un recorrido bezier que se pasara posteriormente a un tween.

```javascript
let path = this._generatePath(); // generates a bezier path. see: https://greensock.com/docs/Plugins/BezierPlugin
let bezierOptions = {
    type: 'cubic',
    values: path // ,
    // autoRotate: ['x', 'y', 'rotation', rotationOffset, true]
};

let coordinateSpace = this;
let smaplingPoints = 100;
let color = COLOR.FILL_BROWN; // if undefined is used: COLOR.FILL_BROWN
let pointRadius = 1;
renderDotsOnBezierPath(coordinateSpace, smaplingPoints, bezierOptions, color, pointRadius);
```
