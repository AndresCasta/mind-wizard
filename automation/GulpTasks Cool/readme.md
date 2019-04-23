# GulpTasks Cool
Esta es una version mejorada de las tareas definidas por defecto por mind. Entre las nuevas tareas podras encontrar las siguientes:

## gulp configureProject
Con esta tarea podras crear una nueva arena a partir de una arena plantilla, (por defecto se utiliza ExampleGame como plantilla). Esta tarea simplifica significativamente el proceso de iniciar un nuevo proyecto ya que hara por ti lo siguiente:

1. Renombrar el nombre de todas las carpetas y archivos.
2. Actualizar las referencias en todos los archivos.
3. Crear una carpeta assets.
4. Convertir el nivel de xml a json.
5. Generar el archivo schema del nivel json.
6. Agregar todas las referencias del puzzle en el archivo test levels, package.json y ArenaName.json.
7. Soportar travis-ci por defecto.


### Ejemplo

```bash
gulp configureProject ---name newProjectName ---xmlLevelSrc ./DemoLevel.xml ---template ExampleGame
```

| Flag        | Descripción           | Es obligatorio?  |
| ------------- |:-------------| :-----|
| ---name      | El nombre del nuevo proyecto | Obligatorio |
| ---template      | El nombre de la arena ubicada en PixiArenas/ que se utilizara como plantilla      |  Opcional (Por defecto se usará ExampleGame)  |
| ---xmlLevelSrc | La ubicación del nivel en XML si se especifica automaticamente se generará el schema y se agregara en todos los archivos necesarios      |    Opcional |

### Nota 2
En la nueva version mind agregó el flag **---ignoreLint** a la tarea bundle, si esta en falso (valor por defecto) el servidor no iniciara y en su lugar es-lint corregira automaticamente todos los errores que pueda.

Para asegurar de que el servidor se ejecutara utiliza el siguiente comando.

```bash
gulp bundle ---gameName ArenaName ---serve true ---ignoreLint true
```

## gulp cropSvg
Esta tarea esta pensada para remplazar cropSvg.js hace exactamente lo mismo, ademas no necesita que el usuario agregue a la variable de entorno PATH del sistema la ubicación de inkscape.

Cabe decir que esta utilidad no busca recursivamente archivos .svg en carpetas hijas.

### Example
Recorta todas los svg en la carpeta cropMe

```bash
gulp cropSvg ---src ./assets/ExampleGame/cropMe/
```

| Flag        | Descripción           | Es obligatorio?  |
| ------------- |:-------------| :-----|
| ---src      | Carpeta en la que se encuentran las imagenes que se van a recortar. | Obligatorio |