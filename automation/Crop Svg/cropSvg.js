const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/*
Author: Jose Villalobos
Date: 2019
*/

// IMPORTANTE: Poner inkscape en el path del sistema.
function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

let arr = process.argv[1].split('\\');
let fileName = arr[arr.length - 1];
let initPath = process.argv[1].replace(fileName, '');
async function fromDir(startPath,filter){

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename, filter); //recurse
        }
        else if (filename.indexOf(filter)>=0) {
            console.log('-- found: ', filename);
            exec('inkscape --verb=FitCanvasToDrawing --verb=FileSave --verb=FileClose --verb=FileQuit ' + filename);
        	await sleep(500);
        };
    };
};

fromDir(initPath, '.svg');

