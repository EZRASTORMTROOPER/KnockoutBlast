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
  g.scale.set(0.44, 0.44, 0.44);
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
  static faceOffset = 0.05;
  constructor(scene, player, type, callbacks = {}, listener, audioLoader) {
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
    this.trapped = false;

    this.walkSpeed = type === 1 ? 2.8 : type === 2 ? 2.4 : 0;
    this.chaseSpeed = type === 1 ? 4.2 : type === 2 ? 3.2 : 0;
    this.chaseRange = type === 1 ? 18 : type === 2 ? 22 : 0;
    this.wanderRadius = type === 1 ? 12 : type === 2 ? 18 : 0;
    this.wanderTarget = new THREE.Vector3();
    this.nextWanderSwitch = 0;
    this.circleDir = Math.random() < 0.5 ? 1 : -1;

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
    this.wanderTarget.copy(this.mesh.position);

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

    // proximity scream audio
    this.screamSound = new THREE.PositionalAudio(listener);
    audioLoader.load('audio/scream.wav', (buffer) => {
      this.screamSound.setBuffer(buffer);
      this.screamSound.setRefDistance(5);
      this.screamSound.setRolloffFactor(2);
      this.screamSound.setLoop(false);
    });
    this.mesh.add(this.screamSound);
    this.lastScream = 0;
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
    this.trapped = false;
    if (this.visible) {
      this.scene.remove(this.mesh);
      this.visible = false;
      this.mesh.position.copy(this.home.clone().add(new THREE.Vector3(0, 0, 2)));
    }
    this.wanderTarget.copy(this.mesh.position);
    this.nextWanderSwitch = 0;
    if (this.screamSound.isPlaying) this.screamSound.stop();
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
        if (isNight) {
          const now = performance.now();
          if (!this.screamSound.isPlaying && this.screamSound.buffer && now - this.lastScream > 3000) {
            this.screamSound.play();
            this.lastScream = now;
          }
        }
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
      if (dist < this.chaseRange) {
        this.moveTowards(this.player.position, this.chaseSpeed, dt);
      } else {
        this.updateWander(dt);
      }
      if (dist < 3 && this.onTrap && !this.trapped) {
        this.trapped = true;
        this.onTrap();
      }
      if (dist >= 3) this.trapped = false;
    } else if (this.type === 2) {
      // berserker rabbit circles the player when close
      const dist = this.player.position.distanceTo(this.mesh.position);
      if (dist < this.chaseRange) {
        const toPlayer = this.player.position.clone().sub(this.mesh.position);
        toPlayer.y = 0;
        const len = toPlayer.length();
        if (len > 0.001) {
          const toPlayerDir = toPlayer.clone().divideScalar(len);
          const tangent = new THREE.Vector3(-toPlayerDir.z, 0, toPlayerDir.x).multiplyScalar(this.circleDir);
          const dir = toPlayerDir.clone().multiplyScalar(0.7).addScaledVector(tangent, 0.3).normalize();
          this.mesh.position.addScaledVector(dir, this.chaseSpeed * dt);
          this.mesh.position.y = 0;
        }
      } else {
        this.updateWander(dt);
      }
    }

    if (this.face) {
      this.face.visible = isNight && this.visible;
      if (this.face.visible) {
        const headPos = this.mesh.localToWorld(this.headOffset.clone());
        const dir = this.player.position.clone().sub(headPos).normalize();
        this.face.position.copy(headPos.clone().addScaledVector(dir, this.headRadius + Rabbit.faceOffset));
        this.face.lookAt(this.player.position);
      }
    }

    this.updateHealthBar(camera);
  }

  updateHealthBar(camera) {
    if (!(this.visible && this.health > 0)) {
      this.healthBar.style.display = 'none';
      return;
    }

    const worldPos = this.mesh.position.clone();
    worldPos.y += 3;

    const viewPos = worldPos.clone().applyMatrix4(camera.matrixWorldInverse);
    if (viewPos.z >= 0) {
      this.healthBar.style.display = 'none';
      return;
    }

    const projected = worldPos.clone().project(camera);
    if (
      projected.x < -1 || projected.x > 1 ||
      projected.y < -1 || projected.y > 1 ||
      projected.z < -1 || projected.z > 1
    ) {
      this.healthBar.style.display = 'none';
      return;
    }

    this.healthBar.style.display = 'block';
    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    this.healthBar.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    const pct = this.health / this.maxHealth;
    this.healthFill.style.width = `${pct * 100}%`;
    this.healthLabel.textContent = Math.round(this.health);
  }

  updateWander(dt) {
    const now = performance.now();
    if (!this.wanderTarget || now >= this.nextWanderSwitch || this.mesh.position.distanceTo(this.wanderTarget) < 0.8) {
      this.pickWanderTarget();
    }
    this.moveTowards(this.wanderTarget, this.walkSpeed, dt);
  }

  pickWanderTarget(center = this.home, radius = this.wanderRadius) {
    const angle = Math.random() * Math.PI * 2;
    const dist = radius > 0 ? Math.random() * radius : 0;
    const offset = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
    this.wanderTarget.copy(center).add(offset);
    this.wanderTarget.y = 0;
    this.nextWanderSwitch = performance.now() + THREE.MathUtils.randFloat(2000, 5000);
  }

  moveTowards(target, speed, dt) {
    const dir = target.clone().sub(this.mesh.position);
    dir.y = 0;
    const dist = dir.length();
    if (dist < 1e-3) return dist;
    const step = speed * dt;
    if (step >= dist) {
      this.mesh.position.copy(target);
      this.mesh.position.y = 0;
      return 0;
    }
    dir.normalize();
    this.mesh.position.addScaledVector(dir, step);
    this.mesh.position.y = 0;
    return dist - step;
  }
}

