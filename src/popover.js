let React = require("react")
let ReactDOM = require("react-dom")

const VERTICLE_PADDING = 20

class Popover extends React.Component{
    constructor(){
        super()
        this.state = {
            leftOffset: 0,
            topOffset: 0,
            triangleOffset: 0
        }
        this._handleClickOutside = this._onClickedOutside.bind(this)
    }

    componentDidMount(){
        let position = typeof this.props.trianglePosition != "undefined" ? this.props.trianglePosition : "left"
        if (position == "horizontal"){
            position = this.props.x < window.innerWidth / 2 ? "left": "right"
        }
        let rectWidth = typeof this.props.rectWidth != "undefined" ? this.props.rectWidth : 0
        let rectHeight = typeof this.props.rectHeight != "undefined" ? this.props.rectHeight : 0
        let x = this.props.x - this.props.width / 2
        let y = this.props.y - this.props.height / 2
        
        let triangleOffset;
        if (position == "left" || position == "right"){
            if (y < VERTICLE_PADDING){
                y = VERTICLE_PADDING;
            }else if (y + this.props.height > window.innerHeight - VERTICLE_PADDING){
                y = window.innerHeight - VERTICLE_PADDING - this.props.height;
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
                y -= this.props.height / 2 + 12 + rectHeight / 2
                break;
            case "bottom":
                y -= this.props.height / 2 + 12 + rectHeight / 2
                break;
        }
        this.setState({
            leftOffset: x |0,
            topOffset: y |0,
            triangleOffset: triangleOffset |0,
            trianglePosition: position
        })
    }

    render(){
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
                    transform={`translate(${this.state.leftOffset}, ${this.state.topOffset})`} 
                    d={this._generatePath()} />
            </svg>
            <div className="content" style={{
                left: this.state.leftOffset + "px", top: this.state.topOffset + "px",
                width: this.props.width + "px", height: this.props.height + "px"
            }}>
                {this.props.children}
            </div>
        </div>
    }

    _generatePath(){
        let path = "M 0 5 "
        if (this.state.trianglePosition == "left"){
            path += `V ${this.state.triangleOffset - 11} q0 2 -2 4 l-7 5 q-2 2 0 4 l7 5 q 2 2 2 4`
        }
        path += `V ${this.props.height - 5} A 5 5 0 0 0 5 ${this.props.height}`
        if (this.state.trianglePosition == "down"){
            path += `H ${this.state.triangleOffset - 11} q2 0 4 2 l5 7 q2 2 4 0 l5 -7 q2 -2 4 -2`
        }
        path += `H ${this.props.width - 5} A 5 5 0 0 0 ${this.props.width} ${this.props.height - 5}`
        if (this.state.trianglePosition == "right"){
            path += `V ${this.state.triangleOffset + 11} q0 -2 2 -4 l7 -5 q2 -2 0 -4 l-7 -5 q-2 -2 -2 -4`
        }
        path += `V 5 A 5 5 0 0 0 ${this.props.width - 5} 0`
        if (this.state.trianglePosition == "up"){
            path += `H ${this.state.triangleOffset + 11} q-2 0 -4 -2 l-5 -7 q-2 -2 -4 0 l-5 7 q-2 2 -4 2`
        }
        path += "H 5 A 5 5 0 0 0 0 5 Z"
        return path
    }

    _onClickedOutside(e){
        if(e.target == this.svgElement){
            ReactDOM.unmountComponentAtNode(document.getElementById("popover-root"))
        }
    }
}


Popover.showPopover = (element) => {
    ReactDOM.render(
        element,
        document.getElementById("popover-root")
    )
}

module.exports = Popover