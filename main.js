import * as THREE from 'three';
import {
    getArtworkCount,
    getBaseNodeRotation,
    getRandomUniqueIndices
} from './helper.js';
import { getArtworkTextureByIndex } from './texture.js';
import { createImageBorderMesh } from './img-border.js';

// Renderer / Scene / Camera setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const rootNode = new THREE.Object3D();
scene.add(rootNode);

// Build artworks in random order, then place them evenly around the circle.
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
    // Slightly behind the artwork mesh to create a border effect
    border.position.z = -4;
    baseNode.add(border);


    const artworkMesh = new THREE.Mesh(
        new THREE.BoxGeometry(3, 2, 0.1),
        new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    );
    artworkMesh.position.z = -4;
    artworkMesh.userData = artworkData;
    baseNode.add(artworkMesh);
});


function animate() {
    rootNode.rotation.y += 0.002;
    renderer.render(scene, camera);
}

// 處理視窗大小調整，保持寬高比並更新渲染器尺寸
// 這確保視窗大小改變時場景看起來正確
// Keep aspect ratio and renderer size in sync with viewport changes.
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
