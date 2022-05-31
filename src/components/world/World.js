import App from '../App.js'
import Environment from './Environment.js'
import Floor from './Floor.js'
import Fox from './Fox.js'

export default class World {
  constructor() {
    this.app = new App()
    this.scene = this.app.scene
    this.resources = this.app.resources

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup
      this.floor = new Floor()
      this.fox = new Fox()
      this.environment = new Environment()
    })
  }

  update() {
    if (this.fox) this.fox.update()
  }
}
