const peer = new Peer(localStorage.savedPeerId || undefined);

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
    peer.on('open', (id) => {
      this.peerId = id;
      localStorage.savedPeerId = id;
    });
    try {
      const access = await navigator.requestMIDIAccess({ sysex: false })
      access.onstatechange = () => {
        this.availableInputs = getKeys(access.inputs).map(key => ({
          key,
          name: access.inputs.get(key).name
        }))
        this.availableOutputs = getKeys(access.outputs).map(key => ({
          key,
          name: access.outputs.get(key).name
        }))
      }
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
}