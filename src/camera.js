import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

const camOffset = new THREE.Vector3(2.5, 1.8, 3.8); // right shoulder & back
const camPivot = new THREE.Vector3(0.4, 1.5, 0); // shoulder pivot

export function updateCamera(camera, player, yaw, pitch) {
  const camRot = new THREE.Euler(pitch, yaw, 0, 'YXZ');
  const pivotWorld = camPivot.clone().applyEuler(new THREE.Euler(0, yaw, 0));
  const offsetWorld = camOffset.clone().applyEuler(camRot);
  const camPos = player.position.clone().add(pivotWorld).add(offsetWorld);
  camera.position.lerp(camPos, 0.85);
  const aimDir = new THREE.Vector3(0, 0, -1).applyEuler(camRot);
  const lookTarget = player.position.clone().add(pivotWorld).add(aimDir);
  camera.lookAt(lookTarget);
}
