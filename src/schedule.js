/** @module schedule */

let Utils = require("./utils.js")

/**
 * Класс, хранящий информацию об времени начала и окончания занятия.
 * Предполагается, что каждый день занятия начинаются и заканчиваются в 
 * одно и то же время.
 *
 * @class
 * @property {number} number - Порядковый номер занятия
 * @property {boolean} startTimeDefined - Было ли время начала занятия 
 *                                      введено пользователем
 * @property {boolean} startTimeDefined - Было ли время конца занятия 
 *                                      введено пользователем
 * @property {int} startTime - Время начала занятия в минутах с полуночи
 * @property {int} endTime - Время конца занятия в минутах с полуночи
 */
class Lesson{

    /**
     * @constructor
     * @param  {int} lessonNumber - Порядковый номер занятия
     * @param  {Schedule} schedule - Объект расписания 
     */
    constructor(lessonNumber, schedule){
        this.number = lessonNumber
        this.startTimeDefined = false;
        this.endTimeDefined = false;
        this.startTime = 0;
        this.endTime = 0;

        this._schedule = schedule;
    }

    /**
     * Устанавливает время начала занятия и проверяет его корректоность:
     * <uL>
     * <li>оно не должно превышать времени конца занятия если оно было 
     *     установлено
     * <li>оно не должно превышать следующего исзвесного времени начала занятия 
     * </ul>
     * 
     * @param {number} time - Время начала занятия в минутах, прошедших с 
     *     полуночи
     */
    setStartTime(time){
        if (this.endTimeDefined && this.endTime <= time){
            alert("Начало занятия не может быть позже его конца.");
        }else if (time < this._schedule.getEarlistTimeForLesson(this.number)){
            alert("Занятие не может начаться раньше чем закончилось предыдущее");
        }else{
            this.startTime = time;
            this.startTimeDefined = true;
        }
    }

    /**
     * Устанавливает время конца занятия и проверяет его корректоность:
     * <uL>
     * <li>оно не должно быть меньше времени начала занятия если оно было 
     *     установлено
     * <li>оно не должно быть меньше времени предыдущего исзвесного времени 
     *     конца занятия  
     * </ul>
     * 
     * @param {number} time - Время начала занятия в минутах, прошедших с 
     *     полуночи
     */
    setEndTime(time){
        if (this.startTimeDefined && this.startTime >= time){
            alert("Конец занятия должен быть позже его начала.");
        }else if (time > this._schedule.getLatestTimeForLesson(this.number)){
            alert("Зянятие не может закончиться позже чем начнется следующее");
        }else{
            this.endTime = time;
            this.endTimeDefined = true;
        }
    }
}

/**
 * Класс, содержащий информацию о одной из вариантов переодического занятия.
 * @param {boolean} active - Определяет является ли занятие активным. 
 *     Если занятие не является активным, оно не будет экспортировано в .ics 
 *     файл и его название не будет отображаться в пользовательском интерфейсе 
 *     календаря.
 * @param {string} name - Название события. По умолчанию используется строка 
 *                        "<без названия>".
 * @param {string} location - Место проведения занятия.
 */
class ItemPart{

    /**
     * @constructor
     */
    constructor(){
        this.active = true;
        this.name = "<без названия>";
        this.location = "";
    }
}

/**
 * Класс, содержащий инфомрацию о занятии, добавленном в календарь.
 *
 * @property {number} partsCount - Количество периодических вариантов собятия.
 * @property {ItemPart[]} parts - Периодические варианты занятия.
 * @property {WeekDay} day - День недели, в который будет проводится занятие.
 *     (0 - понедельник, 6 - воскресенье).
 * @property {Lesson} lesson - Объект, соответствующий времени проведения 
 *     занятия.
 */
