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

-- **`function createWallMaze()`**

Cada '#' na matriz que define o mapa do jogo reprezenta um cubo 1x1x1 que compõe o labirinto. 