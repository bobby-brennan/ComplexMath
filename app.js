const WIDTH = 600;
const HEIGHT = 600;

let data = [[1, 1, 50, 50]];

const X_MIN = -1;
const X_MAX = 1;
const Y_MIN = X_MIN;
const Y_MAX = X_MAX;
const X_SIZE = X_MAX - X_MIN;
const Y_SIZE = Y_MAX - Y_MIN;

// Need to cast [X_MIN, X_MAX] to [0, WIDTH]
// First move to [0, X_SIZE], then scale to [0, WIDTH]

const getXCoord = x => {
  let xPixel = x - X_MIN;
  return xPixel * WIDTH / X_SIZE;
}

const getYCoord = y => {
  let yPixel = y - Y_MIN;
  return yPixel * HEIGHT / Y_SIZE;
}

const getPixel = (x, y) => {
  return [getXCoord(x), getYCoord(y)];
}

const X_AXIS = [[0, Y_MIN], [0, Y_MAX]];
const Y_AXIS = [[X_MIN, 0], [X_MAX, 0]];

$(document).ready(() => {
  window.svg = d3.select('#chart').append("svg")
        .attr('height', HEIGHT).attr('width', WIDTH);

  [X_AXIS, Y_AXIS].forEach(axisPoints => {
    let className = '.' + (axisPoints === X_AXIS ? 'x' : 'y') + '-axis';
    let axis = this.svg.selectAll(className).data([axisPoints]);
    axis.enter()
        .append('line')
        .attr('class', 'axis')
        .attr("x1", d => getXCoord(d[0][0]))
        .attr("y1", d => getYCoord(d[0][1]))
        .attr("x2", d => getXCoord(d[1][0]))
        .attr("y2", d => getYCoord(d[1][1]))
        .attr("class", "line")
        .attr("stroke", "black")
        .attr("stroke-width", 3);
  })
})
