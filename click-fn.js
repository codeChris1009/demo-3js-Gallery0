import * as THREE from 'three';

// 旋轉方向常數：左鍵為正向、右鍵為反向
// Rotation direction constants: left is positive, right is negative.
const TO_LEFT = 1;
const TO_RIGHT = -1;

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
 * 判斷第一個命中物件並執行點擊後行為
 * Check the first hit object and execute click behavior (currently logs).
 *
 * @param {THREE.Intersection[]} intersections
 * @param {number} artworkCount - 作品總數 / Total artwork count
 * @param {number} completeCircleRadians - 一整圈弧度 / Full-circle radians
 * @param {string} leftArrowName - 左箭頭物件名稱 / Left arrow mesh name
 * @param {string} rightArrowName - 右箭頭物件名稱 / Right arrow mesh name
 * @returns {void}
 */
function runClickArrowAction(
    intersections,
    artworkCount,
    completeCircleRadians,
    leftArrowName,
    rightArrowName) {
    if (intersections.length === 0) {
        console.log('Intersections: []');
        return;
    }

    console.log('Intersections:', intersections);
    const firstIntersection = intersections[0];
    if (!firstIntersection || !firstIntersection.object) return;

    const clickedObject = firstIntersection.object;
    const galleryRootNode = clickedObject.parent?.parent || null;

    if (clickedObject.name === leftArrowName) {
        console.log(`${leftArrowName} clicked`);
        rotateGallery(galleryRootNode,
            TO_LEFT,
            artworkCount, completeCircleRadians);
    } else if (clickedObject.name === rightArrowName) {
        console.log(`${rightArrowName} clicked`);
        rotateGallery(galleryRootNode,
            TO_RIGHT,
            artworkCount, completeCircleRadians);
    }
}

// Private helper function
// 私有輔助函式：依方向旋轉作品環
function rotateGallery(
    rootNode,
    direction,
    artworkCount,
    completeCircleRadians) {
    if (!rootNode || artworkCount <= 0) return;

    rootNode.rotateY(direction * (completeCircleRadians / artworkCount));
}


export {
    createClickIntersections,
    runClickArrowAction
};
