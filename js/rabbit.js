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

  g.add(body, head, earL, earR, eyeL, eyeR);
  g.scale.set(2.2, 2.2, 2.2);
  return g;
}

// Simple rectangular house
function createHouse(color = 0x8b4513) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 4), new THREE.MeshLambertMaterial({ color }));
  base.position.y = 1; base.receiveShadow = true; base.castShadow = true;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2, 4), new THREE.MeshLambertMaterial({ color: 0xaa0000 }));
  roof.position.y = 2 + 1; roof.castShadow = true;
  g.add(base, roof);
  return g;
}

// Sheep house (white base)
function createSheepHouse() {
  return createHouse(0xffffff);
}

// Cave for troll rabbit
function createCave() {
  const geo = new THREE.CylinderGeometry(2, 2, 2, 16, 1, true);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshLambertMaterial({ color: 0x554433, side: THREE.DoubleSide });
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true;
  return m;
}

export class Rabbit {
  constructor(scene, player, type, callbacks = {}) {
    this.scene = scene;
    this.player = player;
    this.type = type; // 1,2,3
    this.onTrap = callbacks.onTrap;
    this.onAttack = callbacks.onAttack;
    this.mesh = makeRabbit();
    this.visible = false;

    this.maxHealth = 500;
    this.health = this.maxHealth;
    this.immune = type === 2; // survives one hit
    this.isDragging = false; // for type 3
    this.runAway = false; // for type 3

    // set homes
    if (type === 1) this.home = new THREE.Vector3(30, 0, 30);
    else if (type === 2) this.home = new THREE.Vector3(-30, 0, 30);
    else this.home = new THREE.Vector3(30, 0, -30);

    if (type === 1) this.house = createHouse();
    else if (type === 2) this.house = createSheepHouse();
    else this.house = createCave();
    this.house.position.copy(this.home);
    scene.add(this.house);

    this.mesh.position.copy(this.home.clone().add(new THREE.Vector3(0, 0, 2)));

    const loader = new THREE.TextureLoader();
    const tex = loader.load(`../assets/faces/face${type}.png`);
    const headRadius = 0.8 * this.mesh.scale.x;
    const faceSize = headRadius * 2;
    this.face = new THREE.Mesh(
      new THREE.PlaneGeometry(faceSize, faceSize),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true })
    );
    this.scene.add(this.face);
    this.face.visible = false;
    this.headOffset = new THREE.Vector3(0, 2.1, 0);
    this.headRadius = headRadius + 0.01;

    // health bar UI
    this.healthBar = document.createElement('div');
    this.healthBar.className = 'rabbit-health';
    this.healthFill = document.createElement('div');
    this.healthFill.className = 'fill';
    this.healthLabel = document.createElement('div');
    this.healthLabel.className = 'label';
    this.healthBar.appendChild(this.healthFill);
    this.healthBar.appendChild(this.healthLabel);
    document.body.appendChild(this.healthBar);
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

  damage(amount) {
    if (this.health <= 0) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.endNight();
      this.healthBar.style.display = 'none';
    }
  }

  hitByBall(amount = 10) {
    if (this.immune) { this.immune = false; return; }
    this.damage(amount);
  }

  kick() {
    if (this.type === 3 && this.isDragging) {
      this.isDragging = false;
      this.runAway = true;
    }
  }

  update(dt, isNight, camera) {
    if (isNight) this.startNight(); else this.endNight();
    if (!this.visible) {
      this.updateHealthBar(camera);
      return;
    }

    if (this.type === 3) {
      // Troll rabbit behaviour
      if (this.runAway) {
        const dir = this.home.clone().sub(this.mesh.position).setY(0);
        const dist = dir.length();
        if (dist > 0.1) {
          dir.normalize();
          this.mesh.position.addScaledVector(dir, 5 * dt);
        } else {
          this.endNight();
        }
      } else if (this.isDragging) {
        const dir = this.home.clone().sub(this.player.position).setY(0).normalize();
        this.player.position.addScaledVector(dir, 2 * dt);
        this.mesh.position.copy(this.player.position);
      } else {
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
    } else if (this.type === 1) {
      // screaming trapper
      const dist = this.player.position.distanceTo(this.mesh.position);
      if (dist < 3 && this.onTrap && !this.trapped) {
        this.trapped = true;
        this.onTrap();
      }
      if (dist >= 3) this.trapped = false;
    }

    if (this.face) {
      this.face.visible = isNight && this.visible;
      if (this.face.visible) {
        const headPos = this.mesh.localToWorld(this.headOffset.clone());
        const dir = this.player.position.clone().sub(headPos).normalize();
        this.face.position.copy(headPos.clone().addScaledVector(dir, this.headRadius));
        this.face.lookAt(this.player.position);
      }
    }

    this.updateHealthBar(camera);
  }

  updateHealthBar(camera) {
    const disp = this.visible && this.health > 0;
    this.healthBar.style.display = disp ? 'block' : 'none';
    if (!disp) return;
    const pos = this.mesh.position.clone();
    pos.y += 3;
    pos.project(camera);
    const x = (pos.x * 0.5 + 0.5) * innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * innerHeight;
    this.healthBar.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    const pct = this.health / this.maxHealth;
    this.healthFill.style.width = `${pct * 100}%`;
    this.healthLabel.textContent = Math.round(this.health);
  }
}

