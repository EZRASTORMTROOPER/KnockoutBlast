import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

function makeRabbitMesh() {
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

function makeCave(scene) {
  const cave = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 3, 12, 1, true),
    new THREE.MeshLambertMaterial({ color: 0x333333, side: THREE.DoubleSide })
  );
  cave.rotation.z = Math.PI / 2;
  cave.position.set(30, 1.5, 30);
  scene.add(cave);
  return cave;
}

export class Rabbit {
  constructor(scene, player, changeHealth) {
    this.scene = scene;
    this.player = player;
    this.changeHealth = changeHealth;
    this.obj = makeRabbitMesh();
    this.cave = makeCave(scene);
    this.state = 'idle';
    this.visible = false;
    this.tookHealth = false;
  }

  startNight() {
    this.obj.position.copy(this.cave.position);
    this.scene.add(this.obj);
    this.visible = true;
    this.state = 'attack';
    this.tookHealth = false;
  }

  endNight() {
    if (this.visible) this.scene.remove(this.obj);
    this.visible = false;
    this.state = 'idle';
  }

  kick() {
    if (this.state === 'drag') {
      this.state = 'flee';
    }
  }

  isDragging() {
    return this.state === 'drag';
  }

  update(dt) {
    if (!this.visible) return;
    if (this.state === 'attack') {
      const dir = this.player.position.clone().sub(this.obj.position).normalize();
      this.obj.position.addScaledVector(dir, dt * 4);
      if (this.obj.position.distanceTo(this.player.position) < 1) {
        this.state = 'drag';
      }
    } else if (this.state === 'drag') {
      if (!this.tookHealth) {
        this.changeHealth(0.5);
        this.tookHealth = true;
      }
      const dir = this.cave.position.clone().sub(this.obj.position).normalize();
      this.obj.position.addScaledVector(dir, dt * 3);
      this.player.position.copy(this.obj.position.clone().add(dir.multiplyScalar(-1)));
    } else if (this.state === 'flee') {
      const dir = this.cave.position.clone().sub(this.obj.position).normalize();
      this.obj.position.addScaledVector(dir, dt * 6);
      if (this.obj.position.distanceTo(this.cave.position) < 0.5) {
        this.endNight();
      }
    }
  }
}
