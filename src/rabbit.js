import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

function makeScaryRabbit() {
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

function makeRabbitCave() {
  const cave = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 2.5, 3, 12, 1, true),
    new THREE.MeshLambertMaterial({ color: 0x555555, side: THREE.DoubleSide })
  );
  cave.rotation.x = Math.PI / 2;
  cave.position.y = 1.5;
  return cave;
}

export class RabbitController {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.rabbit = makeScaryRabbit();
    this.cave = makeRabbitCave();
    this.cave.position.set(40, 0, -40);
    scene.add(this.cave);
    this.rabbit.position.copy(this.cave.position.clone().add(new THREE.Vector3(0,0,3)));
    this.rabbit.castShadow = true;
    scene.add(this.rabbit);

    this.state = 'sleep'; // sleep, chase, drag, run
    this.dragDir = new THREE.Vector3();
  }

  startNight() {
    this.state = 'chase';
  }

  startDay() {
    this.state = 'sleep';
    this.rabbit.position.copy(this.cave.position.clone().add(new THREE.Vector3(0,0,3)));
  }

  update(dt, onGround, kickCallback, damageCallback) {
    switch (this.state) {
      case 'sleep':
        break;
      case 'chase': {
        const dir = this.player.position.clone().sub(this.rabbit.position).normalize();
        this.rabbit.position.addScaledVector(dir, 3 * dt);
        if (this.rabbit.position.distanceTo(this.player.position) < 1.5) {
          this.state = 'drag';
          this.dragDir.copy(dir);
          if (damageCallback) damageCallback();
        }
        break; }
      case 'drag': {
        this.player.position.addScaledVector(this.dragDir, 2 * dt);
        this.rabbit.position.copy(this.player.position.clone().addScaledVector(this.dragDir, -1));
        if (kickCallback && onGround) {
          this.state = 'run';
        }
        break; }
      case 'run': {
        const dir = this.cave.position.clone().sub(this.rabbit.position).normalize();
        this.rabbit.position.addScaledVector(dir, 6 * dt);
        if (this.rabbit.position.distanceTo(this.cave.position) < 1) {
          this.state = 'sleep';
        }
        break; }
    }
  }
}
