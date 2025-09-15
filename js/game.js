import { controls, initControls } from "./controls.js";
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { DayNightCycle } from './dayNight.js';
export function startGame() {

// --- Renderer & Scene ---
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

// UI controls
const ballSlider = document.getElementById('ballSlider');
const ballCountLabel = document.getElementById('ballCountLabel');
let maxBalls = parseInt(ballSlider.value);
ballSlider.addEventListener('input', () => {
  ballCountLabel.textContent = ballSlider.value;
  maxBalls = parseInt(ballSlider.value);
});

const healthLabel = document.getElementById('healthLabel');
let playerHealth = 100;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7fb0ff);
scene.fog = new THREE.Fog(0x7fb0ff, 20, 140);
const dayNight = new DayNightCycle(scene);

// --- Camera (third‑person follow) ---
const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 500);

// --- Lights ---
const hemi = new THREE.HemisphereLight(0xffffff, 0x335533, 0.6);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(40, 60, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 200;
sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;
scene.add(sun);

// --- Ground ---
const groundSize = 240;
const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize, 1, 1);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x6dbb4b }); // grassy green
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true;
scene.add(ground);

// --- Low‑poly Tree Factory ---
function makeTree() {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 2.5, 6),
    new THREE.MeshLambertMaterial({ color: 0x8b5a2b })
  );
  trunk.castShadow = true; trunk.receiveShadow = true;
  trunk.position.y = 1.25;

  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(1.6, 3.2, 6),
    new THREE.MeshLambertMaterial({ color: 0x2f8f46 })
  );
  foliage.castShadow = true; foliage.receiveShadow = true;
  foliage.position.y = 1.25 + 1.6;

  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 2.2, 6),
    new THREE.MeshLambertMaterial({ color: 0x2a7a3d })
  );
  cap.castShadow = true; cap.receiveShadow = true;
  cap.position.y = foliage.position.y + 1.1;

  group.add(trunk, foliage, cap);
  return group;
}

// Scatter trees but keep a clearing near the spawn
const rng = (min,max)=>Math.random()*(max-min)+min;
const trees = [];
for (let i=0;i<220;i++){
  const t = makeTree();
  const r = groundSize*0.48;
  let x, z; let tries = 0;
  do {
    x = rng(-r, r); z = rng(-r, r); tries++;
  } while (tries < 50 && Math.hypot(x, z) < 12); // keep spawn clearing
  t.position.set(x, 0, z);
  t.rotation.y = rng(0, Math.PI*2);
  const s = rng(0.8, 1.4); t.scale.setScalar(s);
  trees.push(t);
  scene.add(t);
}

// --- Player (generic low‑poly, Fortnite‑inspired POV) ---
const player = new THREE.Group();

// Body parts
const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.5), new THREE.MeshLambertMaterial({ color: 0x3b82f6 }));
body.position.y = 1.1; body.castShadow = true; body.receiveShadow = true;

const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
head.position.y = 1.1 + 0.85; head.castShadow = true;

const legL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), new THREE.MeshLambertMaterial({ color: 0x1f2937 }));
const legR = legL.clone();
legL.position.set(-0.22, 0.45, 0);
legR.position.set( 0.22, 0.45, 0);

const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, 0.25), new THREE.MeshLambertMaterial({ color: 0x3b82f6 }));
const armR = armL.clone();
armL.position.set(-0.6, 1.2, 0);
armR.position.set( 0.6, 1.2, 0);

// Simple blaster
const gun = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.2), new THREE.MeshLambertMaterial({ color: 0x111315 }));
gun.castShadow = true; gun.position.set(0.55, 1.25, -0.12);
armR.add(gun);

player.add(body, head, legL, legR, armL, armR);
player.position.set(0, 0, 0);
scene.add(player);

// --- Scary Rabbit ---
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
  const geo = new THREE.SphereGeometry(3, 16, 12, 0, Math.PI);
  const mat = new THREE.MeshLambertMaterial({ color: 0x444444, side: THREE.DoubleSide });
  const cave = new THREE.Mesh(geo, mat);
  cave.rotation.y = Math.PI;
  cave.position.y = 1.5;
  cave.castShadow = true; cave.receiveShadow = true;
  return cave;
}

