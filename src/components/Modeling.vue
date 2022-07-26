<template>
  <v-container fluid class="h-100">
    <v-row class="h-100">
      <v-col cols="10">
        <div class="grid" ref="grid">
          <div>
            <canvas id="camera" ref="cameraCanvas" @keydown="onCameraKeyDown" @keyup="onCameraKeyUp" oncontextmenu="return false;"></canvas>
          </div>
          <div>
            <canvas id="top" ref="topCanvas" @mousedown="onMouseDown" @mouseup="onMouseUp" oncontextmenu="return false;"></canvas>
          </div>
          <div>
            <canvas id="front" ref="frontCanvas" oncontextmenu="return false;"></canvas>
          </div>
          <div>
            <canvas id="side" ref="sideCanvas" oncontextmenu="return false;"></canvas>
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
camera.position = new EnhancedDOMPoint(0, 0, 17);

// const topCamera = new Camera(Math.PI / 5, renderCanvas.width / renderCanvas.height, 1, 400);
const topCamera = new OrthoCamera(-10, 10, -10, 10, 1, 400);
topCamera.position = new EnhancedDOMPoint(0, 17, 0.001);

const frontCamera = new OrthoCamera(-10, 10, -10, 10, 1, 400);
frontCamera.position = new EnhancedDOMPoint(0, 0, 17);

const sideCamera = new OrthoCamera(-10, 10, -10, 10, 1, 400);
sideCamera.position = new EnhancedDOMPoint(17, 0, 0.001);

const MoldableCube = MakeMoldable(CubeGeometry);

const wallGeometry = new MoldableCube(8, 1, 1, 8, 1, 1)
  .selectVertices(...[4, 5, 6, 7, 8, 17, 26, 35, 44, 53, 70, 79])
  .rotate(0, 0, 0.6)
  .selectVertices(...[9, 18, 27, 36, 45, 54, 69, 78])
  .rotate(0, 0, 0.4)
  .selectVertices(...[10, 19, 28, 37, 46, 55, 68, 77])
  .rotate(0, 0, 0.2)
  .done();

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

  render();
  function render() {
    scene.updateWorldMatrix();
    camera.updateWorldMatrix();
    renderer.render(camera, scene);
    cameraCanvas.value.getContext('2d').drawImage(renderCanvas, 0, 0);

    topCamera.updateWorldMatrix();
    renderer.render(topCamera, scene, true);
    topCanvas.value.getContext('2d').drawImage(renderCanvas, 0, 0);

    frontCamera.updateWorldMatrix();
    renderer.render(frontCamera, scene, true);
    frontCanvas.value.getContext('2d').drawImage(renderCanvas, 0, 0);

    sideCamera.updateWorldMatrix();
    renderer.render(sideCamera, scene, true);
    sideCanvas.value.getContext('2d').drawImage(renderCanvas, 0, 0);

    requestAnimationFrame(render);
  }

});

const downPosition = new EnhancedDOMPoint();
const downPositionDisplay = ref({x: 0, z: 0});
const upPosition = new EnhancedDOMPoint();

let isMouseDown = false;

function onMouseDown(event: MouseEvent) {
  downPosition.x = event.offsetX - event.target.clientWidth / 2;
  downPosition.z = event.offsetY - event.target.clientHeight / 2;

  downPosition.x *= 20 / event.target.clientWidth;
  downPosition.z *= 20 / event.target.clientHeight;
  downPositionDisplay.value.x = downPosition.x;
  downPositionDisplay.value.z = downPosition.z;
  isMouseDown = true;
}

function onMouseUp(event: MouseEvent) {
  if (isMouseDown) {
    upPosition.x = event.offsetX - event.target.clientWidth / 2;
    upPosition.z = event.offsetY - event.target.clientHeight / 2;

    upPosition.x *= 20 / event.target.clientWidth;
    upPosition.z *= 20 / event.target.clientHeight;
  }

  const smallestX = Math.min(upPosition.x, downPosition.x);
  const largestX = Math.max(upPosition.x, downPosition.x);

  const smallestZ = Math.min(upPosition.z, downPosition.z);
  const largestZ = Math.max(upPosition.z, downPosition.z);

  const verticesInSelection = [];
  wallGeometry.vertices.forEach((vertex, index) => {
    if (vertex.x >= smallestX && vertex.x <= largestX
      && vertex.z >= smallestZ && vertex.z <= largestZ) {
      verticesInSelection.push(index);
    }
  });

  console.log(verticesInSelection);

  isMouseDown = false;
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
</style>
