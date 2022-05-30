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

  const debugObject = {
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

  /**
   * Loaders
   */
  const gltfLoader = new GLTFLoader()
  const textureLoader = new THREE.TextureLoader()
  const cubeTextureLoader = new THREE.CubeTextureLoader()

  /**
   * Update all materials
   */
  const updateAllMaterials = () => {
    scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        // child.material.envMap = environmentMap
        child.material.envMapIntensity = debugObject.envMapIntensity
        child.material.needsUpdate = true
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }

  /**
   * Environment map
   */
  const environmentMap = cubeTextureLoader.load([
    'textures/environmentMaps/5/nx.jpg',
    'textures/environmentMaps/5/py.jpg',
    'textures/environmentMaps/5/px.jpg',
    'textures/environmentMaps/5/ny.jpg',
    'textures/environmentMaps/5/pz.jpg',
    'textures/environmentMaps/5/nz.jpg',
  ])

  environmentMap.encoding = THREE.sRGBEncoding

  // scene.background = environmentMap
  scene.environment = environmentMap

  debugObject.envMapIntensity = 0.4
  gui
    .add(debugObject, 'envMapIntensity')
    .min(0)
    .max(4)
    .step(0.001)
    .onChange(updateAllMaterials)

  /**
   * Models
   */

  gltfLoader.load('models/Fox/glTF/Fox.gltf', (gltf) => {
    console.log('fox', gltf)
    gltf.scene.scale.set(0.009, 0.009, 0.009)
    foxMixer = new THREE.AnimationMixer(gltf.scene)

    foxAnimations = gltf.animations
    playFoxAnimation()
    scene.add(gltf.scene)
  })

  gui.add(debugObject, 'foxStay')
  gui.add(debugObject, 'foxWalk')
  gui.add(debugObject, 'foxRun')

  /**
   * Floor
   */
  const floorColorTexture = textureLoader.load('textures/dirt/color.jpg')
  floorColorTexture.encoding = THREE.sRGBEncoding
  floorColorTexture.repeat.set(1.5, 1.5)
  floorColorTexture.wrapS = THREE.RepeatWrapping
  floorColorTexture.wrapT = THREE.RepeatWrapping

  const floorNormalTexture = textureLoader.load('textures/dirt/normal.jpg')
  floorNormalTexture.repeat.set(1.5, 1.5)
  floorNormalTexture.wrapS = THREE.RepeatWrapping
  floorNormalTexture.wrapT = THREE.RepeatWrapping

  const floorGeometry = new THREE.CircleGeometry(5, 64)
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorColorTexture,
    normalMap: floorNormalTexture,
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI * 0.5
  scene.add(floor)

  /**
   * Lights
   */

  const directionalLight = new THREE.DirectionalLight('#ffffff', 4)
  directionalLight.castShadow = true
  directionalLight.shadow.camera.far = 15
  directionalLight.shadow.mapSize.set(1024, 1024)
  directionalLight.shadow.normalBias = 0.05
  directionalLight.position.set(3.5, 2, -1.25)
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
    35,
    sizes.width / sizes.height,
    0.1,
    100
  )
  camera.position.set(6, 4, 8)
  scene.add(camera)

  // Controls
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  })
  renderer.physicallyCorrectLights = true
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.CineonToneMapping
  renderer.toneMappingExposure = 1.75
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setClearColor('#211d20')
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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
