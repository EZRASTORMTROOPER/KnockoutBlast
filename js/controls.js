export const controls = {
  yaw: 0,
  pitch: 0,
  keys: new Set(),
  pointerLocked: false
};

export function initControls(domElement, shoot, onEscape) {
  const hint = document.getElementById('hint');
  addEventListener('keydown', e => {
    if (e.code === 'Escape') {
      if (controls.pointerLocked) {
        document.exitPointerLock();
      }
      if (onEscape) onEscape();
      return;
    }
    controls.keys.add(e.code);
  });
  addEventListener('keyup', e => {
    controls.keys.delete(e.code);
  });

  addEventListener('mousedown', e => {
    if (!controls.pointerLocked) {
      domElement.requestPointerLock();
      e.preventDefault();
    } else if (e.button === 0) {
      shoot();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    controls.pointerLocked = document.pointerLockElement === domElement;
    hint.classList.toggle('hidden', controls.pointerLocked);
  });

  addEventListener('mousemove', e => {
    if (!controls.pointerLocked) return;
    const sensitivity = 0.0027;
    controls.yaw   -= e.movementX * sensitivity;
    controls.pitch -= e.movementY * sensitivity;
    controls.pitch = Math.max(-Math.PI/3, Math.min(Math.PI/3, controls.pitch));
  });
}
