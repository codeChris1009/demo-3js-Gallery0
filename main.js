import * as THREE from 'three';
import {
    COMPLETE_CIRCLE_RADIANS,
    getArtworkCount,
    getBaseNodeRotation,
    getRandomUniqueIndices
} from './helper.js';
import { getArtworkTextureByIndex } from './texture.js';
import { createImageBorderMesh } from './img-border.js';
import { createSpotlight } from './spotlight.js';
import { createMirror } from './reflector-mirror.js';
import {
    createArrowButton,
    ARROW_LEFT_NAME,
    ARROW_RIGHT_NAME
} from './arrow-btn.js';
import {
    createClickIntersections,
    runClickArrowAction,
    updateTween
} from './click-fn.js';


// 畫作平面尺寸與位置設定
const ARTWORK_WIDTH = 3;
const ARTWORK_HEIGHT = 2;
const ARTWORK_DEPTH = 0.1;
const ARTWORK_Z = -4;

// Renderer / Scene / Camera 初始化
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
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
        new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide })
    );
    artworkMesh.position.z = ARTWORK_Z;
    artworkMesh.userData = artworkData;
    baseNode.add(artworkMesh);

    // ARROW BUTTONS
    const { left: leftArrow, right: rightArrow } = createArrowButton();
    leftArrow.position.set(ARTWORK_WIDTH, 0, ARTWORK_Z);
    rightArrow.position.set(-ARTWORK_WIDTH, 0, ARTWORK_Z);
    baseNode.add(leftArrow);
    baseNode.add(rightArrow);
});


const spotlight = createSpotlight();
spotlight.position.set(0, 5, 0);
spotlight.target.position.set(0, 1.5, -5);
scene.add(spotlight);
scene.add(spotlight.target);

const mirror = createMirror();
mirror.position.y = -1.1;
mirror.rotateX(-Math.PI / 2);
scene.add(mirror);

// 暖機：先編譯材質與 shader，減少首次互動卡頓
// Warm up shader/material pipeline to reduce initial interaction stutter.
renderer.compile(scene, camera);
prewarmArtworkViews();
renderer.render(scene, camera);
renderer.setAnimationLoop(animate);


function animate(time) {
    updateTween(time);
    renderer.render(scene, camera);
}

/**
 * 預先渲染各個作品角度，讓貼圖在首次互動前先上傳到 GPU。
 * Pre-render each artwork view so textures are uploaded before first interaction.
 */
function prewarmArtworkViews() {
    const initialRotationY = rootNode.rotation.y;
    const step = COMPLETE_CIRCLE_RADIANS / Math.max(1, artworkCount);

    for (let i = 0; i < artworkCount; i++) {
        rootNode.rotation.y = initialRotationY + step * i;
        renderer.render(scene, camera);
    }

    rootNode.rotation.y = initialRotationY;
}

// 處理視窗大小調整，保持寬高比並更新渲染器尺寸
// 這確保視窗大小改變時場景看起來正確
// 視窗大小改變時，更新相機與渲染器尺寸
// Keep aspect ratio and renderer size in sync with viewport changes.
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    mirror.getRenderTarget().setSize(window.innerWidth, window.innerHeight);
});

// 點擊事件監聽：建立 raycaster 並處理點擊行為
// Click event listener: create raycaster and handle click behavior.
window.addEventListener('click', (event) => {
    const intersections = createClickIntersections(event, camera, rootNode);
    runClickArrowAction(
        intersections,
        artworkCount,
        COMPLETE_CIRCLE_RADIANS,
        ARROW_LEFT_NAME,
        ARROW_RIGHT_NAME);
});
