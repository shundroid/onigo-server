import Vue from "vue";
import Vuex from "vuex";

import socketPlugin from "./plugins/socketPlugin";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    gameState: "inactive"
  },
  plugins: [socketPlugin]
});
