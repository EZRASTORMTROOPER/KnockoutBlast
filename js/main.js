import { createOfficeScene } from './officeScene.js';
import { createClockSystem } from './clockSystem.js';
import { createAnimatronicSystem } from './animatronicSystem.js';
import { createFlashlightSystem } from './flashlightSystem.js';
import { createPlayerController } from './playerController.js';
import { setupInstructionsPanel } from './uiSystem.js';

const app = document.getElementById('app');
const clockEl = document.getElementById('clockValue');
const threatEl = document.getElementById('threatValue');
const flashEl = document.getElementById('flashState');

const office = createOfficeScene(app);
const clock = createClockSystem(clockEl);
const flashlight = createFlashlightSystem(office.camera, office.scene, flashEl);
const animatronic = createAnimatronicSystem(office.scene, office.camera, threatEl);
const player = createPlayerController(office.camera, office.renderer.domElement, office.roomBounds);

setupInstructionsPanel();

let lastTime = performance.now();

function tick(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  player.update(dt);
  clock.update(dt);
  flashlight.update(dt, clock.isAfter2am());
  animatronic.update({
    dt,
    gameHour: clock.getCurrentHour(),
    flashlightOn: flashlight.isOn,
    flashlightCone: flashlight.cone,
    playerPosition: office.camera.position,
  });

  office.render();
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
