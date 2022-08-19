import { doTimes } from '@/engine/helpers';
import { noiseMaker } from '@/engine/texture-creation/noise-maker';
import { Mesh } from '@/engine/renderer/mesh';
import { materials } from '@/texture-maker';
import { Object3d } from '@/engine/renderer/object-3d';
import { MakeMoldable } from '@/engine/moldable';
import { CubeGeometry } from '@/engine/cube-geometry';

const MoldableCube = MakeMoldable(CubeGeometry);

function makeTree(treeHeight: number, verticalSegments: number, radius: number) {
  const segmentSize = treeHeight / verticalSegments;
  const largeTreeBase = new MoldableCube(3, treeHeight, 3, 4, verticalSegments, 4)
    .cylindrify(radius)
    .translate(0, treeHeight / 2, 0);

  let scale = 1.0;
  doTimes(verticalSegments + 1, index => {
    const yPos = index * segmentSize;
    largeTreeBase.selectBy(vertex => vertex.y === yPos)
      .scale(scale, 1, scale);
    if (index % 2 === 0) {
      scale *= 0.7;
    } else {
      largeTreeBase.translate(noiseMaker.randomNumber(index + treeHeight), 0, noiseMaker.randomNumber(index + treeHeight));
    }

    if (index === verticalSegments) {
      largeTreeBase.scale(0, 1.2, 0);
    }
  });
  return largeTreeBase.done();
}


function makeLeaves(
  fidelity: number,
  radius: number,
  noiseSeed: number,
  translateX: number,
  translateY: number,
  translateZ: number,
  scaleX = 1,
  scaleY = 1,
  scaleZ = 1,
) {
  return new MoldableCube(fidelity, fidelity, fidelity, fidelity, fidelity, fidelity)
    .spherify(radius)
    .translate(translateX, translateY, translateZ)
    .scale(scaleX, scaleY, scaleZ)
    .noisify(noiseSeed, 0.05)
    .computeNormalsCrossPlane()
    .done();
}

const treeBase = makeTree(16, 8, 2);
const branch1 = makeTree(8, 4, 1);
const branch2 = makeTree(6, 3, 0.7);
branch1.all().rotate(0, 0, 1).translate(0, 5, -0.2).done();
branch2.all().rotate(0.8, 0, -1).translate(0, 8, -0.2).done();

treeBase.merge(branch1).merge(branch2).computeNormalsCrossPlane().done();


const leavesGeo1 = makeLeaves(3, 3, 2, -3, 8, -1, 2, 1, 1.7).done();
const leavesGeo2 = makeLeaves(3, 3, 5, 2.5, 10, 3, 2, 1, 1.8).done();
const leavesGeo3 = makeLeaves(3, 4, 7, 0, 9.3, 0, 2, 1.5, 1.9).done();

const leaves1 = new Mesh(leavesGeo1, materials.treeLeaves);
const leaves2 = new Mesh(leavesGeo2, materials.treeLeaves);
const leaves3 = new Mesh(leavesGeo3, materials.treeLeaves);

export const largeTree = new Mesh(treeBase, materials.wood);
export const largeLeaves = new Object3d(leaves1, leaves2, leaves3);
