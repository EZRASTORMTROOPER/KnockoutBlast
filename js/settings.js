import { controls } from './controls.js';
import { Rabbit } from './rabbit.js';

const settingsDiv = document.getElementById('settings');
const ballSlider = document.getElementById('ballSlider');
const ballCountLabel = document.getElementById('ballCountLabel');
const volumeSlider = document.getElementById('volumeSlider');
const volumeLabel = document.getElementById('volumeLabel');
const faceSlider = document.getElementById('faceSlider');
const faceLabel = document.getElementById('faceLabel');
const rabbitHealthSlider = document.getElementById('rabbitHealthSlider');
const rabbitHealthLabel = document.getElementById('rabbitHealthLabel');
const bulletDamageSlider = document.getElementById('bulletDamageSlider');
const bulletDamageLabel = document.getElementById('bulletDamageLabel');
const ballDamageSlider = document.getElementById('ballDamageSlider');
const ballDamageLabel = document.getElementById('ballDamageLabel');
const ballRateSlider = document.getElementById('ballRateSlider');
const ballRateLabel = document.getElementById('ballRateLabel');
const resumeButton = document.getElementById('resumeButton');

export const gameSettings = {
  maxBalls: parseInt(ballSlider.value),
  bulletDamage: parseInt(bulletDamageSlider.value),
  ballDamage: parseInt(ballDamageSlider.value),
  dispenserRate: parseFloat(ballRateSlider.value)
};
function bind(slider, input, parse, onChange) {
  const handle = v => onChange(parse(v));
  input.value = slider.value;
  slider.addEventListener('input', () => { input.value = slider.value; handle(slider.value); });
  input.addEventListener('input', () => { slider.value = input.value; handle(input.value); });
  handle(slider.value);
}

export function initSettings(rabbits, listener, canvas) {
  bind(ballSlider, ballCountLabel, parseInt, v => gameSettings.maxBalls = v);
  bind(bulletDamageSlider, bulletDamageLabel, parseInt, v => gameSettings.bulletDamage = v);
  bind(ballDamageSlider, ballDamageLabel, parseInt, v => gameSettings.ballDamage = v);
  bind(ballRateSlider, ballRateLabel, parseFloat, v => gameSettings.dispenserRate = v);

  bind(faceSlider, faceLabel, parseFloat, v => { Rabbit.faceOffset = v; });
  bind(rabbitHealthSlider, rabbitHealthLabel, parseInt, v => { for (const r of rabbits) { r.maxHealth = v; r.health = v; } });
  bind(volumeSlider, volumeLabel, parseFloat, v => { listener.setMasterVolume(v); });

  resumeButton.addEventListener('click', () => {
    controls.allowPointerLock = true;
    canvas.requestPointerLock();
  });
}

export function showSettings(open) {
  settingsDiv.classList.toggle('hidden', !open);
  controls.allowPointerLock = !open;
}
