import { Rabbit } from './rabbit.js';

export function initSettings(domElement, rabbits, listener) {
  const settings = document.getElementById('settings');
  const resumeButton = document.getElementById('resumeButton');

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

  let maxBalls = parseInt(ballSlider.value);
  ballSlider.addEventListener('input', () => {
    ballCountLabel.textContent = ballSlider.value;
    maxBalls = parseInt(ballSlider.value);
  });

  let bulletDamage = parseInt(bulletDamageSlider.value);
  bulletDamageSlider.addEventListener('input', () => {
    bulletDamage = parseInt(bulletDamageSlider.value);
    bulletDamageLabel.textContent = bulletDamage;
  });

  let ballDamage = parseInt(ballDamageSlider.value);
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
    for (const r of rabbits) { r.maxHealth = v; r.health = v; }
  });

  listener.setMasterVolume(parseFloat(volumeSlider.value));
  volumeSlider.addEventListener('input', () => {
    const v = parseFloat(volumeSlider.value);
    volumeLabel.textContent = v.toFixed(2);
    listener.setMasterVolume(v);
  });

  resumeButton.addEventListener('click', () => {
    domElement.requestPointerLock();
  });

  function onPointerLockChange(locked) {
    settings.classList.toggle('hidden', locked);
  }

  return {
    settings,
    onPointerLockChange,
    getMaxBalls: () => maxBalls,
    getBulletDamage: () => bulletDamage,
    getBallDamage: () => ballDamage
  };
}
