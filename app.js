$(document).ready(() => {
  setUp();
  drawStuff();
})

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
  return HEIGHT - yPixel * HEIGHT / Y_SIZE;
}

const getPixel = (x, y) => {
  return [getXCoord(x), getYCoord(y)];
}

const X_AXIS = [[0, Y_MIN], [0, Y_MAX]];
const Y_AXIS = [[X_MIN, 0], [X_MAX, 0]];

const setUp = () => {
  window.svg = d3.select('#chart').append("svg")
        .attr('height', HEIGHT).attr('width', WIDTH);

  [X_AXIS, Y_AXIS].forEach(axisPoints => {
    let className = '.' + (axisPoints === X_AXIS ? 'x' : 'y') + '-axis';
    let axis = this.svg.selectAll(className).data([axisPoints]);
    axis.enter()
        .append('line')
        .attr('class', 'axis')
        .attr("stroke", "black")
        .attr("stroke-width", 3)
        .attr("x1", d => getXCoord(d[0][0]))
        .attr("y1", d => getYCoord(d[0][1]))
        .attr("x2", d => getXCoord(d[1][0]))
        .attr("y2", d => getYCoord(d[1][1]))
  })
}

class Complex {
  constructor(x, y, color='steelblue') {
    this.x = x || 0;
    this.y = y || 0;
    this.color = color;
  }

  copy() {
    return new Complex(this.x, this.y, this.color);
  }

  add(z) {
    this.x += z.x;
    this.y += z.y;
    return this;
  }

  multiply(z) {
    // (tx + ty*i)(zx + zy*i)
    // = tx*zx + tx*zy*i + ty*zx*i - ty*zy
    // = (tx*zx - ty*zy) + (tx*zy + ty*zx)i
    let newX = this.x * z.x - this.y * z.y;
    let newY = this.x * z.y + this.y * z.x;
    this.x = newX;
    this.y = newY;
    return this;
  }

  pow(n) {
    if (n === 0) {
      this.x = 1;
      this.y = 0;
    } else {
      let copy = this.copy();
      for (let i = 1; i < n; ++i) {
        this.multiply(copy);
      }
    }
    return this;
  }

  draw() {
    if (!this.line) this.line = window.svg.append('line');
    this.line
          .attr('class', 'complex')
          .attr('x1', getXCoord(0))
          .attr('y1', getYCoord(0))
          .attr('x2', getXCoord(this.x))
          .attr('y2', getYCoord(this.y))
          .attr("stroke", this.color)
          .attr("stroke-width", 3);
    return this;
  }

  undraw() {
    if (!this.line) return;
    this.line.remove();
    this.line = null;
  }

  toString() {
    return this.x.toFixed(4) + " " + this.y.toFixed(4) + 'i';
  }
}

const factorial = (n) => {
  if (n === 0) return 1;
  else return n * factorial(n - 1);
}

const addExpTerm = (z, cur, term=0) => {
  if (term === 0) return new Complex(1, 0, 'green');
  let fact = new Complex(1 / factorial(term));
  nextTerm = z.copy().pow(term).multiply(fact);
  return cur.add(nextTerm);
}

const drawStuff = () => {
  let i = new Complex(0, 1);
  let z = new Complex(0, Math.PI);
  z.draw();
  let exp = null;
  let term = 0;
  setInterval(() => {
    if (term > 15) return;
    exp = addExpTerm(z, exp, term++);
    console.log(exp.toString());
    exp.draw();
  }, 500)
}
