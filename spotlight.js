import * as THREE from 'three';

// 聚光燈預設參數 / Spotlight default params
const SPOTLIGHT_MAIN_COLOR = 0xffffff;
const SPOTLIGHT_INTENSITY = 120.0;
const SPOTLIGHT_DISTANCE = 10.0;
const SPOTLIGHT_ANGLE = 0.68;
const SPOTLIGHT_PENUMBRA = 1;
const SPOTLIGHT_DECAY = 1.2;

/**
 * 建立聚光燈（可用物件參數覆蓋預設值）。
 * Create a spotlight with overridable options.
 *
 * 使用方式 / Usage:
 * createSpotlight({ intensity: 120, angle: 0.5 })
 *
 * @param {Object} [options]
 * @param {number|string|THREE.Color} [options.color] - 聚光燈顏色 / Light color
 * @param {number} [options.intensity]                - 光強度 / Light intensity
 * @param {number} [options.distance]                 - 照射距離 / Max effective distance
 * @param {number} [options.angle]                    - 光錐角度（弧度）/ Cone angle in radians
 * @param {number} [options.penumbra]                 - 邊緣柔和度（0~1）/ Edge softness
 * @param {number} [options.decay]                    - 衰減係數 / Light decay
 * @returns {THREE.SpotLight}
 */
function createSpotlight(options = {}) {
    const {
        color = SPOTLIGHT_MAIN_COLOR,
        intensity = SPOTLIGHT_INTENSITY,
        distance = SPOTLIGHT_DISTANCE,
        angle = SPOTLIGHT_ANGLE,
        penumbra = SPOTLIGHT_PENUMBRA,
        decay = SPOTLIGHT_DECAY,
    } = options;

    const spotlight = new THREE.SpotLight(
        color,
        intensity,
        distance,
        angle,
        penumbra,
        decay
    );
    return spotlight;
}

export { createSpotlight };
