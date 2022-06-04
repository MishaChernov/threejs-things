import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import * as dat from 'dat.gui'

import vertexShader from './shaders/vertexFromPattern.glsl'

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

let currentScroll = 0
let fontLoaded = null

/**
 * Base
 */
const gui = new dat.GUI({ width: 350 })
gui.isVisible = false

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
        void main() {
          gl_FragColor = vec4(vUv, 1.0, 1.0);
        }
      `,
    pattern2: `
        void main() {
          gl_FragColor = vec4(vUv, 0.0, 1.0);
        }
      `,
    pattern3: `
        void main() {
          float strength = vUv.x;

          gl_FragColor = vec4(vec3(strength), 1.0);
        }
      `,
    pattern4: `
        void main() {
          float strength = vUv.y;

          gl_FragColor = vec4(vec3(strength), 1.0);
        }
      `,
    pattern5: `
        void main() {
          float strength = 1.0 - vUv.y;

          gl_FragColor = vec4(vec3(strength), 1.0);
        }
      `,
    pattern6: `
        void main() {
          float strength = vUv.y * 10.0;

          gl_FragColor = vec4(vec3(strength), 1.0);
        }
      `,
    pattern7: `
      void main() {
        float strength = mod(vUv.y * 10.0, 1.0);

        gl_FragColor = vec4(vec3(strength), 1.0);
      }
    `,
    pattern8: `
      void main() {
        float strength = mod(vUv.y * 10.0, 1.0);
        strength = step(0.5, strength);

        gl_FragColor = vec4(vec3(strength), 1.0);
      }
    `,
    pattern9: `
      void main() {
        float strength = mod(vUv.y * 10.0, 1.0);
        strength = step(0.8, strength);

        gl_FragColor = vec4(vec3(strength), 1.0);
      }
    `,
    pattern10: `
      void main() {
        float strength = step(0.8, mod(vUv.x * 10.0, 1.0));

        gl_FragColor = vec4(vec3(strength), 1.0);
      }
    `,
    pattern11: `
      void main() {
        float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
        strength += step(0.8, mod(vUv.y * 10.0, 1.0));

        gl_FragColor = vec4(vec3(strength), 1.0);
      }
    `,
    pattern12: `
      void main() {
        float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
        strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

        gl_FragColor = vec4(vec3(strength), 1.0);
      }
    `,
    pattern13: `
      void main() {
        float strength = step(0.8, mod(vUv.y * 10.0, 1.0));
        strength -= step(0.6, mod(vUv.x * 10.0, 1.0));

        gl_FragColor = vec4(vec3(strength), 1.0);
      }
    `,
    pattern14: `
      void main() {
        float barX = step(0.4, mod(vUv.x * 10.0, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
        float barY = step(0.8, mod(vUv.x * 10.0, 1.0)) * step(0.4, mod(vUv.y * 10.0, 1.0));
        float strength = barX + barY;

        gl_FragColor = vec4(vec3(strength), 1.0);
      }
    `,
    pattern15: `
      void main() {
        float barX = step(0.4, mod(vUv.x * 10.0 - 0.2, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
        float barY = step(0.8, mod(vUv.x * 10.0 , 1.0)) * step(0.4, mod(vUv.y * 10.0 -0.2, 1.0));
        float strength = barX + barY;

        gl_FragColor = vec4(vec3(strength), 1.0);
      }
    `,
    pattern15: `
      void main() {
        float barX = step(0.4, mod(vUv.x * 10.0 - 0.2, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
        float barY = step(0.8, mod(vUv.x * 10.0 , 1.0)) * step(0.4, mod(vUv.y * 10.0 -0.2, 1.0));
        float strength = barX + barY;

        gl_FragColor = vec4(vec3(strength), 1.0);
      }
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
        ${shaderFragmentMainFunctionPatterns[key]}
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

function normalize(val, min, max) {
  // Shift to positive to avoid issues when crossing the 0 line
  if (min < 0) {
    max += 0 - min
    val += 0 - min
    min = 0
  }
  // Shift values from 0 - max
  val = val - min
  max = max - min
  return Math.max(0, Math.min(1, val / max))
}

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
    stickGuiLeft()
  } else {
    codeblockElement.style.marginLeft = '100%'
    codeblockElement.style.width = '50vw'
    updateSizes()
    stickGuiRight()
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
