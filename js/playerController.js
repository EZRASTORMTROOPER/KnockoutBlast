const controls = {
  yaw: 0,
  pitch: 0,
  keys: new Set(),
  locked: false,
};

export function createPlayerController(camera, domElement, roomBounds) {
  const hint = document.getElementById('mouseHint');

  function onMouseMove(event) {
    if (!controls.locked) return;
    const sensitivity = 0.0022;
    controls.yaw -= event.movementX * sensitivity;
    controls.pitch -= event.movementY * sensitivity;
    controls.pitch = Math.max(-0.65, Math.min(0.45, controls.pitch));
  }

  function onLockChange() {
    controls.locked = document.pointerLockElement === domElement;
    hint.classList.toggle('hidden', controls.locked);
  }

  window.addEventListener('keydown', (event) => controls.keys.add(event.code));
  window.addEventListener('keyup', (event) => controls.keys.delete(event.code));
  window.addEventListener('mousemove', onMouseMove);

  domElement.addEventListener('mousedown', () => {
    if (!controls.locked) {
      domElement.requestPointerLock();
    }
  });

  document.addEventListener('pointerlockchange', onLockChange);

  return {
    update(dt) {
      camera.rotation.order = 'YXZ';
      camera.rotation.y = controls.yaw;
      camera.rotation.x = controls.pitch;

      const sprinting = controls.keys.has('ShiftLeft') || controls.keys.has('ShiftRight');
      const speed = sprinting ? 3.2 : 2.05;
      const moveStep = speed * dt;

      const forwardX = -Math.sin(controls.yaw);
      const forwardZ = -Math.cos(controls.yaw);
      const rightX = Math.cos(controls.yaw);
      const rightZ = -Math.sin(controls.yaw);

      if (controls.keys.has('KeyW')) {
        camera.position.x += forwardX * moveStep;
        camera.position.z += forwardZ * moveStep;
      }
      if (controls.keys.has('KeyS')) {
        camera.position.x -= forwardX * moveStep;
        camera.position.z -= forwardZ * moveStep;
      }
      if (controls.keys.has('KeyA')) {
        camera.position.x -= rightX * moveStep;
        camera.position.z -= rightZ * moveStep;
      }
      if (controls.keys.has('KeyD')) {
        camera.position.x += rightX * moveStep;
        camera.position.z += rightZ * moveStep;
      }

      camera.position.x = Math.min(roomBounds.maxX, Math.max(roomBounds.minX, camera.position.x));
      camera.position.z = Math.min(roomBounds.maxZ, Math.max(roomBounds.minZ, camera.position.z));
      camera.position.y = 1.65;
    },
  };
}
