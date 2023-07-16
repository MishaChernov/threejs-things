import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'
import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'

const init = () => {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  const parameters = {
    ambientIntensity: 3,
    directionalIntensity: 3,
    clearColor: '#252825',
    firefliesCount: 40,
    portalColorStart: '#000000',
    portalColorEnd: '#486367'
  }

  /**
   * Base
   */
  const gui = new dat.GUI({ width: 350 })
  gui.addColor(parameters, 'clearColor').onChange(() => renderer.setClearColor(parameters.clearColor))
  gui.addColor(parameters, 'portalColorStart').onChange(() => {
    portalLightMaterial.uniforms.uColorStart.value.set(parameters.portalColorStart)
  });
  gui.addColor(parameters, 'portalColorEnd').onChange(() => {
    portalLightMaterial.uniforms.uColorEnd.value.set(parameters.portalColorEnd)
  });;

  // Canvas
  const canvas = document.querySelector('canvas.webgl')

  // Scene
  const scene = new THREE.Scene()

  // Loader
  const textureLoader = new THREE.TextureLoader()
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('draco/')
  const gltfLoader = new GLTFLoader()
  gltfLoader.setDRACOLoader(dracoLoader)

  /**
   * Textures
   */
  const bakedTexture = textureLoader.load('textures/portal/baked.jpg')
  bakedTexture.flipY = false
  // bakedTexture.encoding = THREE.sRGBEncoding
  // bakedTexture.colorSpace = THREE.SRGBColorSpace

  /**
   * Geometries
   */
  const firefliesGeometry = new THREE.BufferGeometry()
  const positionArray = new Float32Array(parameters.firefliesCount * 3)
  const scaleArray = new Float32Array(parameters.firefliesCount)

  for(let i = 0; i < parameters.firefliesCount; i++) {
      positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
      positionArray[i * 3 + 1] = Math.random() * 2
      positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4
      scaleArray[i] = Math.random()
  }

  firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
  firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));

  /**
   * Material
   */
  // Baked materials
  const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
  const poleLightMaterial = new THREE.MeshBasicMaterial({ color: '#FFA34E' })
  const portalLightMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorStart: { value: new THREE.Color(parameters.portalColorStart) },
      uColorEnd: { value: new THREE.Color(parameters.portalColorEnd) }
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,
  })
  const firefliesMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uSize: { value: 40.0 }
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('firefliesSize')

  /**
   * Objects
   */

  gltfLoader.load(
    'models/Portal/glTF/portal.glb',
    (gltf) => {
      console.log(gltf);

      gltf.scene.traverse(child => {
        if (child.name === 'baked') {
          child.material = bakedMaterial
        } else if (['PoleLightA', 'PoleLightB'].includes(child.name)) {
          child.material = poleLightMaterial
        } else if (child.name === 'PortalLight') {
          child.material = portalLightMaterial
        }
      })

      scene.add(gltf.scene);
    },
    (gltf) => {
      console.log('portal loading progress')
    },
    (gltf) => {
      console.log('error')
    }
  )

  const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
  scene.add(fireflies)

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
  camera.position.z = -3
  camera.position.x = -1
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
  renderer.setClearColor(parameters.clearColor)
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

    firefliesMaterial.uniforms.uTime.value = elapsedTime
    portalLightMaterial.uniforms.uTime.value = elapsedTime

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

    // Update fireflies
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
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

  window.addEventListener('resize', () => updateSizes())

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
