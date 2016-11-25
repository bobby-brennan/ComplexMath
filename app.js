$(document).ready(() => {
  drawStuff();
})

const drawStuff = () => {
  let one = new Complex(1);
  let points = PointSet.circle(50, 1, new Complex(0, 0));

  let graph = new Graph('#chart');
  graph.drawPoints(points);
  graph.drawComplex(new Complex(.5, .5));

  setInterval(() => {
    points.operate(z => z.multiply(new Complex(0, 1)), 4000);
    graph.drawPoints(points);
  }, 4000);
}
