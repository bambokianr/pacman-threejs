const id = "pacman-3d";
const canvasWidth = document.getElementById(id).offsetWidth; 
const canvasHeight = document.getElementById(id).offsetHeight;
const webGLExists = Detector.webgl ? true : false;

var frames = 0;
var renderer, scene, camera, loader, arcadeMesh;
// var controls;

window.onload = initApp();

function initApp() {
  if(webGLExists === true) {
    createRenderer();
    createScene();
    createPerspectiveCamera();
    createGLTFLoader();

    animateScene();
  } else if(webGLExists === false) {
    alert("Your browser doesn't support WebGL.");
  }
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true });
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0xd9d9d9, 1); 
  document.getElementById(id).appendChild(renderer.domElement);
}

function createScene() {
  scene = new THREE.Scene();

  // ALTERAR AQUI!!!!
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  scene.add(new THREE.PointLight(0xffffff, 0.5));
}

function createPerspectiveCamera() {
  camera = new THREE.PerspectiveCamera(35, canvasWidth / canvasHeight, 0.1, 1000);
  // camera.position.set(0, -40, 50);
  // camera.lookAt(scene.position);
  // controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function createGLTFLoader() {
  loader = new THREE.GLTFLoader();
  loader.load('./js/arcade.gltf', handleGLTGFile);
}

function handleGLTGFile(gltf) {
  arcadeMesh = gltf.scene;
  arcadeMesh.children[0].material = new THREE.MeshLambertMaterial();
  scene.add(arcadeMesh);
  arcadeMesh.position.z = -500;
  arcadeMesh.position.x = -15;
}


function animateScene() {
  requestAnimationFrame(animateScene);

  frames += 1;
  if (arcadeMesh) 
    arcadeMesh.rotation.y -= 0.01;

  renderer.render(scene, camera);
};