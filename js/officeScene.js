import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export function createOfficeScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040611);

  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(0, 1.65, 4.4);

  const ambient = new THREE.AmbientLight(0x556688, 0.35);
  scene.add(ambient);

  const moonLight = new THREE.DirectionalLight(0x8fa7ff, 0.6);
  moonLight.position.set(6, 9, 7);
  scene.add(moonLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({ color: 0x17181d, roughness: 0.95 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const room = new THREE.Group();
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x23252e, roughness: 0.95 });

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), wallMaterial);
  backWall.position.set(0, 2, -4.8);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), wallMaterial);
  leftWall.position.set(-5, 2, 0);
  leftWall.rotation.y = Math.PI / 2;

  const rightWall = leftWall.clone();
  rightWall.position.x = 5;
  rightWall.rotation.y = -Math.PI / 2;

  const frontWallLeft = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 4), wallMaterial);
  frontWallLeft.position.set(-3.35, 2, 4.8);
  frontWallLeft.rotation.y = Math.PI;

  const frontWallRight = frontWallLeft.clone();
  frontWallRight.position.x = 3.35;

  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 1, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x4d3826, roughness: 0.88 })
  );
  desk.position.set(0, 0.5, 1.5);

  room.add(backWall, leftWall, rightWall, frontWallLeft, frontWallRight, desk);
  scene.add(room);

  const doorwayFrame = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 3.7, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 1 })
  );
  doorwayFrame.position.set(0, 1.85, 4.9);
  scene.add(doorwayFrame);

  const roomBounds = {
    minX: -4.3,
    maxX: 4.3,
    minZ: -3.8,
    maxZ: 4.3,
  };

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return {
    renderer,
    scene,
    camera,
    roomBounds,
    render() {
      renderer.render(scene, camera);
    },
  };
}
