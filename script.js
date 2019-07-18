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
  },
  methods: {
    select(option) {
      this.$emit('select', option.key)
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
    currentInputPort: null,
    currentOutputPort: null,
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
  watch: {
    selectedInput: {
      handler(nextValue, currentValue) {
        this.currentInputPort = nextValue != null ? this.midiAccess.inputs.get(nextValue) : null
        console.log('currentInputPort =>', this.currentInputPort)
      },
      immediate: true
    },
    selectedOutput: {
      handler(nextValue, currentValue) {
        this.currentOutputPort = nextValue != null ? this.midiAccess.outputs.get(nextValue) : null
        console.log('currentOutputPort =>', this.currentOutputPort)
      },
      immediate: true
    },
    currentInputPort: {
      handler(nextValue, currentValue) {
        if (currentValue) {
          currentValue.onmidimessage = () => {}
        }
        if (nextValue) {
          nextValue.onmidimessage = (e) => {
            console.log(e)
          }
        }
      },
      immediate: true
    },
  },
  async mounted() {
    const peer = new Peer(sessionStorage.savedPeerId || undefined)
    window.peer = this.peer = peer
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
      const access = this.midiAccess = await navigator.requestMIDIAccess({ sysex: false })
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