import { controls } from './controls.js';
import { Rabbit } from './rabbit.js';

const settingsDiv = document.getElementById('settings');
const ballSlider = document.getElementById('ballSlider');
const ballCountInput = document.getElementById('ballCountInput');
const volumeSlider = document.getElementById('volumeSlider');
const volumeInput = document.getElementById('volumeInput');
const faceSlider = document.getElementById('faceSlider');
const faceInput = document.getElementById('faceInput');
const rabbitHealthSlider = document.getElementById('rabbitHealthSlider');
const rabbitHealthInput = document.getElementById('rabbitHealthInput');
const bulletDamageSlider = document.getElementById('bulletDamageSlider');
const bulletDamageInput = document.getElementById('bulletDamageInput');
const ballDamageSlider = document.getElementById('ballDamageSlider');
const ballDamageInput = document.getElementById('ballDamageInput');
const dispenserRateSlider = document.getElementById('dispenserRateSlider');
const dispenserRateInput = document.getElementById('dispenserRateInput');
const resumeButton = document.getElementById('resumeButton');

export const gameSettings = {
  maxBalls: parseInt(ballSlider.value),
  bulletDamage: parseInt(bulletDamageSlider.value),
  ballDamage: parseInt(ballDamageSlider.value),
  dispenserRate: parseFloat(dispenserRateSlider.value)
};

export function initSettings(rabbits, listener, canvas) {
  ballCountInput.value = ballSlider.value;
  ballSlider.addEventListener('input', () => {
    ballCountInput.value = ballSlider.value;
    gameSettings.maxBalls = parseInt(ballSlider.value);
  });
  ballCountInput.addEventListener('change', () => {
    let v = parseInt(ballCountInput.value);
    if (isNaN(v)) return;
    v = Math.max(parseInt(ballSlider.min), Math.min(parseInt(ballSlider.max), v));
    ballSlider.value = v;
    gameSettings.maxBalls = v;
  });

  bulletDamageInput.value = gameSettings.bulletDamage;
  bulletDamageSlider.addEventListener('input', () => {
    gameSettings.bulletDamage = parseInt(bulletDamageSlider.value);
    bulletDamageInput.value = gameSettings.bulletDamage;
  });
  bulletDamageInput.addEventListener('change', () => {
    let v = parseInt(bulletDamageInput.value);
    if (isNaN(v)) return;
    v = Math.max(parseInt(bulletDamageSlider.min), Math.min(parseInt(bulletDamageSlider.max), v));
    bulletDamageSlider.value = v;
    gameSettings.bulletDamage = v;
  });

  ballDamageInput.value = gameSettings.ballDamage;
  ballDamageSlider.addEventListener('input', () => {
    gameSettings.ballDamage = parseInt(ballDamageSlider.value);
    ballDamageInput.value = gameSettings.ballDamage;
  });
  ballDamageInput.addEventListener('change', () => {
    let v = parseInt(ballDamageInput.value);
    if (isNaN(v)) return;
    v = Math.max(parseInt(ballDamageSlider.min), Math.min(parseInt(ballDamageSlider.max), v));
    ballDamageSlider.value = v;
    gameSettings.ballDamage = v;
  });

  Rabbit.faceOffset = parseFloat(faceSlider.value);
  faceInput.value = parseFloat(faceSlider.value).toFixed(2);
  faceSlider.addEventListener('input', () => {
    const v = parseFloat(faceSlider.value);
    faceInput.value = v.toFixed(2);
    Rabbit.faceOffset = v;
  });
  faceInput.addEventListener('change', () => {
    let v = parseFloat(faceInput.value);
    if (isNaN(v)) return;
    v = Math.max(parseFloat(faceSlider.min), Math.min(parseFloat(faceSlider.max), v));
    faceSlider.value = v;
    faceInput.value = v.toFixed(2);
    Rabbit.faceOffset = v;
  });

  rabbitHealthInput.value = rabbitHealthSlider.value;
  rabbitHealthSlider.addEventListener('input', () => {
    const v = parseInt(rabbitHealthSlider.value);
    rabbitHealthInput.value = v;
    for (const r of rabbits) { r.maxHealth = v; r.health = v; }
  });
  rabbitHealthInput.addEventListener('change', () => {
    let v = parseInt(rabbitHealthInput.value);
    if (isNaN(v)) return;
    v = Math.max(parseInt(rabbitHealthSlider.min), Math.min(parseInt(rabbitHealthSlider.max), v));
    rabbitHealthSlider.value = v;
    for (const r of rabbits) { r.maxHealth = v; r.health = v; }
  });

  volumeInput.value = parseFloat(volumeSlider.value).toFixed(2);
  listener.setMasterVolume(parseFloat(volumeSlider.value));
  volumeSlider.addEventListener('input', () => {
    const v = parseFloat(volumeSlider.value);
    volumeInput.value = v.toFixed(2);
    listener.setMasterVolume(v);
  });
  volumeInput.addEventListener('change', () => {
    let v = parseFloat(volumeInput.value);
    if (isNaN(v)) return;
    v = Math.max(parseFloat(volumeSlider.min), Math.min(parseFloat(volumeSlider.max), v));
    volumeSlider.value = v;
    volumeInput.value = v.toFixed(2);
    listener.setMasterVolume(v);
  });

  dispenserRateInput.value = dispenserRateSlider.value;
  dispenserRateSlider.addEventListener('input', () => {
    const v = parseFloat(dispenserRateSlider.value);
    dispenserRateInput.value = v;
    gameSettings.dispenserRate = v;
  });
  dispenserRateInput.addEventListener('change', () => {
    let v = parseFloat(dispenserRateInput.value);
    if (isNaN(v)) return;
    v = Math.max(parseFloat(dispenserRateSlider.min), Math.min(parseFloat(dispenserRateSlider.max), v));
    dispenserRateSlider.value = v;
    gameSettings.dispenserRate = v;
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
