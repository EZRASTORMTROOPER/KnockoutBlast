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
const resumeButton = document.getElementById('resumeButton');

export const gameSettings = {
  maxBalls: parseInt(ballSlider.value),
  bulletDamage: parseInt(bulletDamageSlider.value),
  ballDamage: parseInt(ballDamageSlider.value)
};

export function initSettings(rabbits, listener, canvas) {
  ballCountLabel.textContent = ballSlider.value;
  ballSlider.addEventListener('input', () => {
    ballCountLabel.textContent = ballSlider.value;
    gameSettings.maxBalls = parseInt(ballSlider.value);
  });

  bulletDamageLabel.textContent = gameSettings.bulletDamage;
  bulletDamageSlider.addEventListener('input', () => {
    gameSettings.bulletDamage = parseInt(bulletDamageSlider.value);
    bulletDamageLabel.textContent = gameSettings.bulletDamage;
  });

  ballDamageLabel.textContent = gameSettings.ballDamage;
  ballDamageSlider.addEventListener('input', () => {
    gameSettings.ballDamage = parseInt(ballDamageSlider.value);
    ballDamageLabel.textContent = gameSettings.ballDamage;
  });

  Rabbit.faceOffset = parseFloat(faceSlider.value);
  faceLabel.textContent = parseFloat(faceSlider.value).toFixed(2);
  faceSlider.addEventListener('input', () => {
    const v = parseFloat(faceSlider.value);
    faceLabel.textContent = v.toFixed(2);
    Rabbit.faceOffset = v;
  });

  rabbitHealthLabel.textContent = rabbitHealthSlider.value;
  rabbitHealthSlider.addEventListener('input', () => {
    const v = parseInt(rabbitHealthSlider.value);
    rabbitHealthLabel.textContent = v;
    for (const r of rabbits) { r.maxHealth = v; r.health = v; }
  });

  volumeLabel.textContent = parseFloat(volumeSlider.value).toFixed(2);
  listener.setMasterVolume(parseFloat(volumeSlider.value));
  volumeSlider.addEventListener('input', () => {
    const v = parseFloat(volumeSlider.value);
    volumeLabel.textContent = v.toFixed(2);
    listener.setMasterVolume(v);
  });

  resumeButton.addEventListener('click', () => {
    controls.allowPointerLock = true;
    canvas.requestPointerLock();
  });
}

export function showSettings(open) {
  settingsDiv.classList.toggle('hidden', !open);
  controls.allowPointerLock = !open;
}
