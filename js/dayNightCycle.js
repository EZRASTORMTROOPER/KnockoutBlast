import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export class DayNightCycle {
  constructor(scene, sun, hemi, uiRoot) {
    this.scene = scene;
    this.sun = sun;
    this.hemi = hemi;
    this.uiRoot = uiRoot;
    this.duration = 60; // seconds for full cycle
    this.time = 0;
    this.isNight = false;
    this.prev = false;
    this.switched = false;

    this.circumference = 2 * Math.PI * 45;

    if (uiRoot) {
      uiRoot.innerHTML = `
        <svg viewBox="0 0 100 100">
          <circle class="bg" cx="50" cy="50" r="45"></circle>
          <circle class="progress" cx="50" cy="50" r="45"></circle>
        </svg>
        <div class="icon sun">☀️</div>
        <div class="icon moon">🌙</div>
      `;
      this.progress = uiRoot.querySelector('.progress');
    }

    this.toDay();
  }

  update(dt) {
    this.time += dt;
    const phase = (this.time % this.duration) / this.duration;
    this.prev = this.isNight;
    this.isNight = phase >= 0.5;
    if (this.prev !== this.isNight) {
      this.switched = true;
      if (this.isNight) this.toNight(); else this.toDay();
      if (this.uiRoot) this.uiRoot.classList.toggle('night', this.isNight);
    }
    if (this.progress) {
      const offset = this.circumference * (1 - phase);
      this.progress.style.strokeDashoffset = offset;
    }
  }

  toNight() {
    this.scene.background.set(0x000000);
    this.scene.fog.color.set(0x000000);
    this.scene.fog.near = 5;
    this.scene.fog.far = 40;
    this.sun.intensity = 0.15;
    this.hemi.intensity = 0.1;
  }

  toDay() {
    this.scene.background.set(0x7fb0ff);
    this.scene.fog.color.set(0x7fb0ff);
    this.scene.fog.near = 20;
    this.scene.fog.far = 140;
    this.sun.intensity = 1.0;
    this.hemi.intensity = 0.6;
  }
}

