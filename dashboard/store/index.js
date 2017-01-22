import Vue from "vue";
import Vuex from "vuex";

import socketPlugin from "./plugins/socketPlugin";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    gameState: "inactive",
    availableCommandsCount: 1
  },
  mutations: {
    setDefaultGameState(state, gameState) {
      state.gameState = gameState;
    },
    toggleGameState(state) {
      state.gameState = state.gameState === "inactive" ? "active" : "inactive";
    },
    updateAvailableCommandsCount(state, count) {
      state.availableCommandsCount = count;
    }
  },
  actions: {
    toggleGameState({ commit, state }) {
      commit("toggleGameState");
    },
    setDefaultGameState({ commit }, gameState) {
      commit("setDefaultGameState", gameState);
    },
    updateAvailableCommandsCount({ commit }, count) {
      commit("updateAvailableCommandsCount", count);
    }
  },
  plugins: [socketPlugin]
});
