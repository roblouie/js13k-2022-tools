<template>
  <h1>NOISE</h1>
  <div id="canvas-parent"></div>
  <canvas ref="canvas" width="256" height="256" />

</template>

<script setup lang="ts">
import { dirtGrassInbetween } from '@/texture-maker';
import { noiseMaker, NoiseType } from '@/engine/texture-creation/noise-maker';
import { onMounted, ref } from 'vue';


dirtGrassInbetween();
const canvas = ref<HTMLCanvasElement>(null);

onMounted(() => {
  noiseMaker.seed(27);
  const context = canvas.value.getContext('2d')!;
  const result = noiseMaker.noiseLandscape(128, 1 / 8, 5, NoiseType.Perlin, 2);
  // const result = noiseMaker.noiseImage(128, 1 / 128, 4, NoiseType.Perlin, '#f00', 200);
  // console.log(Math.max(...result));
  // console.log(Math.min(...result));

  const imageData = new ImageData(128, 128);
  let noiseIndex = 0;

  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = Math.ceil(result[noiseIndex]) * 200;
    imageData.data[i + 1] = Math.ceil(result[noiseIndex]) * 200;
    imageData.data[i + 2] = Math.ceil(result[noiseIndex]) * 200;
    imageData.data[i + 3] = 255;
    noiseIndex++;
  }

  context.fillStyle = '#ccc';
  context.fillRect(0, 0, 128, 128);
  context.putImageData(imageData, 0, 0);
});

function modifyNoiseValue(noiseValue: number) {
  if (noiseValue < 0.1) {
    return 0;
  } if (noiseValue < 0.2) {
    return 1;
  }

  return 2;
}

</script>

<style scoped>

</style>
