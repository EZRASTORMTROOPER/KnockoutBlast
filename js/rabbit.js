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

function makeCave() {
  const geo = new THREE.CylinderGeometry(2,2,3,16,1,true);
  const mat = new THREE.MeshLambertMaterial({ color: 0x333333, side: THREE.DoubleSide });
  const cave = new THREE.Mesh(geo, mat);
  cave.position.set(-30,1.5,-30);
  cave.rotation.z = Math.PI/2;
  return cave;
}

export class RabbitController {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.rabbit = makeRabbit();
    this.cave = makeCave();
    this.scene.add(this.cave);
    this.rabbitVisible = false;
    this.attacking = false;
  }

  spawn() {
    this.rabbit.position.set(-30,0,-30); // start near cave
    this.scene.add(this.rabbit);
    this.rabbitVisible = true;
  }

  update(dt, isNight) {
    if (isNight) {
      if (!this.rabbitVisible) this.spawn();
      const dir = this.player.position.clone().sub(this.rabbit.position).normalize();
      const speed = 4;
      this.rabbit.position.addScaledVector(dir, speed * dt);
      const dist = this.rabbit.position.distanceTo(this.player.position);
      if (dist < 1.5) {
        if (!this.attacking) {
          this.attacking = true;
          if (this.player.health !== undefined) {
            this.player.health = Math.max(0, this.player.health - this.player.maxHealth * 0.5);
          }
        }
        // drag player
        this.player.position.addScaledVector(dir, speed * dt * 0.5);
      }
    } else {
      if (this.rabbitVisible) {
        this.scene.remove(this.rabbit);
        this.rabbitVisible = false;
      }
      this.attacking = false;
    }
  }

  kick() {
    if (this.attacking) {
      this.scene.remove(this.rabbit);
      this.rabbitVisible = false;
      this.attacking = false;
    }
  }
}
