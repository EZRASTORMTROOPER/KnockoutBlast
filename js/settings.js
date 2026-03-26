export function createUIBindings() {
  const clockEl = document.getElementById('clock');
  const statusEl = document.getElementById('status');
  const flashlightEl = document.getElementById('flashlightIndicator');
  const instructionsEl = document.getElementById('instructions');

  return {
    setClock(text) {
      clockEl.textContent = text;
    },
    setStatus(text) {
      statusEl.textContent = text;
    },
    setFlashlight(on) {
      flashlightEl.textContent = `Flashlight: ${on ? 'ON' : 'OFF'}`;
      flashlightEl.style.background = on ? 'rgba(160,140,40,0.85)' : 'rgba(8, 14, 24, 0.75)';
    },
    toggleInstructions() {
      const isHidden = instructionsEl.style.display === 'none';
      instructionsEl.style.display = isHidden ? 'block' : 'none';
    },
  };
}
