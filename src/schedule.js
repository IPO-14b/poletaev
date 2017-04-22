let Utils = require("./utils.js")

class Lesson{
    constructor(lessonNumber, schedule){
        this.number = lessonNumber
        this.startTimeDefined = false;
        this.endTimeDefined = false;
        this.startTime = 0;
        this.endTime = 0;

        this._schedule = schedule;
    }

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

class ItemPart{
    constructor(){
        this.active = true;
        this.name = "<без названия>";
        this.location = "";
        this.teachers = [];
    }
}

class ScheduleItem{
    constructor(day, lesson){
        this.partsCount = 1;
        this.parts = Utils.range(0, this.partsCount - 1, 1).map(i => new ItemPart());
        this.day = day;
        this.lesson = lesson;
    }

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

class Schedule{
    constructor(){
        this.lessonsCount = 6
        this.lessons = Utils.range(0, this.lessonsCount + 1, 1).map((i) => new Lesson(i, this))
        this.items = []
    }

    getItem(dayNo, lessonNo){
        return this.items.find(item => item.day.number == dayNo && item.lesson.number == lessonNo);
    }

    createItem(day, lesson){
        let item = new ScheduleItem(day, lesson)
        this.items.push(item)
        return item
    }

    remove(day, lesson){
        this.items = this.items.filter(item => item.day != day || item.lesson != lesson);
    }

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