const {
    sumar,
    restar,
    multiplicar,
    calcularDescuento
} = require('./calculadora');

console.log('=================================');
console.log('   SISTEMA DEMO - DEVOPS');
console.log('=================================');

console.log('10 + 5 =', sumar(10, 5));
console.log('10 - 5 =', restar(10, 5));
console.log('10 x 5 =', multiplicar(10, 5));

const precio = 100;
const descuento = 10;

console.log(
    `Precio Q${precio} con ${descuento}% descuento = Q${calcularDescuento(precio, descuento)}`
);

console.log('=================================');
console.log('Aplicación ejecutada correctamente');