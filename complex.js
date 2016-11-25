class Complex {
  constructor(x, y, color='steelblue') {
    this.x = x || 0;
    this.y = y || 0;
    this.color = color;
  }

  copy() {
    return new Complex(this.x, this.y, this.color);
  }

  copyFrom(z) {
    this.x = z.x;
    this.y = z.y;
    this.color = z.color;
  }

  getRed() {
    return d3.scale.linear().domain([X_MIN, X_MAX]).range([0, 255])(this.x);
  }

  getGreen() {return 0}

  getBlue() {
    return d3.scale.linear().domain([Y_MIN, Y_MAX]).range([0, 255])(this.y);
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

  divide(z) {
    let div = z.x * z.x + z.y * z.y;
    let newX = (this.x * z.x + this.y * z.y) / div;
    let newY = (this.y * z.x - this.x * z.y) / div;
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
          .transition()
          .duration(500)
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

class Grid {
  constructor(stepSize) {
    let xStep = X_MIN;
    let yStep = Y_MIN;
    this.points = [];
    while (xStep <= X_MAX) {
      while (yStep <= Y_MAX) {
        this.points.push(new Complex(xStep, yStep));
        yStep += stepSize;
      }
      yStep = Y_MIN;
      xStep += stepSize;
    }
    this.circles = window.svg.selectAll('.grid-points').data(this.points).enter().append('circle');
    this.circles
        .attr('fill', d => d3.rgb(d.getRed(), d.getGreen(), d.getBlue()))
    this.draw();
  }

  draw(duration) {
    this.circles
        .transition().duration(duration)
        .attr('cx', d => getXCoord(d.x))
        .attr('cy', d => getYCoord(d.y))
        .attr('r', 5)
  }

  operate(fn, duration=1000) {
    this.points.forEach(fn);
    this.draw(duration);
  }
}
