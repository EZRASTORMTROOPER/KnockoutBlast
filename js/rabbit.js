import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

function loadFaceTexture() {
  const loader = new THREE.TextureLoader();
  const options = ['assets/faces/face1.png', 'assets/faces/face2.png', 'assets/faces/face3.png'];
  const path = options[Math.floor(Math.random() * options.length)];
  return loader.load(path);
}

export class Animatronic {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.3, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x1e1e1e, metalness: 0.15, roughness: 0.8 })
    );
    body.position.y = 1.15;

    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 1.1),
      new THREE.MeshBasicMaterial({ map: loadFaceTexture(), transparent: true })
    );
    face.position.set(0, 1.75, 0.57);

    const eyes = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff2222 })
    );
    const eyeL = eyes.clone();
    const eyeR = eyes.clone();
    eyeL.position.set(-0.18, 1.8, 0.58);
    eyeR.position.set(0.18, 1.8, 0.58);

    this.group.add(body, face, eyeL, eyeR);
    this.group.visible = false;
    this.group.position.set(0, 0, -9.5);
    this.scene.add(this.group);

    this.visibleTimer = 0;
  }

  spawnForHour(hour) {
    const xOffsets = { 2: -2.8, 3: 0, 4: 2.5, 5: 0 };
    this.group.position.set(xOffsets[hour] ?? 0, 0, -9.5);
    this.group.visible = true;
    this.visibleTimer = 5.5;
  }

  update(dtSeconds) {
    if (!this.group.visible) return;
    this.visibleTimer -= dtSeconds;
    if (this.visibleTimer <= 0) {
      this.group.visible = false;
      this.visibleTimer = 0;
    }
  }

  setLitByFlashlight(isLit) {
    this.group.traverse((node) => {
      if (node.material) {
        if (node.material.type === 'MeshBasicMaterial') return;
        node.material.emissive = new THREE.Color(isLit ? 0x331111 : 0x000000);
      }
    });
  }

  get position() {
    return this.group.position;
  }

  get visible() {
    return this.group.visible;
  }
}
