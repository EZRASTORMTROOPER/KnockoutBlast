export function createUI() {
  const clockEl = document.getElementById('clock');
  const flashlightEl = document.getElementById('flashlight-indicator');
  const eventLogEl = document.getElementById('event-log');
  const closeHelp = document.getElementById('close-help');
  const instructions = document.getElementById('instructions');

  closeHelp.addEventListener('click', () => {
    instructions.style.display = 'none';
  });

  return {
    setClock(label) {
      clockEl.textContent = label;
    },
    setFlashlight(on) {
      flashlightEl.textContent = `Flashlight: ${on ? 'ON' : 'OFF'}`;
      flashlightEl.classList.toggle('on', on);
    },
    setMessage(msg) {
      eventLogEl.textContent = msg;
    }
  };
}
