const id = "pacman-3d";
const canvasWidth = document.getElementById(id).offsetWidth; 
const canvasHeight = document.getElementById(id).offsetHeight;
const webGLExists = Detector.webgl ? true : false;

var renderer, scene, camera;
var cube;

initApp();

function initApp() {
  if(webGLExists === true) {
    createRenderer();
    createScene();
    createPerspectiveCamera();
    drawAxes(15);
    drawCube();
    animateScene();
    
  } else if(webGLExists === false) {
    alert("Your browser doesn't support WebGL.");
  }
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true });
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0x606060, 1); 
  document.getElementById(id).appendChild(renderer.domElement);
}

function createScene() {
  scene = new THREE.Scene();
  //--- [TODO] AD LIGHT
}

function createPerspectiveCamera() {
  camera = new THREE.PerspectiveCamera(60, canvasWidth / canvasHeight, 0.1, 100);
  camera.position.set(-3, 3, 6);
  camera.lookAt(scene.position);
}

function drawAxes(length) {
  var axes = new THREE.AxesHelper(length);
  scene.add(axes);
}

function drawCube() {
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ color: 0x0fffff });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  return cube;
}

function animateScene() {
  requestAnimationFrame(animateScene);
  // cube.rotation.x += 5;
  renderer.render(scene, camera);
};