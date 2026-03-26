export class NightClock {
  constructor({ totalSeconds = 180 } = {}) {
    this.totalSeconds = totalSeconds;
    this.elapsed = 0;
    this.currentHour = 12;
    this.finished = false;

    this.appearanceHours = [2, 3, 4, 5];
    this.triggeredHours = new Set();
  }

  update(dtSeconds) {
    if (this.finished) return;
    this.elapsed += dtSeconds;
    const progress = Math.min(this.elapsed / this.totalSeconds, 1);

    const hourIndex = Math.floor(progress * 6); // 0..6
    this.currentHour = (12 + hourIndex) % 12 || 12;

    if (progress >= 1) this.finished = true;
  }

  getClockText() {
    return `${this.currentHour} AM`;
  }

  consumeAppearanceTrigger() {
    if (!this.appearanceHours.includes(this.currentHour)) return null;
    if (this.triggeredHours.has(this.currentHour)) return null;

    this.triggeredHours.add(this.currentHour);
    return this.currentHour;
  }
}
