const fs = require('fs');
const path = require('path');

console.log('====================================');
console.log('INICIANDO BUILD');
console.log('====================================');

const origen = path.join(__dirname, '..', 'src');
const destino = path.join(__dirname, '..', 'dist');

if (fs.existsSync(destino)) {

    console.log('Eliminando build anterior...');

    fs.rmSync(destino, {
        recursive: true,
        force: true
    });
}

console.log('Creando carpeta dist...');

fs.mkdirSync(destino, {
    recursive: true
});

console.log('Copiando archivos...');

fs.cpSync(origen, destino, {
    recursive: true
});

console.log('====================================');
console.log('BUILD COMPLETADO CORRECTAMENTE');
console.log('====================================');