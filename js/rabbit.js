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

  g.add(body, head, earL, earR, eyeL, eyeR);
  g.scale.set(2.2, 2.2, 2.2);
  return g;
}

function makeHouse(color=0x885533) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4,2,4),
    new THREE.MeshLambertMaterial({color})
  );
  base.position.y = 1; base.castShadow = true; base.receiveShadow = true;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5,2,4),
    new THREE.MeshLambertMaterial({color:0x553311})
  );
  roof.position.y = 2; roof.rotation.y = Math.PI/4; roof.castShadow = true; roof.receiveShadow = true;
  g.add(base, roof);
  return g;
}

function makeSheepHouse(){
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(2,16,16),
    new THREE.MeshLambertMaterial({color:0xffffff})
  );
  body.castShadow = true; body.receiveShadow = true; body.position.y = 2;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.8,16,16),
    new THREE.MeshLambertMaterial({color:0x333333})
  );
  head.position.set(0,2.6,1.6); head.castShadow = true; head.receiveShadow = true;
  g.add(body, head);
  return g;
}

function makeCave(){
  const geo = new THREE.CylinderGeometry(2,2,2,16,1,true);
  geo.rotateX(Math.PI/2);
  const mat = new THREE.MeshLambertMaterial({color:0x554433, side:THREE.DoubleSide});
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true;
  return m;
}

export class Rabbit{
  constructor(scene,camera,player,options={}){
    this.scene = scene;
    this.camera = camera;
    this.player = player;
    this.type = options.type||1;
    this.home = options.home || new THREE.Vector3();
    this.onTrap = options.onTrap;
    this.onAttack = options.onAttack;
    this.sneak = options.sneak||false;
    this.mesh = makeRabbitMesh();
    this.mesh.position.copy(this.home.clone().add(new THREE.Vector3(0,0,2)));
    this.visible = false;
    this.isDragging = false;
    this.runAway = false;
    this.shield = options.shield||false;
    this.dead = false;

    this.maxHealth = options.maxHealth||500;
    this.health = this.maxHealth;
    this.healthEl = document.createElement('div');
    this.healthEl.className = 'enemy-health';
    this.barEl = document.createElement('div');
    this.barEl.className = 'bar';
    this.numEl = document.createElement('span');
    this.healthEl.appendChild(this.barEl);
    this.healthEl.appendChild(this.numEl);
    document.body.appendChild(this.healthEl);
    this.healthEl.style.display = 'none';

    if(this.type===1){
      this.homeMesh = makeHouse();
    }else if(this.type===2){
      this.homeMesh = makeSheepHouse();
    }else{
      this.homeMesh = makeCave();
    }
    this.homeMesh.position.copy(this.home);
    scene.add(this.homeMesh);
  }

  startNight(){
    if(this.dead) return;
    if(!this.visible){
      this.scene.add(this.mesh);
      this.visible = true;
      this.healthEl.style.display = 'block';
    }
  }

  endNight(){
    if(this.sneak || this.dead) return; // sneaky rabbit stays
    this.isDragging = false;
    this.runAway = false;
    if(this.visible){
      this.scene.remove(this.mesh);
      this.visible = false;
      this.mesh.position.copy(this.home.clone().add(new THREE.Vector3(0,0,2)));
      this.healthEl.style.display = 'none';
    }
  }

  updateHealthBar(){
    const pos = this.mesh.position.clone();
    pos.project(this.camera);
    const x = (pos.x * 0.5 + 0.5) * innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * innerHeight;
    this.healthEl.style.left = `${x}px`;
    this.healthEl.style.top = `${y}px`;
    const ratio = this.health / this.maxHealth;
    this.barEl.style.width = `${Math.max(0,ratio)*100}%`;
    this.numEl.textContent = `${Math.round(this.health)}`;
  }

  hit(amount=10){
    if(this.shield){
      this.shield = false; // first hit absorbed
      return;
    }
    this.health -= amount;
    if(this.health <= 0){
      this.die();
    }
  }

  die(){
    this.dead = true;
    this.endNight();
    this.scene.remove(this.homeMesh);
    this.healthEl.remove();
  }

  update(dt){
    if(this.dead) { this.updateHealthBar(); return; }
    if(!this.visible) { this.updateHealthBar(); return; }
    if(this.runAway){
      const dir = this.home.clone().sub(this.mesh.position).setY(0);
      const dist = dir.length();
      if(dist>0.1){
        dir.normalize();
        this.mesh.position.addScaledVector(dir,5*dt);
      }else{
        this.endNight();
      }
      this.updateHealthBar();
      return;
    }

    if(this.isDragging){
      const dir = this.home.clone().sub(this.player.position).setY(0).normalize();
      this.player.position.addScaledVector(dir,2*dt);
      this.mesh.position.copy(this.player.position);
      this.updateHealthBar();
      return;
    }

    const dir = this.player.position.clone().sub(this.mesh.position);
    dir.y = 0;
    const dist = dir.length();
    if(dist>0.1){
      dir.normalize();
      this.mesh.position.addScaledVector(dir,2*dt);
    }

    if(dist < 1){
      if(this.type===1){
        if(this.onTrap) this.onTrap();
      }else if(this.type===3){
        this.isDragging = true;
        if(this.onAttack) this.onAttack();
      }else{
        if(this.onAttack) this.onAttack();
      }
    }
    this.updateHealthBar();
  }

  kick(){
    if(!this.isDragging) return;
    this.isDragging = false;
    this.runAway = true;
  }
}
