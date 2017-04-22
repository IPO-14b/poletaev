/** @module utils */

module.exports = {
    range: range
}

/**
 * Создает массив, содержащий числа начиная со значения <code>start</code> с шагом 
 * <code>step</code> которые не превышают <code>end</code>
 * 
 * @param  {number} start - Начальный интервал генерации чисел
 * @param  {number} end - Конечный интервал генерации чисел
 * @param  {number} step - Шаг итерации
 * @return {number[]} Сформированный массив
 */
function range(start, end, step){ 
    return Array(((end - start + 1) / step) |0).fill().map((_, i) => start + i * step)
}