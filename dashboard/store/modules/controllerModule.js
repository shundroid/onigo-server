const controllerModule = {
  state: {
    controllers: [],
    clients: []
  },
  mutations: {
    setDefaultControllers(state, controllers) {
      state.controllers = controllers;
    }
    setDefaultClients(state, clients) {
      state.clients = clients;
    }
    setName(state, { key, name, controllerDetails }) {
      
    }
  },
  actions: {
    setDefaultControllers({ commit }, controllers) {
      commit("setDefaultControllers", controllers);
    }
    setDefaultClients({ commit }, clients) {
      commit("setDefaultClients", clients);
    }
  }
};

export default controllerModule;
