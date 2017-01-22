<template>
  <div id="root">
    <header>
      <h1>Onigo Dashboard</h1>
      <game-state-button></game-state-button>
      <button id="show-ranking-button">Show Ranking</button>
    </header>
    <main>
      <div id="left-column">
        <commands-count-controller></commands-count-controller>
        <section>
          <h2>Unnamed Controllers</h2>
          <ul id="unnamed-controllers">
          </ul>
        </section>
        <section>
          <h2>Controllers</h2>
          <table id="controllers">
            <tr>
              <th>Name</th>
              <th>Key</th>
              <th>Linked Orb</th>
              <th>Oni</th>
              <th>HP</th>
              <th>Reset HP</th>
              <th>Color</th>
            </tr>
          </table>
        </section>
        <section>
          <h2>Add Orb</h2>
          Name: <input type="text" id="new-orb-name" /><br />
          Port: <input type="text" id="new-orb-port" /><br />
          <button id="add-orb">Add</button>
        </section>
        <section id="sec-orbs">
          <h2>
            Orbs
            <button id="check-battery-button">Check Battery</button>
            <button id="ping-button">Ping</button>
          </h2>
          <table id="orbs">
            <tr>
              <th>Orb Name</th>
              <th>Port</th>
              <th>Battery State</th>
              <th>Link Status</th>
              <th>Ping Status</th>
              <th>Last Streamed</th>
              <th>Disconnect</th>
              <th>Reconnect</th>
          </table>
        </section>
      </div>
      <log></log>
    </main>
  </div>
</template>

<script>
import gameStateButton from "./gameStateButton.vue";
import commandsCountController from "./commandsCountController.vue";
import log from "./log.vue";

export default {
  components: {
    gameStateButton,
    commandsCountController,
    log
  }
};
</script>

<style>
#root {
  width: 100%;
  height: 100%;
}
</style>
