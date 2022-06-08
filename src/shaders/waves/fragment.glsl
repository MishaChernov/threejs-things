uniform vec3 uColorBottom;
uniform vec3 uColorHigh;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main() {
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
  vec3 bottomColor = uColorBottom;
  vec3 mixedColor = mix(bottomColor, uColorHigh, mixStrength);
  gl_FragColor = vec4(mixedColor, 1.0);
}