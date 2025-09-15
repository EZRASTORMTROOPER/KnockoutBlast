import { Rabbit } from './rabbit.js';

export const settingsEl = document.getElementById('settings');
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

export const settings = {
  maxBalls: parseInt(ballSlider.value),
  bulletDamage: parseInt(bulletDamageSlider.value),
  ballDamage: parseInt(ballDamageSlider.value)
};

export function initSettings(rabbits, listener, canvas) {
  ballCountLabel.textContent = ballSlider.value;
  bulletDamageLabel.textContent = settings.bulletDamage;
  ballDamageLabel.textContent = settings.ballDamage;
  volumeLabel.textContent = parseFloat(volumeSlider.value).toFixed(2);
  faceLabel.textContent = parseFloat(faceSlider.value).toFixed(2);
  rabbitHealthLabel.textContent = rabbitHealthSlider.value;

  ballSlider.addEventListener('input', () => {
    ballCountLabel.textContent = ballSlider.value;
    settings.maxBalls = parseInt(ballSlider.value);
  });

  bulletDamageSlider.addEventListener('input', () => {
    settings.bulletDamage = parseInt(bulletDamageSlider.value);
    bulletDamageLabel.textContent = settings.bulletDamage;
  });

  ballDamageSlider.addEventListener('input', () => {
    settings.ballDamage = parseInt(ballDamageSlider.value);
    ballDamageLabel.textContent = settings.ballDamage;
  });

  Rabbit.faceOffset = parseFloat(faceSlider.value);
  faceSlider.addEventListener('input', () => {
    const v = parseFloat(faceSlider.value);
    faceLabel.textContent = v.toFixed(2);
    Rabbit.faceOffset = v;
  });

  const applyRabbitHealth = () => {
    const v = parseInt(rabbitHealthSlider.value);
    rabbitHealthLabel.textContent = v;
    for (const r of rabbits) { r.maxHealth = v; r.health = v; }
  };
  rabbitHealthSlider.addEventListener('input', applyRabbitHealth);
  applyRabbitHealth();

  listener.setMasterVolume(parseFloat(volumeSlider.value));
  volumeSlider.addEventListener('input', () => {
    const v = parseFloat(volumeSlider.value);
    volumeLabel.textContent = v.toFixed(2);
    listener.setMasterVolume(v);
  });

  resumeButton.addEventListener('click', () => {
    canvas.requestPointerLock();
  });
}
