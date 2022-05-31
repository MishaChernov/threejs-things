import * as THREE from 'three'
import App from '../App'

export default class Floor {
  constructor() {
    this.app = new App()
    this.resources = this.app.resources
    this.scene = this.app.scene

    this.createFloor()
  }

  createFloor() {
    const colorTexture = this.resources.getTexture('floorColorTexture')
    colorTexture.encoding = THREE.sRGBEncoding
    colorTexture.repeat.set(1.5, 1.5)
    colorTexture.wrapS = THREE.RepeatWrapping
    colorTexture.wrapT = THREE.RepeatWrapping

    const normalTexture = this.resources.getTexture('floorNormalTexture')
    normalTexture.repeat.set(1.5, 1.5)
    normalTexture.wrapS = THREE.RepeatWrapping
    normalTexture.wrapT = THREE.RepeatWrapping

    this.geometry = new THREE.CircleGeometry(5, 64)
    this.material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture,
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.receiveShadow = true
    this.mesh.rotation.x = -Math.PI * 0.5

    this.scene.add(this.mesh)
  }
}
