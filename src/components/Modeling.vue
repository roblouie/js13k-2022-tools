<template>
  <v-container fluid class="h-100">
    <v-row class="h-100">
      <v-col cols="10">
        <div class="grid" ref="grid">
          <div>
            <canvas
              ref="cameraCanvas"
              @mousemove="onCameraMouseMove"
              oncontextmenu="return false;"
            ></canvas>
          </div>
          <div>
            <div class="canvas-label">Top (x/z)</div>
            <canvas
              ref="topCanvas"
              @mousedown="onMouseDown"
              @mouseup="onMouseUp"
              oncontextmenu="return false;"
              data-horizontal-dimension="x"
              data-vertical-dimension="z"
            ></canvas>
          </div>
          <div>
            <div class="canvas-label">Front (x/y)</div>
            <canvas
              ref="frontCanvas"
              @mousedown="onMouseDown"
              @mouseup="onMouseUp"
              oncontextmenu="return false;"
              data-horizontal-dimension="x"
              data-vertical-dimension="y"
            ></canvas>
          </div>
          <div>
            <div class="canvas-label">Side (z/y)</div>
            <canvas
              ref="sideCanvas"
              @mousedown="onMouseDown"
              @mouseup="onMouseUp"
              oncontextmenu="return false;"
              data-horizontal-dimension="z"
              data-vertical-dimension="y"
            ></canvas>
          </div>
        </div>
      </v-col>
      <v-col cols="2">
        Tools
        {{ downPositionDisplay }}
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang='ts'>
import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Scene } from '@/engine/renderer/scene';
import { Mesh } from '@/engine/renderer/mesh';
import { CubeGeometry } from '@/engine/cube-geometry';
import { materials } from '@/texture-maker';
import { renderer } from '@/engine/renderer/renderer';
import { BufferGeometry } from '@/engine/renderer/buffer-geometry';
import { onMounted, ref } from 'vue';
import { gl, lilgl, renderCanvas } from '@/engine/renderer/lil-gl';
import { OrthoCamera } from '@/engine/renderer/ortho-camera';
import { PlaneGeometry } from '@/engine/plane-geometry';
import { MakeMoldable } from '@/engine/moldable';

const grid = ref<HTMLDivElement>(null);
const cameraCanvas = ref<HTMLCanvasElement>(null);
const topCanvas = ref<HTMLCanvasElement>(null);
const frontCanvas = ref<HTMLCanvasElement>(null);
const sideCanvas = ref<HTMLCanvasElement>(null);

const scene = new Scene();

const camera = new Camera(Math.PI / 5, renderCanvas.width / renderCanvas.height, 1, 400);
camera.position = new EnhancedDOMPoint(0, 0, 10);

const topCamera = new OrthoCamera(-10, 10, -10, 10, 1, 400);
topCamera.position = new EnhancedDOMPoint(0, 17, 0.001);

const frontCamera = new OrthoCamera(-10, 10, -10, 10, 1, 400);
frontCamera.position = new EnhancedDOMPoint(0, 0, 17);

const sideCamera = new OrthoCamera(-10, 10, -10, 10, 1, 400);
sideCamera.position = new EnhancedDOMPoint(17, 0, 0.001);

const MoldableCube = MakeMoldable(CubeGeometry);

function createCorner(width: number, height: number, depth: number, widthSegments: number, heightSegments: number, depthSegments: number) {
  const wallGeometry2 = new MoldableCube(width - 2, height, depth, widthSegments - 2, heightSegments, depthSegments)
      .all()
      .translate(0, 0, width / 2 - 0.5);

  return new MoldableCube(width, height, depth, widthSegments, heightSegments, depthSegments)
      .all()
      .rotate(0, Math.PI / 2)
      .translate(width / 2 - 0.5)
      .merge(wallGeometry2)
      .computeNormalsPerPlane()
      .done();
}


function createCorner2() {
  const wallGeometry2 = new MoldableCube(4, 2, 1, 4, 1, 1)
      .all()
      .translate(0, 0, -2.5);

  return new MoldableCube(6, 2, 1, 6, 1, 1)
      .all()
      .rotate(0, Math.PI / 2)
      .translate(-2.5)
      .merge(wallGeometry2)
      .done();
}
function createBox3() {
  const secondCorner = createCorner(6, 2, 1, 6, 1, 1).all().rotate(0, Math.PI, 0).done();
  return secondCorner//  createCorner(4, 2, 1, 6, 1, 1).merge(secondCorner).computeNormalsPerPlane();
}