const cavePos = new THREE.Vector3(-20, 0, -20);
const cave = makeRabbitCave();
cave.position.copy(cavePos);
scene.add(cave);

const rabbit = makeScaryRabbit();
rabbit.position.copy(cavePos.clone().add(new THREE.Vector3(0,0,2)));
scene.add(rabbit);
let rabbitChasing = false;
let rabbitDragging = false;
let rabbitFleeing = false;


// Camera offset relative to player in local space (over‑the‑shoulder)
const camOffset = new THREE.Vector3(1.6, 1.8, 3.8); // right shoulder & back

// --- Bullets ---
const bullets = [];
const bulletGeo = new THREE.SphereGeometry(0.1, 12, 8);
const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffffee });

// Dispensers and balls
const BALL_RADIUS = 0.4;
const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 16, 12);
const ballMat = new THREE.MeshLambertMaterial({ color: 0xffaa33 });
const dispensers = [
  { pos: new THREE.Vector3(8, 0, 8), last: 0 },
  { pos: new THREE.Vector3(-8, 0, -8), last: 0 },
  { pos: new THREE.Vector3(-8, 0, 8), last: 0 }
];
const balls = [];
let totalDispensed = 0;

// visualize dispensers
const dispGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
const dispMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
for (const d of dispensers) {
  const m = new THREE.Mesh(dispGeo, dispMat);
  m.position.copy(d.pos);
  m.castShadow = true; m.receiveShadow = true;
  scene.add(m);
}

function onAction(){
  const onGround = player.position.y <= 0.001;
  const dist = rabbit.position.distanceTo(player.position);
  if (onGround && dist < 2 && (rabbitChasing || rabbitDragging)) {
    rabbitChasing = false;
    rabbitDragging = false;
    rabbitFleeing = true;
    return;
  }

  const muzzle = new THREE.Vector3(0.4, 1.3, -0.2);
  const muzzleWorld = player.localToWorld(muzzle.clone());

  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);

  const mesh = new THREE.Mesh(bulletGeo, bulletMat);
  mesh.position.copy(muzzleWorld);
  scene.add(mesh);

  bullets.push({ mesh, vel: dir.multiplyScalar(38), born: performance.now() });
}
initControls(renderer.domElement, onAction);



// --- Movement & simple ground physics ---
let velY = 0; // vertical velocity for jumping/gravity
const GRAV = 22;

