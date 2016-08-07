export default {
  unnamedClients: function(clients) {
    return clients.map(client => client.key);
  },
  controllers: function(controllers) {
    return controllers.map(controller => controller.getStates());
  }
}