/**
 * Модуль содержит функции для генерации файлов .ics
 * @module generator
 */

let ical = require("ical-generator");
let moment = require("moment");

/**
 * Проверяет, известно ли время начала и конца каждого занятия, для которых
 * определены события в календаре.
 *
 * @param  {Schedule} - Объект расписания
 * @return {boolean} Возможно ли создание файла
 */
function canGenerate(schedule){
    for (let i = 0; i < schedule.items.length; i++){
        if (!schedule.items[i].lesson.startTimeDefined || !schedule.items[i].lesson.endTimeDefined){
            return false;
        }
    }
    return true;
}


/**
 * Генерирует файл .ics по заданному расписанию и предоставляет его на скачивание
 * пользователю.
 *
 * @param  {Schedule} schedule - Объект расписания
 * @param  {string} startDate - Дата начала семестра в формате <code>ГГГГ-ММ-ДД</code>
 * @param  {string} endDate - Дата конца семестра в формате <code>ГГГГ-ММ-ДД</code>
 */
function generate(schedule, startDate, endDate){
    // TODO: Change domain
	let calendar = ical({domain: "localhost", name: "Schedule"});
    let day = moment(startDate).startOf("day");
    let weekIndex = 0;
    for (let dayIndex = 0; dayIndex < 7; dayIndex++){
        let weekDay = day.isoWeekday() - 1;
        for (let lessonIndex = 0; lessonIndex < schedule.lessonsCount; lessonIndex++){
            let item = schedule.getItem(weekDay, lessonIndex);
            if (typeof item != "undefined"){
                let lessonStart = day.clone().add(schedule.lessons[lessonIndex].startTime, "minutes");
                let lessonEnd = day.clone().add(schedule.lessons[lessonIndex].endTime, "minutes");
                for (let partIndex = 0; partIndex < item.partsCount; partIndex++){
                    let index = (partIndex + weekIndex) % item.partsCount;
                    if (item.parts[index].active){
                        calendar.createEvent({
                            start: lessonStart.clone().add(partIndex, "weeks").toDate(),
                            end: lessonEnd.clone().add(partIndex, "weeks").toDate(),
                            summary: item.parts[index].name,
                            repeating: {
                                freq: "WEEKLY",
                                interval: item.partsCount,
                                until: moment(endDate).toDate()
                            },
                            location: item.parts[partIndex].locaiton
                        });
                    }
                }
            }
        }
        day.add(1, "days");
        if (day.isoWeekday() == 1){
            weekIndex = 1;
        }
    }

    let string = calendar.toString();
    let element = document.createElement("a");
    element.setAttribute("download", "schedule.ics")
    element.setAttribute("href", "data:text/calendar;charset=utf-8," + encodeURIComponent(string));
    element.style.display = "none";

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

module.exports = {
    generate: generate,
    canGenerate: canGenerate
}