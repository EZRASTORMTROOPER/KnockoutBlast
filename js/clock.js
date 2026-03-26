import { HOUR_LENGTH_SECONDS, GAME_HOURS } from './constants.js';

export class NightClock {
  constructor() {
    this.elapsed = 0;
  }

  update(deltaSeconds) {
    this.elapsed += deltaSeconds;
  }

  getHour() {
    const index = Math.min(Math.floor(this.elapsed / HOUR_LENGTH_SECONDS), GAME_HOURS.length - 1);
    return GAME_HOURS[index];
  }

  formatHour() {
    const hour = this.getHour();
    return `${hour} AM`;
  }

  isComplete() {
    return this.getHour() >= 6;
  }
}
