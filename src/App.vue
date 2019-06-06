<template>
  <v-app id="arc" :dark="true">
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>KG7GA</span>&nbsp;
        <span class="font-weight-light">Amateur Station</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        flat
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
      >
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <Station/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Station from './components/Station'

export default {
  name: 'App',
  components: { Station },
  mounted () {
    this.$mqtt.subscribe('shack/#')
    this.$mqtt.subscribe('$SYS/#')
  },
  data () {
    return {
      //
    }
  }
}
</script>
