/**
 * @typedef {Object} ArtworkData
 * @property {number} id            - 作品ID
 * @property {string} image         - 作品檔名(不含.jpg/png等副檔名)
 * @property {string} title         - 作品標題
 * @property {string} artist        - 作品作者
 * @property {number} StartYear     - 作品創作開始年份
 * @property {number} EndYear       - 作品創作結束年份
 * @property {string} description   - 作品描述
 * @property {string} url           - 作品網頁連結
 */

/**
 * @typedef {ArtworkData & { texture: THREE.Texture }} ArtworkTextureResult
 * @property {THREE.Texture} texture
 */

import * as THREE from 'three';
import { artworks } from './const.js';

const textureLoader = new THREE.TextureLoader();
/** @type {Map<string, ArtworkData>} */
const artworkMapById = new Map(artworks.map((artwork) => [String(artwork.id), artwork]));
/** @type {Map<string, THREE.Texture>} */
const textureCache = new Map();


/**
 * Get artwork data and texture by artwork id.
 * @param {number|string} id
 * @returns {ArtworkTextureResult|null}
 */
function getArtworkTextureById(id) {
    const artwork = getArtworkById(id);
    return buildArtworkTextureResult(artwork);
}

/**
 * Get artwork data and texture by array index.
 * @param {number} index
 * @returns {ArtworkTextureResult|null}
 */
function getArtworkTextureByIndex(index) {
    const artwork = getArtworkByIndex(index);
    return buildArtworkTextureResult(artwork);
}

/**
 * Build output payload `{...artwork, texture}`.
 * @param {ArtworkData|null} artwork
 * @returns {ArtworkTextureResult|null}
 */
function buildArtworkTextureResult(artwork) {
    if (!artwork) return null;

    const texture = getTextureByImageName(artwork.image);
    if (!texture) {
        console.warn(`Failed to load texture for artwork id=${artwork.id}, image=${artwork.image}`);
        return null;
    }

    return {
        ...artwork,
        texture,
    };
}



export { getArtworkTextureById, getArtworkTextureByIndex };

// Private helper functions =======================================================

/**
 * @param {number|string} id
 * @returns {ArtworkData|null}
 */
function getArtworkById(id) {
    return artworkMapById.get(String(id)) || null;
}

/**
 * @param {number} index
 * @returns {ArtworkData|null}
 */
function getArtworkByIndex(index) {
    const safeIndex = Math.trunc(index);
    if (safeIndex < 0 || safeIndex >= artworks.length) return null;
    return artworks[safeIndex] || null;
}

/**
 * @param {string} imageName
 * @returns {THREE.Texture|null}
 */
function getTextureByImageName(imageName) {
    if (!imageName) return null;

    const cachedTexture = textureCache.get(imageName);
    if (cachedTexture) return cachedTexture;

    const texturePath = `/${imageName}`;
    const texture = textureLoader.load(texturePath);
    texture.colorSpace = THREE.SRGBColorSpace;

    textureCache.set(imageName, texture);
    return texture;
}
