## :computer: **Projeto**
> Alunos: Gabriel Crestani e Rafaella Bambokian - COMP21

Jogo PacMan 3D, na linguagem JavaScript - com base na biblioteca [Three.js](https://threejs.org/) - desenvolvido como projeto para a matéria CCI-36: Fundamentos de Computação Gráfica.

**Para acessar a demo, [clique aqui](https://bambokianr.github.io/pacman-threejs/).**

![til](./pacmangif_tarefa1.gif)
_Resultado da Tarefa 1_

![til](./pacmangif_tarefa2.gif)
_Resultado da Tarefa 2_


### :one: Tarefa 1
Nesta primeira parte do projeto - Tarefa 1, objetivou-se, inicialmente, familiarizar-se com a biblioteca Three.js e suas funcionalidades para além da linguagem JavaScript. Após isso, a fim de aplicar os conceitos aprendidos, utilizou-se o já tradicional jogo Pacman para realizarmos implementações em tópicos relacionados à disciplina de Computação Gráfica, focando principalmente na construção 3D do cenário e dos objetos, mais do que na lógica do jogo em si.
Com isso, este trabalho, em sua primeira etapa, procurou apresentar implementações de geometrias simples como esferas, cilindros e paralelepípedos (utilizando-se, também, agrupamentos na forma de hierarquia), movimentos de objetos como translação e rotação, implementação de dois tipos de câmeras (uma câmera "livre" e uma "fixa" sobre o pacman) e, por fim, implementação de algumas interações com o usuário (movimento da câmera livre e movimento do pacman).

Abaixo, cada função é detalhada tecnicamente a fim de explicar a construção da geometria do modelo, a definição do posicionamento da câmera e a variação no tempo de animação.

-- **`function initApp()`**
Verifica se é possível renderizar o projeto no browser a partir do detector `Detector.webgl`. Caso seja possível, inicializa todas as funções responsáveis pelo correto funcionamento do modelo quando a janela do browser é carregada - a partir de `window.onload = initApp()`. 
_WebGL_ é uma api que permite criar contextos 3D no browser. Processa os códigos (3D) dentro da GPU e permite ser visualizado via canvas no HTML5.

-- **`function createScene()`**
Cria a cena para adicionar posteriormente todos os objetos do modelo. 
Foi adicionada iluminação - `THREE.AmbientLight` e `THREE.SpotLight` - para testar o funcionamento correto de 'mesh materials' (se são afetados pela refletância).

-- **`function createRenderer()`**
'Renderer' é quem renderiza a cena e a(s) câmera(s) no browser através do canvas.
```js
// Adiciona 'renderer' na árvore de elementos HTML - em <div id="pacman-3d">
document.getElementById(id).appendChild(renderer.domElement);
```

-- **`function drawAxes(length)`**
Função auxiliar para desenvolvimento do modelo. Adiciona os eixos cartesianos tendo como parâmetro de entrada o comprimento deles.

-- **`function createPerspectiveCamera()`**
Adicionando câmera que usa projeção em perspectiva. A partir de 'controls', é possível navegar pela cena do modelo pacman 3D.
```js
controls = new THREE.OrbitControls(camera, renderer.domElement);
```

-- **`function createFirstPersonCamera()`**
Adiciona uma câmera posicionada logo atrás do pacman e o acompanha nos seus movimentos de deslocamento para frente e para trás, rotação para esquerda e para direita.

-- **`function updateFirstPersonCamera()`**
Função chamada para atualizar a posição da câmera quando o pacman realiza algum movimento.

-- **`function changeCameraView()`**
Implementação inicial para alternar entre os dois modos de visualização permitidos para a cena - pressionando a tecla 'c', é possível navegar entre a câmera perspectiva e a câmera em visão primeira pessoa.

-- **`function createMap(levelDef)`**
A partir de uma matriz como parâmetro de entrada é possível construir em cena os objetos sabendo suas respectivas posições.
> '#' - representa a parede do labirinto

> 'G' - representa o fantasma

> 'P' - representa o pacman

> '.' - representa a comida menor

> 'o' - representa a comida maior

Assim, é gerada a posição de cada objeto dada a sua posição na matriz e a função de criação do respectivo objeto é chamada, sendo adicionado tanto em cena quando na variável 'map' que representa a estrutura geral de dados do jogo. 

-- **`function createPacman(skeleton)`**
O pacman é definido por um conjunto de geometrias que são variadas a fim de garantir a animação da abertura e fechamento da boca do objeto. Assim, são definidos 40 frames, tal que 10 desses representam a animação já descrita. 
As geometrias são esferas com ângulos de abertura variáveis salvas no vetor 'pacmanGeometries'.
A posição do pacman é definida por 'P' na matriz que define o mapa do jogo.

-- **`function createGhost(skeleton, color)`**
Cada 'G' na matriz que define o mapa chama essa função, que cria o objeto fantasma como um agrupamento de um cilindro com uma semiesfera. Com esse 'THREE.Group', é possível alterar a posição do grupo no espaço que garante a animação do objeto completo. 

-- **`function createDot()`**
Cada '.' na matriz que define o mapa do jogo representa uma esfera de raio `DOT_RADIUS` que compõe o labirinto. 

-- **`function createBigDot()`**
Cada 'o' na matriz que define o mapa do jogo representa uma esfera de raio `3*DOT_RADIUS` que compõe o labirinto. 

-- **`function animateMouthPacman()`**
A cada 5 frames, é executada a função que adiciona na cena um novo pacman com uma geometria presente no vetor 'pacmanGeometries' após se remover da cena o objeto pacman anterior. A partir da variável 'angleMouthIdx', é calculado o ângulo de abertura da boca.


-- **`function animateFloatGhost(ghost)`**
A cada 10 frames, é executada a função que varia a posição em y de cada fantasma. Semelhante à animação do pacman, o objeto fantasma é removido para a inserção de um novo em uma posição acrescida ou descrescida de deltaY de position.y anterior.

-- **`function movePacman()`**
Analisa os estados das "keys" e identifica se uma das teclas W, A, S ou D está sendo pressionada e aplica um movimento (translação ou rotação em determinado sentido) de acordo com a tecla pressionada.

-- **`function createKeyState()`**
Adiciona 3 "EventListener" ao "document.body" do projeto, verificando quando uma tecla é pressionada e quando ela liberada. Retorna os estados das teclas, atribuindo "true" para teclas pressionadas e "false" para teclas não pressionadas.

-- **`function animateScene()`**
A função animateScene chama 'requestAnimationFrame', tal que assim a cada frame chama as funções que estão indicadas são re-renderizadas em cena, dando uma ideia de que a animação está acontecendo.

### :two: Tarefa 2
Para a segunda parte do projeto, os seguintes objetivos foram definidos:
 - importação de modelos prontos em 3D
 - mapeamento de texturas, a partir da definição de _wrapping_
 - implementação de shader em GLSL, a partir da utilização de _uniforms_

A fim de cumprir com os tópicos acima propostos, optou-se por criar uma tela inicial para o jogo Pacman definindo uma cena virtual realista em Three.js. Ausência de erros de geometria, noções de sombreamento, de texturas e de posicionamento adequado das fontes luz foram levados em conta e priorizados durante essa implementação.

Dado o desenvolvimento da nova cena do jogo, foram necessárias alterações básicas na estrutura de renderização, agora partindo de uma simples lógica mostrada abaixo.
```js
function initApp() {
  if(webGLExists === true) {
    addEnterPressListener();
    ...
  }
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

// Ao carregar a janela do navegador, a cena proposta para a tela inicial é construída
// Caso a tecla 'Enter' seja pressionada, a cena inicial é removida e a cena do jogo é então renderizada
window.onload = initApp();
```

A seguir, são descritas as novas funções adicionadas a fim de complementar o código até então implementado para cumprir com os requisitos propostos na Tarefa 2.

-- **`function createGLTFLoader()`** && -- **`function handleGLTGFile(gltf)`** O loader carrega [este modelo 3D](https://sketchfab.com/3d-models/ms-pac-man-arcade-24f9ac126fb24e27b98e9dc7db4a79f9) encontrado para download em [Sketchfab](https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount). Foi escolhido o formato glTF, uma vez que é focado na entrega do modelo em tempo de execução, é compacto para transmissão e também rápido em seu carregamento. A função callback 'handleGLTGFile' aplica o material definido, adiciona à cena e posiciona o objeto.

-- **`function createFontLoader()`** && -- **`function handleEnterFont(font)`** && -- **`function handlePacmanFont(font)`**
No primeiro método citado, `fontLoader.load` carrega as fontes em formato JSON e aciona as respectivas funções callback 'handleEnterFont' e 'handlePacmanFont', onde são definidos os textos a partir de `THREE.TextGeometry`, os materiais para os 'mesh' e o posicionamento final em cena de "press ENTER to start" e "pacman" respectivamente.

-- **`function createDot()`** 
Esta função foi alterada com o objetivo de introduzir um mapeamento de texturas. Primeiro, foi alterada a geometria do objeto para cilíndrica, a fim de parece mais com uma moeda. Após isso, fez-se o downlaod de uma imagem de textura e, através de THREE.RepeatWrapping, utilizou-se tal textura definindo wrapping.

-- **`function createBigDot()`**
Mudou-se o formato do objeto para um cubo. Assim, definiu-se as functions vertexShader2() (aqui calcula-se onde os pontos do nosso mesh deverão ser colocados) e fragmentShader2() (função que será aplicada em cada fragmento do mesh para colori-los), sendo o código GLSL escrito dentro de uma string, e a variavel uniforms para criar o objeto THREE.ShaderMaterial().

### :three: Tarefa 3
A conclusão do projeto foi realizada nessa tarefa, onde foi dada continuidade para a implementação do jogo PacMan propriamente dito, a partir da reutilização das cenas construídas em Three.JS nas atividades anteriores. A lógica desenvolvida seguiu a proposta do jogo oficial - a interação principal se dá a partir do movimento do objeto pacman a partir das teclas A/D - rotações a esquerda e a direita - e W/S - deslocamentos para frente e para trás. Além disso, é possível controlar os sons adicionados ao jogo (mutá-los ou não a partir de um ícone clicável em tela) e também alternar o posicionamento da câmera entre uma visão em primeira pessoa - FPV e uma visão superior de todo o labirinto.

Além de conceitos da biblioteca Three.JS, muitos conceitos de JavaScript foram estudados e aplicados para a finalização da ideia proposta inicialmente para o projeto. 

Abaixo foram adicionados comentários tanto sobre as novas funções criadas quanto sobre as funções já existentes, porém modificadas nessa última tarefa.

-- **`function reloadGame()`** 
Função chamada sempre que `lost === true && lifesCounter === 0` ou `won === true && numDotsEaten === map.numDots`. Remove todos os objetos da cena de jogo e os reconstrói novamente para iniciar uma nova partida, chamando também a função `animateScene`, responsável pela atualização dos frames em cena. Também redefine as variáveis do jogo.

-- **`function createGamePerspectiveCamera()`** 
Alteração na implementação inicial da câmera perspectiva. Traz uma vista superior de todo o jogo, contemplando o labirinto completo. São definidos alguns atributos para a variável `camera` - `targetPosition`, `targetLookAt` e `lookAtPosition` - como vetores 3D a serem modificados no método `updateGamePerspectiveCamera` explicado a seguir. 
Obs: Os `controls`, definidos por `OrbitControls`, foram retirados para facilitar o posicionamento da câmera para o usuário.

-- **`function updateGamePerspectiveCamera()`** ????? 

-- **`function createFirstPersonCamera()`** 
Foi incrementado `listener = new THREE.AudioListener()` à `camera` para que fosse viável declarar `sound = new THREE.Audio(listener)` como variável a ser utilizada no decorrer de todo o código. Assim, foi possível acrescentar sons que caracterizassem ações particulares durante o jogo - todas mencionadas nas funções a seguir.

-- **`function updateFirstPersonCamera()`** 
Função já mencionada anteriormente. No entanto, ela foi aprimorada para cobrir os casos definidos abaixo.
Ao vencer, ou seja, se `won === true`, a câmera é deslocada para uma posição final, mostrando o mapa a partir de uma vista superior. 
```js
camera.targetPosition.set(map.centerX, map.centerY, 30);
camera.targetLookAt.set(map.centerX, map.centerY, 0);
```

Em caso de perda, ou seja, se `lost === false`, move-se a câmera de forma a mostrar o pacman e uma pequena área ao seu redor vistos superiormente.
```js
camera.targetPosition = pacman.position.clone().addScaledVector(UP, 4);
camera.targetLookAt = pacman.position.clone().addScaledVector(pacman.direction, 0.01);
```

O movimento da câmera (uso do método `lerp`), de sua posição no momento em que acontece `won === true` ou `lost === false` até a posição final definida nas descrições acima, acontece com uma velocidade mais lenta do que o movimento padrão (durante o jogo com o pacman) - `cameraSpeed = (lost || won) ? 1 : 10`.

-- **`function createSoundIcon()`** 
Função que adiciona à `div` com 'id' #sound-icon presente no código HTML uma tag `img` com atributo 'src' correspondente ao path que carrega o ícone de 'sound on' na tela principal do jogo. 

-- **`function addOnClickSoundIcon()`** 
A partir do código mencionado abaixo, é possível adicionar um escutador de eventos à `div`com id #sound-icon, para que esse chame o método `changeSoundIcon` sempre que houver um clique nesse elemento HTML. Função `addOnClickSoundIcon` chamada assim que a cena principal é carregada.
```js
document.getElementById('sound-icon').addEventListener('click', changeSoundIcon);
```

-- **`function changeSoundIcon()`** 
Adiciona um novo ícone em tela - 'sound on' ou 'sound off' a partir da modificação do atributo 'src' da tag `img` anteriormente mencionada. Também modifica a variável `muted` que controla por todo o código se os sons serão ou não carregados para determinadas ações. 

-- **`function createGameScore()`** && -- **`function createLifesCounter()`** 
Funções que inicializam o placar do jogo e a quantidade de vidas, respectivamente. A partir do JavaScript, são buscados os elementos correspondentes a partir do seu 'id' - #game-score e #lifes-counter - e inseridos então dinamicamente na árvore de elementos HTML - DOM. Assim, com o carregamento da cena, as `divs` correspondentes são rendezidas a partir do código dos métodos `createGameScore` e `createLifesCounter`.

-- **`function updateGameScore(value)`** 
Atualiza o score do jogo mostrado em tela após somar `value` à variável `gameScore`. A `div` com id #game-score tem seu innerHTML redefinido a partir do JavaScript.
```js
document.getElementById('game-score').getElementsByClassName('score')[0].innerHTML = gameScore;
```

-- **`function updateLifesCounter()`** 
Função chamada sempre que uma vida é perdida. Atualiza o número de vidas restantes do jogo mostrado em tela após decrementar 1 da variável `lifesCounter`. A `img` com classe .life criada dinamicamente em `createLifesCounter` tem seu estilo redefinido a partir do JavaScript.
```js
document.getElementsByClassName('life')[lifesCounter].style.display = 'none';
```

-- **`function removeInfosGameScore()`** && -- **`function removeInfosLifesCounter()`** 
Funções para remover as informações presentes nas `divs` com ids' #game-score e #lifes-counter, executadas no método `reloadGame`. A div com o id correspondente é removida dinamicamente com o método `parentNode.removeChild` com todas as suas tags filhas e recriadas ao fim a partir de `document.createElement`, inserindo-as na div pai com id #pacman-3d - com `appendChild`.

-- **`function fixObjectLimit(obj, map)`** 
Trata o limite da posição de um objeto caso ele ultrapasse a área do mapa. Assim como no jogo oficial do PacMan, a lógica do código faz com que o objeto em questão apareça do lado oposto exatamente no mesmo eixo da posição em que saiu de uma extremidade do mapa. 
Na função `animateScene` (re-renderização em cena dos métodos indicados a cada frame), `fixObjectLimit` é chamado para verificar se na cena algum objeto com propriedade `hasLimit` está fora dos limites definidos pelo mapa - a partir do código abaixo.
```js
function animateScene() {
  requestAnimationFrame(animateScene);
  
  //... alguns códigos omitidos 

  scene.children.forEach(obj => {
    if (obj.hasLimit === true)
      fixObjectLimit(obj, map);
  });

  renderer.render(scene, camera);
};
```
Obs: A propriedade `hasLimit` foi adicionada tanto ao 'pacman' quanto aos 'ghosts' - permite verificar se o objeto em questão pode ser mapeado pela função `fixObjectLimit`.

-- **`function getObjAtMap(map, pos)`** 
Retorna o objeto no mapa `map`, representado na posição `[y][x] = [Math.round(pos.y)][Math.round(pos.x)]`.

-- **`function makeInvisibleObjAtMap(map, pos)`** 
A partir do atributo `pos`, torna a propriedade `visible = false` do objeto no mapa para essa posição. Método utilizado para tornar os objetos dot e bigDot invisíveis assim que são comidos pelo objeto pacman.

-- **`function removeObjAtMap()`** ??????? 

-- **`function isWall(map, pos)`** 
Verifica se a posição `pos` como argumento é válida no mapa e retorna o objeto correpondente a partir da função `getObjAtMap`. Assim, é possível avaliar se o objeto `obj` é uma 'WallMaze' ao verificar a propriedade `obj.isWall`.

-- **`function movePacman()`** 
Função já mencionada em tarefa anterior, no entanto, novas implementações foram adicionadas. 

Para garantir que o movimento do pacman seja limitado apenas aos caminhos livres do labirinto, calculou-se a cada posição do objeto pacman suas extremidades e verificou-se se essas posições correspondem a paredes do labirinto.
```js
// posições periféricas (à esquerda, à direita, a frente e atrás) com base em sua posição central - pacman.position - e na adição de um vetor escalar com base no raio e na direção analisada
var leftSide = pacman.position.clone().addScaledVector(LEFT, PACMAN_RADIUS).round();
var rightSide = pacman.position.clone().addScaledVector(RIGHT, PACMAN_RADIUS).round();
var topSide = pacman.position.clone().addScaledVector(TOP, PACMAN_RADIUS).round();
var bottomSide = pacman.position.clone().addScaledVector(BOTTOM, PACMAN_RADIUS).round();

// verifica, a partir do método isWall() já descrito, se a posição correspondente se choca com um objeto 'wall' - se sim, mantém o pacman em uma posição que não a ultrapasse, simulando um bloqueio de passagem do objeto pacman
if (isWall(map, leftSide)) 
  pacman.position.x = leftSide.x + 0.5 + PACMAN_RADIUS;
if (isWall(map, rightSide)) 
  pacman.position.x = rightSide.x - 0.5 - PACMAN_RADIUS;
if (isWall(map, topSide)) 
  pacman.position.y = topSide.y - 0.5 - PACMAN_RADIUS;
if (isWall(map, bottomSide)) 
  pacman.position.y = bottomSide.y + 0.5 + PACMAN_RADIUS;
```

A partir da posição do pacman, foi examinado se existe algum objeto nessa mesma posição com `var obj = getObjAtMap(map, pacman.position)`. Caso `obj` seja dot ou bigDot, significa que o pacman está passando por esse objeto, ou seja, irá comê-lo.
```js
// verifica se o objeto retornado pela posição do pacman é dot e se ainda não foi comido
if (obj && obj.isDot === true && obj.visible === true) {
  // torna o objeto invisível e atualiza o score do jogo
  makeInvisibleObjAtMap(map, pacman.position);
  numDotsEaten += 1;
  updateGameScore(5);

  // código omitido - correspondente ao efeito sonoro
}
// atributo 'ateBigDot' permite deixar os fantasmas com medo, ou seja, definir como verdadeiro o atributo 'isAfraid' das variáveis ghost presentes no jogo - torna-os vulneráveis para serem comidos pelo pacman em um intervalo de tempo definido na função 'updateGhost'
pacman.ateBigDot = false;
// verifica se o objeto retornado pela posição do pacman é bigDot e se ainda não foi comido
if (obj && obj.isBigDot === true && obj.visible === true) {
  // torna o objeto invisível e atualiza o score do jogo
  makeInvisibleObjAtMap(map, pacman.position);
  pacman.ateBigDot = true;
  updateGameScore(10);

  // código omitido - correspondente ao efeito sonoro
}
```

-- **`function updatePacman(now)`** ???
Função que implementa as possíveis ações do pacman durante a partida.

-- **`function showGhostAtMap(now)`** 
Função que faz surgir um fantasma a cada intervalo de tempo definido até que se atinja a quantidade máxima de 4 fantasmas estipulada para o jogo. O mapa, representado na variável `LEVEL`, foi modificado para que exista apenas uma posição inicial de surgimento de um fantasma, salva então em `map.ghostSkeleton` assim que o método `createMap(LEVEL)` é executado. 
`showGhostAtMap` recebe como parâmetro a variável `now`, definida por `window.performance.now() / 1000` no método `animateScene`, ou seja, é o tempo transcorrido em segundos desde que o contexto de execução foi criado - desde que a cena do jogo foi carregada inicialmente.
Definindo inicialmente `ghostCreationTime = -8`, cada fantasma é então criado em intervalos de 8 segundos, seguindo a lógica abaixo.
```js
if (numGhosts >= 0 && numGhosts < 4 && now - ghostCreationTime > 8) {
  ghosts.push(createGhost(map.ghostSkeleton, colorsGhost[numGhosts]));
  numGhosts += 1;
  ghostCreationTime = now;
}
```

-- **`function moveGhost(ghost)`** ???? 

-- **`function updateGhost(ghost, now)`** ???? 