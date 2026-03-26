export const controls = {
  keys: new Set(),
  lookDeltaX: 0,
  lookDeltaY: 0,
  flashlightToggleQueued: false,
};

export function initControls(canvas, onInstructionsToggle) {
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  addEventListener('keydown', (event) => {
    controls.keys.add(event.code);
    if (event.code === 'KeyF') controls.flashlightToggleQueued = true;
    if (event.code === 'KeyH' && onInstructionsToggle) onInstructionsToggle();
  });

  addEventListener('keyup', (event) => controls.keys.delete(event.code));

  addEventListener('mousemove', (event) => {
    controls.lookDeltaX += event.movementX;
    controls.lookDeltaY += event.movementY;
  });

  addEventListener('mousedown', (event) => {
    if (event.button === 2) controls.flashlightToggleQueued = true;
  });

  canvas.addEventListener('click', () => {
    if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
  });
}

export function consumeLookDelta() {
  const delta = { x: controls.lookDeltaX, y: controls.lookDeltaY };
  controls.lookDeltaX = 0;
  controls.lookDeltaY = 0;
  return delta;
}

export function consumeFlashlightToggle() {
  const queued = controls.flashlightToggleQueued;
  controls.flashlightToggleQueued = false;
  return queued;
}
