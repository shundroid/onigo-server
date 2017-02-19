<template>
  <div id="app">
    <onigo-header></onigo-header>
    <main>
      <div id="left-column">
        <available-commands></available-commands>
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
            </tr>
          </table>
        </section>
      </div>
      <div id="log-column">
        <h2>Log <button id="clear-log">Clear Log</button></h2>
        <div id="log-area">
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import onigoHeader from "./header.vue";
import availableCommands from "./availableCommands.vue";

export default {
  components: {
    onigoHeader,
    availableCommands
  }
};
</script>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
