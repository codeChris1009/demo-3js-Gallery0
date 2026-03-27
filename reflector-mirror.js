import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

const MIRROR_RADIUS = 10;
const MIRROR_COLOR = 0x000000;

// 減半渲染解析度以提升性能 / Halve render resolution for better performance
const MIRROR_RENDER_SCALE = 1;

const marbleReflectorShader = {
    name: 'MarbleReflectorShader',

    uniforms: {
        color: { value: new THREE.Color('#000000') },
        tDiffuse: { value: null },
        textureMatrix: { value: null },
        resolution: { value: new THREE.Vector2(1, 1) },
        blurStrength: { value: 1.1 },
        reflectionStrength: { value: 0.18 },
        desaturationStrength: { value: 0.62 },
        veinStrength: { value: 0.015 },
    },

    vertexShader: /* glsl */`
        uniform mat4 textureMatrix;

        varying vec4 vUv;
        varying vec2 vMirrorUv;

        #include <common>
        #include <logdepthbuf_pars_vertex>

        void main() {
            vUv = textureMatrix * vec4( position, 1.0 );
            vMirrorUv = uv;

            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

            #include <logdepthbuf_vertex>
        }
    `,

    fragmentShader: /* glsl */`
        uniform vec3 color;
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float blurStrength;
        uniform float reflectionStrength;
        uniform float desaturationStrength;
        uniform float veinStrength;

        varying vec4 vUv;
        varying vec2 vMirrorUv;

        #include <logdepthbuf_pars_fragment>

        float hash( vec2 p ) {
            return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453123 );
        }

        float noise( vec2 p ) {
            vec2 i = floor( p );
            vec2 f = fract( p );
            vec2 u = f * f * ( 3.0 - 2.0 * f );

            return mix(
                mix( hash( i + vec2( 0.0, 0.0 ) ), hash( i + vec2( 1.0, 0.0 ) ), u.x ),
                mix( hash( i + vec2( 0.0, 1.0 ) ), hash( i + vec2( 1.0, 1.0 ) ), u.x ),
                u.y
            );
        }

        float fbm( vec2 p ) {
            float value = 0.0;
            float amplitude = 0.5;

            for ( int i = 0; i < 4; i++ ) {
                value += amplitude * noise( p );
                p *= 2.0;
                amplitude *= 0.5;
            }

            return value;
        }

        vec3 sampleBlurredReflection( vec2 uv, vec2 texel ) {
            vec3 sum = vec3( 0.0 );

            sum += texture2D( tDiffuse, uv ).rgb * 0.20;
            sum += texture2D( tDiffuse, uv + texel * vec2( 1.5, 0.0 ) ).rgb * 0.12;
            sum += texture2D( tDiffuse, uv + texel * vec2( -1.5, 0.0 ) ).rgb * 0.12;
            sum += texture2D( tDiffuse, uv + texel * vec2( 0.0, 1.5 ) ).rgb * 0.10;
            sum += texture2D( tDiffuse, uv + texel * vec2( 0.0, -1.5 ) ).rgb * 0.10;
            sum += texture2D( tDiffuse, uv + texel * vec2( 2.5, 2.0 ) ).rgb * 0.08;
            sum += texture2D( tDiffuse, uv + texel * vec2( -2.5, 2.0 ) ).rgb * 0.08;
            sum += texture2D( tDiffuse, uv + texel * vec2( 2.5, -2.0 ) ).rgb * 0.08;
            sum += texture2D( tDiffuse, uv + texel * vec2( -2.5, -2.0 ) ).rgb * 0.08;
            sum += texture2D( tDiffuse, uv + texel * vec2( 0.0, 3.5 ) ).rgb * 0.02;
            sum += texture2D( tDiffuse, uv + texel * vec2( 0.0, -3.5 ) ).rgb * 0.02;

            return sum;
        }

        void main() {
            #include <logdepthbuf_fragment>

            vec2 projectedUv = vUv.xy / vUv.w;
            projectedUv = clamp( projectedUv, vec2( 0.001 ), vec2( 0.999 ) );

            vec2 texel = vec2( blurStrength ) / resolution;
            vec3 reflection = sampleBlurredReflection( projectedUv, texel );

            float luminance = dot( reflection, vec3( 0.299, 0.587, 0.114 ) );
            reflection = mix( reflection, vec3( luminance ), desaturationStrength );

            vec2 marbleUv = vMirrorUv * vec2( 6.0, 9.0 );
            float stoneNoise = fbm( marbleUv + vec2( 0.0, vMirrorUv.y * 1.2 ) );
            float veins = abs( sin( marbleUv.x * 1.4 + stoneNoise * 3.2 ) );
            veins = smoothstep( 0.82, 0.98, veins ) * veinStrength;

            vec3 stoneBase = mix(
                color,
                color + vec3( 0.01, 0.01, 0.01 ),
                stoneNoise * 0.12 + vMirrorUv.y * 0.03
            );
            stoneBase += veins;

            float edgeFade = 1.0 - smoothstep( 0.55, 0.98, distance( vMirrorUv, vec2( 0.5 ) ) );
            float distanceFade = smoothstep( 0.14, 0.82, vMirrorUv.y );
            float alpha = edgeFade * distanceFade * reflectionStrength;

            vec3 softenedReflection = reflection * 0.52;
            vec3 finalColor = stoneBase + softenedReflection * alpha;

            gl_FragColor = vec4( finalColor, 1.0 );

            #include <tonemapping_fragment>
            #include <colorspace_fragment>
        }
    `,
};

function getMirrorRenderTargetSize() {
    return {
        width: Math.max(1, Math.floor(window.innerWidth * MIRROR_RENDER_SCALE)),
        height: Math.max(1, Math.floor(window.innerHeight * MIRROR_RENDER_SCALE)),
    };
}

function createMirror() {
    const { width, height } = getMirrorRenderTargetSize();
    const mirror = new Reflector(
        new THREE.CircleGeometry(MIRROR_RADIUS, 96),
        {
            textureWidth: width,
            textureHeight: height,
            color: MIRROR_COLOR,
            clipBias: 0.01,
            multisample: 2,
            shader: marbleReflectorShader,
        }
    );

    mirror.material.uniforms.resolution.value.set(width, height);
    return mirror;
}

export { createMirror, getMirrorRenderTargetSize };
