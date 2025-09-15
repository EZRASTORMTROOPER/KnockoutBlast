import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { DayNightCycle } from './dayNightCycle.js';
import { NightRabbit } from './rabbit.js';

// --- Renderer & Scene ---
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7fb0ff);
scene.fog = new THREE.Fog(0x7fb0ff, 20, 140);

// --- Camera (third‑person follow) ---
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);

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

// Day / Night cycle
const dayNight = new DayNightCycle(scene, sun, hemi, document.getElementById('dayNight'));

// --- Ground ---
const groundSize = 240;
const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize, 1, 1);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x6dbb4b });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
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
const rng = (min, max) => Math.random() * (max - min) + min;
const trees = [];
for (let i = 0; i < 220; i++) {
  const t = makeTree();
  const r = groundSize * 0.48;
  let x, z; let tries = 0;
  do {
    x = rng(-r, r); z = rng(-r, r); tries++;
  } while (tries < 50 && Math.hypot(x, z) < 12);
  t.position.set(x, 0, z);
  t.rotation.y = rng(0, Math.PI * 2);
  const s = rng(0.8, 1.4); t.scale.setScalar(s);
  trees.push(t);
  scene.add(t);
}

// --- Player ---
const player = new THREE.Group();

const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.5), new THREE.MeshLambertMaterial({ color: 0x3b82f6 }));
body.position.y = 1.1; body.castShadow = true; body.receiveShadow = true;

const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
head.position.y = 1.1 + 0.85; head.castShadow = true;

const legL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), new THREE.MeshLambertMaterial({ color: 0x1f2937 }));
const legR = legL.clone();
legL.position.set(-0.22, 0.45, 0);
legR.position.set(0.22, 0.45, 0);

const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, 0.25), new THREE.MeshLambertMaterial({ color: 0x3b82f6 }));
const armR = armL.clone();
armL.position.set(-0.6, 1.2, 0);
armR.position.set(0.6, 1.2, 0);

const gun = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.2), new THREE.MeshLambertMaterial({ color: 0x111315 }));
gun.castShadow = true; gun.position.set(0.55, 1.25, -0.12);
armR.add(gun);

player.add(body, head, legL, legR, armL, armR);
player.position.set(0, 0, 0);
scene.add(player);

let playerHealth = 100;
const rabbitCtrl = new NightRabbit(scene, player, () => { playerHealth *= 0.5; });

// --- Controls state ---
let yaw = 0;
let pitch = 0;
const keys = new Set();
let pointerLocked = false;

const camOffset = new THREE.Vector3(-2.5, 1.8, 3.8);

// --- Bullets ---
const bullets = [];
const bulletGeo = new THREE.SphereGeometry(0.1, 12, 8);
const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffffee });

function shoot() {
  const muzzle = new THREE.Vector3(0.4, 1.3, -0.2);
  const muzzleWorld = player.localToWorld(muzzle.clone());
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  const mesh = new THREE.Mesh(bulletGeo, bulletMat);
  mesh.position.copy(muzzleWorld);
  scene.add(mesh);
  bullets.push({ mesh, vel: dir.multiplyScalar(38), born: performance.now() });
}

addEventListener('keydown', e => {
  if (e.code === 'KeyR') {
    document.exitPointerLock();
  } else {
    keys.add(e.code);
  }
});
addEventListener('keyup', e => { keys.delete(e.code); });

const hint = document.getElementById('hint');
addEventListener('mousedown', e => {
  if (!pointerLocked) {
    renderer.domElement.requestPointerLock();
    e.preventDefault();
  } else if (e.button === 0) {
    if (dayNight.isNight && rabbitCtrl.isDragging && onGround) {
      rabbitCtrl.kick();
    } else {
      shoot();
    }
  }
});

document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === renderer.domElement;
  hint.classList.toggle('hidden', pointerLocked);
});

addEventListener('mousemove', e => {
  if (!pointerLocked) return;
  const sensitivity = 0.0027;
  yaw -= e.movementX * sensitivity;
  pitch += e.movementY * sensitivity;
  pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch));
});

let velY = 0;
const GRAV = 22;
let onGround = true;

function update(dt) {
  // Move on XZ using yaw
  const speed = (keys.has('ShiftLeft') || keys.has('ShiftRight')) ? 10 : 6;
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  let move = new THREE.Vector3();
  if (keys.has('KeyW')) move.add(forward);
  if (keys.has('KeyS')) move.add(forward.clone().multiplyScalar(-1));
  if (keys.has('KeyD')) move.add(right);
  if (keys.has('KeyA')) move.add(right.clone().multiplyScalar(-1));
  if (move.lengthSq() > 0) move.normalize().multiplyScalar(speed * dt);

  player.position.add(move);

  onGround = player.position.y <= 0.0 + 0.001;
  if (onGround) { player.position.y = 0; velY = 0; }
  if (onGround && keys.has('Space')) velY = 7.5;
  velY -= GRAV * dt;
  player.position.y += velY * dt;
  if (player.position.y < 0) { player.position.y = 0; velY = 0; }

  player.rotation.y = yaw;
  armR.rotation.x = pitch * 0.75;

  const camRot = new THREE.Euler(pitch, yaw, 0, 'YXZ');
  const offsetWorld = camOffset.clone().applyEuler(camRot);
  const camPos = player.position.clone().add(offsetWorld);
  camera.position.lerp(camPos, 0.85);
  camera.lookAt(player.position.x, player.position.y + 1.3, player.position.z);

  const now = performance.now();
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.mesh.position.addScaledVector(b.vel, dt);
    const life = (now - b.born) / 3000;
    b.mesh.scale.setScalar(Math.max(0, 1 - life));
    if (life > 1 || b.mesh.position.length() > groundSize) {
      scene.remove(b.mesh); bullets.splice(i, 1);
    }
  }

  dayNight.update(dt);
  if (dayNight.switched) {
    if (dayNight.isNight) rabbitCtrl.startNight(); else rabbitCtrl.endNight();
    dayNight.switched = false;
  }
  rabbitCtrl.update(dt, player, onGround);
}

let last = performance.now();
function animate() {
  const now = performance.now();
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

player.position.set(0, 0, 8);
camera.position.set(-2.5, 2.2, 12);
camera.lookAt(player.position.x, 1.3, player.position.z);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

animate();

