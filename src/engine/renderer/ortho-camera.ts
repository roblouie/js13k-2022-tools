import { Object3d } from '@/engine/renderer/object-3d';

export class OrthoCamera extends Object3d {
  projection: DOMMatrix;

  constructor(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    super();
    this.projection = new DOMMatrix(orthoNO(left, right, bottom, top, near, far));
  }
}

function orthoNO(left: number, right: number, bottom: number, top: number, near: number, far: number) {
  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);
  const out = [];
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
