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
///// Comentando as funções que começaram a ser implementadas


-- **`function createGameScore()`** && -- **`function createLifesCounter()`** 
Funções que inicializam o placar do jogo e a quantidade de vidas, respectivamente. A partir do JavaScript, são buscados os elementos correspondentes a partir do seu 'id' - #game-score e #lifes-counter - e inseridos então dinamicamente na árvore de elementos HTML - DOM. Assim, com o carregamento da cena, as `divs` correspondentes são rendezidas a partir do código dos métodos `createGameScore` e `createLifesCounter`.

-- **`function updateGameScore(value)`** ???? 

-- **`function updateLifesCounter()`** ???? 

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

-- **`function isWall(map, pos)`** 
Verifica se a posição `pos` como argumento é válida no mapa e retorna o objeto correpondente a partir da função `getObjAtMap`. Assim, é possível avaliar se o objeto `obj` é uma 'WallMaze' ao verificar a propriedade `obj.isWall`.

-- **`function removeObjAtMap(map, pos)`** 
A partir do atributo `pos`, torna a propriedade `visible = false` do objeto no mapa para essa posição. 

-- **`function showGhostAtMap(now)`** ???? 

-- **`function moveGhost(ghost)`** ???? 

-- **`function updateGhost(ghost, now)`** ???? 
