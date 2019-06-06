<template>
  <v-container fluid>
        <div class="nixie-freq">
          <nixie-string :string="nixieFreq"></nixie-string>
        </div>
        <v-flex>
          <LinearGauge :value="smeter" :options="{ colorPlate: 'black', colorNumbers: 'orange', colorBar: '#100', colorBarProgress: 'orange', barWidth: 5, borders: false, tickSide: 'right', numberSide: 'right', units: 'Signal Strength (dB)', width: 401, height: 130, barBeginCircle: 0 }"></LinearGauge>
        </v-flex>
        <v-flex xs12 sm6 class="py-2">
          <v-toolbar dense>
          <v-btn @click="powerup">ON</v-btn>
          <v-btn @click="poweroff">OFF</v-btn>
          <v-btn @click="connectAudio">Audio</v-btn>
          <v-btn-toggle v-model="mode">
            <v-btn flat value="cw">CW</v-btn>
            <v-btn flat value="cwr">CWR</v-btn>
            <v-btn flat value="usb">USB</v-btn>
            <v-btn flat value="lsb">LSB</v-btn>
            <v-btn flat value="am">AM</v-btn>
            <v-btn flat value="fm">FM</v-btn>
          </v-btn-toggle>
          <v-spacer/>
          <v-btn-toggle v-model="filter">
            <v-btn flat value="wide">Wide</v-btn>
            <v-btn flat value="med">Med</v-btn>
            <v-btn flat value="nar">Nar</v-btn>
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
        let f = parseInt(rawf.toString())
        this.freq = f
        let mhz = ("0" + Math.floor(f/1000000)).slice(-2)
        let khz = ("00" + Math.floor((f%1000000)/1000)).slice(-3)
        let dhz = ("0" + Math.floor(f/10) % 100).slice(-2)
        this.nixieFreq = mhz + "." + khz + "." + dhz
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
      powerup() {
        this.$mqtt.publish('shack/ic7610/power/set', 'on')
      },
      poweroff() {
        this.$mqtt.publish('shack/ic7610/power/set', 'off')
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

    ready () {
      var vm = this;
      window.addEventListener('keyup', function(event) {
        if (event.keyCode == 40) { 
          this.$mqtt.publish('shack/ic7610/freq/set', this.freq - 10)
//          vm.$broadcast('down-arrow-pressed');
        }
      })
    },

    data () {
      return {
        coreTemp: 0,
        freq: 30000,
        smeter: 0,
        nixieFreq: "00.000.00"
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
