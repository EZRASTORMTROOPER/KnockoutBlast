import { controls, initControls } from "./controls.js";
import { DayNightCycle } from './dayNight.js';
import { Rabbit } from './rabbit.js';
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
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

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7fb0ff);
scene.fog = new THREE.Fog(0x7fb0ff, 20, 140);

// --- Camera (third‑person follow) ---
const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 500);
const DEFAULT_FOV = 70;
const AIM_FOV = 45;
camera.fov = DEFAULT_FOV;

// Crosshair element for zoom state
const crosshairEl = document.querySelector('.crosshair');

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

// Player health UI
let playerHealth = 100;
const healthEl = document.createElement('div');
healthEl.className = 'health-ui';
healthEl.textContent = 'Health: 100';
document.body.appendChild(healthEl);
function updateHealthUI() {
  healthEl.textContent = `Health: ${Math.round(playerHealth)}`;
}

// Rabbits and day/night cycle
const rabbits = [
  new Rabbit(scene, player, 1, {
    onTrap: () => { controls.trappedUntil = performance.now() + 2000; }
  }),
  new Rabbit(scene, player, 2),
  new Rabbit(scene, player, 3, {
    onAttack: () => { playerHealth *= 0.5; updateHealthUI(); }
  })
];
const dayNight = new DayNightCycle(scene, sun, hemi);
controls.trappedUntil = 0;

// Camera offsets for normal view and aiming view
const camOffsetNormal = new THREE.Vector3(1.6, 1.8, 3.8); // right shoulder & back
const camOffsetAim = new THREE.Vector3(0.3, 1.6, 2.2);     // closer when aiming
const camOffset = camOffsetNormal.clone();

// --- Bullets ---
const bullets = [];
const bulletGeo = new THREE.SphereGeometry(0.1, 12, 8);
const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
const raycaster = new THREE.Raycaster();

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

function shootBullet(){
  // Muzzle position slightly in front/right of player chest, aligned with aim
  const muzzle = new THREE.Vector3(0.4, 1.3, -0.2);
  const muzzleWorld = player.localToWorld(muzzle.clone());

  // Raycast from the camera through the screen center (crosshair)
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  let hitPoint;
  for (const h of hits) {
    // Skip any hits on the player itself
    let obj = h.object;
    let skip = false;
    while (obj) {
      if (obj === player) { skip = true; break; }
      obj = obj.parent;
    }
    if (!skip) { hitPoint = h.point; break; }
  }
  if (!hitPoint) {
    // No hit: use a distant point straight ahead
    hitPoint = raycaster.ray.at(100, new THREE.Vector3());
  }

  // Aim from the muzzle toward the raycast point so bullets pass through the crosshair
  const dir = hitPoint.clone().sub(muzzleWorld).normalize();

  const mesh = new THREE.Mesh(bulletGeo, bulletMat);
  mesh.position.copy(muzzleWorld);
  scene.add(mesh);

  bullets.push({ mesh, vel: dir.multiplyScalar(38), born: performance.now() });
}
function handleClick(){
  const onGround = player.position.y <= 0.001;
  const dragging = rabbits.find(r => r.isDragging);
  if (dragging && onGround) {
    dragging.kick();
  } else {
    shootBullet();
  }
}
initControls(renderer.domElement, handleClick);



// --- Movement & simple ground physics ---
let velY = 0; // vertical velocity for jumping/gravity
const GRAV = 22;

function update(dt){
  dayNight.update(dt);
  const { yaw, pitch, keys } = controls;
  const now = performance.now();
  // Move on XZ using yaw (aim direction)
  const speed = (keys.has('ShiftLeft')||keys.has('ShiftRight')) ? 10 : 6;
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right   = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  let move = new THREE.Vector3();
  if (!controls.trappedUntil || now > controls.trappedUntil) {
    if (keys.has('KeyW')) move.add(forward);
    if (keys.has('KeyS')) move.add(forward.clone().multiplyScalar(-1));
    if (keys.has('KeyD')) move.add(right);
    if (keys.has('KeyA')) move.add(right.clone().multiplyScalar(-1));
    if (move.lengthSq()>0) move.normalize().multiplyScalar(speed*dt);
  }

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

  // Smooth camera offset and FOV based on aiming
    const targetOffset = controls.aiming ? camOffsetAim : camOffsetNormal;
    camOffset.lerp(targetOffset, 0.15);
    const targetFov = controls.aiming ? AIM_FOV : DEFAULT_FOV;
    camera.fov += (targetFov - camera.fov) * 0.15;
    camera.updateProjectionMatrix();
    crosshairEl.classList.toggle('aim', controls.aiming);

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
    // collision with rabbits
    for (const r of rabbits) {
      if (!r.visible) continue;
      const radius = BALL_RADIUS * b.mesh.scale.x;
      if (r.mesh.position.distanceTo(b.mesh.position) < radius + 1) {
        r.hitByBall();
        scene.remove(b.mesh); balls.splice(i,1);
        break;
      }
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

  for (const r of rabbits) {
    r.update(dt, dayNight.isNight, camera);
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
