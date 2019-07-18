const peer = new Peer(localStorage.savedPeerId || undefined);

const app = new Vue({
  el: '#app',
  data: {
    baseUrl: location.href.replace(/[\?#].*/, ''),
    peerId: '',
  },
  computed: {
    url() {
      return this.baseUrl + '#' + this.peerId
    }
  },
  mounted() {
    peer.on('open', (id) => {
      this.peerId = id;
      localStorage.savedPeerId = id;
    });
  }
})
