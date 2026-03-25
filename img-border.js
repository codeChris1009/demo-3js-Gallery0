import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Border dimensions (slightly larger than artwork plane: 3 x 2)
const BORDER_WIDTH = 3.09;
const BORDER_HEIGHT = 2.09;
const BORDER_DEPTH = 0.09;
const BORDER_SEGMENTS = 6;
const BORDER_RADIUS = 0.03;
const BORDER_COLOR = 0x8a8a8a;

/**
 * Create a simple rounded silver-gray frame mesh.
 * The mesh uses `BackSide` so only the frame edge is visible around the artwork.
 * @returns {THREE.Mesh}
 */
function createImageBorderMesh() {
    // Rounded frame geometry
    const geometry = new RoundedBoxGeometry(
        BORDER_WIDTH,
        BORDER_HEIGHT,
        BORDER_DEPTH,
        BORDER_SEGMENTS,
        BORDER_RADIUS
    );

    // Basic silver-gray material for frame look
    const material = new THREE.MeshStandardMaterial({
        color: BORDER_COLOR,
        // Render back side to show border around artwork edges
        side: THREE.BackSide,
    });

    const borderMesh = new THREE.Mesh(geometry, material);
    return borderMesh;
}

export { createImageBorderMesh };
