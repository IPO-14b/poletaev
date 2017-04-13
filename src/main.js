let React = require("react")
let ReactDOM = require("react-dom")

let Popover = require("./popover.js")
let Calendar = require("./calendar.js")

document.addEventListener("DOMContentLoaded", e => {
    ReactDOM.render(
        <Calendar.Calendar />,
        document.getElementById("app-root")
    )
})
