const id = "pacman-3d";
const canvasWidth = document.getElementById(id).offsetWidth; 
const canvasHeight = document.getElementById(id).offsetHeight;
const webGLExists = Detector.webgl ? true : false;

var frames = 0;
var signalPacman = 1;
var signalGhost = 1;
var angleMouthIdx = 0;
var posYGhost = 0;
var colorsGhost = [0xfa9899, 0x66feff, 0xfa9c00, 0xef0707];
var colorWall = 0x1716a2;
var renderer, scene, camera, controls, map, pacman, ghosts = [];
var PACMAN_RADIUS = 0.4;
var GHOST_RADIUS = PACMAN_RADIUS * 1.15;
var DOT_RADIUS = 0.05;
var PACMAN_SPEED = 2;
var UP = new THREE.Vector3(0, 0, 1);
var LEFT = new THREE.Vector3(-1, 0, 0);
var TOP = new THREE.Vector3(0, 1, 0);
var RIGHT = new THREE.Vector3(1, 0, 0);
var BOTTOM = new THREE.Vector3(0, -1, 0);
var keys;
var delta = 0.02;
var cameraFP = true;
var cancelChangeCamera = false;
var LEVEL = 
[
  '# # # # # # # # # # # # # # # # # # # # # # # # # # # #',
  '# . . . . . . G . . . . . # # . . . . . . . . . . . . #',
  '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
  '# o # # # # . # # # # # . # # . # # # # # . # # # # o #',
  '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
  '# . . . . . . . . . . . . . . . . . . . . . . . . . . #',
  '# . # # # # . # # . # # # # # # # # . # # . # # # # . #',
  '# . # # # # . # # . # # # # # # # # . # # . # # # # . #',
  '# . . . . . . # # . . . . # # . . . . # # . . . . . . #',
  '# # # # # # . # # # # #   # #   # # # # # . # # # # # #',
  '          # . # # # # #   # #   # # # # # . #          ',
  '          # . # #         G           # # . #          ',
  '          # . # #   # # # # # # # #   # # . #          ',
  '# # # # # # . # #   #             #   # # . # # # # # #',
  '            .       #     P       #       .            ',
  '# # # # # # . # #   #             #   # # . # # # # # #',
  '          # . # #   # # # # # # # #   # # . #          ',
  '          # . # #                     # # . #          ',
  '          # . # # G # # # # # # # #   # # . #          ',
  '# # # # # # . # #   # # # # # # # #   # # . # # # # # #',
  '# . . . . . . . . . . . . # # . . . . . . . . . . . . #',
  '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
  '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
  '# o . . # # . . . . . . . .   . . . . . . . # # . . o #',
  '# # # . # # . # # . # # # # # # # # . # # . # # . # # #',
  '# # # . # # . # # . # # # # # # # # . # # . # # . # # #',
  '# . . . . . . # # . . . . # # . . . . # # G . . . . . #',
  '# . # # # # # # # # # # . # # . # # # # # # # # # # . #',
  '# . # # # # # # # # # # . # # . # # # # # # # # # # . #',
  '# . . . . . . . . . . . . . . . . . . . . . . . . . . #',
  '# # # # # # # # # # # # # # # # # # # # # # # # # # # #'
];

window.onload = initApp();

function initApp() {
  if(webGLExists === true) {
    createRenderer();
    createScene();
    // createFirstPersonCamera();
    createPerspectiveCamera();
    keys = createKeyState(); 
    drawAxes(15);
    map = createMap(LEVEL);
    pacman = createPacman(map.pacmanSkeleton);
    map.ghostsSkeleton.map((ghostSkeleton, idx) => ghosts.push(createGhost(ghostSkeleton, colorsGhost[idx])));
    animateScene();
    
  } else if(webGLExists === false) {
    alert("Your browser doesn't support WebGL.");
  }
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true });
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0x000000, 1); 
  document.getElementById(id).appendChild(renderer.domElement);
}

function createScene() {
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0x888888));
  var light = new THREE.SpotLight('white', 0.5);
  light.position.set(0, 0, 50);
  scene.add(light);
}

