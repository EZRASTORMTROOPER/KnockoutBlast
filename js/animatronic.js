import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

const LANE_POSITION = {
  left: -3.2,
  center: 0,
  right: 3.2,
};

export class Animatronic {
  constructor(scene) {
    this.scene = scene;
    this.loader = new THREE.TextureLoader();
    this.mesh = null;
    this.active = false;
    this.lane = 'center';
    this.visibleTimer = 0;
    this.hitWithFlashlight = false;

    const options = ['assets/faces/face1.png', 'assets/faces/face2.png', 'assets/faces/face3.png'];
    const chosen = options[Math.floor(Math.random() * options.length)];
    const texture = this.loader.load(chosen);

    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.8),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 })
    );
    this.mesh.position.set(0, 1.7, -7.6);
    this.scene.add(this.mesh);
  }

  spawn() {
    this.active = true;
    this.hitWithFlashlight = false;
    this.visibleTimer = 0;
    const lanes = ['left', 'center', 'right'];
    this.lane = lanes[Math.floor(Math.random() * lanes.length)];
    this.mesh.position.x = LANE_POSITION[this.lane];
    this.mesh.material.opacity = 0;
  }

  hide() {
    this.active = false;
    this.mesh.material.opacity = 0;
  }

  update(deltaSeconds, { playerView, flashlightOn }) {
    if (!this.active) return { jumpscare: false, flashedAway: false };

    this.visibleTimer += deltaSeconds;
    const inSight = playerView === this.lane;
    const visible = inSight && flashlightOn;
    this.mesh.material.opacity = visible ? 1 : 0;

    if (visible) {
      this.hitWithFlashlight = true;
      this.hide();
      return { jumpscare: false, flashedAway: true };
    }

    if (this.visibleTimer > 5.5 && !this.hitWithFlashlight) {
      return { jumpscare: true, flashedAway: false };
    }

    return { jumpscare: false, flashedAway: false };
  }
}