function createBox2() {
  const secondCorner = createCorner().all().rotate(0, Math.PI, 0).done();
  return createCorner().merge(secondCorner);
}


function createHallway(width: number, height: number, depth: number, widthSegments: number, heightSegments: number, depthSegments: number, spacing: number) {
  const isHorizontal = width >= depth;
  const wallGeometry2 = new MoldableCube(width, height, depth, widthSegments, heightSegments, depthSegments)
      .translate(isHorizontal ? 0 : spacing, 0, isHorizontal ? spacing : 0);

  return new MoldableCube(width, height, depth, widthSegments, heightSegments, depthSegments)
      .translate(isHorizontal ? 0 : -spacing, 0, isHorizontal ? -spacing : 0)
      .merge(wallGeometry2)
      .computeNormalsPerPlane()
      .done();
}

function createBox(width: number, height: number, depth: number, widthSegments: number, heightSegments: number, depthSegments: number) {
  const spacing = (width - depth) / 2;
  const sideWidth = width - depth * 2;
  const segmentWidth = width / widthSegments;
  const widthInSegments = width / segmentWidth;
  const sideSpacing = (segmentWidth / 2) * (widthInSegments - 1);
  const verticalWalls = createHallway(sideWidth, height, segmentWidth, Math.ceil(widthSegments * (sideWidth / width)), heightSegments, depthSegments, sideSpacing).all().rotate(0, Math.PI / 2, 0).done();
  return createHallway(width, height, depth, widthSegments, heightSegments, depthSegments, spacing).merge(verticalWalls).computeNormalsPerPlane();
}

function createTube() {
  return createBox(6, 2, 1, 6, 1, 1)
      .selectBy(vertex => Math.abs(vertex.x) < 2.5 && Math.abs(vertex.z) < 2.5)
      .cylindrify(2, 'y')
      // .cylindrify(3.5, 'y')
      // .selectBy(vertex => vertex.y > 0)
      // .scale(0, 2, 0)
      .done();
}

const wallGeometry = createTube();


// arch
// const wallGeometry = new MoldableCube(8, 1, 1, 8, 1, 1)
//   .selectVertices(...[2, 3, 6, 7, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 53, 54, 55, 56, 57, 58, 59, 60, 61, 71, 72, 73, 74, 75, 76, 77, 78, 79])
//   .cylindrify(3, 'z', {x: 0, y: -3, z: 0})
//     .computeNormalsCrossPlane()
//     .all()
//     .deselectVertices(...[2, 3, 6, 7, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 53, 54, 55, 56, 57, 58, 59, 60, 61, 71, 72, 73, 74, 75, 76, 77, 78, 79])
//     .cylindrify(3, 'z', {x: 0, y: -3, z: 0})
//     .translate(0, -1)
//     .computeNormalsCrossPlane()
//   .done();

const wall = new Mesh(
    wallGeometry,
    materials.bricks,
);

onMounted(() => {
  renderCanvas.width = cameraCanvas.value.parentElement.clientWidth;
  renderCanvas.height = cameraCanvas.value.parentElement.clientHeight;
  cameraCanvas.value.width = cameraCanvas.value.parentElement.clientWidth;
  cameraCanvas.value.height = cameraCanvas.value.parentElement.clientHeight;
  topCanvas.value.width = cameraCanvas.value.width;
  topCanvas.value.height = cameraCanvas.value.height;
  frontCanvas.value.width = cameraCanvas.value.width;
  frontCanvas.value.height = cameraCanvas.value.height;
  sideCanvas.value.width = cameraCanvas.value.width;
  sideCanvas.value.height = cameraCanvas.value.height;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


  // scene.skybox = new BufferGeometry();

  camera.lookAt(wall.position);
  topCamera.lookAt(wall.position);
  frontCamera.lookAt(wall.position);
  sideCamera.lookAt(wall.position);

  scene.add(wall);

  const cameraContext = cameraCanvas.value.getContext('2d')!;
  const topContext = topCanvas.value.getContext('2d')!;
  const frontContext = frontCanvas.value.getContext('2d')!;
  const sideContext = sideCanvas.value.getContext('2d')!;

  render();
  function render() {
    scene.updateWorldMatrix();
    camera.updateWorldMatrix();

    renderer.render(camera, scene);
    cameraContext.clearRect(0, 0, cameraCanvas.value.width, cameraCanvas.value.height);
    cameraContext.drawImage(renderCanvas, 0, 0);

    topCamera.updateWorldMatrix();
    renderer.render(topCamera, scene, true);
    topContext.drawImage(renderCanvas, 0, 0);

    frontCamera.updateWorldMatrix();
    renderer.render(frontCamera, scene, true);
    frontContext.drawImage(renderCanvas, 0, 0);

    sideCamera.updateWorldMatrix();
    renderer.render(sideCamera, scene, true);
    sideContext.drawImage(renderCanvas, 0, 0);

    requestAnimationFrame(render);
  }

});

