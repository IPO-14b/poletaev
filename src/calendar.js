let React = require("react")
let ReactDOM = require("react-dom")

let Select = require("./select.js")
let Utils = require("./utils.js")
let Schedule = require("./schedule.js")
let weekDays = require("./weekdays.js")
let Popover = require("./popover.js")
let Checkbox = require("./checkbox.js");
let AutoSizeInput = require("./auto-size-input.js");
let CalendarIndexes = require("./timetable.js").CalendarIndexes;
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
            <ToolBar schedule={this.state.schedule}/>
            <div className="calendar">
                <CalendarIndexes schedule={this.state.schedule}/>
                {weekDays.map((day) => <CalendarDay schedule={this.state.schedule} key={day.number} day={day} />)}
            </div>
        </div>
    }
}



module.exports = {
    Calendar: Calendar,
    CalendarIndexes: CalendarIndexes,
    CalendarDay: CalendarDay
}