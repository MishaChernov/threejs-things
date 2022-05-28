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
    envMapIntensity: 1.33,
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
  const cubeTextureLoader = new THREE.CubeTextureLoader()
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('draco/')
  const gltfLoader = new GLTFLoader()
  gltfLoader.setDRACOLoader(dracoLoader)

  const environmentMap = cubeTextureLoader.load([
    'textures/environmentMaps/5/px.jpg',
    'textures/environmentMaps/5/nx.jpg',
    'textures/environmentMaps/5/py.jpg',
    'textures/environmentMaps/5/ny.jpg',
    'textures/environmentMaps/5/pz.jpg',
    'textures/environmentMaps/5/nz.jpg',
  ])

  environmentMap.encoding = THREE.sRGBEncoding

  scene.background = environmentMap
  scene.environment = environmentMap

  gui
    .add(parameters, 'envMapIntensity')
    .min(0)
    .max(10)
    .step(0.001)
    .onChange(updateAllMaterials)

  const helmetModel = gltfLoader.load(
    'models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
      gltf.scene.position.x = 0
      gltf.scene.position.y = -1.9
      gltf.scene.scale.set(5, 5, 5)

      gui
        .add(gltf.scene.rotation, 'y')
        .min(-Math.PI)
        .max(Math.PI)
        .step(0.001)
        .name('rotation')
      scene.add(gltf.scene)

      updateAllMaterials()
    }
  )

  const hamburgerModel = gltfLoader.load(
    'models/Hamburger/Hamburger1.gltf',
    (gltf) => {
      console.log('hamburger', gltf)
      gltf.scene.position.set(0.468, -1.385, -0.572)
      gltf.scene.scale.set(0.05, 0.05, 0.05)

      gui
        .add(gltf.scene.position, 'y')
        .min(-2)
        .max(3)
        .step(0.001)
        .name('hamburger y')
      gui
        .add(gltf.scene.position, 'x')
        .min(-2)
        .max(3)
        .step(0.001)
        .name('hamburger x')
      gui
        .add(gltf.scene.position, 'z')
        .min(-1)
        .max(3)
        .step(0.001)
        .name('hamburger z')

      scene.add(gltf.scene)
    }
  )

  /**
   * Lights
   */
  const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
  directionalLight.castShadow = true
  directionalLight.shadow.camera.far = 15
  directionalLight.shadow.mapSize.set(1024, 1024)
  directionalLight.shadow.normalBias = 0.05
  directionalLight.position.set(0.25, 3, -2.25)
  scene.add(directionalLight)

  gui
    .add(directionalLight, 'intensity')
    .min(0)
    .max(10)
    .step(0.001)
    .name('lightIntensity')
  gui
    .add(directionalLight.position, 'x')
    .min(-5)
    .max(5)
    .step(0.001)
    .name('lightX')
  gui
    .add(directionalLight.position, 'y')
    .min(-5)
    .max(5)
    .step(0.001)
    .name('lightY')
  gui
    .add(directionalLight.position, 'z')
    .min(-5)
    .max(5)
    .step(0.001)
    .name('lightZ')

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
    antialias: window.devicePixelRatio < 2,
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.physicallyCorrectLights = true
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.ReinhardToneMapping
  renderer.toneMappingExposure = 3
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  })
  gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

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

    // Render
    renderer.render(scene, camera)
    camera.updateProjectionMatrix()

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

  /**
   * Update all materials
   */

  function updateAllMaterials() {
    scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.material.envMapIntensity = parameters.envMapIntensity
        child.castShadow = true
        child.receiveShadow = true
      }
    })
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

  window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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
