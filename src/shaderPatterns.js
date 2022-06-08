import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import * as dat from 'dat.gui'

import vertexShader from './shaders/patterns/vertexFromPattern.glsl'

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

let currentScroll = 0
let fontLoaded = null

/**
 * Base
 */
// const gui = new dat.GUI({ width: 350 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()
const fontLoader = new FontLoader()

fontLoader.load('./fonts/helvetiker_regular.typeface.json', (font) => {
  console.log(font)
  fontLoaded = font
})

/**
 * Object
 */

const shaderFragmentGeneralCode = `
#define PI 3.1415926535897932384626433832795

varying vec2 vUv;

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t)
{
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec2 P)
{
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}`

function createFragmentsArray() {
  return {
    pattern1: `
        isOwnColor = true;
        gl_FragColor = vec4(vUv, 1.0, 1.0);
        float strength = vUv.x;
    `,
    pattern2: `
        isOwnColor = true;
        gl_FragColor = vec4(vUv, 0.0, 1.0);
        float strength = vUv.x;
    `,
    pattern3: `
        float strength = vUv.x;
    `,
    pattern4: `
        float strength = vUv.y;
    `,
    pattern5: `
        float strength = 1.0 - vUv.y;
    `,
    pattern6: `
        float strength = vUv.y * 10.0;
    `,
    pattern7: `
        float strength = mod(vUv.y * 10.0, 1.0);
    `,
    pattern8: `
        float strength = mod(vUv.y * 10.0, 1.0);
        strength = step(0.5, strength);
    `,
    pattern9: `
        float strength = mod(vUv.y * 10.0, 1.0);
        strength = step(0.8, strength);
    `,
    pattern10: `
        float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
    `,
    pattern11: `
        float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
        strength += step(0.8, mod(vUv.y * 10.0, 1.0));
        strength = clamp(strength, 0.0, 1.0);
    `,
    pattern12: `
        float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
        strength *= step(0.8, mod(vUv.y * 10.0, 1.0));
    `,
    pattern13: `
        float strength = step(0.8, mod(vUv.y * 10.0, 1.0));
        strength -= step(0.6, mod(vUv.x * 10.0, 1.0));
    `,
    pattern14: `
        float barX = step(0.4, mod(vUv.x * 10.0, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
        float barY = step(0.8, mod(vUv.x * 10.0, 1.0)) * step(0.4, mod(vUv.y * 10.0, 1.0));
        float strength = barX + barY;
        strength = clamp(strength, 0.0, 1.0);
    `,
    pattern15: `
        float barX = step(0.4, mod(vUv.x * 10.0 - 0.2, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
        float barY = step(0.8, mod(vUv.x * 10.0 , 1.0)) * step(0.4, mod(vUv.y * 10.0 -0.2, 1.0));
        float strength = barX + barY;
        strength = clamp(strength, 0.0, 1.0);
    `,
    pattern16: `
        float strength = abs(vUv.x - 0.5);
    `,
    pattern17: `
        float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
    `,
    pattern18: `
        float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
    `,
    pattern19: `
        float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    `,
    pattern20: `
        float strengthX = 1.0 - step(0.3, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
        float strengthY = step(0.25, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
        float strength = strengthX * strengthY;
    `,
    pattern21: `
        float strength = floor(vUv.x * 10.0) / 10.0;
    `,
    pattern22: `
        float strength = floor(vUv.x * 10.0) / 10.0;
        strength *= floor(vUv.y * 10.0) / 10.0;
    `,
    pattern23: `
        float strength = random(vUv);
    `,
    pattern24: `
        vec2 gridUv = vec2(floor(vUv.x * 10.0) / 10.0, floor(vUv.y * 10.0) / 10.0);
        float strength = random(gridUv);
    `,
    pattern25: `
        vec2 gridUv = vec2(floor(vUv.x * 10.0) / 10.0, floor((vUv.y + vUv.x * 0.5) * 10.0) / 10.0);
        float strength = random(gridUv);
    `,
    pattern26: `
        float strength = length(vUv);
    `,
    pattern27: `
        float strength = distance(vUv, vec2(0.5));
    `,
    pattern28: `
        float strength = 1.0 - distance(vUv, vec2(0.5));
    `,
    pattern29: `
        float strength = 0.015 / distance(vUv, vec2(0.5));
    `,
    pattern30: `
        float strength = 0.15 / (distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5)));
    `,
    pattern31: `
        float strength = 0.15 / (distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5)));
        strength *= 0.15 / (distance(vec2(vUv.y, (vUv.x - 0.5) * 5.0 + 0.5), vec2(0.5)));
    `,
    pattern32: `
        vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5));
        float strength = 0.15 / (distance(vec2(rotatedUv.x, (rotatedUv.y - 0.5) * 5.0 + 0.5), vec2(0.5)));
        strength *= 0.15 / (distance(vec2(rotatedUv.y, (rotatedUv.x - 0.5) * 5.0 + 0.5), vec2(0.5)));
    `,
    pattern33: `
        float strength = step(0.5, distance(vUv, vec2(0.5)) + 0.25);
    `,
    pattern34: `
        float strength = abs( distance(vUv, vec2(0.5)) - 0.25);
    `,
    pattern35: `
        float strength = step(0.02, abs(distance(vUv, vec2(0.5)) - 0.25));
    `,
    pattern36: `
        float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25));
    `,
    pattern37: `
        vec2 wavedUv = vec2(
          vUv.x,
          vUv.y + sin(vUv.x * 30.0) * 0.1
      );
        float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));
    `,
    pattern38: `
        vec2 wavedUv = vec2(
          vUv.x + sin(vUv.y * 30.0) * 0.1,
          vUv.y + sin(vUv.x * 30.0) * 0.1
      );
        float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));
    `,
    pattern39: `
        vec2 wavedUv = vec2(
          vUv.x + sin(vUv.y * 100.0) * 0.1,
          vUv.y + sin(vUv.x * 100.0) * 0.1
      );
        float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));
    `,
    pattern40: `
        float strength = atan(vUv.x, vUv.y);
    `,
    pattern41: `
        float strength = atan(vUv.x - 0.5, vUv.y - 0.5);
    `,
    pattern42: `
        float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
        angle /= PI * 2.0;
        angle += 0.5;
        float strength = angle;
    `,
    pattern43: `
        float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
        angle /= PI * 2.0;
        angle += 0.5;
        float strength = mod(angle * 20.0, 1.0);
    `,
    pattern44: `
        float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
        angle /= PI * 2.0;
        angle += 0.5;
        float strength = sin(angle * 100.0);
    `,
    pattern45: `
        float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
        float radius = 0.25 + sin(angle * 100.0) * 0.02;
        float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - radius));
    `,
    pattern46: `
        float strength = cnoise(vUv * 10.0);
    `,
    pattern47: `
        float strength = step(0.0, cnoise(vUv * 10.0));
    `,
    pattern48: `
        float strength = 1.0 - abs(cnoise(vUv * 10.0));
    `,
    pattern49: `
        float strength = sin(cnoise(vUv * 10.0) * 20.0);
    `,
    pattern50: `
        float strength = step(0.9, sin(cnoise(vUv * 10.0) * 20.0);
    `,
  }
}

