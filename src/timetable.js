let React = require("react");
let Utils = require("./utils.js");


class CalendarLessonTime extends React.Component{
    constructor(props){
        super()
        this.state = {
            startTime: props.lesson.startTimeDefined ? this._formatTime(props.lesson.startTime) : "--:--",
            endTime: props.lesson.endTimeDefined ? this._formatTime(props.lesson.endTime) : "--:--",
            startTimeCorrect: true,
            endTimeCorrect: true
        }
        this._handleTimeChange = this._timeChanged.bind(this);
        this._handleTimeBlur = this._timeBlur.bind(this);
    }

    render(){
        return <div className="calendar-index">
            <div className="index-number">{this.props.lesson.number + 1}</div>
            <input type="text" 
                className={this._getInputClassName("compact seamless time-start", this.state.startTimeCorrect)} 
                value={this.state.startTime} onChange={this._handleTimeChange} onBlur={this._handleTimeBlur} 
                {... this.props.lesson.startTimeDefined ? {} : {onFocus: (e) => this.setState({startTime: ""})}}
                data-correctProperty="startTimeCorrect" data-valueProperty="startTime"/>
            <input type="text" 
                className={this._getInputClassName("compact seamless time-end", this.state.endTimeCorrect)} 
                value={this.state.endTime} onChange={this._handleTimeChange} onBlur={this._handleTimeBlur} 
                {... this.props.lesson.endTimeDefined ? {} : {onFocus: (e) => this.setState({endTime: ""})}}
                data-correctProperty="endTimeCorrect" data-valueProperty="endTime"/>
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

    _timeChanged(event){
        let stateDiff = {};
        stateDiff[event.target.dataset["valueproperty"]] = event.target.value;
        this.setState(stateDiff);
        
        let time = event.target.value;
        let newTime = this._parseTime(time);
        let timeCorrect = newTime !== false;
        if (timeCorrect != this.state[event.target.dataset["correctproperty"]]){
            let stateObject = {};
            stateObject[event.target.dataset["correctproperty"]] = timeCorrect;
            this.setState(stateObject);
        }
    }

    _timeBlur(event){
        let time = this._parseTime(event.target.value);
        let defined, correctValue;
        if (event.target.dataset["valueproperty"] == "startTime"){
            if (time !== false){
                this.props.lesson.setStartTime(time);
            }
            defined = this.props.lesson.startTimeDefined;
            correctValue = this.props.lesson.startTime;
        }else{
            if (time !== false){
                this.props.lesson.setEndTime(time);
            }
            defined = this.props.lesson.endTimeDefined;
            correctValue = this.props.lesson.endTime;
        }
        let stateDiff = {};
        stateDiff[event.target.dataset["valueproperty"]] = defined ? this._formatTime(correctValue) : "--:--";
        stateDiff[event.target.dataset["correctproperty"]] = true;
        this.setState(stateDiff);
    }
}


class CalendarIndexes extends React.Component{
    render(){
        return <div className="calendar-indexes">
            {Utils.range(0, 6, 1).map(i => <CalendarLessonTime key={i} lesson={this.props.schedule.lessons[i]} />)}
        </div>
    }
}

module.exports = {
    CalendarIndexes: CalendarIndexes,
    CalendarLessonTime: CalendarLessonTime
}