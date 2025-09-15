import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

// Handles the day/night cycle visuals and environment updates
export class DayNightCycle {
  constructor(scene, sun, hemi) {
    this.scene = scene;
    this.sun = sun;
    this.hemi = hemi;
    this.duration = 60000; // full cycle in ms (60s)
    this.time = 0;
    this.isNight = false;

    // create UI
    const circumference = 2 * Math.PI * 45;
    const container = document.createElement('div');
    container.className = 'cycle-ui';
    container.innerHTML = `
      <svg viewBox="0 0 100 100">
        <circle class="bg" cx="50" cy="50" r="45" />
        <circle class="progress" cx="50" cy="50" r="45" />
      </svg>
      <div class="cycle-icon">☀️</div>`;
    document.body.appendChild(container);
    this.progressEl = container.querySelector('.progress');
    this.iconEl = container.querySelector('.cycle-icon');
    this.progressEl.style.strokeDasharray = `${circumference}`;
    this.circumference = circumference;
  }

  update(dt) {
    this.time = (this.time + dt * 1000) % this.duration;
    const phase = this.time / this.duration; // 0..1
    const offset = this.circumference * (1 - phase);
    this.progressEl.style.strokeDashoffset = offset;
    const night = phase >= 0.5;
    if (night !== this.isNight) {
      this.isNight = night;
      this.applyLighting();
    }
  }

  applyLighting() {
    if (this.isNight) {
      this.scene.background.set(0x000000);
      this.scene.fog.color.set(0x000000);
      this.scene.fog.near = 5;
      this.scene.fog.far = 30;
      this.sun.intensity = 0.1;
      this.hemi.intensity = 0.2;
      this.iconEl.textContent = '🌙';
    } else {
      this.scene.background.set(0x7fb0ff);
      this.scene.fog.color.set(0x7fb0ff);
      this.scene.fog.near = 20;
      this.scene.fog.far = 140;
      this.sun.intensity = 1.0;
      this.hemi.intensity = 0.6;
      this.iconEl.textContent = '☀️';
    }
  }
}
