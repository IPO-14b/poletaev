/** @module toolbar */

let React = require("react");
let generate = require("./generator.js").generate;
let canGenerate = require("./generator.js").canGenerate;

/**
 * Панель инструментов, содержащая логотип, настройки генерации .ics-файла.
 *
 * @property {string} state.startDate - Дата начала семестра в формате 
 *     <code>ГГГГ-ММ-ДД</code>
 * @property {string} state.endDate - Дата конца семестра в формате 
 *     <code>ГГГГ-ММ-ДД</code>
 * @property {Schedule} props.schedule - Объект расписания
 */
class ToolBar extends React.Component{
	constructor(props){
		super(props);
		this.state = {
            startDate: "2017-03-12",
            endDate: "2017-05-16"
        };

        this._handleGenerateButtonPress = this._onGenerateButtonPressed.bind(this);
	}

    /**
     * @return {object} DOM-элементы, определяющие компонент.
     */
    render(){
        return <div className="toolbar">
            <div className="logo"></div>
            <div className="generation">
            	<label>
            		<span className="label">Начало семестра:</span>
                    <input type="date" value={this.state.startDate} max={this.state.endDate} 
                        onChange={e => this.setState({startDate: e.target.value})}/>
            	</label>

                <label>
                    <span className="label">Конец семестра:</span>
                    <input type="date" value={this.state.endDate} min={this.state.startDate} 
                        onChange={e => this.setState({endDate: e.target.value})}/>
                </label>

                <input type="button" className="button" value="Сгенерировать ical" 
                    onClick={this._handleGenerateButtonPress} />
            </div>
        </div>
    }

    /**
     * Обработчик события нажатия на кнопку генерации. Производится проверка
     * возможности начала генерации и генерируется файл .ics
     *
     * @private
     */
    _onGenerateButtonPressed(){
        if (!canGenerate(this.props.schedule)){
            alert("Необходимо ввести даты конца и начала занятий для всех событий");
        }else if (this.props.schedule.items.length == 0){
            alert("Необходимо добавить хотя бы одно событие");
        }else{
            generate(this.props.schedule, this.state.startDate, this.state.endState);
        }
    }
}

module.exports = ToolBar;