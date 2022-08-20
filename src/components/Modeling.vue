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
import { Object3d } from '@/engine/renderer/object-3d';
import { createBox } from '@/modeling/building-blocks';
import { truck } from '@/modeling/truck';
import { doTimes } from '@/engine/helpers';
import { noiseMaker } from '@/engine/texture-creation/noise-maker';
import { largeLeaves, largeTree, smallLeaves, smallTree } from '@/modeling/trees';
import { largeRock, mediumRock, smallRock } from '@/modeling/rocks';

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

const frontCamera = new OrthoCamera(-20, 20, -20, 20, 1, 400);
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

const smallTreeBase = new MoldableCube(2, 4, 2, 4, 2, 4)
    .cylindrify(1)
    .selectBy(vertex => vertex.y < 1.5 && vertex.y > -1.5)
    .translate(0, 1)
    .scale(0.8, 1, 0.8)
    .selectBy(vertex => vertex.y > 1.5 && vertex.x > 0.3)
    .scale(0.2, 1, 0.2)
    .translate(4, 5)
    .selectBy(vertex => vertex.y > 1.5 && vertex.x < -0.3)
    .scale(0.2, 1, 0.2)
    .translate(-3, 4, -2)
    .done();

// const rockGeo = new MoldableCube(6, 3, 4, 2, 3, 2).spherify(3);
// let scale = 4.0;
// doTimes(20, index => {
//   const yPos = index - 8;
//   rockGeo
//       .selectBy(vertex => vertex.y > yPos && vertex.y < yPos + 1)
//       .scale(scale, 1.2, scale);
//   scale *= 0.8;
// });
//
// rockGeo.all().noisify(22, 0.03).computeNormalsCrossPlane().done();
//
// const mediumRock = new Mesh(rockGeo, materials.marble);

mediumRock.position.x += -8;
const object3d = new Object3d(smallTree, smallLeaves);
object3d.scale.set(0.5, 0.5, 0.5);


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

  camera.lookAt(object3d.position);
  topCamera.lookAt(object3d.position);
  frontCamera.lookAt(object3d.position);
  sideCamera.lookAt(object3d.position);

  scene.add(object3d);

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
  } else if (event.buttons === 2) {
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
