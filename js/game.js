import { createScene } from './scene.js';
import { createInput } from './input.js';
import { createNightClock } from './clock.js';
import { createEnemy } from './enemy.js';
import { createUI } from './ui.js';
import { GAME_CONFIG } from './config.js';

export function startGame() {
  const app = document.getElementById('app');
  const ui = createUI();
  const input = createInput();
  const { scene, camera, renderer, flashlight } = createScene(app);

  const gameClock = createNightClock(GAME_CONFIG.nightDurationSeconds);
  const enemy = createEnemy(scene, GAME_CONFIG.enemyRevealTimes, GAME_CONFIG.enemyRevealWindowHours);

  let lookX = 0;
  let lean = 0;
  let lastTime = performance.now();
  let exposureDanger = 0;
  let won = false;

  const update = (now) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    const lookDir = (input.isDown('KeyD') ? 1 : 0) - (input.isDown('KeyA') ? 1 : 0);
    const leanDir = (input.isDown('KeyW') ? 1 : 0) - (input.isDown('KeyS') ? 1 : 0);

    lookX += lookDir * GAME_CONFIG.lookSensitivity * dt;
    lean += leanDir * GAME_CONFIG.leanSensitivity * dt;
    lookX *= 0.92;
    lean *= 0.9;

    lookX = Math.max(-GAME_CONFIG.officeLookLimit, Math.min(GAME_CONFIG.officeLookLimit, lookX));
    lean = Math.max(-0.35, Math.min(0.35, lean));

    camera.position.x = lookX * 2.1;
    camera.position.y = 1.8 + lean * 0.7;
    camera.lookAt(lookX * 3.2, 1.6 + lean * 0.3, -4.8);

    const flashlightOn = input.isFlashlightOn();
    flashlight.intensity = flashlightOn ? 3.6 : 0;
    flashlight.target.position.set(lookX * 3.1, 1.5 + lean * 0.2, -5.2);
    flashlight.target.updateMatrixWorld();

    gameClock.update(dt);
    ui.setClock(gameClock.getFormattedTime());
    ui.setFlashlight(flashlightOn);

    const enemyState = enemy.update(gameClock.getHourFloat(), flashlightOn, dt);

    if (enemyState.active && !enemyState.visibleWithFlashlight) {
      exposureDanger += dt;
    } else {
      exposureDanger = Math.max(0, exposureDanger - dt * 0.6);
    }

    if (gameClock.isComplete() && !won) {
      won = true;
      ui.setMessage('6:00 AM! You survived this prototype night.');
    } else if (enemyState.active && enemyState.visibleWithFlashlight) {
      ui.setMessage('You spotted it. Keep watching it in the flashlight beam!');
    } else if (enemyState.active) {
      ui.setMessage('It is nearby... turn on the flashlight (F)!');
    }

    if (exposureDanger > GAME_CONFIG.enemyGraceSeconds) {
      ui.setMessage('JUMPSCARE! You lost this round. Refresh to retry.');
      return;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}
