let Utils = require("./utils.js")

class Lesson{
    constructor(lessonNumber){
        this.number = lessonNumber
        this.startTime = 8 * 60
        this.endTime = 9 * 60 + 35
    }
}

class ItemPart{
    constructor(){
        this.active = true
        this.name = "<без названия>"
        this.location = ""
        this.teachers = []
    }
}

class ScheduleItem{
    constructor(day, lesson){
        this.partsCount = 1
        this.parts = Utils.range(0, this.partsCount - 1, 1).map(i => new ItemPart())
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
        this.lessons = Utils.range(0, this.lessonsCount + 1, 1).map((i) => new Lesson(i))
        this.items = []
    }

    getItem(day, lesson){
        this.items.find(item => item.day == day && item.lesson == lesson)
    }

    createItem(day, lesson){
        let item = new ScheduleItem(day, lesson)
        this.items.push(item)
        return item
    }

    remove(day, lesson){
        this.items = this.items.filter(item => item.day != day || item.lesson != lesson);
    }

}

module.exports = Schedule