import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import VueMqtt from 'vue-mqtt'

Vue.config.productionTip = false
Vue.use(VueMqtt, 'wss://radon.telo.io:9001/ws', [])

new Vue({
  render: function (h) { return h(App) }
}).$mount('#app')