const shaderFragmentMainFunctionPatterns = createFragmentsArray()

const shaderGeometry = new THREE.PlaneBufferGeometry(2, 2, 32, 32)

let stepY = 0

const group = new THREE.Group()

for (let key in shaderFragmentMainFunctionPatterns) {
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: `
        ${shaderFragmentGeneralCode}
        void main() {
          bool isOwnColor = false;

          ${shaderFragmentMainFunctionPatterns[key]}

          if (isOwnColor == false) {
            vec3 blackColor = vec3(0.0);
            vec3 uvColor = vec3(vUv, 1.0);
            vec3 mixedColor = mix(blackColor, uvColor, strength);
            gl_FragColor = vec4(mixedColor, 1.0);
          }
        }
      `,
  })

  const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial)

  shaderMesh.position.y = stepY

  stepY -= 2.5

  group.add(shaderMesh)
}
scene.add(group)

/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(0, 2, 2)
scene.add(directionalLight)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 4
camera.position.y = 0
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = false

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
let fontInitialized = false
let textGeometry = null

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // if (fontLoaded && !fontInitialized) {
  //   textGeometry = new TextGeometry('1', {
  //     font: fontLoaded,
  //     size: 0.3,
  //     height: 0.1,
  //     curveSegments: 10,
  //     bevelEnabled: true,
  //     bevelThickness: 0.03,
  //     bevelSize: 0.02,
  //     bevelOffset: 0,
  //     bevelSegments: 3,
  //   })
  //   const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  //   const text = new THREE.Mesh(textGeometry, textMaterial)
  //   text.position.set(0.85, 0.75, 0)

  //   fontInitialized = true
  //   scene.add(text)
  // } else if (textureLoader && fontInitialized) {
  //   textGeometry.text = 2
  // }

  group.position.y = -1 * currentScroll

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Appear/disapear codeblock on the page
  if (codeblock.shouldBeVisible != codeblock.isVisible) {
    toogleCodeblock()
  }

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()

