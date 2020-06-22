const vShader = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fShader = `
  uniform vec3 u_color;
  uniform float u_time;

  void main() {
    gl_FragColor = vec4(0.0, cos(u_time * 0.5) + 0.5, 1.0, 1.0).rgba;
  }
`;

// shader uniforms
const uniforms = {
  u_time: { value: 0.0 },
  u_color: { value: new THREE.Color(0x0000FF) }
}

// scene
const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
scene.add(new THREE.PointLight(0xffffff, 0.5));

// set clock
const clock = new THREE.Clock();

// camera
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
// camera.position.z = 10;


// renderer
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setClearColor(0x000000, 1); 
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// geometry and material
var geometry = new THREE.CircleGeometry( 1, 32 );
const material = new THREE.ShaderMaterial({
  vertexShader: vShader,
  fragmentShader: fShader,
  uniforms
});

// load font
var loader;

function createFontLoader() {
  loader = new THREE.FontLoader();
  loader.load('./fonts/8-bit.json', function(font) {
    var playText = new THREE.TextGeometry("play", {
      font: font,
      size: 30,
      height: 5,
      // curveSegments: 12,
      // bevelEnabled: true,
      // bevelThickness: 10,
      // bevelSize: 8,
      // bevelOffset: 0,
      // bevelSegments: 5
    });

    // var materialText = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    var materialText = new THREE.ShaderMaterial({
      vertexShader: vShader,
      fragmentShader: fShader,
      uniforms
    });

    var mesh = new THREE.Mesh(playText, materialText);
    camera.position.set(0, 0, 500);
    camera.lookAt(mesh.position);
    mesh.position.set(-70, 0, 0);
    scene.add(mesh);
  });
}

createFontLoader();

// render
function render() {
  // rotate the cube
  // cube.rotation.y += 0.01;
  // cube.rotation.x += 0.01;
  // update time uniform
  uniforms.u_time.value = clock.getElapsedTime();
  // animation loop
  requestAnimationFrame( render );
  renderer.render( scene, camera );
}

// run everything
render();