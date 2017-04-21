let React = require("react");

let MIN_WIDTH = 15;

class AutoSizeInput extends React.PureComponent{

	constructor(props){
		super();
		this.state = {
			width: this._getWidth(props.value)
		}
	}

	render(){
		return <input type="text" className="auto-size" value={this.props.value} onChange={(e) => {
			this.props.onChange(e); 
			this.setState({width: this._getWidth(e.target.value)})
		}} style={{width: this.state.width + "px"}} disabled={this.props.disabled}/>
	}

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