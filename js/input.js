export function createInput() {
  const pressed = new Set();
  let flashlightOn = false;
  let helpVisible = true;

  window.addEventListener('keydown', (event) => {
    const { code } = event;
    pressed.add(code);

    if (code === 'KeyF') {
      flashlightOn = !flashlightOn;
    }

    if (code === 'KeyH') {
      helpVisible = !helpVisible;
      document.getElementById('instructions').style.display = helpVisible ? 'block' : 'none';
    }
  });

  window.addEventListener('keyup', (event) => {
    pressed.delete(event.code);
  });

  return {
    isDown(code) {
      return pressed.has(code);
    },
    isFlashlightOn() {
      return flashlightOn;
    }
  };
}
