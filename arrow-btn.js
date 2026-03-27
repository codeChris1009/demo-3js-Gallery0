import * as THREE from 'three';

// 箭頭按鈕幾何尺寸（目前使用 BoxGeometry）
// Arrow button geometry dimensions (currently using BoxGeometry)
const ARROW_WIDTH = 0.3;
const ARROW_HEIGHT = 0.3;

// 輕微厚度以確保可見性
// Slight thickness to ensure visibility
const ARROW_DEPTH = 0.01;

// Mesh 名稱定義，方便後續識別
// Mesh name definitions for easier identification
const ARROW_LEFT_NAME = 'arrow-left';
const ARROW_RIGHT_NAME = 'arrow-right';

// 貼圖載入器（左右按鈕共用）
// Shared texture loader for left/right arrow buttons.
const textureLoader = new THREE.TextureLoader();

// 左右按鈕貼圖
// Left and right arrow textures.
const ARROW_LEFT = textureLoader.load('/left.png');
const ARROW_RIGHT = textureLoader.load('/right.png');

// 共用按鈕幾何，減少重複建立成本
// Reuse one geometry to reduce allocation cost
const ARROW_BUTTON_BOXGEOMETRY = new THREE.BoxGeometry(
    ARROW_WIDTH,
    ARROW_HEIGHT,
    ARROW_DEPTH
);

// 設定色彩空間，避免貼圖顏色偏暗
// Use sRGB color space to avoid darker-looking textures
ARROW_LEFT.colorSpace = THREE.SRGBColorSpace;
ARROW_RIGHT.colorSpace = THREE.SRGBColorSpace;

/**
 * 建立左右箭頭按鈕
 * Create left/right arrow button meshes
 *
 * @returns {{ left: THREE.Mesh, right: THREE.Mesh }}
 */
function createArrowButton() {
    const left = createArrowMesh(ARROW_LEFT, ARROW_LEFT_NAME);
    const right = createArrowMesh(ARROW_RIGHT, ARROW_RIGHT_NAME);

    return { left, right };
}

/**
 * 建立單一箭頭按鈕 mesh
 * Create one arrow button mesh
 *
 * @param {THREE.Texture} textureMap - 按鈕貼圖 / Button texture map
 * @param {string} name - 物件名稱 / Mesh name
 * @returns {THREE.Mesh}
 */
function createArrowMesh(textureMap, name) {
    const material = new THREE.MeshStandardMaterial({
        map: textureMap,
        // 允許貼圖透明度生效
        // Enable texture transparency
        transparent: true,
    });
    const mesh = new THREE.Mesh(ARROW_BUTTON_BOXGEOMETRY, material);
    mesh.name = name;
    return mesh;
}

export {
    createArrowButton,
    ARROW_LEFT_NAME,
    ARROW_RIGHT_NAME
};
