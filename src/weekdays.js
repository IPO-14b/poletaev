/** @module weekdays */

/**
 * Класс, содержащий информацию о днях недели.
 *
 * @private
 * @property {number} number - Номер дня недели по порядку (0 - понедельник, 6 - воскресенье)
 * @property {string} name - Название дня недели на русском языке
 * @property {boolean} isHoliday - Является ли день выходным
 */
class WeekDay{
    constructor(number, name, isHoliday){
        this.number = number
        this.name = name
        this.isHoliday = typeof(isHoliday) !== undefined && isHoliday
    }
}

/**
 * Список дней недели
 * @type {WeekDay[]}
 */
let weekDays = [
    new WeekDay(0, "Понедельник"),
    new WeekDay(1, "Вторник"),
    new WeekDay(2, "Среда"),
    new WeekDay(3, "Четверг"),
    new WeekDay(4, "Пятница"),
    new WeekDay(5, "Суббота", true),
    new WeekDay(6, "Воскресенье", true)
]

module.exports = weekDays;