/* global Peer, Vue */

Vue.component('port-selector', {
  template: '#port-selector',
  props: ['available', 'selected'],
  computed: {
    options() {
      return [
        { key: null, text: 'None selected', selected: this.selected === null },
        ...this.available.map(item => ({
          key: item.key,
          text: item.name,
          selected: this.selected === item.key
        }))
      ]
    }
  }
})

const app = new Vue({
  el: '#app',
  data: {
    baseUrl: location.href.replace(/[\?#].*/, ''),
    peerId: '',
    error: null,
    selectedInput: null,
    selectedOutput: null,
    availableInputs: [],
    availableOutputs: [],
  },
  computed: {
    url() {
      return this.baseUrl + '#' + this.peerId
    },
    currentInput() {
      return this.selectedInput
    },
    currentOutput() {
      return this.selectedOutput
    },
  },
  async mounted() {
    const peer = new Peer(sessionStorage.savedPeerId || undefined)
    window.peer = peer
    peer.on('open', (id) => {
      this.peerId = id
      sessionStorage.savedPeerId = id
      const connectMatch = location.hash.match(/#(\w+)/)
      if (connectMatch) {
        const target = connectMatch[1]
        console.log('Connecting to ', target)
        const conn = peer.connect(target)
        conn.on('open', () => {
          console.log('Connected!')
        })
      }
    })
    peer.on('connection', conn => {
      console.log('Connection received!')
    })
    try {
      const access = await navigator.requestMIDIAccess({ sysex: false })
      const refreshPorts = () => {
        this.availableInputs = getKeys(access.inputs).map(key => ({
          key,
          name: access.inputs.get(key).name
        }))
        this.availableOutputs = getKeys(access.outputs).map(key => ({
          key,
          name: access.outputs.get(key).name
        }))
      }
      access.onstatechange = refreshPorts()
      refreshPorts()
    } catch (e) {
      this.error = ('Failed to request MIDI access! ' + e)
    }
  }
})

function getKeys(portMap) {
  const keys = []
  const iterator = portMap.keys()
  for (;;) {
    const { done, value: key } = iterator.next()
    if (done) break
    keys.push(key)
  }
  return keys
}