const NIGHT_DURATION_SECONDS = 180;
const START_HOUR = 12;
const END_HOUR = 6;

export function createClockSystem(clockEl) {
  let elapsed = 0;

  function updateClockText() {
    const totalHours = 6;
    const progress = Math.min(1, elapsed / NIGHT_DURATION_SECONDS);
    const currentHourIndex = Math.floor(progress * totalHours);
    let hour = START_HOUR + currentHourIndex;

    if (hour > 12) {
      hour -= 12;
    }
    if (hour === 0) {
      hour = 12;
    }

    clockEl.textContent = `${hour}:00 AM`;
  }

  return {
    update(dt) {
      elapsed += dt;
      if (elapsed >= NIGHT_DURATION_SECONDS) {
        elapsed = NIGHT_DURATION_SECONDS;
        clockEl.textContent = `${END_HOUR}:00 AM (Survived)`;
        return;
      }
      updateClockText();
    },
    getCurrentHour() {
      const progress = Math.min(1, elapsed / NIGHT_DURATION_SECONDS);
      const hourValue = 12 + progress * 6;
      if (hourValue >= 13) {
        return hourValue - 12;
      }
      return hourValue;
    },
    isAfter2am() {
      const hour = this.getCurrentHour();
      return hour >= 2 && hour < 6;
    },
  };
}
