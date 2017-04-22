/** @module  auto-size-input */

let React = require("react");


/**
 * Минимальная ширина текстового поля
 * @private
 * @const
 * @type {Number}
 */
let MIN_WIDTH = 15;


/**
 * React-компонент <code>AutoSizeInput</code> -- текстовое поле переменной ширины. 
 * 
 * При вводе пользователем текста компонент автоматически изменяет свой размер, 
 * устанавливая его равным ширине введенного текста + отступы, заданные в
 * стиле для класса <code>.text-input</code>.
 *
 * @property {number} state.width - Ширина компонента
 * @property {string} props.value - Текущее значение компонента
 * @property {function} props.onChange - Событие, вызываемое при изменении текста поля ввода
 * @property {boolean} props.disabled - Является ли компонент заблокированным для изменения
 */
class AutoSizeInput extends React.PureComponent{

    /**
     * Конструктор компонента. Устанавливает начальное состояние.
     *
     * @constructor
     * @param {object} props - Аргументы, с которыми был создан компонент
     */
    constructor(props){
        super();
        this.state = {
            width: this._getWidth(props.value)
        }
    }

    /**
     * @override
     * @return {object} DOM-элементы, определяющие компонент.
     */
    render(){
        return <input type="text" className="auto-size" value={this.props.value} onChange={(e) => {
            this.props.onChange(e); 
            this.setState({width: this._getWidth(e.target.value)})
        }} style={{width: this.state.width + "px"}} disabled={this.props.disabled}/>
    }

    /**
     * Определяет минимальный размер элемента, чтобы в нем полностью помещался текст {@link text}
     * 
     * @private
     * @param  {string} text - Строка, размер которой необходимо определить
     * @return {number} Размер строки или {@link auto-size-input/MIN_WIDTH}, в зависимости 
     *                  от того, какое значение больше.
     */
    _getWidth(text){
        let temp = document.createElement("span");
        temp.innerHTML = text;
        temp.classList.add("text-input");
        document.body.appendChild(temp);
        let width = temp.getBoundingClientRect().width;
        document.body.removeChild(temp);
        return Math.max(width - 6, MIN_WIDTH);
    }

}

module.exports = AutoSizeInput;