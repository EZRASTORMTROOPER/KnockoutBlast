import { controls } from './controls.js';
import { Rabbit } from './rabbit.js';

const settingsDiv = document.getElementById('settings');
const ballSlider = document.getElementById('ballSlider');
const ballCountInput = document.getElementById('ballCountLabel');
const volumeSlider = document.getElementById('volumeSlider');
const volumeInput = document.getElementById('volumeLabel');
const faceSlider = document.getElementById('faceSlider');
const faceInput = document.getElementById('faceLabel');
const rabbitHealthSlider = document.getElementById('rabbitHealthSlider');
const rabbitHealthInput = document.getElementById('rabbitHealthLabel');
const bulletDamageSlider = document.getElementById('bulletDamageSlider');
const bulletDamageInput = document.getElementById('bulletDamageLabel');
const ballDamageSlider = document.getElementById('ballDamageSlider');
const ballDamageInput = document.getElementById('ballDamageLabel');
const ballRateSlider = document.getElementById('ballRateSlider');
const ballRateInput = document.getElementById('ballRateLabel');
const resumeButton = document.getElementById('resumeButton');

export const gameSettings = {
  maxBalls: parseInt(ballSlider.value),
  bulletDamage: parseInt(bulletDamageSlider.value),
  ballDamage: parseInt(ballDamageSlider.value),
  ballDispenseRate: parseFloat(ballRateSlider.value)
};

export function initSettings(rabbits, listener, canvas) {
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  function bindNumeric(slider, input, onChange, opts = { fixed: 0 }) {
    input.value = slider.value;
    slider.addEventListener('input', () => {
      const v = slider.value;
      input.value = opts.fixed ? parseFloat(v).toFixed(opts.fixed) : v;
      onChange(parseFloat(v));
    });
    input.addEventListener('change', () => {
      let v = parseFloat(input.value);
      v = clamp(v, parseFloat(slider.min), parseFloat(slider.max));
      slider.value = v;
      input.value = opts.fixed ? v.toFixed(opts.fixed) : v;
      onChange(parseFloat(v));
    });
  }

  bindNumeric(ballSlider, ballCountInput, v => { gameSettings.maxBalls = parseInt(v); });
  bindNumeric(bulletDamageSlider, bulletDamageInput, v => { gameSettings.bulletDamage = parseInt(v); });
  bindNumeric(ballDamageSlider, ballDamageInput, v => { gameSettings.ballDamage = parseInt(v); });
  bindNumeric(ballRateSlider, ballRateInput, v => { gameSettings.ballDispenseRate = v; }, { fixed: 1 });

  Rabbit.faceOffset = parseFloat(faceSlider.value);
  bindNumeric(faceSlider, faceInput, v => { Rabbit.faceOffset = v; }, { fixed: 2 });

  bindNumeric(rabbitHealthSlider, rabbitHealthInput, v => {
    const val = parseInt(v);
    for (const r of rabbits) { r.maxHealth = val; r.health = val; }
  });

  listener.setMasterVolume(parseFloat(volumeSlider.value));
  bindNumeric(volumeSlider, volumeInput, v => { listener.setMasterVolume(v); }, { fixed: 2 });

  resumeButton.addEventListener('click', () => {
    controls.allowPointerLock = true;
    canvas.requestPointerLock();
  });
}

export function showSettings(open) {
  settingsDiv.classList.toggle('hidden', !open);
  controls.allowPointerLock = !open;
}

