uniform float uTime;
uniform vec2 uFrequency;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesElevation;
uniform float uBigWavesSpeed;

varying vec2 vUv;
varying float vElevation;


void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 0.001;
    float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) * uBigWavesElevation;
    elevation *= sin(modelPosition.z * uBigWavesFrequency.y) * uBigWavesElevation;

    modelPosition.y += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;
    vElevation = elevation;
}