import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// 创建Three.js场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加光源
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

// 创建纸张几何体
const paperGeometry = new THREE.PlaneGeometry(5, 5, 10, 10);
const paperMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, wireframe: true });
const paperMesh = new THREE.Mesh(paperGeometry, paperMaterial);
scene.add(paperMesh);

// 设置相机位置
camera.position.z = 10;

// 创建物理世界
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // 设置重力

// 创建纸张物理体
const paperShape = new CANNON.Box(new CANNON.Vec3(2.5, 2.5, 0.1)); // 纸张形状
const paperBody = new CANNON.Body({
  mass: 0.1, // 质量很小
  position: new CANNON.Vec3(0, 5, 0), // 初始位置
  shape: paperShape
});
world.addBody(paperBody);

// 创建地面
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({
  mass: 0
});
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // 将平面旋转到水平位置
world.addBody(groundBody);

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 更新物理世界
  world.step(1 / 60);

  // 将物理体的状态更新到Three.js几何体
  paperMesh.position.copy(paperBody.position);
  paperMesh.quaternion.copy(paperBody.quaternion);

  // 渲染场景
  renderer.render(scene, camera);
}

animate();

// 添加空气阻力
function applyAirResistance() {
  const airResistance = 0.05; // 空气阻力系数
  paperBody.velocity.x *= (1 - airResistance);
  paperBody.velocity.y *= (1 - airResistance);
  paperBody.velocity.z *= (1 - airResistance);
}

// 模拟风的作用
function applyWind() {
  const windForce = new CANNON.Vec3(0.5, 0, 0); // 向右的风
  paperBody.applyForce(windForce, paperBody.position);
}

// 设置定时器来施加风和空气阻力
setInterval(() => {
  applyAirResistance();
  applyWind();
}, 1000 / 60);
