const RADIUS = 300;
const setVertexFromZeta = (v, zeta) => {
  let norm = Math.pow(math.re(zeta), 2) + Math.pow(math.im(zeta), 2);
  let div = (1.0 + norm) / RADIUS;
  v.x = 2.0 * math.re(zeta) / div;
  v.z = 2.0 * math.im(zeta) / div;
  v.y = (norm - 1) / div;
}
const getZetaFromVertex = (v) => {
  let cx = math.complex(v.x / RADIUS);
  let cz = math.complex(v.y / RADIUS);
  let cy = math.complex(v.z / RADIUS);
  let zeta = math.add(cx, math.multiply(cy, math.complex(0, 1)));
  zeta = math.divide(zeta, math.subtract(1, cz));
  return zeta;
}

const normalizeVertex = (vertex) => {
  let norm =
    vertex.x * vertex.x +
    vertex.y * vertex.y +
    vertex.z * vertex.z;
  norm = Math.sqrt(norm);
  vertex.x /= norm / RADIUS;
  vertex.y /= norm / RADIUS;
  vertex.z /= norm / RADIUS;
  return vertex;
}

const getRandomVertex = (bias={x:1,y:1,z:1}) => {
  let vertex = new THREE.Vector3();
  vertex.x = bias.x * (Math.random() - .5);
  vertex.y = bias.y * (Math.random() - .5);
  vertex.z = bias.z * (Math.random() - .5);
  normalizeVertex(vertex);
  vertex.zeta = getZetaFromVertex(vertex);
  vertex.targetZeta = getTarget(vertex.zeta);
  return normalizeVertex(vertex);
}

const getTarget = (zeta) => {
  return math.divide(1, zeta);
}

const updateVertex = (v, progress) => {
  /*
  let start = v.zeta.toPolar();
  let end = v.targetZeta.toPolar();
  let r = start.r * (1.0 - progress) + end.r * progress;
  let phi = start.phi * (1.0 - progress) + end.phi * progress;
  let zeta = math.complex({r, phi});
  */
  /**/
  let real = math.re(v.targetZeta) * progress + math.re(v.zeta) * (1.0 - progress);
  let im =   math.im(v.targetZeta) * progress + math.im(v.zeta) * (1.0 - progress);
  let zeta = math.complex(real, im);
  /**/
  setVertexFromZeta(v, zeta);
}

