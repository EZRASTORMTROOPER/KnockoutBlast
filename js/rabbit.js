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

function makeCave() {
  const cave = new THREE.Mesh(
    new THREE.ConeGeometry(3, 4, 8),
    new THREE.MeshLambertMaterial({ color: 0x444444 })
  );
  cave.rotation.x = Math.PI; // open side forward
  cave.position.set(50, 0, -30);
  cave.castShadow = true;
  cave.receiveShadow = true;
  return cave;
}

export class RabbitAI {
  constructor(scene, player, cycle) {
    this.scene = scene;
    this.player = player;
    this.cycle = cycle;
    this.rabbit = makeScaryRabbit();
    this.cave = makeCave();
    scene.add(this.cave);
    this.rabbit.position.copy(this.cave.position.clone().add(new THREE.Vector3(0,0,2)));
    scene.add(this.rabbit);
    this.state = 'inCave'; // inCave, chasing, dragging, retreating
    this.playerHealth = 100;
  }

  update(dt) {
    if (this.cycle.isNight()) {
      if (this.state === 'inCave') this.state = 'chasing';
    } else {
      this.state = 'inCave';
      this.rabbit.position.copy(this.cave.position.clone().add(new THREE.Vector3(0,0,2)));
    }

    if (this.state === 'chasing') {
      const dir = this.player.position.clone().sub(this.rabbit.position).setY(0).normalize();
      this.rabbit.position.addScaledVector(dir, dt * 4);
      if (this.rabbit.position.distanceTo(this.player.position) < 1.2) {
        this.state = 'dragging';
        this.playerHealth = Math.max(0, this.playerHealth * 0.5);
      }
    } else if (this.state === 'dragging') {
      const target = this.cave.position.clone().add(new THREE.Vector3(0,0,2));
      const dir = target.clone().sub(this.rabbit.position).setY(0).normalize();
      this.rabbit.position.addScaledVector(dir, dt * 4);
      this.player.position.addScaledVector(dir, dt * 4);
    } else if (this.state === 'retreating') {
      const target = this.cave.position.clone().add(new THREE.Vector3(0,0,2));
      const dir = target.clone().sub(this.rabbit.position).setY(0).normalize();
      this.rabbit.position.addScaledVector(dir, dt * 4);
      if (this.rabbit.position.distanceTo(target) < 0.5) {
        this.state = 'inCave';
      }
    }
  }

  kick(onGround) {
    if (this.state === 'dragging' && onGround) {
      this.state = 'retreating';
      return true;
    }
    return false;
  }
}
