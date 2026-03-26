import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { controls, initControls, consumeFlashlightToggle, consumeLookDelta } from './controls.js';
import { NightClock } from './dayNight.js';
import { Animatronic } from './rabbit.js';
import { createUIBindings } from './settings.js';

function createOffice(scene) {
  const room = new THREE.Group();

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x1f2329, roughness: 0.95 })
  );
  floor.rotation.x = -Math.PI / 2;
  room.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2d3440, roughness: 0.95 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), wallMat);
  backWall.position.set(0, 4, -10);
  room.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-10, 4, 0);
  room.add(leftWall);

  const rightWall = leftWall.clone();
  rightWall.position.x = 10;
  rightWall.rotation.y = -Math.PI / 2;
  room.add(rightWall);

  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(6, 1.2, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x3b3129 })
  );
  desk.position.set(0, 0.6, -3.2);
  room.add(desk);

  const doorwayFrame = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 6.5, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x111418 })
  );
  doorwayFrame.position.set(0, 3.25, -9.9);
  room.add(doorwayFrame);

  scene.add(room);
}

export function startGame() {
  const app = document.getElementById('app');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  app.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05080d);

  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 1.65, 2.6);

  createOffice(scene);

  const ambient = new THREE.AmbientLight(0x7d8aa0, 0.25);
  scene.add(ambient);

  const roomLight = new THREE.PointLight(0x9fb6dd, 0.35, 16);
  roomLight.position.set(0, 2.8, -2.2);
  scene.add(roomLight);

  const flashlight = new THREE.SpotLight(0xfff6cc, 0, 20, Math.PI / 8, 0.45, 1.1);
  flashlight.position.copy(camera.position);
  flashlight.target.position.set(0, 1.4, -4);
  scene.add(flashlight);
  scene.add(flashlight.target);

  const ui = createUIBindings();
  const gameClock = new NightClock({ totalSeconds: 180 });
  const animatronic = new Animatronic(scene);

  let yaw = 0;
  let pitch = 0;
  let flashlightOn = false;
  let gameWon = false;

  initControls(renderer.domElement, () => ui.toggleInstructions());

  const clock = new THREE.Clock();

  function animate() {
    const dt = clock.getDelta();

    const look = consumeLookDelta();
    yaw -= look.x * 0.0025;
    pitch -= look.y * 0.002;
    pitch = Math.max(-0.55, Math.min(0.55, pitch));

    const moveSpeed = 2.2;
    const forward = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).negate();

    if (controls.keys.has('KeyW')) camera.position.addScaledVector(forward, moveSpeed * dt);
    if (controls.keys.has('KeyS')) camera.position.addScaledVector(forward, -moveSpeed * dt);
    if (controls.keys.has('KeyA')) camera.position.addScaledVector(right, -moveSpeed * dt);
    if (controls.keys.has('KeyD')) camera.position.addScaledVector(right, moveSpeed * dt);

    camera.position.x = Math.max(-4, Math.min(4, camera.position.x));
    camera.position.z = Math.max(0.8, Math.min(4.5, camera.position.z));

    camera.rotation.set(pitch, yaw, 0, 'YXZ');

    if (consumeFlashlightToggle()) flashlightOn = !flashlightOn;

    flashlight.intensity = flashlightOn ? 2.2 : 0;
    flashlight.position.copy(camera.position);
    const targetDir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
    flashlight.target.position.copy(camera.position).addScaledVector(targetDir, 6);

    gameClock.update(dt);
    ui.setClock(gameClock.getClockText());

    const spawnHour = gameClock.consumeAppearanceTrigger();
    if (spawnHour) {
      animatronic.spawnForHour(spawnHour);
      ui.setStatus(`Movement detected at ${spawnHour} AM`);
    }

    animatronic.update(dt);

    const dist = camera.position.distanceTo(animatronic.position);
    const lit = animatronic.visible && flashlightOn && dist < 14;
    animatronic.setLitByFlashlight(lit);

    if (animatronic.visible && !flashlightOn) {
      ui.setStatus('You hear metal footsteps... turn on the flashlight.');
    } else if (lit) {
      ui.setStatus('Target in sight. Stay calm.');
    } else if (!gameWon) {
      ui.setStatus('Survive until 6 AM');
    }

    if (gameClock.finished && !gameWon) {
      gameWon = true;
      ui.setStatus('6 AM — You survived the night.');
    }

    ui.setFlashlight(flashlightOn);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}
