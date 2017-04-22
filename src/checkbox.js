/** @module checkbox */

let React = require("react");

/**
 * React-component, используемый для создания независимых переключателей
 * с нестандартным внешним видом.
 *
 * @property {boolean} props.checked - Определяет, активен ли "флажок"
 * @property {function} props.onChanhe - Событие, вызываемое при изменении 
 *   состояния компонента
 */
class Checkbox extends React.PureComponent{

	/**
	 * Используется для определения внешнего вида компонента
	 * 
	 * @override
	 * @return {object} 
	 */
	render(){
		return <div className="checkbox">
			<input type="checkbox" checked={this.props.checked} onChange={this.props.onChange} />
			<div className="graphics">
				{this.props.checked ? <svg width="12" height="12">
					<path d="M3 6 L5 9 L9 3" fill="transparent" stroke="white" strokeWidth="1.3" />
				</svg> : null }
			</div>
		</div>
	}
}

module.exports = Checkbox;