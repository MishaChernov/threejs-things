import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import EventEmitter from './EventEmitter'

export default class Resources extends EventEmitter {
  constructor(sources) {
    super()
    this.loaded = 0
    this.items = {}
    this.sources = sources
    this.toLoad = this.sources.length

    this.gltfLoader = new GLTFLoader()
    this.textureLoader = new THREE.TextureLoader()
    this.cubeTextureLoader = new THREE.CubeTextureLoader()

    this.onLoad()
  }

  setTexture(name, texture) {
    this.items[name] = texture
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file

    this.loaded++

    if (this.loaded === this.toLoad) {
      this.trigger('ready')
    }
  }

  getTexture(name) {
    return this.items[name]
  }

  onLoad() {
    for (const source of this.sources) {
      if (source.type === 'glTF') {
        this.gltfLoader.load(source.path, (gltf) => {
          this.sourceLoaded(source, gltf)
        })
      } else if (source.type === 'cubeTexture') {
        this.cubeTextureLoader.load(source.path, (texture) => {
          this.sourceLoaded(source, texture)
        })
      } else if (source.type === 'texture') {
        this.textureLoader.load(source.path, (texture) => {
          this.sourceLoaded(source, texture)
        })
      }
    }
  }
}
