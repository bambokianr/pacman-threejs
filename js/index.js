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
var UP = new THREE.Vector3(0, 0, 1);
var LEFT = new THREE.Vector3(-1, 0, 0);
var TOP = new THREE.Vector3(0, 1, 0);
var RIGHT = new THREE.Vector3(1, 0, 0);
var BOTTOM = new THREE.Vector3(0, -1, 0);
var _lookAt = new THREE.Vector3();
var keys;
var delta = 0.02;
var cameraFP = true;
var cancelChangeCamera = false;
var lifesCounter = 3;
var gameScore = 0;
var numDotsEaten = 0;
var LEVEL = [
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
  '            P       #             #       .            ',
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
    // new THREE.Mesh(playText[1], new THREE.MeshPhongMaterial({color: 0xff0000})),
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
  }
}

// /\/\/\/\/\/\/\/\  game scene  /\/\/\/\/\/\/\/\
function initGame() {
  if(webGLExists === true) {
    createGameScene();
    // drawAxes(15);
    createGamePerspectiveCamera();
    keys = createKeyState(); 
    map = createMap(LEVEL);
    pacman = createPacman(map.pacmanSkeleton);
    map.ghostsSkeleton.map((ghostSkeleton, idx) => ghosts.push(createGhost(ghostSkeleton, colorsGhost[idx])));
    createLifesCounter();
    createGameScore();
    animateScene();
  } else if(webGLExists === false) {
    alert("Your browser doesn't support WebGL.");
  }
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
  camera = new THREE.PerspectiveCamera(60, canvasWidth / canvasHeight, 0.1, 100);
  camera.position.set(0, -40, 50);
  camera.lookAt(scene.position);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;
}

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

function changeCameraView() {
  if (keys['C']) {
    if (!cancelChangeCamera) {
      if (cameraFP) createGamePerspectiveCamera();
      else createFirstPersonCamera();
      cancelChangeCamera = true;
    }
  } else cancelChangeCamera = false;
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

function createLifesCounter() {
  var lifesCounterContainer = document.getElementById('lifes-counter');
  for (var i = 0; i < lifesCounter; i++) {
    var life = document.createElement('img');
    life.src = './pacman.png';
    life.className = 'life';
    lifesCounterContainer.appendChild(life);
  }
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
      x = Math.floor(column / 2);
      // x = Math.floor(column / 2) + (2 - levelDef.length/2);
      var cell = levelDef[row][column];
      var object = null;

      if (cell === '#') {
        object = createWallMaze();
      } else if (cell == 'o') {
        object = createBigDot();
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

var wrapObject = function (object, map) {
  if (object.position.x < map.left)
      object.position.x = map.right;
  else if (object.position.x > map.right)
      object.position.x = map.left;

  if (object.position.y > map.top)
      object.position.y = map.bottom;
  else if (object.position.y < map.bottom)
      object.position.y = map.top;
};

function getObjAtMap(map, pos) {
  var x = Math.round(pos.x);
  var y = Math.round(pos.y);

  return map[y] && map[y][x];
}

function removeObjAtMap(map, pos) {
  var x = Math.round(pos.x);
  var y = Math.round(pos.y);

  if (map[y] && map[y][x]) 
    map[y][x].visible = false;
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
  // console.log('obj', obj);
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
  
  pacman.isWrapper = true;

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

  var ghost = new THREE.Group();
  ghost.add(objSemisphere, objCylinder);

  ghost.isWrapper = true;

  scene.add(ghost);

  return ghost;
}

function createDot() {
  var coinGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 30).rotateX(Math.PI / 2);
  var texture = new THREE.TextureLoader().load("textures/coin_texture.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 4, 4 );
  var coinMaterial = new THREE.MeshLambertMaterial({ map: texture });
  var dot = new THREE.Mesh(coinGeometry, coinMaterial);
  dot.isDot = true;

  return dot;
}

function createBigDot() {
  let geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  let material =  new THREE.ShaderMaterial({
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

  // [TODO] - explicar essa parte no README.md
  var leftSide = pacman.position.clone().addScaledVector(LEFT, PACMAN_RADIUS).round();
  var topSide = pacman.position.clone().addScaledVector(TOP, PACMAN_RADIUS).round();
  var rightSide = pacman.position.clone().addScaledVector(RIGHT, PACMAN_RADIUS).round();
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
    removeObjAtMap(map, pacman.position);
    numDotsEaten += 1;
  }
  // pacman.atePellet = false;
  if (obj && obj.isBigDot === true && obj.visible === true) {
    removeObjAtMap(map, pacman.position);
    // pacman.atePellet = true;
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
    if (cameraFP)
      updateFirstPersonCamera();
    changeCameraView();
    animateMouthPacman();
    ghosts.map(ghost => animateFloatGhost(ghost));
    movePacman();

    scene.children.forEach(obj => {
      if (obj.isWrapper === true)
        fixObjectLimit(obj, map);
    });
  }

  renderer.render(scene, camera);
};