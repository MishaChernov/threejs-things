import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'

const init = () => {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  const parameters = {
    ambientIntensity: 3,
    directionalIntensity: 3,
    foxStay: () => playFoxAnimation(),
    foxWalk: () => playFoxAnimation(1),
    foxRun: () => playFoxAnimation(2),
  }

  let foxMixer = null
  let foxAnimations = null

  /**
   * Base
   */
  const gui = new dat.GUI({ width: 350 })

  // Canvas
  const canvas = document.querySelector('canvas.webgl')

  // Scene
  const scene = new THREE.Scene()

  // Loader
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('draco/')
  const gltfLoader = new GLTFLoader()
  gltfLoader.setDRACOLoader(dracoLoader)

  const duckModel = gltfLoader.load(
    'models/Duck/glTF/Duck.gltf',
    (gltf) => {
      console.log('duck loaded successfully')
      gltf.scene.children[0].position.x = -0.5
      gltf.scene.children[0].rotateY(-Math.PI * 0.5)
      gltf.scene.children[0].scale.set(0.003, 0.003, 0.003)
      scene.add(gltf.scene.children[0])
    },
    (gltf) => {
      console.log('duck loading progress')
    },
    (gltf) => {
      console.log('error')
    }
  )

  const helmetModel = gltfLoader.load(
    'models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
      // const childrens = [...scene.children]
      // for (const child of childrens) {
      //   scene.add(child)
      // }
      console.log('helmet loaded successfully')
      gltf.scene.position.x = 0.5
      scene.add(gltf.scene)
    }
  )

  const foxModel = gltfLoader.load('models/Fox/glTF/Fox.gltf', (gltf) => {
    console.log('fox', gltf)
    gltf.scene.scale.set(0.009, 0.009, 0.009)
    foxMixer = new THREE.AnimationMixer(gltf.scene)

    foxAnimations = gltf.animations
    playFoxAnimation()
    scene.add(gltf.scene)
  })

  gui.add(parameters, 'foxStay')
  gui.add(parameters, 'foxWalk')
  gui.add(parameters, 'foxRun')

  const hamburgerModel = gltfLoader.load(
    'models/Hamburger/Hamburger.gltf',
    (gltf) => {
      console.log('hamburger', gltf)
      gltf.scene.position.z = 1.5
      gltf.scene.scale.set(0.09, 0.09, 0.09)

      scene.add(gltf.scene)
    }
  )

  /**
   * Object
   */

  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(5, 5),
    new THREE.MeshStandardMaterial({
      color: '#5a626f',
    })
  )
  plane.rotation.x = -Math.PI * 0.5
  plane.position.y = 0
  scene.add(plane)

  /**
   * Lights
   */

  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    parameters.ambientIntensity
  )
  const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    parameters.directionalIntensity
  )
  gui.add(ambientLight, 'intensity').min(0).max(1).step(0.01)
  gui.add(directionalLight, 'intensity').min(0).max(1).step(0.01)
  directionalLight.position.set(0, 2, 2)
  scene.add(ambientLight, directionalLight)

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

    // Update controls
    controls.update()

    // Animation mixer updates
    foxMixer?.update(deltaTime)

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

  function playFoxAnimation(value = 0) {
    foxMixer?.stopAllAction()
    const action = foxMixer?.clipAction(foxAnimations[value])
    action.play()
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
