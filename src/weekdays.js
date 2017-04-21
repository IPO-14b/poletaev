 class WeekDay{
    constructor(number, name, isHoliday){
        this.number = number
        this.name = name
        this.isHoliday = typeof(isHoliday) !== undefined && isHoliday
    }
}

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