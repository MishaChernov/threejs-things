import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

import vertexShader from './shaders/waves/vertex.glsl'
import fragmentShader from './shaders/waves/fragment.glsl'

const init = () => {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  const debugOptions = {
    bottomColor: '#186691',
    highColor: '#9bd8ff',
    colorOffset: 0.25,
    colorMultiplier: 2.0,
    bigWavesSpeed: 1,
  }

  /**
   * Base
   */
  const gui = new dat.GUI({ width: 350, closed: true })

  // Canvas
  const canvas = document.querySelector('canvas.webgl')

  // Scene
  const scene = new THREE.Scene()

  /**
   * Object
   */

  const shaderGeometry = new THREE.PlaneBufferGeometry(2, 2, 128, 128)

  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uFrequency: { value: new THREE.Vector2(10, 5) },
      uTime: { value: 0 },

      uBigWavesElevation: { value: 0.2 },
      uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
      uBigWavesSpeed: { value: debugOptions.bigWavesSpeed },

      uColorBottom: { value: new THREE.Color(debugOptions.bottomColor) },
      uColorHigh: { value: new THREE.Color(debugOptions.highColor) },
      uColorOffset: { value: debugOptions.colorOffset },
      uColorMultiplier: { value: debugOptions.colorMultiplier },
    },
    wireframe: false,
  })
  const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial)
  shaderMesh.rotation.x = -Math.PI * 0.5

  gui.add(shaderMaterial, 'wireframe')
  gui
    .add(shaderMaterial.uniforms.uFrequency.value, 'x')
    .min(0)
    .max(20)
    .step(0.01)
    .name('frequencyX')
  gui
    .add(shaderMaterial.uniforms.uFrequency.value, 'y')
    .min(0)
    .max(20)
    .step(0.01)
    .name('frequencyY')
  gui
    .add(shaderMaterial.uniforms.uColorOffset, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name('uColorOffset')
  gui
    .add(shaderMaterial.uniforms.uColorMultiplier, 'value')
    .min(0)
    .max(10)
    .step(0.001)
    .name('uColorMultiplier')
  gui
    .add(shaderMaterial.uniforms.uBigWavesFrequency.value, 'x')
    .min(0)
    .max(10)
    .step(0.001)
    .name('uBigWavesFrequencyX')
  gui
    .add(shaderMaterial.uniforms.uBigWavesFrequency.value, 'y')
    .min(0)
    .max(10)
    .step(0.001)
    .name('uBigWavesFrequencyY')
  gui
    .add(shaderMaterial.uniforms.uBigWavesSpeed, 'value')
    .min(0)
    .max(10)
    .step(0.001)
    .name('uBigWavesSpeed')
  gui.addColor(debugOptions, 'bottomColor').onChange(() => {
    shaderMaterial.uniforms.uColorBottom.value.set(debugOptions.bottomColor)
  })
  gui.addColor(debugOptions, 'highColor').onChange(() => {
    shaderMaterial.uniforms.uColorHigh.value.set(debugOptions.highColor)
  })

  scene.add(shaderMesh)

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
  camera.position.y = 2
  scene.add(camera)

  // Controls
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

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

  const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update material
    shaderMaterial.uniforms.uTime.value = elapsedTime

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
}

init()

const code = document.getElementsByClassName('code')[0]

code.innerHTML = init.toString()
