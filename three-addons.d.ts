declare module 'three/addons/geometries/RoundedBoxGeometry.js' {
    import { BufferGeometry } from 'three';

    export class RoundedBoxGeometry extends BufferGeometry {
        constructor(
            width?: number,
            height?: number,
            depth?: number,
            segments?: number,
            radius?: number
        );
    }
}

declare module 'three/examples/jsm/geometries/RoundedBoxGeometry.js' {
    import { BufferGeometry } from 'three';

    export class RoundedBoxGeometry extends BufferGeometry {
        constructor(
            width?: number,
            height?: number,
            depth?: number,
            segments?: number,
            radius?: number
        );
    }
}

declare module 'three/addons/objects/Reflector.js' {
    import {
        BufferGeometry,
        ColorRepresentation,
        Mesh,
        WebGLRenderTarget,
    } from 'three';

    export interface ReflectorOptions {
        color?: ColorRepresentation;
        textureWidth?: number;
        textureHeight?: number;
        clipBias?: number;
        multisample?: number;
        shader?: {
            uniforms?: Record<string, unknown>;
            vertexShader?: string;
            fragmentShader?: string;
        };
    }

    export class Reflector extends Mesh {
        constructor(geometry?: BufferGeometry, options?: ReflectorOptions);
        getRenderTarget(): WebGLRenderTarget;
    }
}

declare module 'three/examples/jsm/objects/Reflector.js' {
    import {
        BufferGeometry,
        ColorRepresentation,
        Mesh,
        WebGLRenderTarget,
    } from 'three';

    export interface ReflectorOptions {
        color?: ColorRepresentation;
        textureWidth?: number;
        textureHeight?: number;
        clipBias?: number;
        multisample?: number;
        shader?: {
            uniforms?: Record<string, unknown>;
            vertexShader?: string;
            fragmentShader?: string;
        };
    }

    export class Reflector extends Mesh {
        constructor(geometry?: BufferGeometry, options?: ReflectorOptions);
        getRenderTarget(): WebGLRenderTarget;
    }
}
