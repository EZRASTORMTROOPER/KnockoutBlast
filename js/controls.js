export class Controls {
  constructor() {
    this.view = 'center';
    this.flashlightHeld = false;
    this.flashlightToggle = false;

    addEventListener('keydown', (event) => {
      if (event.code === 'KeyA' || event.code === 'ArrowLeft') this.view = 'left';
      if (event.code === 'KeyD' || event.code === 'ArrowRight') this.view = 'right';
      if (event.code === 'KeyF') this.flashlightToggle = !this.flashlightToggle;
      if (event.code === 'Space') this.flashlightHeld = true;
    });

    addEventListener('keyup', (event) => {
      if (event.code === 'Space') this.flashlightHeld = false;
      if ((event.code === 'KeyA' || event.code === 'ArrowLeft') && this.view === 'left') this.view = 'center';
      if ((event.code === 'KeyD' || event.code === 'ArrowRight') && this.view === 'right') this.view = 'center';
    });
  }

  isFlashlightOn() {
    return this.flashlightHeld || this.flashlightToggle;
  }
}
