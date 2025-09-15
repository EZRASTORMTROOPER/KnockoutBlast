export const controls = {
  yaw: 0,
  pitch: 0,
  keys: new Set(),
  pointerLocked: false,
  aiming: false
};

export function initControls(domElement, shoot) {
  const hint = document.getElementById('hint');
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
      domElement.requestPointerLock();
      e.preventDefault();
    } else if (e.button === 0) {
      shoot();
    } else if (e.button === 2) {
      controls.aiming = true;
    }
  });

  addEventListener('mouseup', e => {
    if (e.button === 2) {
      controls.aiming = false;
    }
  });

  // Prevent context menu on right click while in pointer lock
  addEventListener('contextmenu', e => {
    if (controls.pointerLocked) e.preventDefault();
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
