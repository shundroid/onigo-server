<template>
  <section>
    <h2>Available Commands</h2>
    Count:&nbsp;
    <input type="number" id="available-commands" min="1" max="6" v-model="currentCount" />
    <button id="set-available-commands-button" @click="updateAvailableCommandsCount">Set</button>
  </section>
</template>

<script>
import appModel from "../appModel";
import eventPublisher from "../publisher";

export default {
  data() {
    return {
      currentCount: appModel.availableCommandsCount
    };
  },
  created() {
    eventPublisher.on("availableCommandsCount", count => {
      this.currentCount = count;
    });
  },
  methods: {
    updateAvailableCommandsCount() {
      if (!isNaN(this.currentCount)) {
        console.log(this.currentCount);
        appModel.updateAvailableCommandsCount(this.currentCount);
      }
    }
  }
};
</script>