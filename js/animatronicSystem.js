import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

const APPEAR_HOURS = [2, 3, 4, 5];

export function createAnimatronicSystem(scene, camera, threatEl) {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('./assets/faces/face3.png');
  texture.colorSpace = THREE.SRGBColorSpace;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0 })
  );
  sprite.position.set(0, 1.6, 4.2);
  sprite.scale.set(1.6, 1.9, 1);
  scene.add(sprite);

  const fallbackBody = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.45, 1.1, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x191919, roughness: 0.9 })
  );
  fallbackBody.position.set(0, 1.1, 4.18);
  fallbackBody.visible = false;
  scene.add(fallbackBody);

  let visible = false;
  let currentTargetHour = null;
  let holdTimer = 0;

  function setThreatState(active, text) {
    threatEl.textContent = text;
    threatEl.className = active ? 'status-danger' : 'status-safe';
  }

  function chooseHour(gameHour) {
    return APPEAR_HOURS.find((hour) => gameHour >= hour && gameHour < hour + 0.45) ?? null;
  }

  return {
    update({ dt, gameHour, flashlightOn, flashlightCone, playerPosition }) {
      const selectedHour = chooseHour(gameHour);

      if (selectedHour !== null && currentTargetHour !== selectedHour) {
        currentTargetHour = selectedHour;
        visible = true;
        holdTimer = 8;
      }

      if (visible) {
        holdTimer -= dt;
        if (holdTimer <= 0) {
          visible = false;
          currentTargetHour = null;
        }
      }

      if (!visible) {
        sprite.material.opacity = Math.max(0, sprite.material.opacity - dt * 2.5);
        fallbackBody.visible = false;
        setThreatState(false, 'No movement');
        return;
      }

      fallbackBody.visible = sprite.material.map?.image == null;

      const toAnimatronic = sprite.position.clone().sub(playerPosition).normalize();
      const flashlightDirection = new THREE.Vector3();
      flashlightCone.getWorldDirection(flashlightDirection);
      const seenByFlashlight = flashlightOn && flashlightDirection.dot(toAnimatronic) > 0.93;

      const targetOpacity = seenByFlashlight ? 1 : 0.08;
      sprite.material.opacity += (targetOpacity - sprite.material.opacity) * Math.min(1, dt * 8);

      setThreatState(true, seenByFlashlight ? `ANIMATRONIC SPOTTED @ ~${currentTargetHour}:00 AM` : 'Movement heard near doorway');
    },
  };
}
