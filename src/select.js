let React = require("react");

class Select extends React.Component{
	constructor(){
		super();
		this.state = {
			focused: false
		};
	}

	render(){
		let selected = this.props.values[0];
		for (let i = 0; i < this.props.values.length; i++){
			if (this.props.values[i].value == this.props.value){
				selected = this.props.values[i];
			}
		}

		return <div className={"select" + (this.state.focused ? " focused" : "")}>
			<div className="arrow-area">
				<svg width="8" height="5"><path d="M0,0H8L4,5Z" fill="#EBEBEB" /></svg>
			</div>
			<div className="value">{selected.label}</div>
			<select className="control" onFocus={() => this.setState({focused: true})} onBlur={() => this.setState({focused: false})}
				value={selected.value} onChange={(e) => this.props.onChange(e.target.value)}>
				{this.props.values.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
			</select>
		</div>;
	}
} 

module.exports = Select;