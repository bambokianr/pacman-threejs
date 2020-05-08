const id = "pacman-3d";
const canvasWidth = document.getElementById(id).offsetWidth; 
const canvasHeight = document.getElementById(id).offsetHeight;
const webGLExists = Detector.webgl ? true : false;

var frames = 0;
var signalPacman = 1;
var signalGhost = 1;
var angleMouthIdx = 0;
var posYGhost = 0;
var renderer, scene, camera, controls, map, pacman, ghost;
var PACMAN_RADIUS = 0.4;
var GHOST_RADIUS = PACMAN_RADIUS * 1.15;
var LEVEL = 
[
  '# # # # # # # # # # # # # # # # # # # # # # # # # # # #',
  '# . . . . . . . . . . . . # # . . . . . . . . . . . . #',
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
  '          # . # #   # # # # # # # #   # # . #          ',
  '# # # # # # . # #   # # # # # # # #   # # . # # # # # #',
  '# . . . . . . . . . . . . # # . . . . . . . . . . . . #',
  '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
  '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
  '# o . . # # . . . . . . . .   . . . . . . . # # . . o #',
  '# # # . # # . # # . # # # # # # # # . # # . # # . # # #',
  '# # # . # # . # # . # # # # # # # # . # # . # # . # # #',
  '# . . . . . . # # . . . . # # . . . . # # . . . . . . #',
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
    createPerspectiveCamera();
    drawAxes(15);
    map = createMap(LEVEL);
    pacman = createPacman(map.pacmanSkeleton);
    ghost = createGhost(map.ghostSkeleton, 0xff0000);
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
      } else if (cell === 'P') {
        map.pacmanSkeleton = new THREE.Vector3(x, y, 0);
      } else if (cell === 'G') {
        map.ghostSkeleton = new THREE.Vector3(x, y, 0);
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
  var material = new THREE.MeshPhongMaterial({ color: 0x00ffff });
  var wall = new THREE.Mesh(geometry, material);
  // wall.isWall = true;

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
  animateMouthPacman();
  animateFloatGhost();
  renderer.render(scene, camera);
};