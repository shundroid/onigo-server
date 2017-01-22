import Vue from "vue";
import Vuex from "vuex";

import appModule from "./modules/appModule";
import logModule from "./modules/logModule";

import socketPlugin from "./plugins/socketPlugin";
import logTimeStampPlugin from "./plugins/logTimeStampPlugin";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app: appModule,
    log: logModule
  },
  plugins: [socketPlugin, logTimeStampPlugin]
});
