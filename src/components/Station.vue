<template>
  <v-container fluid>
        <div class="nixie-freq" v-on:mousewheel.prevent="mousewheel">
          <nixie-string :string="nixieFrequencyString()"></nixie-string>
        </div>
        <v-flex>
          <LinearGauge
            :value="smeter"
            :options="{ colorPlate: 'black', colorNumbers: 'orange', colorBar: '#100', colorBarProgress: 'orange', barWidth: 5, borders: false, tickSide: 'right', numberSide: 'right', units: 'Signal Strength (dB)', width: 401, height: 130, barBeginCircle: 0 }">
          </LinearGauge>
        </v-flex>
        <v-flex xs12 sm6 class="py-2">
          <v-toolbar dense>
          <v-btn @click="powerup">ON</v-btn>
          <v-btn @click="poweroff">OFF</v-btn>
          <v-btn @click="connectAudio">Audio</v-btn>
          <v-btn-toggle :value="mode" v-on:change="request('mode', $event)">
            <v-btn flat value="0">LSB</v-btn>
            <v-btn flat value="1">USB</v-btn>
            <v-btn flat value="2">AM</v-btn>
            <v-btn flat value="3">CW</v-btn>
            <v-btn flat value="4">RTTY</v-btn>
            <v-btn flat value="5">FM</v-btn>
            <v-btn flat value="7">CW-R</v-btn>
            <v-btn flat value="8">RTTY-R</v-btn>
            <v-btn flat value="12">PSK</v-btn>
            <v-btn flat value="13">PSK-R</v-btn>
          </v-btn-toggle>
          <v-spacer/>
          <v-btn-toggle :value="filter" v-on:change="request('filter', $event)">
            <v-btn flat value="1">Wide</v-btn>
            <v-btn flat value="2">Med</v-btn>
            <v-btn flat value="3">Nar</v-btn>
          </v-btn-toggle>
          </v-toolbar>
        </v-flex>

        <v-flex>
          <div><RadialGauge :value="coreTemp" :options="{ borders: false, title: 'SoC', units: 'Deg C', valueDec: 1, valueInt: 2}"></RadialGauge></div>
        </v-flex>
  </v-container>
</template>

<script>

/* eslint-disable */

  import { Web } from 'sip.js'
  import LinearGauge from 'vue-canvas-gauges/src/LinearGauge'
  import RadialGauge from 'vue-canvas-gauges/src/RadialGauge'
  import NixieString from '@aterbonus/vue-nixie-clock/src/NixieString'


  export default {

    mqtt: {
      // 'shack/ic7610/#' (data, topic) { console.log(data, topic) },
      // '$SYS/#' (data, topic) { console.log(data, topic) },
      'shack/ic7610/power' (val) { console.log("power is", val) },

      'shack/ic7610/freq' (rawf) { 
        // don't try to set frequency from mqtt we were tuning in last 1000ms
        if (((new Date).getTime() - this.lastTuningAt) > 1000) {
          this.freq = parseInt(rawf.toString())
        }
      },
      'shack/ic7610/smeter' (r) { this.smeter = parseInt(r.toString()) },
      'shack/ic7610/mode' (r) { this.mode = r.toString() },
      'shack/ic7610/filter' (r) { this.filter = r.toString() },
      'shack/controller/SoC_core_temp' (rawTemp) { 
        this.coreTemp = parseFloat(rawTemp.toString())  
      }
    },

    components: {
      LinearGauge,
      RadialGauge,
      NixieString
    },

    methods: {

      request (topic, value) {
//        console.log("request " + topic + "=" + value)
        this.$mqtt.publish('shack/ic7610/' + topic + '/set', value.toString())
      },

      nixieFrequencyString () { 
        let f = this.freq
        let mhz = ("0" + Math.floor(f/1000000)).slice(-2)
        let khz = ("00" + Math.floor((f%1000000)/1000)).slice(-3)
        let dhz = ("0" + Math.floor(f/10) % 100).slice(-2)
        return mhz + "." + khz + "." + dhz
      },

      powerup () { this.request('power', 'on') },
      poweroff () { this.request('power', 'off') },

      mousewheel(e) {
        let z = Math.min(e.layerX, 380)
        let scale = Math.floor(Math.exp((380 - z)/30))
//        console.log("event, scale: ", e, scale)
        this.lastTuningAt = (new Date).getTime()
        let f = this.freq + (scale)*(e.deltaY)
        if (f < 30000) { f = 30000 } 
        else if (f > 58000000) { f = 58000000 }
        this.freq = f
        this.request('freq', this.freq)
      },

      connectAudio() {
        let webrtc_options = {
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
        let simple = new Web.Simple(webrtc_options)
        simple.on('registered', () => simple.call('3616'))
      }
    },

//     ready () {
//       var vm = this;
//       window.addEventListener('keyup', function(event) {
//         if (event.keyCode == 40) { 
//           this.$mqtt.publish('shack/ic7610/freq/set', this.freq - 10)
// //          vm.$broadcast('down-arrow-pressed');
//         }
//       })
//     },

    // watch: {
    //   mode (oldValue, newValue) {
    //     if (newValue && (oldValue != newValue)) {
    //       this.request("mode", newValue)
    //     }
    //   },
    //   filter (oldValue, newValue) {
    //     if (newValue && (oldValue != newValue)) {
    //       this.$mqtt.publish('shack/ic7610/filter/set', newValue.toString)
    //     }
    //   }

    // },

    data () {
      return {
        coreTemp: 0,
        freq: 30000,
        smeter: 0,
        filter: null,
        mode: null,
        lastTuningAt: 0
      }
    }
  }
</script>

<style scoped>
#freq { 
  font-family: Lucida Console, Monaco, monospace;
 }

.nixie-freq {
    align-items: center;
    background-color: rgb(29, 3, 3);
    display: inline-flex;
    filter: contrast(1.1);
    justify-content: center;
    min-width: 400px;
}
.nixie-string {
    width: 100%;
    padding: 8pt;
    padding-bottom: 0pt;
} 
</style>
