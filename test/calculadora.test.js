const test = require('node:test');
const assert = require('node:assert');

const {
    sumar,
    restar,
    multiplicar,
    calcularDescuento
} = require('../src/calculadora');


test('2 + 3 debe ser igual a 5', () => {

    const resultado = sumar(2, 3);

    assert.strictEqual(resultado, 5);

});


test('10 - 4 debe ser igual a 6', () => {

    const resultado = restar(10, 4);

    assert.strictEqual(resultado, 6);

});


test('5 x 4 debe ser igual a 20', () => {

    const resultado = multiplicar(5, 4);

    assert.strictEqual(resultado, 20);

});


test('Q100 con 10% de descuento debe ser Q90', () => {

    const resultado = calcularDescuento(100, 10);

    assert.strictEqual(resultado, 90);

});