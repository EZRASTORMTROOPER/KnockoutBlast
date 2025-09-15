import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export class NightRabbit {
  constructor(scene, player, onGrab) {
    this.scene = scene;
    this.player = player;
    this.onGrab = onGrab;
    this.state = 'sleep';
    this.rabbit = this.makeRabbit();
    this.cave = this.makeCave();
    this.scene.add(this.cave);
    this.vel = new THREE.Vector3();
    this.speed = 5;
  }

  makeRabbit() {
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
    const earL = new THREE.Mesh(earGeo, earMat); earL.position.set(-0.35, 2.8, 0); earL.castShadow = true;
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

  makeCave() {
    const cave = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 16, 16, 0, Math.PI),
      new THREE.MeshLambertMaterial({ color: 0x444444 })
    );
    cave.rotation.y = Math.PI;
    cave.position.set(-20, 1.25, -20);
    cave.receiveShadow = true; cave.castShadow = true;
    return cave;
  }

  startNight() {
    if (this.state !== 'sleep') return;
    this.rabbit.position.set(this.cave.position.x, 0, this.cave.position.z + 3);
    this.scene.add(this.rabbit);
    this.state = 'hunt';
  }

  endNight() {
    if (this.state === 'sleep') return;
    this.scene.remove(this.rabbit);
    this.state = 'sleep';
  }

  get isDragging() { return this.state === 'drag'; }

  kick() {
    if (this.state !== 'drag') return;
    const dir = this.player.position.clone().sub(this.rabbit.position).normalize();
    this.vel.copy(dir.multiplyScalar(-8));
    this.state = 'flee';
  }

  update(dt, player, onGround) {
    if (this.state === 'hunt') {
      const dir = player.position.clone().sub(this.rabbit.position);
      dir.y = 0;
      const dist = dir.length();
      dir.normalize();
      this.rabbit.position.addScaledVector(dir, this.speed * dt);
      this.rabbit.lookAt(player.position);
      if (dist < 1.5) {
        this.state = 'drag';
        if (this.onGrab) this.onGrab();
      }
    } else if (this.state === 'drag') {
      const toCave = this.cave.position.clone().sub(player.position);
      toCave.y = 0; toCave.normalize();
      player.position.addScaledVector(toCave, dt * 2);
      this.rabbit.position.copy(player.position);
    } else if (this.state === 'flee') {
      this.rabbit.position.addScaledVector(this.vel, dt);
      this.vel.multiplyScalar(0.95);
      if (this.vel.length() < 0.1) {
        this.scene.remove(this.rabbit);
        this.state = 'sleep';
      }
    }
  }
}