$(document).ready(function() {
    'use strict';
    // 'To actually be able to display anything with Three.js, we need three things:
    // A scene, a camera, and a renderer so we can render the scene with the camera.'
    // - http://threejs.org/docs/#Manual/Introduction/Creating_a_scene

    var scene, camera, renderer;

    // I guess we need this stuff too
    var container, HEIGHT,
        WIDTH, fieldOfView, aspectRatio,
        nearPlane, farPlane, stats,
        geometry, particleCount,
        i, h, color, size,
        material,
        animation = {},
        windowHalfX, windowHalfY, cameraZ,
        fogHex, fogDensity, parameters = {},
        parameterCount, particles;

    var screenW = window.innerWidth;
    var screenH = window.innerHeight;
    var mouseX = 0, mouseY = 0;
    var dragX = 0, dragY = 0;
    var mouseDown = false;

    init();
    animate();

    function init() {

        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        windowHalfX = WIDTH / 2;
        windowHalfY = HEIGHT / 2;

        fieldOfView = 75;
        aspectRatio = WIDTH / HEIGHT;
        nearPlane = 1;
        farPlane = 3000;
        animation.progress = 0;

        /*  fieldOfView — Camera frustum vertical field of view.
    aspectRatio — Camera frustum aspect ratio.
    nearPlane — Camera frustum near plane.
    farPlane — Camera frustum far plane.

    - http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera

    In geometry, a frustum (plural: frusta or frustums)
    is the portion of a solid (normally a cone or pyramid)
    that lies between two parallel planes cutting it. - wikipedia.      */

        cameraZ = farPlane / 3; /*  So, 1000? Yes! move on! */
        fogHex = 0x000000; /* As black as your heart.   */
        fogDensity = 0.0007; /* So not terribly dense?  */

        camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        camera.position.z = cameraZ;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(fogHex, fogDensity);

        container = document.createElement('div');
        document.body.appendChild(container);
        document.body.style.margin = 0;
        document.body.style.overflow = 'hidden';

        geometry = new THREE.Geometry();
        geometry.colors = [];

        //coverSphere(geometry);
        addUnitCircle(geometry, {x: 1, y: 1, z: 0}, 0x0000ff);
        addUnitCircle(geometry, {x: 1, y: 0, z: 1}, 0xff0000);
        addUnitCircle(geometry, {x: 0, y: 1, z: 1}, 0x00ff00);
        addAxes(geometry);

        material = new THREE.PointCloudMaterial({
            size: 5,
            vertexColors: THREE.VertexColors,
        });

        particles = new THREE.PointCloud(geometry, material);
        scene.add(particles);

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(WIDTH, HEIGHT);

        container.appendChild(renderer.domElement);

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        stats.domElement.style.right = '0px';
        container.appendChild(stats.domElement);

        let tween = new TWEEN.Tween(animation).to({progress: 1.0}, 5000).start();
        tween.delay(2000).repeat(Infinity);

        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);

    }

    function coverSphere(geometry) {
      let steps = 30;
      for (let x = 0; x < steps; ++x) {
        for (let y = 0; y < steps; ++y) {
          for (let z = 0; z < steps; ++z) {
            var vertex = new THREE.Vector3();
            vertex.x = x / steps - .5;
            vertex.y = y / steps - .5;
            vertex.z = z / steps - .5;
            normalizeVertex(vertex);
            vertex.zeta = getZetaFromVertex(vertex);
            vertex.targetZeta = getTarget(vertex.zeta);
            geometry.vertices.push(vertex);

            let color = new THREE.Color(1, 1, 1);
            geometry.colors.push(color);
          }
        }
      }
    }

    function addUnitCircle(geometry, bias, color) {
      for (let step = 0; step < 1000; ++step) {
        let vertex = getRandomVertex(bias);
        geometry.vertices.push(vertex);
        geometry.colors.push(new THREE.Color(color));
      }
    }

    function addAxes(geometry) {
      let axisSize = 500;
      ([1,2,3]).forEach(axis => {
        let color = 0x000000;
        if (axis === 1) color = 0xff0000
        if (axis === 2) color = 0x00ff00
        if (axis === 3) color = 0x0000ff
        var material = new THREE.LineBasicMaterial({color})
        let x = axis === 1 ? axisSize : 0;
        let y = axis === 2 ? axisSize : 0;
        let z = axis === 3 ? axisSize : 0;
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-x, -y, -z));
        geometry.vertices.push(new THREE.Vector3(x, y, z));
        var line = new THREE.Line(geometry, material);
        scene.add(line);
      })
    }

    function animate(time) {
      requestAnimationFrame(animate);
      TWEEN.update(time);
      render();
      geometry.vertices.forEach(v => updateVertex(v, animation.progress));
      geometry.verticesNeedUpdate = true;
      stats.update();
    }

    function render() {
      var time = Date.now() * 0.00005;
      let sensitivity = 100;
      scene.children.forEach(o => {
        o.rotation.x = dragY / sensitivity;
        o.rotation.y = dragX / sensitivity;
      })
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }

    function onDocumentMouseMove(e) {
        let x = e.clientX - windowHalfX;
        let y = e.clientY - windowHalfY;
        if (mouseDown) {
          dragX += x - mouseX;
          dragY += y - mouseY;
        }
        mouseX = x;
        mouseY = y;
    }

    document.body.addEventListener("mousedown", function(event) {
        mouseDown = true
    }, false);
    document.body.addEventListener("mouseup", function(event) {
        mouseDown = false
    }, false);

    /*  Mobile users?  I got your back homey    */

    function onDocumentTouchStart(e) {

        if (e.touches.length === 1) {

            e.preventDefault();
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    function onDocumentTouchMove(e) {

        if (e.touches.length === 1) {

            e.preventDefault();
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

/*
    var loader = new THREE.FontLoader();
    loader.load( 'node_modules/three/examples/fonts/helvetiker_bold.typeface.json', function ( font ) {
        const labels = [{
          x: 500,
          y: 0,
          z: 0,
          text: "Infinity",
        }]
        var material = new THREE.MeshBasicMaterial({color: 0x11ff00});
        labels.forEach(label => {
          var textGeo = new THREE.TextGeometry(label.text, {
              font: font,
              size: 20,
              height: 20,
              curveSegments: 12,
              bevelThickness: 2,
              bevelSize: 5,
              bevelEnabled: true
          } );

          var mesh = new THREE.Mesh(textGeo, material);
          mesh.position.set(label.x, label.y, label.z);
          scene.add( mesh );
        })
    } );
*/
});

