# Cool GulpTasks
Esta es una version mejorada de las tareas definidas por defecto por mind. Entre las nuevas tareas podras encontrar las siguientes:

*NOTA: Se recomienda tener el terminal en el directorio raiz del proyecto antes de ejecutar estos comandos.*

## Instalación
1. **npm install** // si aun no lo has hecho
2. **jspm install** // si aun no lo has hecho.
3. **npm i --save-dev gulp-rename** // to allow folder rename.
4. **npm i --save-dev gulp-replace** // to allow file strings replace.
5. **npm i --save-dev gulp-watch** // improved gulp watcher by using chokidar
6. Listo para usar.

## gulp configureProject
Con esta tarea podras crear una nueva arena a partir de una arena plantilla, (por defecto se utiliza ExampleGame como plantilla). Esta tarea simplifica significativamente el proceso de iniciar un nuevo proyecto ya que hara por ti lo siguiente:

1. Renombrar el nombre de todas las carpetas y archivos.
2. Actualizar las referencias en todos los archivos.
3. Crear una carpeta assets.
4. Convertir el nivel de xml a json.
5. Generar el archivo schema del nivel json.
6. Agregar todas las referencias del puzzle en el archivo test levels, package.json y ArenaName.json.
7. Soportar travis-ci por defecto.

Para ejecutar el proyecto generado debes utilizar la siguiente dirección:


```
// Nota el /testgen/ en lugar del /test/
http://localhost:8080/testgen/
```

### Ejemplo

```bash
gulp configureProject ---name newProjectName ---xmlLevelSrc ./DemoLevel.xml ---template ExampleGame
```

| Flag        | Descripción           | Es obligatorio?  |
| ------------- |:-------------| :-----|
| ---name      | El nombre del nuevo proyecto | Obligatorio |
| ---template      | El nombre de la arena ubicada en PixiArenas/ que se utilizará como plantilla      |  Opcional (Por defecto se usará ExampleGame)  |
| ---xmlLevelSrc | La ubicación del nivel en XML si se especifica automaticamente se generará el schema y se agregara en todos los archivos necesarios      |    Opcional |

### Nota 1
Ten en cuenta que debes modificar el schema generado automaticamente. Por ejemplo: para quitar campos requeridos o cambiar los tipos de datos.

### Nota 2

Para asegurar de que el servidor se ejecutara utiliza el siguiente comando.

```bash
gulp bundle ---gameName ArenaName ---serve true ---ignoreLint true
```
## gulp assetImporter
Importa recursivamente los archivos **.svg** que se encuentren desde la carpeta **---src**, la tarea genera un archivo que referencia todas las imagenes, este archivo luego se podrá importar fácilmente en el tema del juego (y en el package.json).

Adicionalmente la tarea se quedara escuchando la ruta especificada de forma recursiva para actualizar automaticamente el archivo generado, permitiendonos asi agregar imagenes al proyecto simplemente agregandolas a la carpeta especificada.

### Ejemplo
Supongamos la siguiente estructura de archivos en: **assets/ExampleGame**

Para importar todos los svg facilmente ejecutamos el siguiente comando:
```bash
gulp assetImporter ---src ./assets/ExampleGame
```

Se generarán dos archivos que contendran toda la información de los assets encontrados.

![](https://imgur.com/zhWyf5h.gif)

Estos archivos se podran importar luego en el tema tan facil como:
```javascript
import { default as ExampleGameAssets } from '../../assets/ExampleGame/ExampleGame_assets';

export default {
  'exampleGameAssets': ExampleGameAssets,
  // ... the other assets an styles
}
```

Por ultimo podras utilizar los assets definidios en **ExampleGame_assets.js** como estas acostumbrado.
```javascript
sprite.texture = this.resources['ufo_feedback_12fps_assets_frame004'].texture;
```

## gulp cropSvg
Esta tarea esta pensada para remplazar cropSvg.js hace exactamente lo mismo, ademas no necesita que el usuario agregue a la variable de entorno PATH del sistema la ubicación de inkscape.

*NOTA: esta utilidad no busca recursivamente archivos **.svg** en carpetas hijas.*

### Ejemplo
Recorta todas los **svg** en la carpeta cropMe

```bash
gulp cropSvg ---src ./assets/ExampleGame/cropMe/
```

| Flag        | Descripción           | Es obligatorio?  |
| ------------- |:-------------| :-----|
| ---src      | Carpeta en la que se encuentran las imagenes que se van a recortar. | Obligatorio |
