export class DayNightCycle {
  constructor(scene, sun, hemi) {
    this.scene = scene;
    this.sun = sun;
    this.hemi = hemi;
    this.time = 0;
    this.phaseDuration = 30; // seconds for day or night
    this.isNight = false;
    this.icon = document.getElementById('cycle-icon');
    this.bar = document.getElementById('cycle-bar');
    this.updateVisuals();
  }

  update(dt) {
    this.time += dt;
    const cycleLength = this.phaseDuration * 2;
    const phaseTime = this.time % cycleLength;
    const newIsNight = phaseTime >= this.phaseDuration;
    if (newIsNight !== this.isNight) {
      this.isNight = newIsNight;
      this.updateVisuals();
    }
    const progress = newIsNight ? (phaseTime - this.phaseDuration) / this.phaseDuration : phaseTime / this.phaseDuration;
    const dash = 100 - progress * 100;
    if (this.bar) this.bar.style.strokeDashoffset = dash;
  }

  updateVisuals() {
    if (this.icon) this.icon.textContent = this.isNight ? '\u{1F319}' : '\u2600\uFE0F'; // moon or sun
    if (this.scene) {
      if (this.isNight) {
        this.scene.background.set(0x000000);
        this.scene.fog.color.set(0x000000);
        this.scene.fog.near = 5;
        this.scene.fog.far = 60;
      } else {
        this.scene.background.set(0x7fb0ff);
        this.scene.fog.color.set(0x7fb0ff);
        this.scene.fog.near = 20;
        this.scene.fog.far = 140;
      }
    }
    if (this.sun) this.sun.intensity = this.isNight ? 0.2 : 1.0;
    if (this.hemi) this.hemi.intensity = this.isNight ? 0.1 : 0.6;
  }
}
