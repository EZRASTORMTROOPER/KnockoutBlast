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
  constructor(scene, player, options = {}) {
    this.scene = scene;
    this.player = player;
    this.onAttack = options.onAttack;
    this.type = options.type || 1;
    this.mesh = makeRabbit();
    this.visible = false;
    this.isDragging = false;
    this.runAway = false;
    this.dragTimer = 0;
    this.dragDuration = options.dragDuration || 0;
    this.activeDuringDay = options.activeDuringDay || false;

    // Health system
    this.maxHealth = options.health || 500;
    this.health = this.maxHealth;

    this.home = options.home || new THREE.Vector3(30, 0, -30);
    this.homeObject = this.createHome(options.homeType || 'cave');
    scene.add(this.homeObject);
    this.mesh.position.copy(this.home.clone().add(new THREE.Vector3(0, 0, 2)));

    // Health UI
    this.healthEl = document.createElement('div');
    this.healthEl.className = 'health-ui';
    this.healthEl.style.top = `${80 + 24 * (this.type - 1)}px`;
    this.healthEl.style.left = '16px';
    this.healthEl.style.bottom = 'auto';
    document.body.appendChild(this.healthEl);
    this.updateHealthUI();

    this.screamOnAttack = options.scream || false;
    this.audioCtx = null;
  }

  createHome(type) {
    if (type === 'house') {
      return this.createHouse(0x8b4513, 0x555555);
    } else if (type === 'sheep') {
      return this.createHouse(0xffffff, 0xcccccc);
    }
    return this.createCave();
  }

  createHouse(colorBase, colorRoof) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, 4),
      new THREE.MeshLambertMaterial({ color: colorBase })
    );
    base.position.y = 1.25;
    base.castShadow = true; base.receiveShadow = true;

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 2, 4),
      new THREE.MeshLambertMaterial({ color: colorRoof })
    );
    roof.position.y = 2.5; roof.castShadow = true; roof.rotation.y = Math.PI/4;
    g.add(base, roof);
    g.position.copy(this.home);
    g.receiveShadow = true;
    return g;
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

  updateHealthUI() {
    this.healthEl.textContent = `${this.health}/${this.maxHealth}`;
  }

  startNight() {
    if (this.dead) return;
    if (!this.visible) {
      this.scene.add(this.mesh);
      this.visible = true;
    }
  }

  endNight() {
    this.isDragging = false;
    this.runAway = false;
    this.dragTimer = 0;
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
      this.dragTimer += dt;
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
      this.dragTimer = 0;
      if (this.onAttack) this.onAttack();
      if (this.screamOnAttack) this.scream();
    }
  }

  scream() {
    if (this.audioCtx) return;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 400;
    gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.4, this.audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.7);
    osc.connect(gain).connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.7);
    osc.onended = () => { this.audioCtx.close(); this.audioCtx = null; };
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    this.updateHealthUI();
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.scene.remove(this.mesh);
    this.visible = false;
    this.dead = true;
    this.healthEl.remove();
  }

  kick() {
    if (!this.isDragging) return;
    if (this.dragTimer < this.dragDuration) return; // cannot escape yet
    this.isDragging = false;
    this.runAway = true;
  }
}
