/** @module timetable */

let React = require("react");
let Utils = require("./utils.js");

/**
 * Компонент, используемый для отбражения и редактирования времени начала и 
 * конца занятия.
 *
 * @property {string} state.startTime - Значение, отображаемое в поле 
 *     редактировании времени начала занятия
 * @property {boolean} state.startTimeCorrect - Определяет корректность 
 *     введенных данных в поле редактирования даты начала занятия
 * @property {string} state.endTime - Значение, отображаемое в поле 
 *     редактировании времени конца занятия
 * @property {boolean} state.startTimeCorrect - Определяет корректность 
 *     введенных данных в поле редактирования даты конца занятия
 * @property {Lesson} props.lesson - Редактируемый временной интервал занятия
 */
class CalendarLessonTime extends React.Component{
    /**
     * @constructor
     * @param {object} props - Аттрибуты с которыми компонент был добавлен в DOM-дерево
     */
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

    /**
     * @return {object} DOM-элементы, определяющие компонент.
     */
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

    /**
     * Распознает дату введенную пользователем и возвращает время, 
     * преобразованное в количество минут прошедших между полуночью и введенным
     * пользователем временем
     *
     * @private
     * @param  {string} time - Введенная пользователем строка
     * @return {number | boolean} Количество минут после полуночи или false, 
     *     если введенное значение не удовлетворяет шаблону /^(\d+):?(\d*)$/
     */
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

    /**
     * Формирует список классов - описание стилей элемента пользовательского 
     * ввода в зависимости от корректности введенных пользователей данных.
     * 
     * @private
     * @param  {string} classNames - Список классов, использующихся для полей 
     *     ввода в любом состоянии.
     * @param  {boolean} isCorrect - Флаг правильности введенных данных
     * @return {string} Спсиок классов CSS
     */
    _getInputClassName(classNames, isCorrect){
        if (!isCorrect){
            classNames = classNames + " incorrect";
        }
        return classNames
    }

    /**
     * Форматирует время, выраженное в минутах, прошедших после полуночи в 
     * строку в формате <code>М.СС</code>, которую можно отображать 
     * пользователю 
     * 
     * @private
     * @param  {number} time - Количество минут, прошедших после полуночи
     * @return {string} Форматированная дата
     */
    _formatTime(time){
        var minutes = (time % 60).toString()
        if (minutes.length == 1){
            minutes = "0" + minutes
        }
        return (time / 60 | 0) + ":" + minutes
    }

    /**
     * Обработчик события изменения времени пользователем. Поля объекта 
     * состояния, которые необходимо изменить определяютя с помощью аттрибутов
     * data-valueProperty и data-correctProperty.
     * 
     * @private
     * @param {Event} event Событие React
     */
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

    /**
     * Обработчик события снятия фокуса с элемента ввода. Поля объекта 
     * состояния, которые необходимо изменить определяютя с помощью аттрибутов
     * data-valueProperty и data-correctProperty.
     *
     * @private
     * @param {Event} event Событие React
     */
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

/**
 * Компонент, используемый для оображения списка, содержащего номер временного
 * интервала, время начала и конца занятия.
 *
 * @property {Lesson[]} props.lessons - Список временных интервалов
 */
class CalendarIndexes extends React.Component{
    /**
     * @return {object} DOM-элементы, определяющие компонент.
     */
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