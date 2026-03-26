export function setupInstructionsPanel() {
  const panel = document.getElementById('instructionsPanel');

  document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyH') {
      panel.classList.toggle('hidden');
    }
  });
}
