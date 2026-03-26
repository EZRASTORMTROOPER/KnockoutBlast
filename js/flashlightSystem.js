import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export function createFlashlightSystem(camera, scene, flashEl) {
  const cone = new THREE.SpotLight(0xf5f0d4, 0, 20, Math.PI / 8, 0.45, 1.3);
  const coneTarget = new THREE.Object3D();
  camera.add(cone);
  camera.add(coneTarget);
  cone.target = coneTarget;
  cone.position.set(0.06, -0.05, -0.1);
  coneTarget.position.set(0, -0.1, -1);
  scene.add(camera);

  let isOn = false;
  let battery = 100;

  function refreshUi() {
    flashEl.textContent = `Flashlight: ${isOn ? 'ON' : 'OFF'} (${Math.ceil(battery)}%)`;
  }

  document.addEventListener('keydown', (event) => {
    if (event.code !== 'KeyF') return;
    if (battery <= 0) {
      isOn = false;
      cone.intensity = 0;
      refreshUi();
      return;
    }
    isOn = !isOn;
    cone.intensity = isOn ? 2.7 : 0;
    refreshUi();
  });

  refreshUi();

  return {
    cone,
    get isOn() {
      return isOn;
    },
    update(dt, canDrain) {
      if (isOn && canDrain) {
        battery = Math.max(0, battery - dt * 2.8);
        if (battery <= 0) {
          isOn = false;
          cone.intensity = 0;
        }
      } else if (!isOn) {
        battery = Math.min(100, battery + dt * 1.4);
      }
      refreshUi();
    },
  };
}
