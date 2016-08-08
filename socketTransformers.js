export default {
  unnamedClients: function(clients) {
    return clients.map(client => client.key);
  },
  controllers: function(controllers) {
    return controllers.map(controller => controller.getStates());
  },
  orbs: function(orbs) {
    return orbs.map(orb => {
      return {
        name: orb.name,
        linkedClients: orb.linkedClients,
        port: orb.port
      };
    });
  }
}