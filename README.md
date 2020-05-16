## :computer: **Projeto**
Jogo PacMan 3D, na linguagem JavaScript - com base na biblioteca [Three.js](https://threejs.org/) - desenvolvido como projeto para a matéria CCI-36: Fundamentos de Computação Gráfica.
>**[introdução explicando o modelo que desejam construir, os fundamentos por trás dele e porque ele deve ser visualizado em 3D]**

-- gif do projeto (alternando entre câmeras)

### :one: Tarefa 1
Abaixo, cada função é detalhada a fim de explicar a construção da geometria do modelo, a definição do posicionamento da câmera e a variação no tempo de animação.

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

-- **`function updateFirstPersonCamera()`**

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

-- **`function createKeyState()`**

-- **`function animateScene()`**
A função animateScene chama 'requestAnimationFrame', tal que assim a cada frame chama as funções que estão indicadas são re-renderizadas em cena, dando uma ideia de que a animação está acontecendo.
