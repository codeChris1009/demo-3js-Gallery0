import { artworks } from './const.js';

const COMPLETE_CIRCLE_RADIANS = Math.PI * 2;

/**
 * 取得作品總數
 * Get total number of artworks
 * @returns {number}
 */
function getArtworkCount() {
    return artworks.length;
}

/**
 * 計算作品在圓周上的旋轉角度，使其平均分布
 * Calculate the base node rotation angle for placing artworks evenly around a circle
 * @param {number} index - 目前第幾個位置（從 0 開始）/ Current position (0-based)
 * @param {number} count - 總作品數量 / Total artwork count
 * @returns {number}
 */
function getBaseNodeRotation(index, count) {
    const safeIndex = Number.isFinite(index) ? index : 0;
    const safeCount = Math.max(1, Math.floor(count));
    return safeIndex * (COMPLETE_CIRCLE_RADIANS / safeCount);
}

/**
 * 產生 0 ~ count-1 的隨機且不重複索引陣列（使用 Fisher-Yates 洗牌法）
 * Get an array of unique random indices from 0 to count-1 using Fisher-Yates shuffle
 * @param {number} count - 陣列長度 / Array length
 * @returns {number[]}
 */
function getRandomUniqueIndices(count) {
    const safeCount = Math.max(0, Math.floor(count));
    const indices = Array.from({ length: safeCount }, (_, i) => i);

    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return indices;
}

export {
    COMPLETE_CIRCLE_RADIANS,
    getArtworkCount,
    getBaseNodeRotation,
    getRandomUniqueIndices,
};
