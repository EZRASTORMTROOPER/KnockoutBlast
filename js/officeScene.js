import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { VIEW_ANGLES } from './constants.js';

function makeBackdropTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#181923');
  grad.addColorStop(1, '#060608');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#11131b';
  ctx.fillRect(0, 320, canvas.width, 192);

  // hallway opening
  ctx.fillStyle = '#000';
  ctx.fillRect(390, 120, 244, 240);

  // cheap wall details
  ctx.strokeStyle = 'rgba(180, 200, 255, 0.16)';
  ctx.lineWidth = 3;
  for (let y = 40; y < 300; y += 40) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(350, y);
    ctx.moveTo(674, y);
    ctx.lineTo(1004, y);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

export class OfficeScene {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
    this.camera.position.set(0, 1.5, 5.7);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.1));

    this.flashlight = new THREE.SpotLight(0xe8f5ff, 0, 30, 0.45, 0.45, 1.1);
    this.flashlight.position.set(0, 1.55, 5.2);
    this.flashlight.target.position.set(0, 1.7, -8);
    this.scene.add(this.flashlight, this.flashlight.target);

    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 8),
      new THREE.MeshLambertMaterial({ map: makeBackdropTexture() })
    );
    wall.position.set(0, 2, -8);
    this.scene.add(wall);

    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(12, 1.3, 3.5),
      new THREE.MeshLambertMaterial({ color: 0x20232a })
    );
    desk.position.set(0, -0.5, 3);
    this.scene.add(desk);
  }

  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  setView(view) {
    this.camera.rotation.set(0, VIEW_ANGLES[view], 0);
  }

  setFlashlight(on) {
    this.flashlight.intensity = on ? 2.5 : 0;
  }
}
