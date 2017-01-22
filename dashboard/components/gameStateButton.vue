<template>
  <button @click="toggleGameState">{{ gameState }}</button>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  computed: mapState([
    "gameState"
  ]),
  methods: mapActions([
    "toggleGameState"
  ])
};
</script>

<style scoped>
button {
  text-transform: uppercase;
}
</style>
