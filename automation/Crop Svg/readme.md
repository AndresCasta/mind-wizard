# Crop Svg
**cropSvg.js** es un pequello script de utilidad para ajustar el tamaño de la pagina al dibujo que contiene el archivo svg.

Ten en cuenta que el script busca de forma recursiva archivos **.svg** en las subcarpetas, esto puede ser algo bueno para tus necesidades o quizas algo malo si no quieres que se modifiquen dichas imagenes asi que es recomendable organizar las imagenes de una forma conveniente antes de ejecutarlo.

## Requisitos
cropSvg.js solo utiliza modulos nativos, por lo que no requiere de la instalación de ninguna libreria adicional. Sin embargo, si es necesario tener inkscape instalado y agregado en la variable PATH del sistema para que el script funcione correctamente.

1. Descargar e instalar inkscape. *(Yo no lo hago por que ya lo tengo instalado :D)*
2. Precionar las teclas Win + R
3. Escribir: **SystemPropertiesRemote** en la ventana de dialogo que se abrió.
4. Ir a la pestaña **Opciones Avanzadas** o **Advanced Options** (dependiendo del lenguaje de tu computador)
5. Click en **Variables de entorno** o **Environment Variables**
6. En la sección de **Variables del sistema** buscar el registro que se llama **Path** y presione doble click.
7. En la ventana que se abrió pulse sobre el boton **Nuevo** y luego en **Examinar**
8. Busque la carpeta en la que se instalo inkscape en el paso **1** (normalmente en C:\Program Files\Inkscape)

## Como usarlo
Asegurate de haber seguido los pasos explicados en los **requisitos**.

1. Copia el archivo cropSvg.js en la carpeta en la que se encuentran tus imagenes.
2. Abre una linea de comandos ubicandote en la barra de dirección del explorador de archivos, luego escribe cmd y pulsa enter.
3. escribe lo siguiente en el terminal: **node ./cropSvg.js**
4. Espera mientras la magia ocurre.

## Notas
1. Pido disculpas por los muy probables errores de ortografia que tiene este documento.
2. El *"Yo no lo hago por que ya lo tengo instalado"* es una frase tipica de youtubers que hacen tutoriales de instalación de programas.
