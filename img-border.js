import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function createImageBorderMesh() {
    // Slightly larger than the image plane to create a border effect
    const geometry = new RoundedBoxGeometry(3.09, 2.09, 0.09, 6, 0.03);
    const material = new THREE.MeshBasicMaterial({
        // Simple silver-gray border color
        color: 0xd5d5d5,
        // Render back side to show border around artwork edges
        side: THREE.BackSide,
    });

    const borderMesh = new THREE.Mesh(geometry, material);
    return borderMesh;
}

export { createImageBorderMesh };
