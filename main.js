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
// Artwork dimensions and position settings
const ARTWORK_WIDTH = 3;
const ARTWORK_HEIGHT = 2;
const ARTWORK_DEPTH = 0.1;
const ARTWORK_Z = -4;

// Renderer / Scene / Camera 初始化
// Initialize Renderer / Scene / Camera
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const rootNode = new THREE.Object3D();
scene.add(rootNode);

// 追蹤當前面向相機的作品 displayIndex
// Track the current front-facing artwork displayIndex
let currentFrontDisplayIndex = 0;

// 建立作品：先打散順序，再平均分布在圓周上
// Build artworks: shuffle order, then distribute evenly around the circle
const artworkCount = getArtworkCount();
const randomArtworkIndices = getRandomUniqueIndices(artworkCount);

randomArtworkIndices.forEach((artworkIndex, displayIndex) => {
    const artworkTextureResult = getArtworkTextureByIndex(artworkIndex);
    if (!artworkTextureResult) return;
    const { texture, ...artworkData } = artworkTextureResult;

    const baseNode = new THREE.Object3D();
    baseNode.rotation.y = getBaseNodeRotation(displayIndex, artworkCount);
    // 將作品完整資料存入 baseNode，用於後續查找
    // Store complete artwork data in baseNode for later retrieval.
    baseNode.userData = { displayIndex, ...artworkData };
    rootNode.add(baseNode);

    const border = createImageBorderMesh();
    // 邊框與畫作放在同一 Z 位置，確保邊框正確包圍畫作
    // Position border and artwork at the same Z to ensure the border frames the artwork correctly
    border.position.z = ARTWORK_Z;
    baseNode.add(border);

    const artworkMesh = new THREE.Mesh(
        new THREE.BoxGeometry(ARTWORK_WIDTH, ARTWORK_HEIGHT, ARTWORK_DEPTH),
        new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide })
    );
    artworkMesh.position.z = ARTWORK_Z;
    artworkMesh.userData = artworkData;
    baseNode.add(artworkMesh);

    // 建立左右箭頭按鈕
    // Create left and right arrow buttons
    const { left: leftArrow, right: rightArrow } = createArrowButton();
    leftArrow.userData = displayIndex;
    rightArrow.userData = displayIndex;
    // 注意：leftArrow 在畫面右邊（x = +3），rightArrow 在畫面左邊（x = -3）
    // Note: leftArrow is on the right side of screen (x = +3), rightArrow is on the left side (x = -3)
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

// 初始化時顯示正面作品的標題與藝術家
// Display the front-facing artwork's title and artist on initialization
updateArtworkInfoFromRotation();
// 延遲一點淡入，讓頁面載入更流暢
// Delay fade-in slightly for smoother page load.
setTimeout(() => {
    const titleElement = document.getElementById('title');
    const artistElement = document.getElementById('artist');
    if (titleElement) titleElement.style.opacity = '1';
    if (artistElement) artistElement.style.opacity = '1';
}, 100);

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

// 視窗大小調整：更新相機寬高比與渲染器尺寸
// Window resize: update camera aspect ratio and renderer size
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
        ARROW_RIGHT_NAME,
        updateArtworkInfoFromRotation);
});

/**
 * 從當前旋轉角度找到正面作品並更新資訊
 * Find the front-facing artwork from current rotation and update display info
 */
function updateArtworkInfoFromRotation() {
    // 找到面向相機的 baseNode（總旋轉角度絕對值最小，考慮 2π 週期性）
    // Find the baseNode facing the camera (smallest absolute total rotation, considering 2π periodicity)
    let frontFacingNode = null;
    let minRotationDiff = Infinity;

    rootNode.children.forEach((child) => {
        const totalRotation = rootNode.rotation.y + child.rotation.y;
        const normalizedRotation = ((totalRotation % COMPLETE_CIRCLE_RADIANS) + COMPLETE_CIRCLE_RADIANS) % COMPLETE_CIRCLE_RADIANS;
        const adjustedRotation = normalizedRotation > Math.PI ? normalizedRotation - COMPLETE_CIRCLE_RADIANS : normalizedRotation;
        const rotationDiff = Math.abs(adjustedRotation);

        if (rotationDiff < minRotationDiff) {
            minRotationDiff = rotationDiff;
            frontFacingNode = child;
        }
    });

    if (frontFacingNode && frontFacingNode.userData) {
        const { displayIndex, id, title, artist } = frontFacingNode.userData;
        currentFrontDisplayIndex = displayIndex;

        const titleElement = document.getElementById('title');
        const artistElement = document.getElementById('artist');

        if (titleElement) titleElement.textContent = title || '';
        if (artistElement) artistElement.textContent = artist || '';
    }
}
