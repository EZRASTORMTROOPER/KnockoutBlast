import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { NightClock } from './clock.js';
import { Controls } from './controls.js';
import { OfficeScene } from './officeScene.js';
import { Animatronic } from './animatronic.js';
import { UI } from './ui.js';
import { ANIMATRONIC_SPAWN_HOURS } from './constants.js';

export class Game {
  constructor(mountNode) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    mountNode.appendChild(this.renderer.domElement);

    this.office = new OfficeScene();
    this.clock = new NightClock();
    this.controls = new Controls();
    this.ui = new UI();
    this.animatronic = new Animatronic(this.office.scene);

    this.lastFrame = performance.now();
    this.spawnedAtHours = new Set();
    this.gameOver = false;

    addEventListener('resize', () => {
      this.renderer.setSize(innerWidth, innerHeight);
      this.office.resize();
    });
  }

  tick = (now) => {
    const dt = Math.min((now - this.lastFrame) / 1000, 0.1);
    this.lastFrame = now;

    if (!this.gameOver) {
      this.clock.update(dt);
      const hour = this.clock.getHour();

      if (ANIMATRONIC_SPAWN_HOURS.includes(hour) && !this.spawnedAtHours.has(hour)) {
        this.spawnedAtHours.add(hour);
        this.animatronic.spawn();
        this.ui.showEvent('Movement detected in hallway');
      }

      const flashlightOn = this.controls.isFlashlightOn();
      this.office.setView(this.controls.view);
      this.office.setFlashlight(flashlightOn);

      const result = this.animatronic.update(dt, {
        playerView: this.controls.view,
        flashlightOn,
      });

      if (result.flashedAway) {
        this.ui.showEvent('Animatronic repelled');
      }
      if (result.jumpscare) {
        this.gameOver = true;
        this.ui.showEvent('JUMPSCARE - Shift failed', 3000);
      }
      if (this.clock.isComplete()) {
        this.gameOver = true;
        this.animatronic.hide();
        this.ui.showEvent('6 AM - You survived!', 3500);
      }

      this.ui.update({
        hourLabel: this.clock.formatHour(),
        flashlightOn,
        view: this.controls.view,
      });
    }

    this.renderer.render(this.office.scene, this.office.camera);
    requestAnimationFrame(this.tick);
  };

  start() {
    requestAnimationFrame(this.tick);
  }
}
