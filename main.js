import * as THREE from 'three';
import {
    getArtworkCount,
    getBaseNodeRotation,
    getRandomUniqueIndices
} from './helper.js';
import { getArtworkTextureByIndex } from './texture.js';
import { createImageBorderMesh } from './img-border.js';

// 畫作平面尺寸與位置設定
const ARTWORK_WIDTH = 3;
const ARTWORK_HEIGHT = 2;
const ARTWORK_DEPTH = 0.1;
const ARTWORK_Z = -4;
const ROTATION_SPEED = 0.002;

// Renderer / Scene / Camera 初始化
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const rootNode = new THREE.Object3D();
scene.add(rootNode);


// Build artworks: shuffle order, then distribute evenly around the circle
// 建立作品：先打散順序，再平均分布在圓周上
const artworkCount = getArtworkCount();
const randomArtworkIndices = getRandomUniqueIndices(artworkCount);

randomArtworkIndices.forEach((artworkIndex, displayIndex) => {
    const artworkTextureResult = getArtworkTextureByIndex(artworkIndex);
    if (!artworkTextureResult) return;
    const { texture, ...artworkData } = artworkTextureResult;

    const baseNode = new THREE.Object3D();
    baseNode.rotation.y = getBaseNodeRotation(displayIndex, artworkCount);
    rootNode.add(baseNode);

    const border = createImageBorderMesh();
    // Position border and artwork at the same Z to ensure the border frames the artwork correctly
    // 邊框與畫作放在同一層位置
    border.position.z = ARTWORK_Z;
    baseNode.add(border);

    const artworkMesh = new THREE.Mesh(
        new THREE.BoxGeometry(ARTWORK_WIDTH, ARTWORK_HEIGHT, ARTWORK_DEPTH),
        new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    );
    artworkMesh.position.z = ARTWORK_Z;
    artworkMesh.userData = artworkData;
    baseNode.add(artworkMesh);
});

function animate() {
    // 持續旋轉，形成環繞展示效果
    rootNode.rotation.y += ROTATION_SPEED;
    renderer.render(scene, camera);
}

// 處理視窗大小調整，保持寬高比並更新渲染器尺寸
// 這確保視窗大小改變時場景看起來正確
// 視窗大小改變時，更新相機與渲染器尺寸
// Keep aspect ratio and renderer size in sync with viewport changes.
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
