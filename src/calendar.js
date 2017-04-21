let React = require("react")
let ReactDOM = require("react-dom")

let Select = require("./select.js")
let Utils = require("./utils.js")
let Schedule = require("./schedule.js")
let weekDays = require("./weekdays.js")
let Popover = require("./popover.js")
let Checkbox = require("./checkbox.js");
let AutoSizeInput = require("./auto-size-input.js");
let ToolBar = require("./toolbar.js")

let SCHEDULE_TYPES = [
    {value: 1, label: "Не меняется"},
    {value: 2, label: "Периодиченость: 2 недели"},
    {value: 4, label: "Периодиченость: 4 недели"}
];

class CalendarItemEditor extends React.Component{
    render(){
        let i = 0;
        return <Popover width="200" height="300" trianglePosition="horizontal"
            x={(this.props.bbox.left + this.props.bbox.right) / 2} 
            y={(this.props.bbox.top + this.props.bbox.bottom) / 2} 
            rectWidth={this.props.bbox.width} rechHeight={this.props.bbox.hright}>
            
            <Select values={SCHEDULE_TYPES} value={this.props.lesson.partsCount} 
                onChange={(value) => {this.props.lesson.setPartsCount(value); this._changed()}} />
            <div>
            {this.props.lesson.parts.map((part) => 
                <div key={i++} className="part">
                    <div className="general">
                        <Checkbox checked={part.active} onChange={(e)=>{part.active = e.target.checked; this._changed();}} />
                        <input type="text" disabled={!part.active} value={part.name} onChange={(e)=>{part.name = e.target.value; this._changed();}} />
                        <span>@</span>
                        <AutoSizeInput disabled={!part.active} value={part.location} onChange={(e)=>{part.location = e.target.value; this._changed();}}/>
                    </div>
                </div>
            )}
            </div>

            <div className="button warning" onClick={() => {
                this.props.onDelete();
                Popover.hidePopover();
            }}>Удалить</div>
        </Popover>
    }

    _changed(){
        this.props.onChange();
        this.forceUpdate();
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
                        { part.active ? 
                            <div>
                                <div className="name">{part.name}</div>
                                <div className="location">{part.location}</div>
                            </div> :
                            <div className="none"></div>
                        }
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

        Popover.showPopover(<CalendarItemEditor bbox={bbox} lesson={this.props.item} onChange={() => this.forceUpdate()}
            onDelete={() => this.props.onDelete(this.props.item)}/>)
    }
}


class CalendarSlot extends React.Component{
    constructor(){
        super()
        this.state = {
            item: null
        }

        this._handleAddItem = this._addItem.bind(this)
    }

    componentDidMount(){
        let item = this.props.schedule.getItem(this.props.day, this.props.lesson);
        this.setState({
            item: typeof item != "undefined" ? item : null
        })
    }

    render(){
        if (this.state.item == null){
            return <div className="day-item" onClick={this._handleAddItem}>
                <svg className="plus-sign" width="20" height="20">
                    <path d="M 0 9 V11 H9 V20 H11 V11 H20 V9 H11 V0 H9 V9 Z" />
                </svg>
            </div>
        } else {
            return <div className="day-item">
                <CalendarItem item={this.state.item} onDelete={() => {
                    this.setState({item: null});
                    this.props.schedule.remove(this.props.day, this.props.lesson);
                }}/>
            </div>
        }
    }

    _addItem(){
        if (this.state.item != null){
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
        return <div>
            <ToolBar />
            <div className="calendar">
                <CalendarIndexes schedule={this.state.schedule}/>
                {weekDays.map((day) => <CalendarDay schedule={this.state.schedule} key={day.number} day={day} />)}
            </div>
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