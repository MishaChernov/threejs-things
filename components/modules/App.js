import EventEmitter from './utils/EventEmmiter'
import Resources from './utils/Resources'
import sources from './sources'

let instance = null

export default class App extends EventEmitter {
  constructor() {
    super()
    // Singeltone
    if (instance !== null) {
      return instance
    }
    instance = this

    window.App = this
    this.on('resources-loaded', (resources) => {
      console.log('resources-loaded', resources)
    })

    new Resources(sources)
  }
}
