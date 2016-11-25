$(document).ready(() => {
  drawStuff();
})

const ANIMATION_DURATION = 6000;

const CONSTANTS = {};
CONSTANTS.zero = new Complex(0);
CONSTANTS.one = new Complex(1);
CONSTANTS.i = new Complex(0, 1);

const graphs = [{
  title: "1/z on the unit circle",
  points: PointSet.circle(50, 1),
  mutation: z => z.copyFrom(CONSTANTS.one.copy().divide(z)),
  repeat: true,
}, {
  title: "1/z on four circles",
  points: PointSet.circle(20, .5, new Complex(1, 0))
    .append(PointSet.circle(20, .5, new Complex(0, 1)))
    .append(PointSet.circle(20, .5, new Complex(-1, 0)))
    .append(PointSet.circle(20, .5, new Complex(0, -1))),
  mutation: z => z.copyFrom(CONSTANTS.one.copy().divide(z)),
}]

const drawStuff = () => {
  let one = new Complex(1);
  let points = PointSet.circle(50, 1, new Complex(0, 0));

  graphs.forEach(g => {
    $('#chart').append('<h1>' + g.title + '</h1>');
    g.graph = new Graph('#chart');
  })

  setInterval(() => {
    graphs.forEach(g => {
      let points = g.repeat ? g.points : g.points.copy();
      if (!g.repeat) g.graph.clear();
      setTimeout(() => {
        g.graph.drawPoints(points);
        setTimeout(() => {
          points.operate(g.mutation);
          g.graph.drawPoints(points, ANIMATION_DURATION / 3);
        }, ANIMATION_DURATION / 3);
      }, 100)
    });
  }, ANIMATION_DURATION)
}
