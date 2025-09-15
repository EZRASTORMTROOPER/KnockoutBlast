import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export class DayNightCycle {
  constructor(scene, sun, hemi) {
    this.scene = scene;
    this.sun = sun;
    this.hemi = hemi;
    this.duration = 60000; // 60s for a full cycle
    this.start = performance.now();
    this.circle = document.getElementById('cycleProgress');
    this.icon = document.getElementById('cycleIcon');
    const r = 45;
    this.circumference = 2 * Math.PI * r;
    if (this.circle) {
      this.circle.style.strokeDasharray = `${this.circumference}`;
      this.circle.style.strokeDashoffset = `${this.circumference}`;
    }
    this.night = false;
  }

  update(now) {
    const elapsed = (now - this.start) % this.duration;
    const t = elapsed / this.duration;
    if (this.circle) {
      this.circle.style.strokeDashoffset = `${this.circumference * (1 - t)}`;
    }
    const nightNow = t >= 0.5;
    if (nightNow !== this.night) {
      this.night = nightNow;
      if (nightNow) {
        this.icon.textContent = '🌙';
        this.scene.background.set(0x000000);
        this.scene.fog.color.set(0x000000);
        this.scene.fog.near = 2;
        this.scene.fog.far = 40;
        this.sun.intensity = 0.1;
        this.hemi.intensity = 0.1;
      } else {
        this.icon.textContent = '☀️';
        this.scene.background.set(0x7fb0ff);
        this.scene.fog.color.set(0x7fb0ff);
        this.scene.fog.near = 20;
        this.scene.fog.far = 140;
        this.sun.intensity = 1.0;
        this.hemi.intensity = 0.6;
      }
    }
  }

  isNight() {
    return this.night;
  }
}
