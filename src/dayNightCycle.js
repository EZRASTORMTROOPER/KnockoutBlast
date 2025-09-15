import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export class DayNightCycle {
  constructor(scene) {
    this.scene = scene;
    this.duration = 60; // total cycle length in seconds
    this.elapsed = 0;
    this.isNight = false;

    this.circle = document.getElementById('timer-circle');
    this.icon = document.getElementById('timer-icon');
    const radius = this.circle.r.baseVal.value;
    this.circumference = 2 * Math.PI * radius;
    this.circle.style.strokeDasharray = `${this.circumference}`;
    this.circle.style.strokeDashoffset = `${this.circumference}`;
  }

  update(dt) {
    this.elapsed = (this.elapsed + dt) % this.duration;
    const t = this.elapsed / this.duration; // 0..1
    const wasNight = this.isNight;
    this.isNight = t >= 0.5;

    if (this.isNight !== wasNight) {
      if (this.isNight) {
        this.scene.background.set(0x000000);
        this.scene.fog.color.set(0x000000);
        this.scene.fog.near = 5;
        this.scene.fog.far = 40;
        this.icon.textContent = '🌙';
      } else {
        this.scene.background.set(0x7fb0ff);
        this.scene.fog.color.set(0x7fb0ff);
        this.scene.fog.near = 20;
        this.scene.fog.far = 140;
        this.icon.textContent = '☀️';
      }
    }

    // progress within current phase (day or night)
    const phaseProgress = this.isNight ? (t - 0.5) * 2 : t * 2;
    const offset = this.circumference * (1 - phaseProgress);
    this.circle.style.strokeDashoffset = `${offset}`;
  }
}
