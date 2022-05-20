import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'

const init = () => {
  const hitSound = new Audio('sounds/hit.mp3')

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  const parameters = {
    createSphere: () =>
      createSphere(Math.random() * 0.5, {
        x: -0.5 + Math.random() * 2,
        y: 2 + Math.random() * 4,
        z: -0.5 + Math.random() * 2,
      }),
    createBox: () => {
      const getRandomValue = () => 0.3 + Math.random() * 0.6

      createBox(getRandomValue(), getRandomValue(), getRandomValue(), {
        x: -0.5 + Math.random() * 2,
        y: 2 + Math.random() * 4,
        z: -0.5 + Math.random() * 2,
      })
    },
    destroy: () => destroyMaterials(),
  }

  const worldGravity = new CANNON.Vec3(0, -9.82, 0)

  const objectsToUpdate = []

  /**
   * Texture Loader
   */
  const cubeTextureLoader = new THREE.CubeTextureLoader()

  const environmentMapTexture = cubeTextureLoader.load([
    'textures/environmentMaps/0/px.png',
    'textures/environmentMaps/0/nx.png',
    'textures/environmentMaps/0/py.png',
    'textures/environmentMaps/0/ny.png',
    'textures/environmentMaps/0/pz.png',
    'textures/environmentMaps/0/nz.png',
  ])

  /**
   * Base
   */
  const gui = new dat.GUI({ width: 350 })
  gui.add(parameters, 'createSphere')
  gui.add(parameters, 'createBox')
  gui.add(parameters, 'destroy')

  // Canvas
  const canvas = document.querySelector('canvas.webgl')

  // Scene
  const scene = new THREE.Scene()

  /**
   * Object
   */
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
      color: '#102610',
      metalness: 0.3,
      roughness: 0.4,
      envMap: environmentMapTexture,
      envMapIntensity: 0.5,
    })
  )
  plane.rotation.x = -Math.PI * 0.5
  plane.position.y = 0
  plane.receiveShadow = true
  scene.add(plane)

  // Physics
  const defaultMaterial = new CANNON.Material('default')
  const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
      friction: 0.1,
      restitution: 0.4,
    }
  )

  const world = new CANNON.World({
    gravity: worldGravity,
    allowSleep: true,
  })
  world.broadphase = new CANNON.SAPBroadphase(world)
  world.addContactMaterial(defaultContactMaterial)

  const groundBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
    material: defaultMaterial,
  })

  groundBody.position.copy(plane.position)
  groundBody.quaternion.copy(plane.quaternion)
  world.addBody(groundBody)

  const playHitSound = (event) => {
    const impactVelocity = event.contact.getImpactVelocityAlongNormal()
    const volume = normilizeNumber(impactVelocity + event.target.mass, 0, 35)

    if (impactVelocity > 1) {
      hitSound.volume = volume
      hitSound.currentTime = 0
      hitSound.play()
    }
  }

  const destroyMaterials = () => {
    for (const object of objectsToUpdate) {
      world.removeBody(object.body)
      scene.remove(object.mesh)

      object.body.removeEventListener('collide', playHitSound)
    }
    objectsToUpdate.splice(0, objectsToUpdate.length - 1)
  }

  const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
  const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })

  const createSphere = (radius, position) => {
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.scale.set(radius, radius, radius)
    mesh.castShadow = true
    mesh.receiveShadow = true

    scene.add(mesh)

    // Physics
    const body = new CANNON.Body({
      mass: normilizeNumber(radius + 0.5, 0, 1),
      shape: new CANNON.Sphere(radius),
      position,
      material: defaultMaterial,
    })
    body.collisionResponse = true
    // body.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0))
    world.addBody(body)

    body.addEventListener('collide', playHitSound)

    objectsToUpdate.push({
      body: body,
      mesh: mesh,
    })
  }

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
  const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })

  const createBox = (width, height, depth, position) => {
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // Physics
    const halfExtends = new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
    const body = new CANNON.Body({
      mass: normilizeNumber(width * 0.5 + height * 0.5 + depth * 0.5, 0, 1),
      shape: new CANNON.Box(halfExtends),
      position,
      material: defaultMaterial,
    })

    body.collisionResponse = true
    world.addBody(body)

    body.addEventListener('collide', playHitSound)

    objectsToUpdate.push({
      body: body,
      mesh: mesh,
    })
  }
  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)
  gui
    .add(ambientLight, 'intensity')
    .min(0)
    .max(1)
    .step(0.001)
    .name('ambient intensity')

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = sizes.width
  directionalLight.shadow.mapSize.height = sizes.height
  directionalLight.shadow.radius = 2
  directionalLight.position.set(4, 6, -4)
  gui
    .add(directionalLight, 'intensity')
    .min(0)
    .max(1)
    .step(0.001)
    .name('directional intensity')

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
  camera.position.z = 3
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
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  /**
   * Animate
   */
  const clock = new THREE.Clock()
  let previousTime = 0

  const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Physics
    world.step(1 / 60, deltaTime, 3)

    for (const obj of objectsToUpdate) {
      obj.mesh.position.copy(obj.body.position)
      obj.mesh.quaternion.copy(obj.body.quaternion)
    }

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

  function normilizeNumber(value, min, max) {
    return (value - min) / (max - min)
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
