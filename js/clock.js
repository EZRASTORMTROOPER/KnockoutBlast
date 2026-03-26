export function createNightClock(totalSeconds) {
  let elapsed = 0;

  return {
    update(dt) {
      elapsed = Math.min(totalSeconds, elapsed + dt);
    },
    getHourFloat() {
      return 12 + (elapsed / totalSeconds) * 6;
    },
    getFormattedTime() {
      const hourFloat = 12 + (elapsed / totalSeconds) * 6;
      let hour = Math.floor(hourFloat);
      const minute = Math.floor((hourFloat % 1) * 60);
      if (hour >= 13) hour -= 12;
      const ampm = 'AM';
      return `${hour}:${String(minute).padStart(2, '0')} ${ampm}`;
    },
    isComplete() {
      return elapsed >= totalSeconds;
    }
  };
}
