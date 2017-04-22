/** @module popover */

let React = require("react")
let ReactDOM = require("react-dom")

const VERTICLE_PADDING = 20


/**
 * React-компонент используеющийся для создания закрепленного всплывающего окна.
 * 
 * Компонент отображается на экране польвателя поверх всех остальных элементов 
 * интерфейса и в один момент времени может быть показан только один экземпляр.
 *
 * @property {number} state.leftOffset - Смещение компонента относительно 
 *     левого края окна браузера
 * @property {number} state.topOffset - Смещение компонена относительно 
 *     верхнего края окна браузера
 * @property {number} state.triangleOffset - Смещение треугольника относительно 
 *     левого верхнего угла компонента
 * @property {string} props.trianglePosition - Положение треугольника. Может 
 *     принимать одно из следующих значений: undefined, left, right, top, 
 *     bottom, horizontal, vertical. В случае использования значения 
 *     horizontal или vertical положение будет определено автоматически
 * @property {number} props.x - Абсцисса центра прямоугольника, на который 
 *     будет направлен триугольник, заданная в системе координат страницы
 * @property {number} props.y - Одрината центра прямоугольника, на который 
 *     будет направлен триугольник, заданная в системе координат страницы
 * @property {number} props.width - Ширина, занимаемая компонентом, выраженная
 *     в пикселях
 * @property {number} rectWidth - Ширина прямоугольника с центрам в точке 
 *     (x, y), на который будет направлен триугольник
 * @property {number} rectHeight - Высота прямоугольника с центрам в точке 
 *     (x, y), на который будет направлен триугольник
 */
class Popover extends React.Component{

    /**
     * Конструктор компонента. Устанавливает начальное состояние
     * @constructor
     */
    constructor(){
        super()
        this.state = {
            leftOffset: 0,
            topOffset: 0,
            triangleOffset: 0,
            height: 0
        }
        this._handleClickOutside = this._onClickedOutside.bind(this)
    }

    /**
     * Событие жизненного цикла React-компонента. Вызывается после первого 
     * добавления компонента в DOM-дерево страницы.
     */
    componentDidMount(){
        let position = typeof this.props.trianglePosition != "undefined" ? this.props.trianglePosition : "left"
        if (position == "horizontal"){
            position = this.props.x < window.innerWidth / 2 ? "left": "right"
        }
        let rectWidth = typeof this.props.rectWidth != "undefined" ? this.props.rectWidth : 0
        let rectHeight = typeof this.props.rectHeight != "undefined" ? this.props.rectHeight : 0
        this.state.height = this.refs.container.getBoundingClientRect().height;
        let x = this.props.x - this.props.width / 2
        let y = this.props.y - this.state.height / 2
        
        let triangleOffset;
        if (position == "left" || position == "right"){
            if (y < VERTICLE_PADDING){
                y = VERTICLE_PADDING;
            }else if (y + this.state.height > window.innerHeight - VERTICLE_PADDING){
                y = window.innerHeight - VERTICLE_PADDING - this.state.height;
            }
            triangleOffset = this.props.y - y
        } else {
            triangleOffset = this.props.width / 2
        }

        switch (position){
            case "left":
                x = x + this.props.width / 2 + 15 + rectWidth / 2
                break;
            case "right":
                x = x - this.props.width / 2 - 15 - rectWidth / 2
                break;

            case "up":
                y -= this.state.height / 2 + 12 + rectHeight / 2
                break;
            case "bottom":
                y -= this.state.height / 2 + 12 + rectHeight / 2
                break;
        }
        this.setState({
            leftOffset: x |0,
            topOffset: y |0,
            triangleOffset: triangleOffset |0,
            trianglePosition: position
        })
    }

    /**
     * Событие жизненного цикла React-компонента. Вызывается после каждого обновления.
     */
    componentDidUpdate(){
        let height = this.refs.container.getBoundingClientRect().height;
        if (height != this.state.height){
            this.setState({height: height});
        }
    }

