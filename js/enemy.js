import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

const SPAWN_POINTS = [
  new THREE.Vector3(-6.2, 1.3, -2.8),
  new THREE.Vector3(0, 1.3, -4.1),
  new THREE.Vector3(6.2, 1.3, -2.8)
];

export function createEnemy(scene, revealTimes, revealWindowHours) {
  const enemy = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.8, 2.4, 12),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  body.position.y = 1.2;

  const faceTexture = new THREE.TextureLoader().load('./assets/faces/face2.png');
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 1.15),
    new THREE.MeshBasicMaterial({ map: faceTexture, transparent: true })
  );
  face.position.set(0, 1.75, 0.52);

  enemy.add(body);
  enemy.add(face);
  enemy.visible = false;
  scene.add(enemy);

  let activeSlot = -1;

  return {
    update(hourFloat, flashlightOn, dt) {
      const activeIndex = revealTimes.findIndex((hour) => {
        return hourFloat >= hour && hourFloat <= hour + revealWindowHours;
      });

      if (activeIndex !== activeSlot) {
        activeSlot = activeIndex;
        if (activeSlot >= 0) {
          enemy.position.copy(SPAWN_POINTS[activeSlot % SPAWN_POINTS.length]);
        }
      }

      const shouldExist = activeSlot >= 0;
      enemy.visible = shouldExist;

      if (enemy.visible) {
        enemy.lookAt(0, 1.6, 7.8);
        const pulse = 0.55 + Math.sin(performance.now() * 0.005) * 0.06;
        face.material.opacity = flashlightOn ? 1 : 0.18;
        body.material.emissive = flashlightOn ? new THREE.Color(0x330000) : new THREE.Color(0x000000);
        body.material.emissiveIntensity = flashlightOn ? pulse : 0;
      }

      return {
        active: shouldExist,
        visibleWithFlashlight: shouldExist && flashlightOn,
        delta: dt
      };
    }
  };
}
