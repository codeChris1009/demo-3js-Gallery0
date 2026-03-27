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
import { createMirror, getMirrorRenderTargetSize } from './reflector-mirror.js';
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
import { initCustomCursor } from './cursor.js';

// 畫作平面尺寸與位置設定
// Artwork dimensions and position settings
const ARTWORK_WIDTH = 3;
const ARTWORK_HEIGHT = 2;
const ARTWORK_DEPTH = 0.1;
const ARTWORK_Z = -4;
const ARTWORK_FOCUS_Z_OFFSET = 0.55;
const ARTWORK_SIDE_SCALE = 0.6;
const ARTWORK_FOCUS_SCALE = 1.12;

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
let isGalleryInteractive = false;

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

    baseNode.userData.borderMesh = border;
    baseNode.userData.artworkMesh = artworkMesh;
});

// 建立全局左右箭頭按鈕（固定在場景中，不跟隨畫作旋轉）
// Create global left and right arrow buttons (fixed in scene, don't rotate with artworks)
const { left: leftArrow, right: rightArrow } = createArrowButton();
// 儲存 rootNode 引用到箭頭的 userData，供點擊事件使用
// Store rootNode reference in arrow userData for click event handling
leftArrow.userData = { galleryRootNode: rootNode };
rightArrow.userData = { galleryRootNode: rootNode };
leftArrow.visible = false; // 初始隱藏，由 updateArtworkInfoFromRotation 控制
rightArrow.visible = false; // 初始隱藏，由 updateArtworkInfoFromRotation 控制
// 箭頭固定在相機視角的左右兩側，懸浮於地面
// Arrows fixed on left and right sides of camera view, floating above ground
leftArrow.position.set(ARTWORK_WIDTH, -0.9, ARTWORK_Z);
rightArrow.position.set(-ARTWORK_WIDTH, -0.9, ARTWORK_Z);
// 箭頭躺平並反向（繞 X 軸旋轉 -90 度，繞 Z 軸旋轉 180 度）
// Arrows lying flat and reversed direction
leftArrow.rotation.z = Math.PI;
rightArrow.rotation.z = Math.PI;
scene.add(leftArrow);
scene.add(rightArrow);


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

// 初始化自定義光標
// Initialize custom cursor
initCustomCursor().then(() => {
    isGalleryInteractive = true;
    const titleElement = document.getElementById('title');
    const artistElement = document.getElementById('artist');
    if (titleElement) titleElement.style.opacity = '1';
    if (artistElement) artistElement.style.opacity = '1';
});

renderer.setAnimationLoop(animate);


function animate(time) {
    updateTween(time);
    updateArtworkFocus();
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


// Handle window resize Keep the aspect ratio and update the renderer size
// This ensures that the scene looks correct when the window size changes
// 處理視窗大小調整，保持寬高比並更新渲染器尺寸
// 這確保視窗大小改變時場景看起來正確
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    const { width, height } = getMirrorRenderTargetSize();
    mirror.getRenderTarget().setSize(width, height);
    mirror.material.uniforms.resolution.value.set(width, height);
});

// 點擊事件監聽：建立 raycaster 並處理點擊行為
// Click event listener: create raycaster and handle click behavior.
window.addEventListener('click', (event) => {
    if (!isGalleryInteractive) return;

    // 檢測場景中所有物件（包含箭頭和畫作）
    // Detect all objects in scene (including arrows and artworks)
    const intersections = createClickIntersections(event, camera, scene);
    runClickArrowAction(
        intersections,
        artworkCount,
        COMPLETE_CIRCLE_RADIANS,
        ARROW_LEFT_NAME,
        ARROW_RIGHT_NAME,
        updateArtworkInfoFromRotation);
});

// 追蹤當前懸浮的箭頭
// Track currently hovered arrow
let currentHoveredArrow = null;

// 鼠標懸浮效果：箭頭變亮
// Mouse hover effect: arrows brighten
window.addEventListener('mousemove', (event) => {
    if (!isGalleryInteractive) return;

    const intersections = createClickIntersections(event, camera, scene);

    // 尋找被懸浮的箭頭
    // Find hovered arrow
    const arrowIntersection = intersections.find((intersection) => {
        const name = intersection?.object?.name;
        return name === ARROW_LEFT_NAME || name === ARROW_RIGHT_NAME;
    });

    const hoveredArrow = arrowIntersection ? arrowIntersection.object : null;

    // 如果懸浮的箭頭改變了
    // If hovered arrow changed
    if (hoveredArrow !== currentHoveredArrow) {
        // 恢復之前懸浮的箭頭亮度
        // Restore previous hovered arrow brightness
        if (currentHoveredArrow && currentHoveredArrow.material) {
            currentHoveredArrow.material.emissiveIntensity = 0.05;
        }

        // 增亮新懸浮的箭頭
        // Brighten newly hovered arrow
        if (hoveredArrow && hoveredArrow.material) {
            hoveredArrow.material.emissiveIntensity = 0.4;
        }

        currentHoveredArrow = hoveredArrow;
    }
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

    // 更新全局箭頭可見性：只在有正面畫作時顯示
    // Update global arrow visibility: only show when there is a front-facing artwork
    if (frontFacingNode) {
        const leftArrowObj = scene.children.find(child => child.name === ARROW_LEFT_NAME);
        const rightArrowObj = scene.children.find(child => child.name === ARROW_RIGHT_NAME);
        if (leftArrowObj) leftArrowObj.visible = true;
        if (rightArrowObj) rightArrowObj.visible = true;
    }

    if (frontFacingNode && frontFacingNode.userData) {
        const { displayIndex, id, title, artist } = frontFacingNode.userData;
        currentFrontDisplayIndex = displayIndex;

        const titleElement = document.getElementById('title');
        const artistElement = document.getElementById('artist');

        if (titleElement) titleElement.textContent = title || '';
        if (artistElement) artistElement.textContent = artist || '';
    }
}

/**
 * 根據作品面向相機的程度，動態調整前後位置與縮放，
 * 讓正中央的作品更突出。
 * Emphasize the centered artwork by pushing it forward and scaling it up.
 */
function updateArtworkFocus() {
    rootNode.children.forEach((child) => {
        const borderMesh = child.userData?.borderMesh;
        const artworkMesh = child.userData?.artworkMesh;

        if (!borderMesh || !artworkMesh) return;

        const totalRotation = rootNode.rotation.y + child.rotation.y;
        const normalizedRotation = ((totalRotation % COMPLETE_CIRCLE_RADIANS) + COMPLETE_CIRCLE_RADIANS) % COMPLETE_CIRCLE_RADIANS;
        const adjustedRotation = normalizedRotation > Math.PI ? normalizedRotation - COMPLETE_CIRCLE_RADIANS : normalizedRotation;

        const facingStrength = Math.max(0, Math.cos(adjustedRotation));
        const focusStrength = facingStrength * facingStrength;
        const focusedZ = ARTWORK_Z + ARTWORK_FOCUS_Z_OFFSET * focusStrength;
        const focusedScale = ARTWORK_SIDE_SCALE + (ARTWORK_FOCUS_SCALE - ARTWORK_SIDE_SCALE) * focusStrength;

        borderMesh.position.z = focusedZ;
        artworkMesh.position.z = focusedZ;
        borderMesh.scale.setScalar(focusedScale);
        artworkMesh.scale.set(focusedScale, focusedScale, focusedScale);
    });
}
