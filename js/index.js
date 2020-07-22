const id = "pacman-3d";
const canvasWidth = document.getElementById(id).offsetWidth; 
const canvasHeight = document.getElementById(id).offsetHeight;
const webGLExists = Detector.webgl ? true : false;

var enterPressed = false;
var frames = 0;
var renderer, scene, camera, controls;

// /\/\/\/\/\/\/\/\  initial scene  /\/\/\/\/\/\/\/\
var arcadeRotation = 'right';
var arcadeLoader, arcadeMesh, fontLoader, fontMesh = [];
const clock = new THREE.Clock();
const vertexShaderEnter = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShaderEnter = `
  uniform vec3 u_color;
  uniform float u_time;

  void main() {
    gl_FragColor = vec4(1.0, cos(u_time * 0.5) + 0.5, 0.0, 1.0).rgba;
  }
`;
const uniformsEnter = {
  u_time: {value: 0.0},
  u_color: {value: new THREE.Color(0x0000FF)}
}
const vertexShaderBigDot = `
  varying vec3 vUv; 

  void main() {
    vUv = position; 
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition; 
  }
`;
const fragmentShaderBigDot = `
  uniform vec3 colorA; 
  uniform vec3 colorB; 
  varying vec3 vUv;

  void main() {
    gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
  }
`;
const uniformsBigDot = {
  colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
  colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
}

// /\/\/\/\/\/\/\/\  game scene  /\/\/\/\/\/\/\/\
var colorWall = 0x1716a2;
var colorsGhost = [0xfa9899, 0x66feff, 0xfa9c00, 0xef0707];
var colorPeach = 0xfddca6;
var signalPacman = 1;
var signalGhost = 1;
var angleMouthIdx = 0;
var posYGhost = 0;
var map, pacman, ghosts = [];
var PACMAN_RADIUS = 0.4;
var GHOST_RADIUS = PACMAN_RADIUS * 1.15;
var DOT_RADIUS = 0.05;
var PACMAN_SPEED = 2;
var GHOST_SPEED = 1.5;
var UP = new THREE.Vector3(0, 0, 1);
var LEFT = new THREE.Vector3(-1, 0, 0);
var TOP = new THREE.Vector3(0, 1, 0);
var RIGHT = new THREE.Vector3(1, 0, 0);
var BOTTOM = new THREE.Vector3(0, -1, 0);
var _lookAt = new THREE.Vector3();
var keys;
var delta = 0.02;
var toRemove = [];
var whoAte = [];
var cameraFP = true;
var cancelChangeCamera = false;
var lifesCounter = 3;
var won = false;
var lost = false;
var lostTime, wonTime;
var gameScore = 0;
var numGhosts = 0;
var ghostCreationTime = -8;
var numDotsEaten = 0;
var sound;
var muted = false;
var cancelMuted = false;
var LEVEL = [
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
  '          o P       #             #       .            ',
  '# # # # # # . # #   #             #   # # . # # # # # #',
  '          # . # #   # # # # # # # #   # # . #          ',
  '          # . # #                     # # . #          ',
  '          # . # #   # # # # # # # #   # # . #          ',
  '# # # # # # . # #   # # # # # # # #   # # . # # # # # #',
  '# . . . . . . . . . . . . # # . . . . . . . . . . . . #',
  '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
  '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
  '# o . . # # . . . . . . . . . . . . . . . . # # . . o #',
  '# # # . # # . # # . # # # # # # # # . # # . # # . # # #',
  '# # # . # # . # # . # # # # # # # # . # # . # # . # # #',
  '# . . . . . . # # . . . . # # . . . . # # . . . . . . #',
  '# . # # # # # # # # # # . # # . # # # # # # # # # # . #',
  '# . # # # # # # # # # # . # # . # # # # # # # # # # . #',
  '# . . . . . . . . . . . . . . . . . . . . . . . . . . #',
  '# # # # # # # # # # # # # # # # # # # # # # # # # # # #'
];

