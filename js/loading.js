const id = "pacman-3d";
const canvasWidth = document.getElementById(id).offsetWidth; 
const canvasHeight = document.getElementById(id).offsetHeight;
const webGLExists = Detector.webgl ? true : false;

var frames = 0;
var arcadeRotation = 'right';
var renderer, scene, camera, controls, arcadeLoader, arcadeMesh, fontLoader, fontMesh = [];

const vertexShader = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 u_color;
  uniform float u_time;

  void main() {
    gl_FragColor = vec4(0.0, cos(u_time * 0.5) + 0.5, 1.0, 1.0).rgba;
  }
`;

const uniforms = {
  u_time: {value: 0.0},
  u_color: {value: new THREE.Color(0x0000FF)}
}

const clock = new THREE.Clock();

window.onload = initApp();

function initApp() {
  if(webGLExists === true) {
    addEnterPressListener();
    createRenderer();
    createScene();
    createPerspectiveCamera();
    createGLTFLoader();
    createFontLoader();

    animateScene();
  } else if(webGLExists === false) {
    alert("Your browser doesn't support WebGL.");
  }
}

function addEnterPressListener() {
  document.getElementById(id).addEventListener('keypress', function (e) {
    if(e.key === 'Enter') {
      console.log('PASSAR PARA O ARQUIVO game.js');
    }
});
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0x000000, 1); 
  document.getElementById(id).appendChild(renderer.domElement);
}

function createScene() {
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  scene.add(new THREE.PointLight(0xffffff, 1));
}

function createPerspectiveCamera() {
  camera = new THREE.PerspectiveCamera(35, canvasWidth / canvasHeight, 0.1, 1000);
  camera.position.set(-100, 60, 250);
  camera.lookAt(scene.position);
  // controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function createGLTFLoader() {
  arcadeLoader = new THREE.GLTFLoader();
  arcadeLoader.load('./3dmodel/arcade.gltf', handleGLTGFile);
}

function handleGLTGFile(gltf) {
  arcadeMesh = gltf.scene;
  arcadeMesh.children[0].material = new THREE.MeshLambertMaterial();
  scene.add(arcadeMesh);
  arcadeMesh.position.set(-18, 0, -100);
}

function createFontLoader() {
  fontLoader = new THREE.FontLoader();
  fontLoader.load('./fonts/8-bit.json', handleFont);
}

function handleFont(font) {
  var playText = [
      new THREE.TextGeometry("press", {
      font: font,
      size: 10,
      height: 10
    }),
      new THREE.TextGeometry("ENTER", {
      font: font,
      size: 18,
      height: 10
    }),
      new THREE.TextGeometry("to start", {
      font: font,
      size: 10,
      height: 10
    }),
  ];

  fontMesh.push(
    new THREE.Mesh(playText[0], new THREE.MeshPhongMaterial({color: 0xff0000})),
    new THREE.Mesh(playText[1], new THREE.ShaderMaterial({vertexShader, fragmentShader, uniforms})),
    new THREE.Mesh(playText[2], new THREE.MeshPhongMaterial({color: 0xff0000}))
  );
  fontMesh[0].position.set(-110, -40, 0);
  fontMesh[1].position.set(-35, -40, 0);
  fontMesh[2].position.set(-45, -50, 20);
  scene.add(fontMesh[0], fontMesh[1], fontMesh[2]);
}

function animateScene() {
  requestAnimationFrame(animateScene);

  frames += 1;
  uniforms.u_time.value = clock.getElapsedTime();
  
  if (arcadeMesh) {
    // if (arcadeMesh.rotation.y > - 0.5 && arcadeRotation === 'right') {
    //   arcadeMesh.rotation.y -= 0.01;
    // } else {
    //   arcadeRotation = 'left';
    //   if (arcadeMesh.rotation.y < 0.5 && arcadeRotation === 'left') {
    //     arcadeMesh.rotation.y += 0.01;
    //   } else {
    //     arcadeRotation = 'right';
    //   }
    // }
  }
  renderer.render(scene, camera);
};