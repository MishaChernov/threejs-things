import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import App from '../App'
import EventEmitter from './EventEmmiter'

export default class Resources extends EventEmitter {
  constructor(sources) {
    super()
    this.loadedCount = 0
    this.textures = {}
    this.sources = sources

    this.app = new App()
    this.gltfLoader = new GLTFLoader()
    this.textureLoader = new THREE.TextureLoader()
    this.cubeTextureLoader = new THREE.CubeTextureLoader()

    this.onLoad()
  }

  setTexture(name, texture) {
    this.textures[name] = texture
  }

  onLoad() {
    for (const source of this.sources) {
      if (source.type === 'glTF') {
        this.gltfLoader.load(source.path, (gltf) => {
          this.setTexture(source.name, gltf)
        })
        this.loadedCount++
      } else if (source.type === 'cubeTexture') {
        this.cubeTextureLoader.load(source.path, (texture) => {
          this.setTexture(source.name, texture)
        })
        this.loadedCount++
      } else if (source.type === 'texture') {
        this.textureLoader.load(source.path, (texture) => {
          this.setTexture(source.name, texture)
        })
        this.loadedCount++
      }

      if (this.loadedCount === this.sources.length) {
        this.trigger('resources-loaded', this.textures)
        this.app.resources = this.textures
      }
    }
  }
}
