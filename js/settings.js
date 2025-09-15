import { Rabbit } from './rabbit.js';

export const settings = document.getElementById('settings');
export const resumeButton = document.getElementById('resumeButton');
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

export let maxBalls = parseInt(ballSlider.value);
export let bulletDamage = parseInt(bulletDamageSlider.value);
export let ballDamage = parseInt(ballDamageSlider.value);

export function getRabbitHealth() {
  return parseInt(rabbitHealthSlider.value);
}

export function initSettings(getRabbits, listener) {
  // initial label values
  ballCountLabel.textContent = ballSlider.value;
  bulletDamageLabel.textContent = bulletDamageSlider.value;
  ballDamageLabel.textContent = ballDamageSlider.value;
  faceLabel.textContent = parseFloat(faceSlider.value).toFixed(2);
  rabbitHealthLabel.textContent = rabbitHealthSlider.value;
  volumeLabel.textContent = parseFloat(volumeSlider.value).toFixed(2);
  listener.setMasterVolume(parseFloat(volumeSlider.value));

  ballSlider.addEventListener('input', () => {
    ballCountLabel.textContent = ballSlider.value;
    maxBalls = parseInt(ballSlider.value);
  });

  bulletDamageSlider.addEventListener('input', () => {
    bulletDamage = parseInt(bulletDamageSlider.value);
    bulletDamageLabel.textContent = bulletDamage;
  });

  ballDamageSlider.addEventListener('input', () => {
    ballDamage = parseInt(ballDamageSlider.value);
    ballDamageLabel.textContent = ballDamage;
  });

  Rabbit.faceOffset = parseFloat(faceSlider.value);
  faceSlider.addEventListener('input', () => {
    const v = parseFloat(faceSlider.value);
    faceLabel.textContent = v.toFixed(2);
    Rabbit.faceOffset = v;
  });

  rabbitHealthSlider.addEventListener('input', () => {
    const v = parseInt(rabbitHealthSlider.value);
    rabbitHealthLabel.textContent = v;
    for (const r of getRabbits()) { r.maxHealth = v; r.health = v; }
  });

  volumeSlider.addEventListener('input', () => {
    const v = parseFloat(volumeSlider.value);
    volumeLabel.textContent = v.toFixed(2);
    listener.setMasterVolume(v);
  });
}