const downPosition = new EnhancedDOMPoint();
const downPositionDisplay = ref({x: 0, y: 0, z: 0});
const upPosition = new EnhancedDOMPoint();

let isMouseDown = false;


function onMouseDown(event: MouseEvent) {
  const { horizontalDimension, verticalDimension } = event.target.dataset;
  downPosition[horizontalDimension] = event.offsetX - event.target.clientWidth / 2;
  downPosition[verticalDimension] = event.offsetY - event.target.clientHeight / 2;

  downPosition[horizontalDimension] *= 20 / event.target.clientWidth;
  downPosition[verticalDimension] *= 20 / event.target.clientHeight;

  if (verticalDimension === 'y') {
    downPosition[verticalDimension] *= -1;
  }

  downPositionDisplay.value[horizontalDimension] = downPosition[horizontalDimension];
  downPositionDisplay.value[verticalDimension] = downPosition[verticalDimension];
  isMouseDown = true;
}

function onMouseUp(event: MouseEvent) {
  const { horizontalDimension, verticalDimension } = event.target.dataset;

  if (isMouseDown) {
    upPosition[horizontalDimension] = event.offsetX - event.target.clientWidth / 2;
    upPosition[verticalDimension] = event.offsetY - event.target.clientHeight / 2;

    upPosition[horizontalDimension] *= 20 / event.target.clientWidth;
    upPosition[verticalDimension] *= 20 / event.target.clientHeight;
  }

  const smallestX = Math.min(upPosition[horizontalDimension], downPosition[horizontalDimension]);
  const largestX = Math.max(upPosition[horizontalDimension], downPosition[horizontalDimension]);

  const smallestZ = Math.min(upPosition[verticalDimension], downPosition[verticalDimension]);
  const largestZ = Math.max(upPosition[verticalDimension], downPosition[verticalDimension]);

  const verticesInSelection = [];
  wallGeometry.vertices.forEach((vertex, index) => {
    if (vertex[horizontalDimension] >= smallestX && vertex[horizontalDimension] <= largestX
      && vertex[verticalDimension] >= smallestZ && vertex[verticalDimension] <= largestZ) {
      verticesInSelection.push(index);
    }
  });

  console.log(verticesInSelection);

  isMouseDown = false;
}

const cameraRotation = new EnhancedDOMPoint(0, 0, 0);
function onCameraMouseMove(event: MouseEvent) {
  if (event.buttons === 1) {
    const rotationSpeed = 0.01;
    cameraRotation.y += event.movementX * -rotationSpeed;
    cameraRotation.x += event.movementY * -rotationSpeed;
    camera.setRotation(cameraRotation.x, cameraRotation.y, 0);
  } else if (event.buttons === 4) {
    const movementSpeed = 0.1;
    camera.position.x += event.movementX * movementSpeed;
    camera.position.y += event.movementY * -movementSpeed;
  }
}

</script>

<style>
  .grid div {
    background-color: #ddd;
  }

  .grid {
    max-width: 1815px;
    width:100%;
    height:100%;
    display:grid;
    grid-template-columns: 50% 50%;
    grid-row: auto;
    grid-column-gap: 10px;
    grid-row-gap: 10px;
  }

  .canvas-label {
    position: absolute;
    pading-top: 5px;
    padding-left: 5px;
    font-size: 14px;
  }
</style>
