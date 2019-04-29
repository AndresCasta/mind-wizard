# SimpleTiledSprite
Si tienes un problema en donde tienes 3 sprites y el sprite del medio se tiene que ir haciendo ancho mientras la posicion de los sprites de los extremos se deben ir actualizando. este componente puede ahorrarte algunas horas.

![](https://imgur.com/jLw8ycH.gif)

## Ejemplo de uso
```javascript
const cart = new SimpleTiledSprite({ tileWidth: 500 }); // tileWidth is the width of the mid sprite.
cart.anchor.set(ZERO); // you can set the anchor of the sprite combinations just as you change the anchor of an sprite.
parent.addChild(cart); // add the TiledSprite to a contanier.
```

Los sprites que se usarán para el inicio el medio y el final deben definirce en el tema.

```
'myCustomTiledSprite': {
	'styleToUse': 'default',
	'default': {
		// default resources id
		'resourceIdInit': '3d_platform_init',
		'resourceIdMid': '3d_platform_mid',
		'resourceIdEnd': '3d_platform_end',

		// hover resources id
		'resourceIdInit_hover': 'resourceIdInit_hover',
		'resourceIdEnd_hover': 'resourceIdEnd_hover',
		'resourceIdMid_hover': 'resourceIdMid_hover'
	},
	'tactile': {
		// default resources id
		'resourceIdInit': '3d_platform_init',
		'resourceIdMid': '3d_platform_mid',
		'resourceIdEnd': '3d_platform_end',

		// hover resources id
		'resourceIdInit_hover': 'resourceIdInit_hover_hc',
		'resourceIdEnd_hover': 'resourceIdEnd_hover_hc',
		'resourceIdMid_hover': 'resourceIdMid_hover_hc'
	}
}
```

El style se le pasa a travez del constructor.
```javascript
const myTiledSprite = new SimpleTiledSprite({ 
        styleId: 'myCustomTiledSprite', // pass the style id.
        tileWidth: 500 // the width of the mid sprite.
    });
parent.addChild(cart); // add the TiledSprite to a contanier.
```