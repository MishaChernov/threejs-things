import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import * as dat from 'dat.gui'

const init = () => {
  /* 
  Constants
*/

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
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

  // Door textures
  const doorColor = textureLoader.load('textures/door/color.jpg')
  const doorAlpha = textureLoader.load('textures/door/alpha.jpg')
  const doorAmbientOcclusion = textureLoader.load(
    'textures/door/ambientOcclusion.jpg'
  )
  const doorHeight = textureLoader.load('textures/door/height.jpg')
  const doorMetalness = textureLoader.load('textures/door/metalness.jpg')
  const doorRoughness = textureLoader.load('textures/door/roughness.jpg')
  const doorNormal = textureLoader.load('textures/door/normal.jpg')

  // Grass textures
  const grassColor = textureLoader.load('textures/grass/color.jpg')
  const grassAo = textureLoader.load('textures/grass/ambientOcclusion.jpg')
  const grassNormal = textureLoader.load('textures/grass/normal.jpg')
  const grassRoughness = textureLoader.load('textures/grass/roughness.jpg')

  grassColor.repeat.set(8, 8)
  grassAo.repeat.set(8, 8)
  grassNormal.repeat.set(8, 8)
  grassRoughness.repeat.set(8, 8)

  grassColor.wrapS = THREE.RepeatWrapping
  grassAo.wrapS = THREE.RepeatWrapping
  grassNormal.wrapS = THREE.RepeatWrapping
  grassRoughness.wrapS = THREE.RepeatWrapping

  grassColor.wrapT = THREE.RepeatWrapping
  grassAo.wrapT = THREE.RepeatWrapping
  grassNormal.wrapT = THREE.RepeatWrapping
  grassRoughness.wrapT = THREE.RepeatWrapping

  // Bricks textures
  const bricksColor = textureLoader.load('textures/bricks/color.jpg')
  const bricksAo = textureLoader.load('textures/bricks/ambientOcclusion.jpg')
  const bricksNormal = textureLoader.load('textures/bricks/normal.jpg')
  const bricksRoughness = textureLoader.load('textures/bricks/roughness.jpg')

  /*
  Objects
*/

  // Plane
  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(20, 20),
    new THREE.MeshStandardMaterial({
      map: grassColor,
      aoMap: grassAo,
      normalMap: grassNormal,
      roughnessMap: grassRoughness,
    })
  )
  plane.rotation.x = -Math.PI * 0.5
  plane.position.z = -2
  plane.position.y = -1.5
  plane.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(plane.geometry.attributes.uv.array, 2)
  )

  scene.add(plane)

  // House
  const house = new THREE.Group()
  house.position.z = -2
  house.position.y = -0.3

  const houseFolderGUI = gui.addFolder('house')
  houseFolderGUI
    .add(house.position, 'z')
    .min(-10)
    .max(10)
    .step(0.01)
    .name('walls z')

  houseFolderGUI
    .add(house.position, 'y')
    .min(-10)
    .max(10)
    .step(0.01)
    .name('walls y')

  scene.add(house)

  // Walls
  const walls = new THREE.Mesh(
    new THREE.BoxBufferGeometry(3, 2.5, 3),
    new THREE.MeshStandardMaterial({
      map: bricksColor,
      aoMap: bricksAo,
      normalMap: bricksNormal,
      roughnessMap: bricksRoughness,
    })
  )
  walls.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
  )
  walls.castShadow = true
  walls.receiveShadow = true
  house.add(walls)

  // Roof
  const roof = new THREE.Mesh(
    new THREE.ConeBufferGeometry(2.5, 1.5, 4),
    new THREE.MeshStandardMaterial({ color: '#35363a' })
  )
  roof.position.y = 2
  roof.rotation.y = Math.PI * 0.25

  houseFolderGUI
    .add(roof.position, 'y')
    .min(-1)
    .max(3)
    .step(0.01)
    .name('roof y')
  houseFolderGUI
    .add(roof.rotation, 'y')
    .min(-1)
    .max(3)
    .step(0.01)
    .name('roof rotation y')

  house.add(roof)

  // Door
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 100, 100),
    new THREE.MeshStandardMaterial({
      map: doorColor,
      transparent: true,
      aoMap: doorAmbientOcclusion,
      alphaMap: doorAlpha,
      displacementMap: doorHeight,
      displacementScale: 0.1,
      normalMap: doorNormal,
      metalnessMap: doorMetalness,
      roughnessMap: doorRoughness,
    })
  )
  door.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
  )
  door.position.z = 1.5 + 0.001
  door.position.y = -0.2

  houseFolderGUI
    .add(door.position, 'z')
    .min(1)
    .max(3)
    .step(0.01)
    .name('door position z')

  house.add(door)

  /* 
  Fog
*/
  const fog = new THREE.Fog('#262837', 1, 20)
  scene.fog = fog

  /* 
  Bushes
*/
  const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
  const bushMaterial = new THREE.MeshStandardMaterial({ color: '#206420' })

  const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
  bush1.scale.set(0.5, 0.5, 0.5)
  bush1.position.set(1.1, -1, 2)

  const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
  bush2.scale.set(0.25, 0.25, 0.25)
  bush2.position.set(1.4, -1, 2.1)

  const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
  bush3.scale.set(0.4, 0.4, 0.4)
  bush3.position.set(-0.8, -1, 1.95)

  const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
  bush4.scale.set(0.15, 0.15, 0.15)
  bush4.position.set(-1, -1.1, 2.2)

  bush1.castShadow = true
  bush1.receiveShadow = true

  bush2.castShadow = true
  bush2.receiveShadow = true

  bush3.castShadow = true
  bush3.receiveShadow = true

  bush4.castShadow = true
  bush4.receiveShadow = true

  house.add(bush1, bush2, bush3, bush4)

  /* 
  Graves
*/
  const graveGeometry = new THREE.BoxBufferGeometry(1, 1.5, 0.3)
  const graveMaterial = new THREE.MeshStandardMaterial({ color: 'eeeeee' })

  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 3 // Random angle
    const radius = 3.5 + Math.random() * 4.5 // Random radius
    const x = Math.cos(angle) * radius // Get the x position using cosinus
    const z = -2 + Math.sin(angle) * radius // Get the z position using sinus

    const graveMesh = new THREE.Mesh(graveGeometry, graveMaterial)
    // Position
    graveMesh.position.set(x, -1.1, z)

    // Rotation
    graveMesh.rotation.z = (Math.random() - 0.5) * 0.4
    graveMesh.rotation.y = (Math.random() - 0.5) * 0.4
    graveMesh.castShadow = true
    scene.add(graveMesh)
  }

  /* 
  Ghosts
*/
  const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
  scene.add(ghost1)

  const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
  scene.add(ghost2)

  const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
  scene.add(ghost3)

  /* 
  Lights
*/
  const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)

  const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12)

  const doorLight = new THREE.PointLight('#ff7d46', 0.5, 10)
  doorLight.position.set(0, 2, 2.3)

  houseFolderGUI
    .add(doorLight.position, 'z')
    .min(1)
    .max(5)
    .step(0.01)
    .name('door light position z')

  house.add(doorLight)
  scene.add(ambientLight, moonLight)

  /* 
  Shadows
*/
  moonLight.castShadow = true
  doorLight.castShadow = true
  ghost1.castShadow = true
  ghost2.castShadow = true
  ghost3.castShadow = true

  plane.receiveShadow = true

  moonLight.shadow.mapSize.width = 256
  moonLight.shadow.mapSize.height = 256
  moonLight.shadow.camera.far = 15

  // ...

  doorLight.shadow.mapSize.width = 256
  doorLight.shadow.mapSize.height = 256
  doorLight.shadow.camera.far = 7

  // ...

  ghost1.shadow.mapSize.width = 256
  ghost1.shadow.mapSize.height = 256
  ghost1.shadow.camera.far = 7

  // ...

  ghost2.shadow.mapSize.width = 256
  ghost2.shadow.mapSize.height = 256
  ghost2.shadow.camera.far = 7

  // ...

  ghost3.shadow.mapSize.width = 256
  ghost3.shadow.mapSize.height = 256
  ghost3.shadow.camera.far = 7

  // ...

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
  renderer.setClearColor('#262837')
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  renderer.render(scene, camera)

  window.addEventListener('resize', () => updateSizes)

  /**
   * Animate
   */
  const clock = new THREE.Clock()

  const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    // Ghosts
    const ghost1Angle = elapsedTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(elapsedTime * 3)

    const ghost2Angle = -elapsedTime * 0.32
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    const ghost3Angle = -elapsedTime * 0.18
    ghost3.position.x =
      Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
    ghost3.position.z =
      Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
    ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)
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
