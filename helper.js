import { artworks } from './const.js';


/**
 * Get total number of artworks.
 * @returns {number}
 */
function getArtworkCount() {
    return artworks.length;
}


/**
 * Compute base node rotation so artworks are evenly distributed in a circle.
 * @param {number} index
 * @param {number} count
 * @returns {number}
 */
function getBaseNodeRotation(index, count) {
    if (count <= 0) return 0;
    return index * (2 * Math.PI / count);
}

/**
 * Build a shuffled non-repeating index array in range [0, count - 1].
 * @param {number} count
 * @returns {number[]}
 */
function getRandomUniqueIndices(count) {
    const safeCount = Math.max(0, Math.floor(count));
    const indices = Array.from({ length: safeCount }, (_, i) => i);

    // Fisher-Yates shuffle
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
