class Graph {
  constructor(selector, width=500, height=500, xRange=[-1,1], yRange=[-1,1]) {
    this.width = width;
    this.height = height;
    this.xRange = xRange;
    this.yRange = yRange;
    this.xSize = xRange[1] - xRange[0];
    this.ySize = yRange[1] - yRange[0];
    this.svg = d3.select(selector).append("svg")
          .attr('height', height).attr('width', width);
    this.drawAxes();
  }

  clear() {
    if (this.circles) this.circles.remove();
    this.circles = null;
  }

  getXCoord(x) {
    let xPixel = x - this.xRange[0];
    return xPixel * this.width / this.xSize;
  }
  getYCoord(y) {
    let yPixel = y - this.yRange[0];
    return this.height - yPixel * this.height / this.ySize;
  }
  getPixel(x, y) {
    return [this.getXCoord(x), this.getYCoord(y)];
  }
  getRed(z) {
    return d3.scale.linear().domain(this.xRange).range([0, 255])(z.x);
  }
  getGreen(z) {return 0}
  getBlue(z) {
    return d3.scale.linear().domain(this.yRange).range([0, 255])(z.y);
  }

  drawAxes() {
    const X_AXIS = [[0, this.yRange[0]], [0, this.yRange[1]]];
    const Y_AXIS = [[this.xRange[0], 0], [this.xRange[1], 0]];
    [X_AXIS, Y_AXIS].forEach(axisPoints => {
      let className = '.' + (axisPoints === X_AXIS ? 'x' : 'y') + '-axis';
      let axis = this.svg.selectAll(className).data([axisPoints]);
      axis.enter()
          .append('line')
          .attr('class', 'axis')
          .attr("stroke", "black")
          .attr("stroke-width", 3)
          .attr("x1", d => this.getXCoord(d[0][0]))
          .attr("y1", d => this.getYCoord(d[0][1]))
          .attr("x2", d => this.getXCoord(d[1][0]))
          .attr("y2", d => this.getYCoord(d[1][1]))
    })
  }

  drawComplex(z, color='steelblue') {
    let line = this.svg.append('line');
    line
        .attr('class', 'complex')
        .attr('x1', this.getXCoord(0))
        .attr('y1', this.getYCoord(0))
        .attr('x2', this.getXCoord(z.x))
        .attr('y2', this.getYCoord(z.y))
        .attr("stroke", color)
        .attr("stroke-width", 3);
    return this;
  }

  drawPoints(pointSet, duration=1000) {
    if (!this.circles) {
      this.circles = this.svg.selectAll('.grid-points').data(pointSet.points).enter().append('circle');
      this.circles.attr('fill', d => d3.rgb(this.getRed(d), this.getGreen(d), this.getBlue(d)))
    }
    this.circles
        .transition().duration(duration)
        .attr('cx', d => this.getXCoord(d.x))
        .attr('cy', d => this.getYCoord(d.y))
        .attr('r', 5)
  }
}

class Complex {
  constructor(x, y, polar=false) {
    if (polar) {
      let r = x;
      let theta = y;
      this.x = r * Math.cos(theta);
      this.y = r * Math.sin(theta);
    } else {
      this.x = x || 0;
      this.y = y || 0;
    }
  }

  copy() {
    return new Complex(this.x, this.y, false, this.color);
  }

  copyFrom(z) {
    this.x = z.x;
    this.y = z.y;
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

  toString() {
    return this.x.toFixed(4) + " " + this.y.toFixed(4) + 'i';
  }
}

class PointSet {
  constructor(points) {
    this.points = points;
  }

  copy() {
    return new PointSet(this.points.map(p => p.copy()));
  }

  append(set) {
    this.points = this.points.concat(set.points);
    return this;
  }

  operate(fn) {
    this.points.forEach(fn);
  }

  static grid(steps=10) {
    let xStep = X_MIN;
    let yStep = Y_MIN;
    let xStepSize = X_SIZE / steps;
    let yStepSize = Y_SIZE / steps;
    let points = [];
    while (xStep <= X_MAX) {
      while (yStep <= Y_MAX) {
        points.push(new Complex(xStep, yStep));
        yStep += yStepSize;
      }
      yStep = Y_MIN;
      xStep += xStepSize;
    }
    return new PointSet(points);
  }

  static circle(steps=10, radius=1, shift=null) {
    let points = [];
    let theta = 0;
    let maxTheta = 2.0 * Math.PI;
    let thetaStep = maxTheta / steps;
    while (theta < maxTheta) {
      let p = new Complex(radius, theta, true);
      if (shift) p.add(shift);
      points.push(p);
      theta += thetaStep;
    }
    return new PointSet(points);
  }
}
