export const keys = new Set();
export let yaw = 0;
export let pitch = 0;
export let pointerLocked = false;

export function initControls(renderer, shoot) {
  addEventListener('keydown', e => {
    if (e.code === 'Escape' && pointerLocked) {
      document.exitPointerLock();
    } else {
      keys.add(e.code);
    }
  });
  addEventListener('keyup', e => {
    keys.delete(e.code);
  });

  addEventListener('mousemove', e => {
    if (!pointerLocked) return;
    const sensitivity = 0.0027;
    yaw   -= e.movementX * sensitivity;
    pitch -= e.movementY * sensitivity;
    pitch = Math.max(-Math.PI/3, Math.min(Math.PI/3, pitch));
  });

  const hint = document.getElementById('hint');
  addEventListener('mousedown', e => {
    if (!pointerLocked) {
      renderer.domElement.requestPointerLock();
      e.preventDefault();
    } else if (e.button === 0) {
      shoot();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === renderer.domElement;
    hint.classList.toggle('hidden', pointerLocked);
  });
}
