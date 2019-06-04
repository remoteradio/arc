import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import VueMqtt from 'vue-mqtt'
import { Web } from 'sip.js'

Vue.config.productionTip = false
Vue.use(VueMqtt, 'ws://kg7ga.xcv.cx/ws', [])

new Vue({
  mqtt: {
    '+/#': function (val) { console.log('got here') }
  },
  mounted: function () {
    this.$mqtt.subscribe('$sys/#')
  },
  render: function (h) { return h(App) }
}).$mount('#app')

var options = {
  media: {
    remote: {
      audio: document.getElementById('remoteAudio')
    }
  },
  ua: {
    uri: '1019@radon.telo.io',
    wsServers: 'wss://radon.telo.io:7443',
    authorizationUser: '1019',
    password: 'w4an_sk',
    display_name: '1019'
  }
}

// start webrtc simple i/o

let simple = new Web.Simple(options)
simple.on('registered', () => simple.call('3616'))
