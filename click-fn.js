import * as THREE from 'three';
import { Group, Tween, Easing } from '@tweenjs/tween.js';

// 旋轉方向常數：左鍵為正向、右鍵為反向
// Rotation direction constants: left is positive, right is negative.
const TO_LEFT = 1;
const TO_RIGHT = -1;
const tweenGroup = new Group();
const ENABLE_CLICK_DEBUG_LOG = false;

// 旋轉動畫持續時間（毫秒）/ Rotation animation duration in milliseconds.
const ROTATE_DURATION_MS = 720;

// 防止同一個 rootNode 同時被多個 tween 更新造成抖動
// Prevent jitter caused by multiple concurrent twines on the same rootNode.
const activeRotationTweenByRoot = new WeakMap();

/**
 * 建立 raycaster 並回傳點擊命中的物件清單
 * Build raycaster and return intersection list for the click event.
 *
 * @param {MouseEvent} event
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.Object3D} rootNode
 * @returns {THREE.Intersection[]}
 */
function createClickIntersections(event, camera, rootNode) {
    if (!event || !camera || !rootNode) return [];

    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouseNDC, camera);
    return raycaster.intersectObject(rootNode, true);
}

/**
 * 判斷點擊的物件並執行相應的旋轉行為
 * Check clicked object and execute corresponding rotation behavior
 *
 * @param {THREE.Intersection[]} intersections
 * @param {number} artworkCount - 作品總數 / Total artwork count
 * @param {number} completeCircleRadians - 一整圈弧度 / Full-circle radians
 * @param {string} leftArrowName - 左箭頭物件名稱 / Left arrow mesh name
 * @param {string} rightArrowName - 右箭頭物件名稱 / Right arrow mesh name
 * @param {Function} [onRotationComplete] - 旋轉完成後的回調函數 / Callback after rotation completes
 * @returns {void}
 */
function runClickArrowAction(
    intersections,
    artworkCount,
    completeCircleRadians,
    leftArrowName,
    rightArrowName,
    onRotationComplete) {
    if (intersections.length === 0) {
        if (ENABLE_CLICK_DEBUG_LOG) console.log('Intersections: []');
        return;
    }

    if (ENABLE_CLICK_DEBUG_LOG) console.log('Intersections:', intersections);
    // 不只看第一筆命中，改為找「箭頭」命中，避免被其他 mesh 擋到排序
    // Do not rely on only the first hit. Find the arrow hit in intersections.
    const arrowIntersection = intersections.find((intersection) => {
        const name = intersection?.object?.name;
        return name === leftArrowName || name === rightArrowName;
    });
    if (!arrowIntersection || !arrowIntersection.object) return;

    const clickedObject = arrowIntersection.object;
    // 從箭頭的 userData 中獲取 galleryRootNode 引用
    // Get galleryRootNode reference from arrow's userData
    const galleryRootNode = clickedObject.userData?.galleryRootNode || null;

    if (clickedObject.name === leftArrowName) {
        if (ENABLE_CLICK_DEBUG_LOG) console.log(`${leftArrowName} clicked`);
        rotateGallery(galleryRootNode,
            TO_LEFT,
            artworkCount, completeCircleRadians, onRotationComplete);
    } else if (clickedObject.name === rightArrowName) {
        if (ENABLE_CLICK_DEBUG_LOG) console.log(`${rightArrowName} clicked`);
        rotateGallery(galleryRootNode,
            TO_RIGHT,
            artworkCount, completeCircleRadians, onRotationComplete);
    }
}

// === Private Helper Functions ===

/**
 * 執行畫廊旋轉動畫
 * Execute gallery rotation animation
 *
 * @param {THREE.Object3D} rootNode - 旋轉的根節點 / The root node to rotate
 * @param {number} direction - 旋轉方向，左正右負 / Rotation direction, left positive, right negative
 * @param {number} artworkCount - 作品總數 / Total artwork count
 * @param {number} completeCircleRadians - 一整圈弧度 / Full-circle radians
 * @param {Function} [onRotationComplete] - 旋轉完成後的回調函數 / Callback after rotation completes
 * @returns {void}
 */
function rotateGallery(
    rootNode,
    direction,
    artworkCount,
    completeCircleRadians,
    onRotationComplete) {

    if (!rootNode || artworkCount <= 0) return;
    const deltaY = direction * (completeCircleRadians / artworkCount);
    const tweenState = { y: rootNode.rotation.y };
    const previousRotationTween = activeRotationTweenByRoot.get(rootNode);
    if (previousRotationTween) previousRotationTween.stop();

    // 淡出當前的標題與藝術家
    // Fade out current title and artist.
    fadeOutArtworkInfo();

    // 使用 Tween.js 進行平滑旋轉動畫
    const rotationTween = new Tween(tweenState, tweenGroup)
        .to({ y: rootNode.rotation.y + deltaY }, ROTATE_DURATION_MS)
        // 前段較快、尾段平滑收斂
        // Faster at start, smooth settle at the end.
        .easing(Easing.Cubic.Out)
        .onUpdate(() => {
            rootNode.rotation.y = tweenState.y;
        })
        .onComplete(() => {
            activeRotationTweenByRoot.delete(rootNode);
            // 旋轉完成後，更新並淡入新的標題與藝術家
            // After rotation, update and fade in new title and artist.
            if (onRotationComplete) onRotationComplete();
            fadeInArtworkInfo();
        })
        .onStop(() => {
            activeRotationTweenByRoot.delete(rootNode);
        })
        .start();
    activeRotationTweenByRoot.set(rootNode, rotationTween);
}

/**
 * 更新所有啟用中的 tween 動畫
 * Update all active tween animations
 *
 * @param {number} [time] - 當前時間戳 / Current timestamp
 * @returns {void}
 */
function updateTween(time) {
    tweenGroup.update(time);
}

/**
 * 淡出標題與藝術家元素
 * Fade out title and artist elements.
 */
function fadeOutArtworkInfo() {
    const titleElement = document.getElementById('title');
    const artistElement = document.getElementById('artist');
    if (titleElement) titleElement.style.opacity = '0';
    if (artistElement) artistElement.style.opacity = '0';
}

/**
 * 淡入標題與藝術家元素
 * Fade in title and artist elements.
 */
function fadeInArtworkInfo() {
    const titleElement = document.getElementById('title');
    const artistElement = document.getElementById('artist');
    if (titleElement) titleElement.style.opacity = '1';
    if (artistElement) artistElement.style.opacity = '1';
}


export {
    updateTween,
    createClickIntersections,
    runClickArrowAction
};
