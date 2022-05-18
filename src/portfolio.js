import './style.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import gsap from 'gsap'

const init = () => {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  const parameters = {
    color: '#ffffff',
    particlesCount: 200,
  }
  const mousePosition = {
    x: 0,
    y: 0,
  }
  let scrollY = window.scrollY
  let currentSection = 0

  /**
   * Base
   */
  const gui = new dat.GUI({ width: 350 })

  // Canvas
  const canvas = document.querySelector('canvas.webgl')

  // Scene
  const scene = new THREE.Scene()

  /**
   * Texture Loader
   */
  const textureLoader = new THREE.TextureLoader()
  const gradientMap = textureLoader.load('/textures/gradients/3.jpg')
  gradientMap.magFilter = THREE.NearestFilter

  /**
   * Object
   */

  const material = new THREE.MeshToonMaterial({
    color: parameters.color,
    gradientMap: gradientMap,
  })

  const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(0.65, 0.4, 10, 100),
    material
  )

  const mesh2 = new THREE.Mesh(
    new THREE.ConeBufferGeometry(0.65, 2, 40, 10),
    material
  )

  const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotBufferGeometry(0.65, 0.3, 100, 16),
    material
  )

  const meshes = [mesh1, mesh2, mesh3]
  const meshesDistance = 4

  for (let i = 0; i < meshes.length; i++) {
    if ((i + 1) % 2) {
      meshes[i].position.x = 1.5
    } else {
      meshes[i].position.x = -1.5
    }
    meshes[i].position.y = -meshesDistance * i
  }

  scene.add(...meshes)

  /**
   * Particles
   */
  const particlesGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(parameters.particlesCount * 3)
  for (let i = 0; i < parameters.particlesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] =
      meshesDistance - Math.random() * Math.pow(meshesDistance, 2)
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
  }

  const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.color,
    size: 0.03,
    sizeAttenuation: true,
    depthWrite: false,
  })

  particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  )

  const points = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(points)

  /**
   * GUI settings
   */
  gui.addColor(parameters, 'color').onChange((value) => {
    material.color.set(new THREE.Color(value))
    particlesMaterial.color.set(parameters.color)
  })

  /**
   * Lights
   */
  const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
  directionalLight.position.set(1, 1, 0)
  scene.add(directionalLight)

  /**
   * Camera
   */
  //It needs for easing animation
  const cameraGroup = new THREE.Group()
  scene.add(cameraGroup)
  // Base camera
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  )
  camera.position.z = 3
  cameraGroup.add(camera)

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
  })
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
    // Update objects
    for (const mesh of meshes) {
      mesh.rotation.y += 0.1 * deltaTime
      mesh.rotation.x += 0.15 * deltaTime
    }

    // Camera position
    camera.position.y = (scrollY / sizes.height) * meshesDistance

    // Parallax
    const parallaxX = mousePosition.x * 0.5
    const parallaxY = -mousePosition.y * 0.5

    // Easing animation
    cameraGroup.position.x +=
      (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y +=
      (parallaxY - cameraGroup.position.y) * 5 * deltaTime

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

  window.addEventListener('mousemove', (e) => {
    mousePosition.x = e.clientX / sizes.width - 0.5
    mousePosition.y = -(e.clientY / sizes.height - 0.5)
  })

  window.addEventListener('scroll', (e) => {
    scrollY = -window.scrollY

    // Animate meshes on scroll to it section
    const newSection = Math.round(window.scrollY / sizes.height)

    if (newSection !== currentSection) {
      currentSection = newSection
      gsap.to(meshes[currentSection].rotation, {
        duration: 1.5,
        ease: 'power2.inOut',
        x: '+=4',
        y: '+=2',
      })
    }
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
