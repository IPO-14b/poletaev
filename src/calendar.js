/** @module calendar */

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

/**
 * Возможные варианты количества альтернативных занятий.
 * @type {Array}
 * @property {number} value - Количество альтернативных вариантов занятия
 * @property {string} label - Текст, описывающий периодичность занятия
 */
let SCHEDULE_TYPES = [
    {value: 1, label: "Не меняется"},
    {value: 2, label: "Периодиченость: 2 недели"},
    {value: 4, label: "Периодиченость: 4 недели"}
];

/**
 * Редактор данных, хранящихся в объекте занятия. Редактор отображается в
 * всплывающем окне <code>Popover</code>.
 *
 * @property {TextRectangle} props.bbox - Прямугольник, описывающий компонент
 *     интерфейса, отображающий информацию о занятии, добавленном в расписании
 * @property {Item} props.lesson Редактируемое занятие
 * @property {function} props.onDelete Событие, вызываемое при удалении события
 *     из расписания по запросу пользователя
 * @property {function} props.onChaneg Событие, вызываемое при измененнии 
 *     любого свойства занятия
 * 
 */
class CalendarItemEditor extends React.Component{
    /**
     * @return {object} DOM-элементы, определяющие компонент.
     */
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

    /**
     * Обработчик события измнения любого из свойств занятия
     */
    _changed(){
        this.props.onChange();
        this.forceUpdate();
    }
}

/**
 * React-компонент, использующийся для отображения занятия, добавленного в расписание
 *
 * @property {Item} props.item - Занятие, добавленное в расписание
 */
class CalendarItem extends React.Component{
    constructor(){
        super()
        this._handleClick = this._onClick.bind(this)
    }

    /**
     * @return {object} DOM-элементы, определяющие компонент.
     */
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

    /**
     * Определяет стили DOM-элемента, который отображает информацию о части
     * периодического события.
     * 
     * @return {string} Спсиок классов CSS, которые будут применены к элементу,
     * содержащему информацию о части периодического занятия.
     */
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

    /**
     * Событие нажатия пользователем левой кнопки мыши на компоненте.
     *
     * Отображает редактор <code>CalendarItemEditor</code> для редактирования 
     * события календаря.
     */
    _onClick(){
        let domElement = ReactDOM.findDOMNode(this)
        let bbox = domElement.getBoundingClientRect()

        Popover.showPopover(<CalendarItemEditor bbox={bbox} lesson={this.props.item} onChange={() => this.forceUpdate()}
            onDelete={() => this.props.onDelete(this.props.item)}/>)
    }
}

/**
 * React-компонент использующийся для отображения ячейки календаря. 
 *
 * Может содержать или компонент собятия календаря <code>CalendarItem</code> или 
 * символ "+" - индикатор возможности добавления нового события. При нажатии 
 * пользователем левой кнопки мыши на ячейке в которую не было добалено событие
 * событие должно быть добавлено в ячейку и в расписание <code>Schedule</code>
 *
 * @property {Item | null} state.item - Событие, которое должно быть отображено в 
 *     ячейке или <code>null</code> если такое событие не определено
 * @property {WeekDay} props.day - День недели, соответствующий ячейке
 * @property {Lesson} props.lesson - Временной интервал, соответствующий ячейке
 */
class CalendarSlot extends React.Component{
    constructor(){
        super()
        this.state = {
            item: null
        }

        this._handleAddItem = this._addItem.bind(this)
    }

    /**
     * Событие жизненного цикла React-компонента, вызываемого добавления 
     * объекта в Dom-дерево.
     */
    componentDidMount(){
        let item = this.props.schedule.getItem(this.props.day, this.props.lesson);
        this.setState({
            item: typeof item != "undefined" ? item : null
        })
    }

    /**
     * @return {object} DOM-элементы, определяющие компонент.
     */
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

    /**
     * Событие нажатия на ячейку в которую не было обавлено событие.
     *
     * Создает собятие и добавляет его в расписание.
     */
    _addItem(){
        if (this.state.item != null){
            return;
        }
        this.setState({
            item: this.props.schedule.createItem(this.props.day, this.props.lesson)
        })
    }

}

/**
 * React-компонент, содержащий список всех событий в определенный день недели и
 * название дня недели.
 *
 * @property {WeekDay} props.day День недели
 * @property {Schedule} props.schedule - Объект расписания
 */
class CalendarDay extends React.Component{
    /**
     * @return {object} DOM-элементы, определяющие компонент.
     */
    render(){
        return <div className={this._makeClassName()}>
            <div className="day-header">{this.props.day.name}</div>
            {Utils.range(0, 6, 1).map(i => <CalendarSlot schedule={this.props.schedule} 
                day={this.props.day} lesson={this.props.schedule.lessons[i]} key={i}/>)}
        </div>
    }

    /**
     * Создает список классов, для списка событий дня недели  в зависимости от того,
     * является ли этот день недели выодным или нет.
     *
     * @private
     * @return {string} Список классов CSS
     */
    _makeClassName(){
        var className = "day-column"
        if (this.props.day.isHoliday){
            className += " holiday"
        }
        return className
    }
}

/**
 * Корневой элемент приложения. Состоит из панели инструментов <code>ToolBar</code>, расписания 
 * <code>CalendarIndexes</code> и семи контейнеров <code>CalendarDay</code>
 *
 * @property {Schedule} state.schedule - Объект расписания
 */
class Calendar extends React.Component{

    constructor(){
        super()
        this.state = {
            schedule: new Schedule()
        }
    }

    /**
     * @return {object} DOM-элементы, определяющие компонент.
     */
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