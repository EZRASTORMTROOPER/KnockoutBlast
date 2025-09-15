import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

function makeRabbit() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 16, 16),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  body.position.y = 1.2; body.castShadow = true; body.receiveShadow = true;

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 16, 16),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  head.position.y = 2.1; head.castShadow = true;

  const earGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3);
  const earMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const earL = new THREE.Mesh(earGeo, earMat);
  earL.position.set(-0.35, 2.8, 0); earL.castShadow = true;
  const earR = earL.clone(); earR.position.x = 0.35;

  const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat); eyeL.position.set(-0.2, 2.2, 0.55);
  const eyeR = eyeL.clone(); eyeR.position.x = 0.2;

  const blood = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.6),
    new THREE.MeshBasicMaterial({ color: 0x8b0000 })
  );
  blood.rotation.x = -Math.PI/2; blood.position.set(0, 0, -0.8);

  g.add(body, head, earL, earR, eyeL, eyeR, blood);
  g.scale.set(2.2, 2.2, 2.2);
  return g;
}

export class Rabbit {
  constructor(scene, player, onAttack) {
    this.scene = scene;
    this.player = player;
    this.onAttack = onAttack;
    this.mesh = makeRabbit();
    this.visible = false;
    this.isDragging = false;
    this.runAway = false;

    this.home = new THREE.Vector3(30, 0, -30);
    this.cave = this.createCave();
    scene.add(this.cave);
    this.mesh.position.copy(this.home.clone().add(new THREE.Vector3(0, 0, 2)));
  }

  createCave() {
    const geo = new THREE.CylinderGeometry(2, 2, 2, 16, 1, true);
    geo.rotateX(Math.PI/2);
    const mat = new THREE.MeshLambertMaterial({ color: 0x554433, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(this.home);
    m.receiveShadow = true;
    return m;
  }

  startNight() {
    if (!this.visible) {
      this.scene.add(this.mesh);
      this.visible = true;
    }
  }

  endNight() {
    this.isDragging = false;
    this.runAway = false;
    if (this.visible) {
      this.scene.remove(this.mesh);
      this.visible = false;
      this.mesh.position.copy(this.home.clone().add(new THREE.Vector3(0, 0, 2)));
    }
  }

  update(dt) {
    if (!this.visible) return;
    if (this.runAway) {
      const dir = this.home.clone().sub(this.mesh.position).setY(0);
      const dist = dir.length();
      if (dist > 0.1) {
        dir.normalize();
        this.mesh.position.addScaledVector(dir, 5 * dt);
      } else {
        this.endNight();
      }
      return;
    }

    if (this.isDragging) {
      const dir = this.home.clone().sub(this.player.position).setY(0).normalize();
      this.player.position.addScaledVector(dir, 2 * dt);
      this.mesh.position.copy(this.player.position);
      return;
    }

    const dir = this.player.position.clone().sub(this.mesh.position);
    dir.y = 0;
    const dist = dir.length();
    if (dist > 0.1) {
      dir.normalize();
      this.mesh.position.addScaledVector(dir, 2 * dt);
    }
    if (dist < 1) {
      this.isDragging = true;
      if (this.onAttack) this.onAttack();
    }
  }

  kick() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.runAway = true;
  }
}
