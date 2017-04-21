module.exports = {
    range: range
}

function range(start, end, step){ 
    return Array(((end - start + 1) / step) |0).fill().map((_, i) => start + i * step)
}