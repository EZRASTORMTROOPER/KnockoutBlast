import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export class DayNightCycle {
  constructor(scene, sun, hemi) {
    this.scene = scene;
    this.sun = sun;
    this.hemi = hemi;
    this.duration = 60000; // ms for full cycle (30s day + 30s night)
    this.half = this.duration / 2;
    this.start = performance.now();
    this.icon = document.getElementById('cycle-icon');
    this.progress = document.getElementById('cycle-progress');
    this.circ = 2 * Math.PI * 28;
    if (this.progress) {
      this.progress.style.strokeDasharray = String(this.circ);
    }
  }

  isNight() {
    const phase = (performance.now() - this.start) % this.duration;
    return phase >= this.half;
  }

  update() {
    const phase = (performance.now() - this.start) % this.duration;
    const night = phase >= this.half;
    const t = (phase % this.half) / this.half;
    if (this.progress) {
      const offset = this.circ * (1 - t);
      this.progress.style.strokeDashoffset = String(offset);
    }

    if (night) {
      if (this.icon) this.icon.textContent = '🌙';
      this.scene.background.set(0x000000);
      this.scene.fog.color.set(0x000000);
      this.scene.fog.near = 2;
      this.scene.fog.far = 30;
      this.sun.intensity = 0.1;
      this.hemi.intensity = 0.2;
    } else {
      if (this.icon) this.icon.textContent = '☀️';
      this.scene.background.set(0x7fb0ff);
      this.scene.fog.color.set(0x7fb0ff);
      this.scene.fog.near = 20;
      this.scene.fog.far = 140;
      this.sun.intensity = 1.0;
      this.hemi.intensity = 0.6;
    }
  }
}
