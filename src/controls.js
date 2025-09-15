export function setupControls(renderer, shoot) {
  const keys = new Set();
  const state = { yaw: 0, pitch: 0, keys, pointerLocked: false };

  addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && state.pointerLocked) {
      document.exitPointerLock();
    } else {
      keys.add(e.code);
    }
  });

  addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });

  const hint = document.getElementById('hint');

  addEventListener('mousedown', (e) => {
    if (!state.pointerLocked) {
      renderer.domElement.requestPointerLock();
      e.preventDefault();
    } else if (e.button === 0) {
      shoot();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    state.pointerLocked = document.pointerLockElement === renderer.domElement;
    hint.classList.toggle('hidden', state.pointerLocked);
  });

  addEventListener('mousemove', (e) => {
    if (!state.pointerLocked) return;
    const sensitivity = 0.0027;
    state.yaw -= e.movementX * sensitivity;
    state.pitch -= e.movementY * sensitivity; // natural (not inverted)
    state.pitch = Math.max(-Math.PI/3, Math.min(Math.PI/3, state.pitch));
  });

  return state;
}
