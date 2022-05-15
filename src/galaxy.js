import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

const init = () => {
  /* 
  Constants
*/

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  const parameters = {
    count: 7800,
    size: 0.001,
    radius: 4.18,
    branches: 6,
    spin: 1.3,
    randomness: 0.698,
    randomnessPower: 4.3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
  }

  const canvas = document.querySelector('canvas.webgl')

  /* 
  GUI
*/
  const gui = new dat.GUI({ width: 300 })

  /* 
  Scene
*/
  const scene = new THREE.Scene()

  /*
  Texture loader
 */
  const textureLoader = new THREE.TextureLoader()

  /**
   * Galaxy
   */
  let geometry = null
  let material = null
  let points = null

  const generateGalaxy = () => {
    // Destroy old galaxy
    if (points !== null) {
      geometry.dispose()
      material.dispose()
      scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3

      const radius = Math.random() * parameters.radius
      const spinAngle = radius * parameters.spin
      const branchAngle =
        ((i % parameters.branches) / parameters.branches) * Math.PI * 2

      const randomX =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius
      const randomY =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius
      const randomZ =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius

      positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX
      positions[i3 + 1] = randomY
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

      const mixedColor = colorInside.clone()
      mixedColor.lerp(colorOutside, radius / parameters.radius)

      colors[i3] = mixedColor.r
      colors[i3 + 1] = mixedColor.g
      colors[i3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /**
     * Material
     */
    material = new THREE.PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
  }
  generateGalaxy()

  /**
   * Tweaks gui
   */

  gui
    .add(parameters, 'count')
    .min(100)
    .max(100000)
    .step(100)
    .onFinishChange(generateGalaxy)

  gui
    .add(parameters, 'size')
    .min(0.001)
    .max(0.1)
    .step(0.001)
    .onFinishChange(generateGalaxy)

  gui
    .add(parameters, 'radius')
    .min(0.01)
    .max(20)
    .step(0.01)
    .onFinishChange(generateGalaxy)

  gui
    .add(parameters, 'branches')
    .min(2)
    .max(20)
    .step(1)
    .onFinishChange(generateGalaxy)

  gui
    .add(parameters, 'spin')
    .min(1)
    .max(5)
    .step(0.001)
    .onFinishChange(generateGalaxy)

  gui
    .add(parameters, 'randomness')
    .min(0)
    .max(2)
    .step(0.001)
    .onFinishChange(generateGalaxy)

  gui
    .add(parameters, 'randomnessPower')
    .min(1)
    .max(10)
    .step(0.001)
    .onFinishChange(generateGalaxy)

  gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)

  gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

  /* 
  Camera
*/
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  )
  camera.position.z = 6
  camera.position.y = 3
  scene.add(camera)

  /* 
  Controllers
*/
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

  /* 
  Renderer
*/
  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio), 2)
  renderer.setClearColor(0x000000)
  renderer.render(scene, camera)

  /* 
  Request Animation Frame
*/

  window.addEventListener('resize', () => updateSizes)

  /**
   * Animate
   */
  const clock = new THREE.Clock()

  const tick = () => {
    // const elapsedTime = clock.getElapsedTime()

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
