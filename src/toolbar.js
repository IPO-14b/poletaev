let React = require("react");

class ToolBar extends React.Component{
	constructor(props){
		super(props);
		this.state = {
            startDate: "2017-03-12",
            endDate: "2017-05-16"
        };
	}

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
                        onChange={e => this.setState({startDate: e.target.value})}/>
                </label>

                <input type="button" className="button" value="Сгенерировать ical" />
            </div>
        </div>
    }
}

module.exports = ToolBar;