// /\/\/\/\/\/\/\/\  general functions  /\/\/\/\/\/\/\/\
function createRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0x000000, 1); 
  document.getElementById(id).appendChild(renderer.domElement);
}

function drawAxes(length) {
  var axes = new THREE.AxesHelper(length);
  scene.add(axes);
}


window.onload = initApp();

// /\/\/\/\/\/\/\/\  initial scene  /\/\/\/\/\/\/\/\
function initApp() {
  if(webGLExists === true) {
    addEnterPressListener();
    createRenderer();
    createInitialScene();
    // drawAxes(100);
    createInitialPerspectiveCamera();
    createGLTFLoader();
    createFontLoader();
    animateScene();
  } else if(webGLExists === false) {
    alert("Your browser doesn't support WebGL.");
  }
}

function createInitialScene() {
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  scene.add(new THREE.PointLight(0xffffff, 1));
}

function createInitialPerspectiveCamera() {
  camera = new THREE.PerspectiveCamera(35, canvasWidth / canvasHeight, 0.1, 1000);
  camera.position.set(-100, 50, 270);
  camera.lookAt(scene.position);
}

function createGLTFLoader() {
  arcadeLoader = new THREE.GLTFLoader();
  arcadeLoader.load('./3dmodel/scene.gltf', handleGLTGFile);
}

function handleGLTGFile(gltf) {
  arcadeMesh = gltf.scene;
  arcadeMesh.children[0].material = new THREE.MeshLambertMaterial();
  scene.add(arcadeMesh);
  arcadeMesh.position.set(2, 0, -100);
}

function createFontLoader() {
  fontLoader = new THREE.FontLoader();
  fontLoader.load('./fonts/8-bit.json', handleEnterFont);
  fontLoader.load('./fonts/crackman.json', handlePacmanFont);
}

function handleEnterFont(font) {
  var playText = [
    new THREE.TextGeometry("press", {
      font,
      size: 10,
      height: 10
    }),
    new THREE.TextGeometry("ENTER", {
      font,
      size: 18,
      height: 10
    }),
    new THREE.TextGeometry("to start", {
      font,
      size: 10,
      height: 10
    }),
  ];

  fontMesh.push(
    new THREE.Mesh(playText[0], new THREE.MeshPhongMaterial({color: 0xffff00})),
    new THREE.Mesh(playText[1], new THREE.ShaderMaterial({
      vertexShader: vertexShaderEnter, 
      fragmentShader: fragmentShaderEnter,
      uniforms: uniformsEnter, 
      lights: false
    })),
    new THREE.Mesh(playText[2], new THREE.MeshPhongMaterial({color: 0xffff00}))
  );
  fontMesh[0].position.set(-100, -40, 0);
  fontMesh[1].position.set(-25, -40, 0);
  fontMesh[2].position.set(-35, -50, 20);
  scene.add(fontMesh[0], fontMesh[1], fontMesh[2]);
}

function handlePacmanFont(font) {
  var pacmanText = new THREE.TextGeometry("pac-man", {font, size: 10, height: 10});

  fontMesh.push(new THREE.Mesh(pacmanText, new THREE.MeshPhongMaterial({color: 0x0000ff})));
  fontMesh[3].position.set(35, -2, -5);
  scene.add(fontMesh[3]);
}

function addEnterPressListener() {
  document.body.addEventListener('keypress', passToNextScene);
}

function passToNextScene(e) {
  if(e.key === 'Enter') {
    enterPressed = true;
    while(scene.children.length > 0)  
      scene.remove(scene.children[0]); 
    initGame();
    document.body.removeEventListener('keypress', passToNextScene);

    var audioLoader = new THREE.AudioLoader();
    if (!muted)
      audioLoader.load('sounds/pacman_beginning.wav', function(buffer) {
        sound.setBuffer(buffer);
        sound.setVolume(0.5);
        sound.play();
      });
  }
}