function createPerspectiveCamera() {
  cameraFP = false;
  camera = new THREE.PerspectiveCamera(60, canvasWidth / canvasHeight, 0.1, 100);
  camera.position.set(0, -40, 50);
  camera.lookAt(scene.position);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  // controls.enablePan = false;
  // controls.enableKeys = false;
  // controls.enableZoom = false;
  // controls.enableRotate = false;
}

function drawAxes(length) {
  var axes = new THREE.AxesHelper(length);
  scene.add(axes);
}

function createMap(levelDef) {
  var map = {};
  map.bottom = 1 -levelDef.length;
  map.top = 0;
  map.left = 0;
  map.right = 0;
  map.pacmanSkeleton = null;
  map.ghostSkeleton = null;
  map.ghostsSkeleton = [];

  var x, y;
  for (var row = 0; row < levelDef.length; row++) {
    y = -row + (levelDef.length-3)/2;
    map[y] = {};

    var length = Math.floor(levelDef[row].length / 2);
    map.right = Math.max(map.right, length);

    for (var column = 0; column < levelDef[row].length; column += 2) {
      x = Math.floor(column / 2) + (2 - levelDef.length/2);
      var cell = levelDef[row][column];
      var object = null;

      if (cell === '#') {
        object = createWallMaze();
      } else if (cell == '.') {
        object = createDot();
      } else if (cell === 'P') {
        map.pacmanSkeleton = new THREE.Vector3(x, y, 0);
      } else if (cell === 'G') {
        map.ghostsSkeleton.push(new THREE.Vector3(x, y, 0));
      }

      if (object !== null) {
        object.position.set(x, y, 0);
        map[y][x] = object;
        scene.add(object);
      }
    }
  }
  map.centerX = (map.left + map.right) / 2;
  map.centerY = (map.bottom + map.top) / 2;

  return map;
}

function createWallMaze() {
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshPhongMaterial({ color: colorWall });
  var wall = new THREE.Mesh(geometry, material);

  return wall;
}

function createPacman(skeleton) {
  var pacmanGeometries = [];
  var numFrames = 40;
  for (var i = 0; i < numFrames; i++) {
    var mouthAngle = (i / (numFrames - 1)) * Math.PI;
    pacmanGeometries.push(new THREE.SphereGeometry(PACMAN_RADIUS, 40, 40, mouthAngle, Math.PI * 2 - mouthAngle * 2));
  }

  var pacmanMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00, side: THREE.DoubleSide });
  pacman = new THREE.Mesh(pacmanGeometries[10], pacmanMaterial);

  //adicionando a chave frames do obj pacman todas as geometrias geradas para o pacman
  pacman.frames = pacmanGeometries;
  pacman.position.copy(skeleton); //definindo a posição do pacman no mapa
  pacman.direction = new THREE.Vector3(-1, 0, 0);

  scene.add(pacman);
  return pacman;
}

function createGhost(skeleton, color) {
  const { x, y, z } = skeleton;
  var heightCylinder = GHOST_RADIUS;
  var material = new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide });

  var geomSemisphere = new THREE.SphereGeometry(GHOST_RADIUS, 40, 40, 0, Math.PI);
  var objSemisphere = new THREE.Mesh(geomSemisphere, material);
  objSemisphere.position.x = x;
  objSemisphere.position.y = y;
  objSemisphere.position.z = z + heightCylinder/2;
  
  var geomCylinder = new THREE.CylinderGeometry(GHOST_RADIUS, GHOST_RADIUS, heightCylinder, 40);  
  var objCylinder = new THREE.Mesh(geomCylinder, material);
  objCylinder.rotateX(Math.PI / 2);
  objCylinder.position.copy(skeleton);

  ghost = new THREE.Group();
  ghost.add(objSemisphere, objCylinder);

  scene.add(ghost);

  return ghost;
}

