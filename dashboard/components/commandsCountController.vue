<template>
  <section>
    <h2>Available Commands</h2>
    Count: <input type="number" min="1" max="6" v-model="commandsCount" />
    <button @click="updateAvailableCommandsCount(commandsCount)">Set</button>
  </section>
</template>

<script>
import { mapActions } from "vuex";
export default {
  created() {
    this.$store.subscribe(({ type, payload }) => {
      if (type === "updateAvailableCommandsCount") {
        this.commandsCount = payload;
      }
    });
  },
  data() {
    return {
      commandsCount: 0
    }
  },
  methods: mapActions(["updateAvailableCommandsCount"])
}
</script>