// /\/\/\/\/\/\/\/\  game scene  /\/\/\/\/\/\/\/\
function initGame() {
  if(webGLExists === true) {
    createGameScene();
    // drawAxes(15);
    // createGamePerspectiveCamera();
    createFirstPersonCamera();
    keys = createKeyState(); 
    map = createMap(LEVEL);
    pacman = createPacman(map.pacmanSkeleton);
    createSoundIcon();
    addOnClickSoundIcon();
    createLifesCounter();
    createGameScore();
    animateScene();
  } else if(webGLExists === false) {
    alert("Your browser doesn't support WebGL.");
  }
}

function reloadGame() {
  while(scene.children.length > 0) 
    scene.remove(scene.children[0]);
  
  ghosts.map(ghost => toRemove.push(ghost));
  removeObjAtMap();
  ghosts = [];

  removeInfosGameScore();
  removeInfosLifesCounter();
  
  won = false;
  lost = false;
  wonTime = 0;
  lostTime = 0;
  lifesCounter = 3;
  gameScore = 0;
  numGhosts = 0;
  ghostCreationTime = -8;
  numDotsEaten = 0;
  
  createGameScene();
  map = createMap(LEVEL);
  pacman = createPacman(map.pacmanSkeleton);
  createGameScore();
  createLifesCounter();
  animateScene();
}

function createGameScene() {
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0x888888));
  var light = new THREE.SpotLight('white', 0.5);
  light.position.set(0, 0, 50);
  scene.add(light);
}

function createGamePerspectiveCamera() {
  cameraFP = false;
  camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 100);
  
  camera.targetPosition = new THREE.Vector3();
  camera.targetLookAt = new THREE.Vector3();
  camera.lookAtPosition = new THREE.Vector3();
}

function updateGamePerspectiveCamera() {
  camera.targetPosition.set(map.centerX, map.centerY, 30);
  camera.targetLookAt.set(map.centerX, map.centerY, 0);

  var cameraSpeed = 10;
  camera.position.lerp(camera.targetPosition, delta * cameraSpeed);
  camera.lookAtPosition.lerp(camera.targetLookAt, delta * cameraSpeed);
  camera.lookAt(camera.lookAtPosition);

  var angleToRotate = (Math.atan(pacman.direction.y / pacman.direction.x)) - Math.PI/2;
  if (pacman.direction.x >= 0 && pacman.direction.y >= 0)
    camera.rotation.z += angleToRotate;
  else if (pacman.direction.x <= 0 && pacman.direction.y >= 0)
    camera.rotation.z += angleToRotate + Math.PI;
  else if (pacman.direction.x <= 0 && pacman.direction.y <= 0)
    camera.rotation.z += angleToRotate + Math.PI;
  else if (pacman.direction.x >= 0 && pacman.direction.y <= 0)
    camera.rotation.z += angleToRotate + 2*Math.PI;
}

function createFirstPersonCamera() {
  cameraFP = true;
  camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 100);
  camera.up.copy(UP);
  camera.targetPosition = new THREE.Vector3();
  camera.targetLookAt = new THREE.Vector3();
  camera.lookAtPosition = new THREE.Vector3();

  var listener = new THREE.AudioListener();
  camera.add(listener);
  sound = new THREE.Audio(listener);
}

function updateFirstPersonCamera() {
  if (won) {
    camera.targetPosition.set(map.centerX, map.centerY, 30);
    camera.targetLookAt.set(map.centerX, map.centerY, 0);
  } else if (lost) {
    camera.targetPosition = pacman.position.clone().addScaledVector(UP, 4);
    camera.targetLookAt = pacman.position.clone().addScaledVector(pacman.direction, 0.01);
  } else {
    camera.targetPosition.copy(pacman.position).addScaledVector(UP, 1.5).addScaledVector(pacman.direction, -1);
    camera.targetLookAt.copy(pacman.position).add(pacman.direction);
  }

  var cameraSpeed = (lost || won) ? 1 : 10;
  camera.position.lerp(camera.targetPosition, delta * cameraSpeed);
  camera.lookAtPosition.lerp(camera.targetLookAt, delta * cameraSpeed);
  camera.lookAt(camera.lookAtPosition);
}