/*
 * Helpers
 */

const resizeButton = document.getElementById('resize-btn')
const codeblockElement = document.getElementById('codeblock')
const codeblockScreenPosition = codeblockElement.getBoundingClientRect()

function updateSizes(width = window.innerWidth, height = window.innerHeight) {
  // Update sizes
  sizes.width = width
  sizes.height = height

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

function toogleCodeblock() {
  codeblock.isVisible = !codeblock.isVisible

  if (codeblock.isVisible) {
    codeblockElement.style.marginLeft = '50%'
    updateSizes(window.innerWidth / 2, window.innerHeight)
    // stickGuiLeft()
  } else {
    codeblockElement.style.marginLeft = '100%'
    codeblockElement.style.width = '50vw'
    updateSizes()
    // stickGuiRight()
  }
}

function stickGuiLeft() {
  document.getElementsByClassName('dg main a')[0].style.marginLeft = '0'
  document.getElementsByClassName('dg main a')[0].style.marginRight = '100%'
  document.getElementsByClassName('dg main a')[0].style.transform =
    'translateX(0%)'
}
;``
function stickGuiRight() {
  document.getElementsByClassName('dg main a')[0].style.marginLeft = '100%'
  document.getElementsByClassName('dg main a')[0].style.marginRight = '0%'
  document.getElementsByClassName('dg main a')[0].style.transform =
    'translateX(-100%)'
}

function handleMouseMove(e) {
  const availableZone = e.clientX < window.innerWidth - 35
  const { shouldBeVisible, mouseDownResize, isVisible } = codeblock

  if (!availableZone && shouldBeVisible && mouseDownResize) {
    codeblock.shouldBeVisible = !shouldBeVisible
    codeblock.mouseDownResize = false
  }

  if (isVisible && availableZone && shouldBeVisible && mouseDownResize) {
    codeblockElement.style.marginLeft = e.clientX + 'px'

    if (e.clientX < codeblockScreenPosition.x) {
      codeblockElement.style.width = window.innerWidth - e.clientX + 'px'
    }

    updateSizes(e.clientX, window.innerHeight)
  }
}

document.body.addEventListener('mousewheel', function (e) {
  currentScroll += e.wheelDeltaY * 0.0002
})

resizeButton.addEventListener('mousedown', function () {
  codeblock.mouseDownResize = true
  document.addEventListener('mousemove', handleMouseMove)
  canvas.style.transition = 'none'
  codeblockElement.style.transition = 'none'
})

resizeButton.addEventListener('mouseup', function () {
  codeblock.mouseDownResize = false
  canvas.style.transition = 'width 0.5s ease-in-out'
  codeblockElement.style.transition = 'margin 0.5s ease-in-out;'
})

document.addEventListener('keypress', (e) => {
  const { shouldBeVisible } = codeblock

  if (e.code === 'KeyG') {
    codeblock.shouldBeVisible = !shouldBeVisible
    console.log('Toggle code block')
  }
})

let isFullScreen = false

canvas.addEventListener('dblclick', (e) => {
  if (!isFullScreen) {
    canvas.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
  isFullScreen = !isFullScreen
})

const code = document.getElementsByClassName('code')[0]

code.innerHTML = createFragmentsArray.toString()
