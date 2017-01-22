const logModule = {
  state: {
    logs: []
  },
  mutations: {
    pushLog(state, log) {
      state.logs.push(log);
    },
    clearLog(state) {
      while (state.logs.length > 0) {
        state.logs.pop();
      }
    },
    setTimeStampToLog(state, { target, timeStamp }) {
      const index = state.logs.indexOf(target);
      if (index >= 0) {
        state.logs[index].timeStamp = timeStamp;
      }
    }
  },
  actions: {
    pushLog({ commit }, log) {
      commit("pushLog", log);
    },
    clearLog({ commit }) {
      commit("clearLog");
    },
    setTimeStampToLog({ commit }, timeStampDetails) {
      commit("setTimeStampToLog", timeStampDetails);
    }
  }
};

export default logModule;
