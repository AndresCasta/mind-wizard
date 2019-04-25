# VALIDATE
Libreria minimalista de aserttions, puede validar:
1. Tipos de datos
2. Asignar valores por defecto a variables undefined.
3. Assert conditions.

## _ASSERT()
Lanza una excepción si la condición es evaluada falsa.
```javascript
VALIDATE._ASSERT(condition, message);
```

## isType()
Verifica que el input object es del tipo especificado en el segundo parametro.
```javascript
VALIDATE.isType(inputObject, Type);
```

## requiredArg()
Lanza una excepción si el inputObject no esta definido y muestra el message especificado.
```javascript
VALIDATE.requiredArg(inputObject, message);
```

Se recomienda leer el la clase para entender los demas metodos que son una variante de estos tres.