function changeCameraView() {
  if (keys['C']) {
    if (!cancelChangeCamera) {
      if (cameraFP) createGamePerspectiveCamera();
      else createFirstPersonCamera();
      cancelChangeCamera = true;
    }
  } else cancelChangeCamera = false;
}

function createSoundIcon() {
  var soundIconContainer = document.getElementById('sound-icon');
  var icon = document.createElement('img');
  icon.src = './images/sound1.svg';
  icon.className = 'icon-img';
  soundIconContainer.appendChild(icon);
}

function addOnClickSoundIcon() {
  document.getElementById('sound-icon').addEventListener('click', changeSoundIcon);
}

function changeSoundIcon() {
  var iconImg = document.getElementsByClassName('icon-img')[0];
  const nameIcon = iconImg.src.slice(iconImg.src.length - 10, iconImg.src.length);
  const newIcon = nameIcon === 'sound1.svg' ? './images/sound2.svg' : './images/sound1.svg';
  iconImg.src = newIcon;
  
  if (!cancelMuted) {
    if (muted) muted = false;
    else muted = true;
    cancelMuted = true;
  }
}

function createGameScore() {
  var gameScoreContainer = document.getElementById('game-score');
  var gameScoreText = document.createElement('span');
  gameScoreText.innerHTML = "GAME SCORE";
  gameScoreContainer.appendChild(gameScoreText);
  var gameScoreValue = document.createElement('span');
  gameScoreValue.className = 'score';
  gameScoreValue.innerHTML = gameScore;
  gameScoreContainer.appendChild(gameScoreValue);
}

function removeInfosGameScore() {
  var divGameScore = document.getElementById('game-score');
  divGameScore.parentNode.removeChild(divGameScore);
  var newGameScore = document.createElement('div');
  newGameScore.setAttribute('id', 'game-score');
  document.getElementById('pacman-3d').appendChild(newGameScore);
}

function updateGameScore(value) {
  gameScore += value;
  document.getElementById('game-score').getElementsByClassName('score')[0].innerHTML = gameScore;
}

function createLifesCounter() {
  var lifesCounterContainer = document.getElementById('lifes-counter');
  for (var i = 0; i < lifesCounter; i++) {
    var life = document.createElement('img');
    life.src = './images/pacman.png';
    life.className = 'life';
    lifesCounterContainer.appendChild(life);
  }
}

function removeInfosLifesCounter() {
  var divLifesCounter = document.getElementById('lifes-counter');
  divLifesCounter.parentNode.removeChild(divLifesCounter);
  var newLifesCounter = document.createElement('div');
  newLifesCounter.setAttribute('id', 'lifes-counter');
  document.getElementById('pacman-3d').appendChild(newLifesCounter);
}

function updateLifesCounter() {
  if (lifesCounter > 0) {
    lifesCounter -= 1;
    document.getElementsByClassName('life')[lifesCounter].style.display = 'none';
  }
}

