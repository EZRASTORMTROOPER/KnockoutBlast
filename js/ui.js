import { VIEW_LABELS } from './constants.js';

export class UI {
  constructor() {
    this.clockEl = document.getElementById('clock');
    this.flashlightEl = document.getElementById('flashlight');
    this.lookEl = document.getElementById('lookIndicator');
    this.eventEl = document.getElementById('eventMessage');
    this.eventTimeout = null;
  }

  update({ hourLabel, flashlightOn, view }) {
    this.clockEl.textContent = hourLabel;
    this.flashlightEl.textContent = `Flashlight: ${flashlightOn ? 'ON' : 'OFF'}`;
    this.lookEl.textContent = `View: ${VIEW_LABELS[view]}`;
  }

  showEvent(text, duration = 1200) {
    this.eventEl.textContent = text;
    this.eventEl.classList.add('visible');
    clearTimeout(this.eventTimeout);
    this.eventTimeout = setTimeout(() => this.eventEl.classList.remove('visible'), duration);
  }
}
