function sumar(a, b) {
    return a + b;
}

function restar(a, b) {
    return a - b;
}

function multiplicar(a, b) {
    return a * b;
}

function calcularDescuento(precio, porcentaje) {
    return precio - (precio * porcentaje / 100);
}

module.exports = {
    sumar,
    restar,
    multiplicar,
    calcularDescuento
};