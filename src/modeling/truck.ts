import { createBox } from '@/modeling/building-blocks';
import { Mesh } from '@/engine/renderer/mesh';
import { getTextureForSide, materials } from '@/texture-maker';
import { Object3d } from '@/engine/renderer/object-3d';
import { MakeMoldable } from '@/engine/moldable';
import { CubeGeometry } from '@/engine/cube-geometry';
import { AttributeLocation } from '@/engine/renderer/renderer';
import { Material } from '@/engine/renderer/material';
const MoldableCube = MakeMoldable(CubeGeometry);

function createTire() {
  return createBox(6, 2, 1, 6, 1, 1)
    .selectBy(vertex => Math.abs(vertex.x) < 2.5 && Math.abs(vertex.z) < 2.5)
    .cylindrify(1.5, 'y')
    .invertSelection()
    .cylindrify(3.5, 'y')
    .all()
    .rotate(0, 0, Math.PI / 2)
    .computeNormalsCrossPlane()
    .done();
}

function createWheel() {
  return new MoldableCube(2, 2, 2, 4, 1, 4)
    .selectBy(vertex => Math.abs(vertex.x) > 0.4 && Math.abs(vertex.z) > 0.4)
    .cylindrify(1.5)
    .invertSelection()
    .scale(1, 0.5, 1)
    .all()
    .rotate(0, 0, Math.PI / 2)
    .computeNormalsPerPlane()
    .done();
}

function createWheelAndTire() {
  const wheelGeometry = createWheel();
  const wheel = new Mesh(
    wheelGeometry,
    materials.wheel,
  );

  const tireGeometry = createTire();
  const tire = new Mesh(
    tireGeometry,
    materials.tire,
  );

  const wheelAndTire = new Object3d(wheel, tire);
  wheelAndTire.scale.set(1.5, 0.5, 0.5);
  return wheelAndTire;
}

function createWheelPair() {
  const leftWheel = createWheelAndTire();
  // leftWheel.rotate(0, 0, Math.PI / 2);
  leftWheel.position.x -= 4;

  const rightWheel = createWheelAndTire();
  // rightWheel.rotate(0, 0, Math.PI / 2);
  rightWheel.position.x += 4;

  return new Object3d(leftWheel, rightWheel);
}


function createChassis() {
  const texturesPerSide = MoldableCube.TexturePerSide(3, 4, 5,
    materials.truckCabSide.texture!,
    materials.lake.texture!,
    materials.truckCabTop.texture!,
    materials.tiles.texture!,
    materials.wood.texture!,
    materials.truckCabFront.texture!,
  );

  const cab = new MoldableCube(8, 3, 9, 3, 4, 5)
    .selectBy(vertex => vertex.y > 1 && (vertex.z < 3 && vertex.z > 0))
    .translate(0, 2, 1.8)
    .selectBy(vertex => vertex.y > 1 && (vertex.z < 3 && vertex.z > 0))
    .translate(0, 0, -1)
    .computeNormalsPerPlane()
    .done();

  cab.setAttribute(AttributeLocation.TextureDepth, new Float32Array(texturesPerSide), 1);
  cab.bindGeometry();

  const bedFloor = new MoldableCube(6, 1.5, 6).translate(0, -0.8, 8).done();

  const bed = createBox(8, 3, 0.8, 6, 2, 1)
    .rotate(0, Math.PI / 2)
    .translate(0, 0, 8)
    .computeNormalsPerPlane()
    .done();

  // const chassisGeometry = cab.merge(bed)
  //   .computeNormalsPerPlane()
  //   .done();

  const cabMesh = new Mesh(cab, new Material({ color: '#fff' }));
  const bedFloorMesh = new Mesh(bedFloor, materials.chassis);
  const bedMesh = new Mesh(bed, materials.chassis);

  const chassis = new Object3d(cabMesh, bedFloorMesh, bedMesh);
  chassis.position.y += 2;
  chassis.position.z += 3;
  chassis.scale.z = 0.9;
  chassis.rotate(0, Math.PI, 0);
  return chassis;
}

const frontWheels = createWheelPair();
const rearWheels = createWheelPair();
frontWheels.position.z += 4;
rearWheels.position.z -= 4;

export const truck = new Object3d(frontWheels, rearWheels, createChassis());
