import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export function createScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050508);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.8, 8.2);

  const ambience = new THREE.AmbientLight(0x223344, 0.5);
  scene.add(ambience);

  const roomLight = new THREE.PointLight(0x7788aa, 0.7, 18);
  roomLight.position.set(0, 2.5, 4.5);
  scene.add(roomLight);

  const flashlight = new THREE.SpotLight(0xfff4c2, 0, 30, 0.28, 0.5, 1);
  flashlight.position.set(0, 1.7, 7.8);
  flashlight.target.position.set(0, 1.4, 0);
  scene.add(flashlight);
  scene.add(flashlight.target);

  // Office built from simple geometry placeholders.
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x21252f });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x161921 });
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x363c49 });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), wallMat);
  backWall.position.set(0, 4, -5.2);
  scene.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), wallMat);
  leftWall.position.set(-8, 4, -0.2);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  const rightWall = leftWall.clone();
  rightWall.position.x = 8;
  rightWall.rotation.y = -Math.PI / 2;
  scene.add(rightWall);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 2.4), deskMat);
  desk.position.set(0, 0.6, 4.7);
  scene.add(desk);

  const monitor = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.5, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x111319, emissive: 0x1f2b47, emissiveIntensity: 0.4 })
  );
  monitor.position.set(0, 1.95, 3.7);
  scene.add(monitor);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, flashlight };
}
