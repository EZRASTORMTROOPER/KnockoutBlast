import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export class DayNightCycle {
  constructor(scene, duration = 40) {
    this.scene = scene;
    this.duration = duration; // seconds for full cycle
    this.timer = 0;
    this.night = false;

    // UI setup
    const ui = document.getElementById('dayNightUI');
    this.progress = ui.querySelector('.progress');
    this.icon = ui.querySelector('.icon');
    this.circumference = 2 * Math.PI * 16;
    this.progress.style.strokeDasharray = this.circumference;
    this.progress.style.strokeDashoffset = this.circumference;

    this.setDay();
  }

  update(dt) {
    this.timer += dt;
    if (this.timer > this.duration) this.timer -= this.duration;
    const p = this.timer / this.duration;
    this.progress.style.strokeDashoffset = this.circumference * (1 - p);
    const nightNow = p > 0.5;
    if (nightNow !== this.night) {
      this.night = nightNow;
      if (this.night) this.setNight(); else this.setDay();
    }
  }

  setDay() {
    this.scene.background.set(0x7fb0ff);
    this.scene.fog.color.set(0x7fb0ff);
    this.scene.fog.near = 20;
    this.scene.fog.far = 140;
    this.icon.textContent = '☀️';
    this.progress.style.stroke = '#facc15';
  }

  setNight() {
    this.scene.background.set(0x000000);
    this.scene.fog.color.set(0x000000);
    this.scene.fog.near = 5;
    this.scene.fog.far = 60;
    this.icon.textContent = '🌙';
    this.progress.style.stroke = '#4f46e5';
  }

  isNight() {
    return this.night;
  }
}