class ScheduleItem{
    /**
     * @constructor
     * @param  {WeekDay} day - День недели в который проводится занятие
     * @param  {Lesson} lesson - Объект, соответствующий времени проведения 
     *     занятия.
     */
    constructor(day, lesson){
        this.partsCount = 1;
        this.parts = Utils.range(0, this.partsCount - 1, 1).map(i => new ItemPart());
        this.day = day;
        this.lesson = lesson;
    }

    /**
     * Устанавливает количество вариантов события и добавляет или удаляет 
     * элементы массива <code>parts</code>
     * 
     * @param {number} partsCount - Количество вариантов события
     */
    setPartsCount(partsCount){
        while (this.parts.length > partsCount){
            this.parts.pop();
        }
        while (this.parts.length < partsCount){
            this.parts.push(new ItemPart());
        }
        this.partsCount = partsCount;
    }
}


/**
 * Класс расписания, содержащий описания всех занятий и времени их проведения
 *
 * @property {num} lessonsCount - Максимальное количество занятий, которое может 
 *                                проводится в один день
 * @property {Lesson[]} lessons - Список временных промежутков занятий
 * @property {Item[]} items - Список занятий, добавленных в расписание
 */
class Schedule{
    constructor(){
        this.lessonsCount = 6
        this.lessons = Utils.range(0, this.lessonsCount + 1, 1).map((i) => new Lesson(i, this))
        this.items = []
    }

    /**
     * Выполняет поиск занятия в расписании, проводимый в определенный день 
     * недели и в опредленный временной интервал.
     * 
     * @param  {number} dayNo - Номер для недели в который проводится занятие
     * @param  {number} lessonNo - Номер временного промежутка в который 
     *     проводится занятия
     * @return {Item} Найденное занятие или <code>undefined</code>
     */
    getItem(dayNo, lessonNo){
        return this.items.find(item => item.day.number == dayNo && item.lesson.number == lessonNo);
    }

    /**
     * Добавляет занятие со стандартными свойствами, проводимое в определенное 
     * время в определенный день недели. 
     * 
     * @param  {WeekDay} day - День недели, в который проводится занятие
     * @param  {Lesson} lesson - Временной интервал, в который вроводится занятие
     * @return {Item} Созданный объект занятия
     */
    createItem(day, lesson){
        let item = new ScheduleItem(day, lesson)
        this.items.push(item)
        return item
    }

    /**
     * Удаляет занятие, проводимое в заданный момент времени из расписания.
     * 
     * @param  {WeekDay} day - День недели, в который проводится занятие
     * @param  {Lesson} lesson Временной интервал, в который вроводится занятие
     */
    remove(day, lesson){
        this.items = this.items.filter(item => item.day != day || item.lesson != lesson);
    }

    /**
     * Определяет наиболее раннее время в которое может начаться занятие.
     * 
     * @param  {number} lessonNumber - Номер временного интервала, во время 
     *     которого приходит занятие
     * @return {number} Время, выраженное в минутах начиная с полуночи
     */
    getEarlistTimeForLesson(lessonNumber){
        let earliest = 0;
        for(let i = lessonNumber - 1; i >= 0; i--){
            if (this.lessons[i].endTimeDefined){
                earliest = this.lessons[i].endTime;
                break;
            }else if (this.lessons[i].startTimeDefined){
                earliest = this.lessons[i].startTime;
                break;
            }
        }
        return earliest;
    }

    /**
     * Определяет наиболее позднее время в которое может начаться занятие.
     * 
     * @param  {number} lessonNumber - Номер временного интервала, во время 
     *     которого приходит занятие
     * @return {number} Время, выраженное в минутах начиная с полуночи
     */
    getLatestTimeForLesson(lessonNumber){
        let latest = 23 * 60 + 59;
        for (let i = lessonNumber + 1; i < this.lessons.length; i++){
            if (this.lessons[i].startTimeDefined){
                latest = this.lessons[i].startTime;
                break;
            }else if (this.lessons[i].endTimeDefined){
                latest = this.lessons[i].endTime;
                break;
            }
        }
        return latest;
    }

}

module.exports = Schedule