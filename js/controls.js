export const controls = {
  yaw: 0,
  pitch: 0,
  keys: new Set(),
  pointerLocked: false
};

export function initControls(domElement, shoot, onPointerLockChange) {
  const hint = document.getElementById('hint');
  const settingsEl = document.getElementById('settings');
  addEventListener('keydown', e => {
    if (e.code === 'Escape' && controls.pointerLocked) {
      document.exitPointerLock();
    } else {
      controls.keys.add(e.code);
    }
  });
  addEventListener('keyup', e => {
    controls.keys.delete(e.code);
  });

  addEventListener('mousedown', e => {
    if (!controls.pointerLocked) {
      if (e.target === domElement && settingsEl.classList.contains('hidden')) {
        domElement.requestPointerLock();
        e.preventDefault();
      }
    } else if (e.button === 0) {
      shoot();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    controls.pointerLocked = document.pointerLockElement === domElement;
    hint.classList.toggle('hidden', controls.pointerLocked);
    if (onPointerLockChange) onPointerLockChange(controls.pointerLocked);
  });

  addEventListener('mousemove', e => {
    if (!controls.pointerLocked) return;
    const sensitivity = 0.0027;
    controls.yaw   -= e.movementX * sensitivity;
    controls.pitch -= e.movementY * sensitivity;
    controls.pitch = Math.max(-Math.PI/3, Math.min(Math.PI/3, controls.pitch));
  });
}
