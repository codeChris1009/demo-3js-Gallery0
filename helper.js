import { artworks } from './const.js';

const COMPLETE_CIRCLE_RADIANS = Math.PI * 2;

/**
 * Get total number of artworks.
 * 取得作品總數
 * @returns {number}
 */
function getArtworkCount() {
    return artworks.length;
}

/**
 * Calculate the base node rotation angle for placing artworks evenly around a circle.
 * 計算作品在圓周上的旋轉角度
 * @param {number} index - 目前第幾個位置（從 0 開始）
 * @param {number} count - 總作品數量
 * @returns {number}
 */
function getBaseNodeRotation(index, count) {
    const safeIndex = Number.isFinite(index) ? index : 0;
    const safeCount = Math.max(1, Math.floor(count));
    return safeIndex * (COMPLETE_CIRCLE_RADIANS / safeCount);
}

/**
 * Get an array of unique random indices from 0 to count-1.
 * 產生 0 ~ count-1 的隨機且不重複索引陣列
 * 使用 Fisher-Yates 洗牌法，時間複雜度 O(n)
 * @param {number} count
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
    getArtworkCount,
    getBaseNodeRotation,
    getRandomUniqueIndices,
};
