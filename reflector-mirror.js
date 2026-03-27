import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

const MIRROR_RADIUS = 10;
const MIRROR_COLOR = 0x303030;

function createMirror() {
    const mirror = new Reflector(
        new THREE.CircleGeometry(MIRROR_RADIUS),
        {
            textureWidth: window.innerWidth,
            textureHeight: window.innerHeight,
            color: MIRROR_COLOR,
        }
    );
    return mirror;
}

export { createMirror };
