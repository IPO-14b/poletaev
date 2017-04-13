let React = require("react")
let ReactDOM = require("react-dom")
let SimpleSelect = require("react-selectize").SimpleSelect

let Utils = require("./utils.js")
let Schedule = require("./schedule.js")
let weekDays = require("./weekdays.js")
let Popover = require("./popover.js")

class CalendarItemEditor extends React.Component{
    render(){
        var options = ["1", "2", "3"]
        var opts = options.map((e) => {return {label:e, value:e}})
        return <Popover width="200" height="400" trianglePosition="horizontal"
            x={(this.props.bbox.left + this.props.bbox.right) / 2} 
            y={(this.props.bbox.top + this.props.bbox.bottom) / 2} 
            rectWidth={this.props.bbox.width} rechHeight={this.props.bbox.hright}>
            <SimpleSelect options={opts} />
        </Popover>
    }
}

class CalendarItem extends React.Component{
    constructor(){
        super()
        this._handleClick = this._onClick.bind(this)
    }

    render(){
        return <div className="item-container" onClick={this._handleClick}>
                <div className="item">
                {this.props.item.parts.map((part, i) =>
                    <div key={i} className={this._getPartClassName()}>
                        <div className="name">{part.name}</div>
                    </div>
                )}
            </div>
        </div>
    }

    _getPartClassName(){
        let className = "part"
        let partsCount = this.props.item.partsCount
        if (partsCount == 1){
            className = className + " single-part"
        }else if (partsCount == 2){ 
            className = className + " two-parts"
        }else{
            className = className + " many-parts"
        }
        return className
    }

    _onClick(){
        let domElement = ReactDOM.findDOMNode(this)
        let bbox = domElement.getBoundingClientRect()

        Popover.showPopover(<CalendarItemEditor bbox={bbox} />)
    }
}


class CalendarSlot extends React.Component{
    constructor(){
        super()
        this.state = {
            item: undefined
        }

        this._handleAddItem = this._addItem.bind(this)
    }

    componentDidMount(){
        this.setState({
            item: this.props.schedule.getItem(this.props.day, this.props.lesson)
        })
    }

    render(){
        if (typeof this.state.item == "undefined"){
            return <div className="day-item" onClick={this._handleAddItem}>
                <svg className="plus-sign" width="20" height="20">
                    <path d="M 0 9 V11 H9 V20 H11 V11 H20 V9 H11 V0 H9 V9 Z" />
                </svg>
            </div>
        } else {
            return <div className="day-item">
                <CalendarItem item={this.state.item} />
            </div>
        }
    }

    _addItem(){
        if (typeof this.state.item != "undefined"){
            return;
        }
        this.setState({
            item: this.props.schedule.createItem(this.props.day, this.props.lesson)
        })
    }

}


class CalendarDay extends React.Component{
    render(){
        return <div className={this._makeClassName()}>
            <div className="day-header">{this.props.day.name}</div>
            {Utils.range(0, 6, 1).map(i => <CalendarSlot schedule={this.props.schedule} 
                day={this.props.day} lesson={this.props.schedule.lessons[i]} key={i}/>)}
        </div>
    }

    _makeClassName(){
        var className = "day-column"
        if (this.props.day.isHoliday){
            className += " holiday"
        }
        return className
    }
}


class Calendar extends React.Component{

    constructor(){
        super()
        this.state = {
            schedule: new Schedule()
        }
    }

    render(){
        return <div className="calendar">
            <CalendarIndexes schedule={this.state.schedule}/>
            {weekDays.map((day) => <CalendarDay schedule={this.state.schedule} key={day.number} day={day} />)}
        </div>
    }
}


class CalendarLessonTime extends React.Component{
    constructor(){
        super()
        this.state = {
            startTime: "",
            endTime: "",
            startTimeCorrect: true,
            endTimeCorrect: true
        }
        this._handleStartTimeChange = this._startTimeChanged.bind(this)
        this._handleEndTimeChange = this._endTimeChanged.bind(this)
        this._handleStartTimeBlur = this._startTimeBlur.bind(this)
        this._handleEndTimeBlur = this._endTimeBlur.bind(this)
    }

    componentDidMount(){
        this.setState({
                    startTime: this._formatTime(this.props.lesson.startTime),
                    endTime: this._formatTime(this.props.lesson.endTime)
                });
    }

    render(){
        return <div className="calendar-index">
            <div className="index-number">{this.props.lesson.number}</div>
            <input type="text" 
                className={this._getInputClassName("compact seamless time-start", this.state.startTimeCorrect)} 
                value={this.state.startTime} onChange={this._handleStartTimeChange}
                onBlur={this._handleStartTimeBlur} />
            <input type="text" 
                className={this._getInputClassName("compact seamless time-end", this.state.endTimeCorrect)} 
                value={this.state.endTime} onChange={this._handleEndTimeChange}
                onBlur={this._handleEndTimeBlur} />
        </div>
    }

    _parseTime(time){
        let regexpr = /^(\d+):?(\d*)$/
        let matches = time.match(regexpr)
        if (matches == null){
            return false
        }
        let hours = parseInt(matches[1])
        let minutes = matches[2] == "" ? 0 : parseInt(matches[2])
        if (hours > 23 || minutes > 59){
            return false
        }
        return hours * 60 + minutes
    }

    _getInputClassName(classNames, isCorrect){
        if (!isCorrect){
            classNames = classNames + " incorrect";
        }
        return classNames
    }

    _formatTime(time){
        var minutes = (time % 60).toString()
        if (minutes.length == 1){
            minutes = "0" + minutes
        }
        return (time / 60 | 0) + ":" + minutes
    }

    _timeChanged(time, correctPropertyName){
        let newTime = this._parseTime(time)
        let timeCorrect = newTime !== false;
        if (timeCorrect != this.state[correctPropertyName]){
            let stateObject = {}
            stateObject[correctPropertyName] = timeCorrect
            this.setState(stateObject)
        }
    }

    _startTimeChanged(event){
        this.setState({startTime: event.target.value})
        this._timeChanged(event.target.value, "startTimeCorrect")
    }

    _endTimeChanged(event){
        this.setState({endTime: event.target.value})
        this._timeChanged(event.target.value, "endTimeCorrect")
    }

    _startTimeBlur(event){
        let time = this._parseTime(event.target.value)
        if (time !== false){
            this.props.lesson.startTime = time
        }
        this.setState({startTime: this._formatTime(this.props.lesson.startTime), startTimeCorrect: true})
    }

    _endTimeBlur(event){
        let time = this._parseTime(event.target.value)
        if (time !== false){
            this.props.lesson.endTime = time
        }
        this.setState({endTime: this._formatTime(this.props.lesson.endTime), endTimeCorrect: true})
    }
}


class CalendarIndexes extends React.Component{
    render(){
        return <div className="calendar-indexes">
            {Utils.range(1, 7, 1).map(i => <CalendarLessonTime key={i} lesson={this.props.schedule.lessons[i]} />)}
        </div>
   }
}


module.exports = {
    Calendar: Calendar,
    CalendarIndexes: CalendarIndexes,
    CalendarDay: CalendarDay
}