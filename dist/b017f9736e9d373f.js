import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import * as dat from 'dat.gui'

const init = () => {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  /**
   * Base
   */
  const gui = new dat.GUI({ width: 350 })

  // Canvas
  const canvas = document.querySelector('canvas.webgl')

  // Scene
  const scene = new THREE.Scene()

  /**
   * Object
   */

  const material = new THREE.MeshStandardMaterial()

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  gui
    .add(ambientLight, 'intensity')
    .min(0)
    .max(1)
    .step(0.001)
    .name('ambient intensity')

  const directionLight = new THREE.DirectionalLight(0xffffff, 0.3)
  gui
    .add(directionLight, 'intensity')
    .min(0)
    .max(1)
    .step(0.001)
    .name('direction intensity')

  directionLight.position.set(1, 0.25, 0)

  const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0xffff00, 0.3)
  gui
    .add(hemisphereLight, 'intensity')
    .min(0)
    .max(1)
    .step(0.001)
    .name('hemisphere intensity')

  const pointLight = new THREE.PointLight(0xff0000, 0.5, 10, 5)
  pointLight.position.x = 2
  pointLight.position.y = 3
  pointLight.position.z = 4
  gui
    .add(pointLight, 'intensity')
    .min(0)
    .max(1)
    .step(0.001)
    .name('point intensity')

  const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
  rectAreaLight.position.set(-1.5, 0, 1.5)
  rectAreaLight.lookAt(new THREE.Vector3())
  gui
    .add(rectAreaLight, 'intensity')
    .min(0)
    .max(10)
    .step(0.001)
    .name('rect intensity')
  gui.add(rectAreaLight, 'width').min(0).max(10).step(0.001).name('rect width')
  gui
    .add(rectAreaLight, 'height')
    .min(0)
    .max(10)
    .step(0.001)
    .name('rect height')

  const spotLight = new THREE.SpotLight(
    0x78ff00,
    0.5,
    10,
    Math.PI * 0.1,
    0.25,
    1
  )
  spotLight.position.set(0, 2, 3)
  spotLight.target.position.x = -0.75
  gui
    .add(spotLight, 'intensity')
    .min(0)
    .max(10)
    .step(0.001)
    .name('spot intensity')

  scene.add(
    ambientLight,
    directionLight,
    hemisphereLight,
    pointLight,
    rectAreaLight,
    spotLight
  )

  /*
   * Light Helperes
   */

  const hemisphereLightHelper = new THREE.HemisphereLightHelper(
    hemisphereLight,
    0.2
  )
  scene.add(hemisphereLightHelper)

  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionLight,
    0.2
  )
  scene.add(directionalLightHelper)

  const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
  scene.add(pointLightHelper)

  const spotLightHelper = new THREE.SpotLightHelper(spotLight)
  scene.add(spotLightHelper)

  window.requestAnimationFrame(() => {
    spotLightHelper.update()
  })

  const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)
  scene.add(rectAreaLightHelper)

  const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 32, 32),
    material
  )

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material)
  plane.rotation.x = -Math.PI * 0.5
  plane.position.y = -0.65

  scene.add(sphere, plane)

  /**
   * Camera
   */
  // Base camera
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  )
  camera.position.z = 3
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

  /**
   * Animate
   */
  const clock = new THREE.Clock()

  const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime

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