function animateMouthPacman() {
  const framesInterval = 5;
  const qtOfAngles = 10;

  //a cada intervalo de 5 frames, altera-se a geomgetria do pacman - em relação a boca
  if (frames % framesInterval === 0) {
    // altera o mesh do pacman - especificamente a geometria a partir das pacmanGeometries (prop frames do pacman)
    scene.remove(pacman);
    pacman.geometry = pacman.frames[angleMouthIdx];
    scene.add(pacman);
    if (angleMouthIdx === 0) { //aumentando o âgulo - abrindo a boca
      signalPacman = 1;
    } else if (angleMouthIdx === qtOfAngles) { //fechando o âgulo - diminuindo a boca
      signalPacman = -1;
    }
    angleMouthIdx += signalPacman;
  }
}

function animateFloatGhost() {
  const framesInterval = 10;
  const deltaY = 0.2;

  if (frames % framesInterval === 0) {
    posYGhost = Math.round((posYGhost +signalGhost*0.05) * 100) / 100;
    scene.remove(ghost);
    ghost.position.z = posYGhost;
    scene.add(ghost);
    if (posYGhost === -1*deltaY) {
      signalGhost = 1;
    } else if (posYGhost === deltaY) {
      signalGhost = -1;
    }
  }
}

function animateScene() {
  requestAnimationFrame(animateScene);

  frames += 1;
  if (cameraFP)
    updateFirstPersonCamera();
  changeCameraView();
  animateMouthPacman();
  // animateFloatGhost();
  movePacman();
  renderer.render(scene, camera);
};

/// Moita a partir daqui

function createFirstPersonCamera() {
  cameraFP = true;
  camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 100);
  camera.up.copy(UP);
  camera.targetPosition = new THREE.Vector3();
  camera.targetLookAt = new THREE.Vector3();
  camera.lookAtPosition = new THREE.Vector3();
}

function updateFirstPersonCamera() {
  camera.targetPosition.copy(pacman.position).addScaledVector(UP, 1.5).addScaledVector(pacman.direction, -1);
  camera.targetLookAt.copy(pacman.position).add(pacman.direction);

  camera.position.lerp(camera.targetPosition, 0.2);
  camera.lookAtPosition.lerp(camera.targetLookAt, 0.2);
  camera.lookAt(camera.lookAtPosition);
}

var _lookAt = new THREE.Vector3();
function movePacman() {
  pacman.up.copy(pacman.direction).applyAxisAngle(UP, -Math.PI / 2);
  _lookAt = pacman.position.clone();
  pacman.lookAt(_lookAt.add(UP));

  //console.log(keys);
  if (keys['W']) {
    pacman.translateOnAxis(LEFT, PACMAN_SPEED * delta);
    pacman.distanceMoved += PACMAN_SPEED * delta;
  }
  if (keys['A']) {
    pacman.direction.applyAxisAngle(UP, Math.PI / 2 * delta);
  }
  if (keys['D']) {
    pacman.direction.applyAxisAngle(UP, -Math.PI / 2 * delta);
  }
  if (keys['S']) {
    pacman.translateOnAxis(LEFT, -PACMAN_SPEED * delta);
    pacman.distanceMoved += PACMAN_SPEED * delta;
  }
}

function createKeyState() {
  var keyState = {};

  document.body.addEventListener('keydown', onDocumentKeyDown,false);
  function onDocumentKeyDown(event) {
    keyState[event.keyCode] = true;
    keyState[String.fromCharCode(event.keyCode)] = true; 
         
  };
  
  document.body.addEventListener('keyup', function (event) {
      keyState[event.keyCode] = false;
      keyState[String.fromCharCode(event.keyCode)] = false;
  });
  document.body.addEventListener('blur', function (event) {
      for (var key in keyState) {
          if (keyState.hasOwnProperty(key))
              keyState[key] = false;
      }
  });

  return keyState;
}

function createDot() {
  var dotGeometry = new THREE.SphereGeometry(DOT_RADIUS);
  var dotMaterial = new THREE.MeshPhongMaterial({ color: 0xFFDAB9 }); // Paech color

  var dot = new THREE.Mesh(dotGeometry, dotMaterial);
  return dot;
}

function changeCameraView() {
  if (keys['C']) {
    if (!cancelChangeCamera) {
      if (cameraFP)
        createPerspectiveCamera();
      else
        createFirstPersonCamera();
      cancelChangeCamera = true;
    }
  }
  else
    cancelChangeCamera = false;
}