function createMap(levelDef) {
  var map = {};
  map.bottom = 1 - levelDef.length;
  map.top = 0;
  map.left = 0;
  map.right = 0;
  map.numDots = 0;
  map.pacmanSkeleton = null;
  map.ghostSkeleton = null;

  var x, y;
  for (var row = 0; row < levelDef.length; row++) {
    y = -row;
    map[y] = {};

    var length = Math.floor(levelDef[row].length / 2);
    map.right = Math.max(map.right, length);

    for (var column = 0; column < levelDef[row].length; column += 2) {
      x = Math.floor(column / 2);
      var cell = levelDef[row][column];
      var object = null;

      if (cell === '#')
        object = createWallMaze();
      else if (cell == 'o')
        object = createBigDot();
      else if (cell == '.') {
        map.numDots += 1;
        object = createDot();
      } else if (cell === 'P')
        map.pacmanSkeleton = new THREE.Vector3(x, y, 0);
      else if (cell === 'G') 
        map.ghostSkeleton = new THREE.Vector3(x, y, 0);

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

function fixObjectLimit(obj, map) {
  if (obj.position.x < map.left)
    obj.position.x = map.right;
  else if (obj.position.x > map.right)
    obj.position.x = map.left;

  if (obj.position.y > map.top)
    obj.position.y = map.bottom;
  else if (obj.position.y < map.bottom)
    obj.position.y = map.top;
}

function getObjAtMap(map, pos) {
  var x = Math.round(pos.x);
  var y = Math.round(pos.y);

  return map[y] && map[y][x];
}

function makeInvisibleObjAtMap(map, pos) {
  var x = Math.round(pos.x);
  var y = Math.round(pos.y);

  if (map[y] && map[y][x]) 
    map[y][x].visible = false;
}

function removeObjAtMap() {
  toRemove.forEach(scene.remove, scene);
  toRemove.map(item => {
    if (toRemove.hasOwnProperty(item)) {
      scene.remove(toRemove[item]);
      delete toRemove[item];
    }
  });
}

function createWallMaze() {
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshPhongMaterial({ color: colorWall });
  var wall = new THREE.Mesh(geometry, material);
  wall.isWall = true;

  return wall;
}

function isWall(map, pos) {
  var obj = getObjAtMap(map, pos);
  return obj && obj.isWall === true; 
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
  
  pacman.frames = pacmanGeometries;
  pacman.position.copy(skeleton);
  pacman.direction = new THREE.Vector3(-1, 0, 0);
  pacman.distanceMoved = 0;
  pacman.hasLimit = true;
  pacman.ateBigDot = false;

  scene.add(pacman);
  return pacman;
}

function createGhost(skeleton, color) {
  const { z } = skeleton;
  var heightCylinder = GHOST_RADIUS;
  var material = new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide });

  var geomSemisphere = new THREE.SphereGeometry(GHOST_RADIUS, 40, 40, 0, Math.PI);
  var objSemisphere = new THREE.Mesh(geomSemisphere, material);
  objSemisphere.position.z = z + heightCylinder / 2;
  
  var geomCylinder = new THREE.CylinderGeometry(GHOST_RADIUS, GHOST_RADIUS, heightCylinder, 40);  
  var objCylinder = new THREE.Mesh(geomCylinder, material);
  objCylinder.rotateX(Math.PI / 2);

  var ghost = new THREE.Group();
  ghost.add(objSemisphere, objCylinder);
  ghost.position.copy(skeleton);
  ghost.direction = new THREE.Vector3(-1, 0, 0);
  ghost.hasLimit = true;
  ghost.isAfraid = false;

  scene.add(ghost);
  return ghost;
}

function createDot() {
  var coinGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 30).rotateX(Math.PI / 2);
  var texture = new THREE.TextureLoader().load("textures/coin_texture.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  var coinMaterial = new THREE.MeshLambertMaterial({ map: texture });
  var dot = new THREE.Mesh(coinGeometry, coinMaterial);
  dot.isDot = true;

  return dot;
}

function createBigDot() {
  let geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  let material = new THREE.ShaderMaterial({
    vertexShader: vertexShaderBigDot,
    fragmentShader: fragmentShaderBigDot,
    uniforms: uniformsBigDot,
  });
  let bigDot = new THREE.Mesh(geometry, material);
  bigDot.isBigDot = true;

  return bigDot;
}

function animateMouthPacman() {
  const framesInterval = 5;
  const qtOfAngles = 10;

  if (frames % framesInterval === 0) {
    scene.remove(pacman);
    pacman.geometry = pacman.frames[angleMouthIdx];
    scene.add(pacman);
    if (angleMouthIdx === 0) {
      signalPacman = 1;
    } else if (angleMouthIdx === qtOfAngles) {
      signalPacman = -1;
    }
    angleMouthIdx += signalPacman;
  }
}

function animateFloatGhost(ghost) {
  const framesInterval = 10;
  const deltaY = 0.2;

  if (frames % framesInterval === 0) {
    posYGhost = Math.round((posYGhost + signalGhost * 0.05) * 100) / 100;
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

function movePacman() {
  pacman.up.copy(pacman.direction).applyAxisAngle(UP, -Math.PI / 2);
  _lookAt = pacman.position.clone();
  pacman.lookAt(_lookAt.add(UP));

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

  var leftSide = pacman.position.clone().addScaledVector(LEFT, PACMAN_RADIUS).round();
  var rightSide = pacman.position.clone().addScaledVector(RIGHT, PACMAN_RADIUS).round();
  var topSide = pacman.position.clone().addScaledVector(TOP, PACMAN_RADIUS).round();
  var bottomSide = pacman.position.clone().addScaledVector(BOTTOM, PACMAN_RADIUS).round();

  if (isWall(map, leftSide)) 
    pacman.position.x = leftSide.x + 0.5 + PACMAN_RADIUS;
  if (isWall(map, rightSide)) 
    pacman.position.x = rightSide.x - 0.5 - PACMAN_RADIUS;
  if (isWall(map, topSide)) 
    pacman.position.y = topSide.y - 0.5 - PACMAN_RADIUS;
  if (isWall(map, bottomSide)) 
    pacman.position.y = bottomSide.y + 0.5 + PACMAN_RADIUS;

  var obj = getObjAtMap(map, pacman.position);
  if (obj && obj.isDot === true && obj.visible === true) {
    makeInvisibleObjAtMap(map, pacman.position);
    numDotsEaten += 1;
    updateGameScore(5);

    var audioLoader = new THREE.AudioLoader();
    if (!muted)
      audioLoader.load('sounds/pacman_eatfruit.wav', function(buffer) {
        sound.setBuffer(buffer);
        sound.setVolume(0.5);
        //sound.stop();
        sound.play();
      });
  }
  pacman.ateBigDot = false;
  if (obj && obj.isBigDot === true && obj.visible === true) {
    makeInvisibleObjAtMap(map, pacman.position);
    pacman.ateBigDot = true;
    updateGameScore(10);

    var audioLoader = new THREE.AudioLoader();
    if (!muted)
      audioLoader.load('sounds/pacman_intermission.wav', function(buffer) {
        sound.setBuffer(buffer);
        sound.setVolume(0.5);
        sound.stop();
        sound.play();
      });
  }
}

function updatePacman(now) {
  if (!won && !lost)
    movePacman();

  if (!won && numDotsEaten === map.numDots) {
    won = true;
    wonTime = now;
    console.log('[GAME] YOU WON!');
  }
  
  if (won && now - wonTime > 3) 
    reloadGame();

  if (lost && lifesCounter > 0 && now - lostTime > 3) {    
    lost = false;
    pacman.position.copy(map.pacmanSkeleton);
    pacman.direction.copy(LEFT);
    pacman.distanceMoved = 0;     
  }

  if (lost) {
    var angle = (now - lostTime) * Math.PI / 2;
    var frame = Math.min(pacman.frames.length - 1, Math.floor(angle / Math.PI * pacman.frames.length));

    pacman.geometry = pacman.frames[frame];
  } 
}

function createKeyState() {
  var keyState = {};

  document.body.addEventListener('keydown', onDocumentKeyDown, false);
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

function showGhostAtMap(now) {
  if (numGhosts >= 0 && numGhosts < 4 && now - ghostCreationTime > 8) {
    ghosts.push(createGhost(map.ghostSkeleton, colorsGhost[numGhosts]));
    numGhosts += 1;
    ghostCreationTime = now;
  } 
}

function moveGhost(ghost) {
  var previousPosition = new THREE.Vector3();
  var currentPosition = new THREE.Vector3();
  var leftTurn = new THREE.Vector3();
  var rightTurn = new THREE.Vector3();
  
  previousPosition.copy(ghost.position).addScaledVector(ghost.direction, 0.5).round();
  ghost.translateOnAxis(ghost.direction, delta * GHOST_SPEED);
  currentPosition.copy(ghost.position).addScaledVector(ghost.direction, 0.5).round();

  if (!currentPosition.equals(previousPosition)) {
    leftTurn.copy(ghost.direction).applyAxisAngle(UP, Math.PI / 2);
    rightTurn.copy(ghost.direction).applyAxisAngle(UP, -Math.PI / 2);

    var forwardWall = isWall(map, currentPosition);
    var leftWall = isWall(map, currentPosition.copy(ghost.position).add(leftTurn));
    var rightWall = isWall(map, currentPosition.copy(ghost.position).add(rightTurn));

    if (!leftWall || !rightWall) {
      var possibleTurns = [];
      if (!forwardWall) possibleTurns.push(ghost.direction);
      if (!leftWall) possibleTurns.push(leftTurn);
      if (!rightWall) possibleTurns.push(rightTurn);

      var newDirection = possibleTurns[Math.floor(Math.random() * possibleTurns.length)];
      ghost.direction.copy(newDirection);

      ghost.position.round().addScaledVector(ghost.direction, delta);
    }
  }
}

function updateGhost(ghost, idxGhost, now, frames) {
  moveGhost(ghost);
  animateFloatGhost(ghost);

  if (frames % 50 === 0) {
    whoAte = [];
  }

  if (pacman.ateBigDot === true) {
    ghost.isAfraid = true;
    ghost.becameAfraidTime = now;
    ghost.children[0].material.color = new THREE.Color(0xFFFFFF);
    ghost.children[1].material.color = new THREE.Color(0xFFFFFF);
  }

  if (ghost.isAfraid && now - ghost.becameAfraidTime > 10) {
    ghost.isAfraid = false;
    ghost.children[0].material.color = new THREE.Color(colorsGhost[idxGhost]);
    ghost.children[1].material.color = new THREE.Color(colorsGhost[idxGhost]);
  }

  var difference = new THREE.Vector3();
  difference.copy(pacman.position).sub(ghost.position);

  if (!lost && !won && difference.length() < PACMAN_RADIUS + GHOST_RADIUS) {
    if (ghost.isAfraid === true) {
      var toRemoveFiltered = toRemove.filter(item => item === ghost);
      if (toRemoveFiltered.length === 0) {
        numGhosts -= 1;
        toRemove.push(ghost);
      }
    } else {
      var whoAteFiltered = whoAte.filter(item => item === ghost);
      if (whoAteFiltered.length === 0) {
        updateLifesCounter();
        whoAte.push(ghost);

        var audioLoader = new THREE.AudioLoader();
        if (!muted)
          audioLoader.load('sounds/pacman_death.wav', function(buffer) {
            sound.setBuffer(buffer);
            sound.setVolume(0.5);
            sound.stop();
            sound.play();
    }     );
      }
      
      lost = true;
      lostTime = now;

      if (lost && lifesCounter > 0) {
        console.log('[GAME] YOU DIED!');
      }
      else {
        console.log('[GAME] GAME OVER!');
        reloadGame();
      }
    }
  }
}

// /\/\/\/\/\/\/\/\  general animate scene  /\/\/\/\/\/\/\/\
function animateScene() {
  requestAnimationFrame(animateScene);

  frames += 1;
  
  if (enterPressed === false) {
    uniformsEnter.u_time.value = clock.getElapsedTime();

    if (arcadeMesh) {
      if (arcadeMesh.rotation.y > - 0.2 && arcadeRotation === 'right') {
        arcadeMesh.rotation.y -= 0.005;
      } else {
        arcadeRotation = 'left';
        if (arcadeMesh.rotation.y < 0.2 && arcadeRotation === 'left') {
          arcadeMesh.rotation.y += 0.005;
        } else {
          arcadeRotation = 'right';
        }
      }
    }
  } else {
    var now = window.performance.now() / 1000;
    cancelMuted = false;

    if (cameraFP) updateFirstPersonCamera();
    else updateGamePerspectiveCamera();
    changeCameraView();
    animateMouthPacman();
    showGhostAtMap(now);
    updatePacman(now);

    scene.children.forEach(obj => {
      if (obj.hasLimit === true)
        fixObjectLimit(obj, map);
    });
    
    ghosts.map((ghost, idx) => updateGhost(ghost, idx, now, frames));

    removeObjAtMap();
  }

  renderer.render(scene, camera);
};