function update(dt){
  const { yaw, pitch, keys } = controls;
  const now = performance.now();
  dayNight.update(dt);
  const night = dayNight.isNight();
  if (night && !rabbitChasing && !rabbitDragging && !rabbitFleeing) {
    rabbitChasing = true;
    rabbit.position.copy(cavePos.clone().add(new THREE.Vector3(0,0,2)));
  }
  if (!night && (rabbitChasing || rabbitDragging || rabbitFleeing)) {
    rabbitChasing = false; rabbitDragging = false; rabbitFleeing = false;
    rabbit.position.copy(cavePos.clone().add(new THREE.Vector3(0,0,2)));
  }
  // Move on XZ using yaw (aim direction)
  const speed = (keys.has('ShiftLeft')||keys.has('ShiftRight')) ? 10 : 6;
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right   = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  let move = new THREE.Vector3();
  if (keys.has('KeyW')) move.add(forward);
  if (keys.has('KeyS')) move.add(forward.clone().multiplyScalar(-1));
  if (keys.has('KeyD')) move.add(right);
  if (keys.has('KeyA')) move.add(right.clone().multiplyScalar(-1));
  if (move.lengthSq()>0) move.normalize().multiplyScalar(speed*dt);

  player.position.add(move);

  // Jump
  const onGround = player.position.y <= 0.0 + 0.001;
  if (onGround) { player.position.y = 0; velY = 0; }
  if (onGround && keys.has('Space')) velY = 7.5;
  velY -= GRAV * dt;
  player.position.y += velY * dt;
  if (player.position.y < 0) { player.position.y = 0; velY = 0; }

  // Rotate player body to face yaw (torso only for a simple look)
  player.rotation.y = yaw;

  // Aim the right arm toward where camera looks (rough)
  armR.rotation.x = pitch * 0.75;

  // Update camera to orbit around player
    const camRot = new THREE.Euler(pitch, yaw, 0, 'YXZ');
    const offsetWorld = camOffset.clone().applyEuler(camRot);
    const camPos = player.position.clone().add(offsetWorld);
    camera.position.lerp(camPos, 0.85);
    const camQuat = new THREE.Quaternion().setFromEuler(camRot);
    camera.quaternion.slerp(camQuat, 0.85);

  // Spawn balls from dispensers
  for (const d of dispensers) {
    if (totalDispensed >= maxBalls) break;
    if (now - d.last >= 1000) {
      const mesh = new THREE.Mesh(ballGeo, ballMat);
      mesh.position.copy(d.pos).add(new THREE.Vector3(0, BALL_RADIUS, 0));
      mesh.castShadow = true; mesh.receiveShadow = true;
      scene.add(mesh);
      const dir = new THREE.Vector3(Math.random() - 0.5, 0.5, Math.random() - 0.5).normalize();
      balls.push({ mesh, vel: dir.multiplyScalar(6) });
      d.last = now;
      totalDispensed++;
    }
  }

  // Update balls
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    b.vel.y -= GRAV * dt;
    b.mesh.position.addScaledVector(b.vel, dt);
    if (b.mesh.position.y < BALL_RADIUS) {
      b.mesh.position.y = BALL_RADIUS;
      b.vel.y *= -0.6;
    }
    if (b.mesh.position.length() > groundSize) {
      scene.remove(b.mesh); balls.splice(i,1);
    }
  }

  // Bullets update and collision with balls
  for (let i=bullets.length-1;i>=0;i--){
    const b = bullets[i];
    b.mesh.position.addScaledVector(b.vel, dt);
    const life = (now - b.born) / 3000;
    b.mesh.scale.setScalar(Math.max(0, 1 - life));
    if (life > 1 || b.mesh.position.length() > groundSize) {
      scene.remove(b.mesh); bullets.splice(i,1); continue;
    }
    for (let j = balls.length - 1; j >= 0; j--) {
      const ball = balls[j];
      const radius = BALL_RADIUS * ball.mesh.scale.x;
      if (b.mesh.position.distanceTo(ball.mesh.position) < radius + 0.1) {
        ball.mesh.scale.multiplyScalar(0.7);
        scene.remove(b.mesh); bullets.splice(i,1);
        if (ball.mesh.scale.x < 0.2) {
          scene.remove(ball.mesh); balls.splice(j,1);
        }
        break;
      }
    }
  }

  // Rabbit behaviour
  if (rabbitChasing) {
    const dir = player.position.clone().sub(rabbit.position);
    const dist = dir.length();
    dir.normalize();
    rabbit.position.addScaledVector(dir, 3 * dt);
    if (dist < 1.2) {
      rabbitChasing = false;
      rabbitDragging = true;
      playerHealth *= 0.5;
      healthLabel.textContent = Math.round(playerHealth);
    }
  } else if (rabbitDragging) {
    const dir = cavePos.clone().sub(rabbit.position).normalize();
    rabbit.position.addScaledVector(dir, 2 * dt);
    player.position.addScaledVector(dir, 2 * dt);
  } else if (rabbitFleeing) {
    const dir = cavePos.clone().sub(rabbit.position);
    const dist = dir.length();
    dir.normalize();
    rabbit.position.addScaledVector(dir, 6 * dt);
    if (dist < 1) rabbitFleeing = false;
  }
}

// --- Animate ---
let last = performance.now();
function animate(){
  const now = performance.now();
  const dt = Math.min(0.033, (now - last)/1000);
  last = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Spawn position and initial camera placement
  player.position.set(0,0,8);
  camera.position.copy(player.position).add(camOffset);
  camera.quaternion.setFromEuler(new THREE.Euler(0,0,0));

// Resize
addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

animate();

}
