/**
 * @typedef {Object} ArtworkData
 * @property {number} id - 作品 ID
 * @property {string} image - 作品圖片檔名（含副檔名）
 * @property {string} title - 作品標題
 * @property {string} artist - 作品作者
 * @property {number} StartYear - 創作開始年份
 * @property {number} EndYear - 創作結束年份
 * @property {string} description - 作品描述
 * @property {string} url - 作品頁面連結
 */

/**
 * @typedef {ArtworkData & { texture: THREE.Texture }} ArtworkTextureResult
 * @property {THREE.Texture} texture - Three.js 貼圖物件
 */

import * as THREE from 'three';
import { artworks } from './const.js';

const textureLoader = new THREE.TextureLoader();
/** @type {Map<string, ArtworkData>} */
const artworkMapById = new Map(artworks.map((artwork) => [String(artwork.id), artwork]));
/** @type {Map<string, THREE.Texture>} */
const textureCache = new Map();


/**
 * 依作品 ID 取得作品資料與貼圖
 * @param {number|string} id
 * @returns {ArtworkTextureResult|null}
 */
function getArtworkTextureById(id) {
    const artwork = getArtworkById(id);
    return buildArtworkTextureResult(artwork);
}

/**
 * 依作品索引（0-based）取得作品資料與貼圖
 * @param {number} index
 * @returns {ArtworkTextureResult|null}
 */
function getArtworkTextureByIndex(index) {
    const artwork = getArtworkByIndex(index);
    return buildArtworkTextureResult(artwork);
}

/**
 * 將作品資料組合成 `{ ...artwork, texture }` 回傳格式
 * @param {ArtworkData|null} artwork
 * @returns {ArtworkTextureResult|null}
 */
function buildArtworkTextureResult(artwork) {
    if (!artwork) return null;

    const texture = getTextureByImageName(artwork.image);
    if (!texture) return null;

    return {
        ...artwork,
        texture,
    };
}

export { getArtworkTextureById, getArtworkTextureByIndex };

/**
 * 依 ID 從快取 Map 取得作品
 * @param {number|string} id
 * @returns {ArtworkData|null}
 */
function getArtworkById(id) {
    return artworkMapById.get(String(id)) || null;
}

/**
 * 依索引從陣列取得作品
 * @param {number} index
 * @returns {ArtworkData|null}
 */
function getArtworkByIndex(index) {
    const safeIndex = Math.trunc(index);
    if (safeIndex < 0 || safeIndex >= artworks.length) return null;
    return artworks[safeIndex] || null;
}

/**
 * 依圖片檔名取得貼圖，並使用快取避免重複載入
 * @param {string} imageName
 * @returns {THREE.Texture|null}
 */
function getTextureByImageName(imageName) {
    if (!imageName) return null;

    const cachedTexture = textureCache.get(imageName);
    if (cachedTexture) return cachedTexture;

    // Vite， public/ 目錄會被當成網站根目錄來提供靜態檔案
    const texturePath = `/${imageName}`;
    const texture = textureLoader.load(texturePath);
    texture.colorSpace = THREE.SRGBColorSpace;

    textureCache.set(imageName, texture);
    return texture;
}