    /**
     * Используется для определения внешнего вида компонента.
     * 
     * На заднем фоне - прямоугольник с закругленными углами и стрелкой c одной
     * стороны. На переднем - тег <code>div</code>, содержащий вложенные в компонент
     * компоненты, HTML или SVG-теги.
     * 
     * @return {object}
     */
    render(){ 
        let topOffset = Math.min(window.innerHeight - this.state.height - VERTICLE_PADDING, this.state.topOffset);
        return <div className="popover-container" onClick={this._handleClickOutside}>
            <svg width="100%" height="100%" ref={svg => this.svgElement = svg}>
                <defs>
                    <filter id="dropshadow" y="-50%" height="200%" x="-50%" width="200%">
                        <feColorMatrix in="SourceAlpha" type="matrix" values="
                            0 0 0 0.2 0
                            0 0 0 0.2 0
                            0 0 0 0.2 0
                            0 0 0 1.0 0" result="shadow1color"/>
                        <feGaussianBlur in="shadow1color" result="shadow1" stdDeviation="3" />
                  
                        <feColorMatrix in="SourceAlpha" type="matrix" values="
                            0 0 0 0.2 0
                            0 0 0 0.2 0
                            0 0 0 0.2 0
                            0 0 0 1.0 0" result="shadow2color"/>
                        <feOffset in="shadow2color" dx="0" dy="8" result="shadow2offset" />
                        <feGaussianBlur in="shadow2offset" result="shadow2" stdDeviation="12" />
                  
                        <feBlend in="SourceGraphic" in2="shadow1" mode="normal" result="shadow1blend" />
                        <feBlend in="shadow1blend" in2="shadow2" mode="normal" />
                    </filter>
                </defs>
                <path filter="url(#dropshadow)" className="popover-background" 
                    transform={`translate(${this.state.leftOffset}, ${topOffset})`} 
                    d={this._generatePath(topOffset)} />
            </svg>
            <div className="content" ref="container" style={{
                left: this.state.leftOffset + "px", 
                top: topOffset + "px",
                width: this.props.width + "px"
            }}>
                {this.props.children}
            </div>
        </div>
    }

    /**
     * @private
     * @param  {number} topOffset - Смещение компонента от верхнего края экрана
     * @return {string} Строка, определяюая форму компонента, спользуемая как 
     *                  содержимое аттрибута <code>d</code> тега <code>path</code>
     */
    _generatePath(topOffset){
        let path = "M 0 5 "

        let triangleOffset;
        if (this.state.trianglePosition == "left" || this.state.trianglePosition == "right"){
            triangleOffset = Math.min(this.props.y - topOffset, window.innerHeight - VERTICLE_PADDING - topOffset - 20);
        }else{
            triangleOffset = this.state.triangleOffset;
        }

        if (this.state.trianglePosition == "left"){
            path += `V ${triangleOffset - 11} q0 2 -2 4 l-7 5 q-2 2 0 4 l7 5 q 2 2 2 4`
        }
        path += `V ${this.state.height - 5} A 5 5 0 0 0 5 ${this.state.height}`
        if (this.state.trianglePosition == "down"){
            path += `H ${triangleOffset - 11} q2 0 4 2 l5 7 q2 2 4 0 l5 -7 q2 -2 4 -2`
        }
        path += `H ${this.props.width - 5} A 5 5 0 0 0 ${this.props.width} ${this.state.height - 5}`
        if (this.state.trianglePosition == "right"){
            path += `V ${triangleOffset + 11} q0 -2 2 -4 l7 -5 q2 -2 0 -4 l-7 -5 q-2 -2 -2 -4`
        }
        path += `V 5 A 5 5 0 0 0 ${this.props.width - 5} 0`
        if (this.state.trianglePosition == "up"){
            path += `H ${triangleOffset + 11} q-2 0 -4 -2 l-5 -7 q-2 -2 -4 0 l-5 7 q-2 2 -4 2`
        }
        path += "H 5 A 5 5 0 0 0 0 5 Z"
        return path
    }

    /**
     * Событие нажатия на область вне компонента.
     * 
     * @private 
     * @param  {MouseEvent} - Объект события
     */
    _onClickedOutside(e){
        if(e.target == this.svgElement){
            Popover.hidePopover();
        }
    }
}

/**
 * Отображает компонент пользователю.
 * 
 * @static
 * @param  {Popover} element - Компонент, который необходимо показать пользователю
 */
Popover.showPopover = (element) => {
    ReactDOM.render(
        element,
        document.getElementById("popover-root")
    )
}

/**
 * Удаляет текущий отображаемый компонент из DOM-дерева.
 */
Popover.hidePopover = () => {
    setTimeout(() => ReactDOM.unmountComponentAtNode(document.getElementById("popover-root")));
}

module.exports = Popover