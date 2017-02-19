<template>
  <header>
    <h1>Onigo Dashboard</h1>
    <button id="game-state-button" @click="toggleGameState">{{ this.gameState }}</button>
    <button id="show-ranking-button"
            @click="toggleRankingState"
            :disabled="isDisabledRankingButton">
      Ranking: {{ this.rankingState }}
    </button>
  </header>
</template>

<script>
import eventPublisher from "../publisher";
import appModel from "../appModel";

export default {
  data() {
    return {
      gameState: appModel.gameState,
      rankingState: appModel.rankingState
    };
  },
  created() {
    eventPublisher.on("gameState", state => {
      this.gameState = state;
    });
    eventPublisher.on("rankingState", state => {
      this.rankingState = state;
    });
  },
  computed: {
    isDisabledRankingButton() {
      return this.gameState === "inactive";
    }
  },
  methods: {
    toggleGameState() {
      appModel.toggleGameState();
    },
    toggleRankingState() {
      appModel.toggleRankingState();
    }
  }
};
</script>

<style scoped>
#game-state-button {
  text-transform: uppercase;
}
#show-ranking-button {
  text-transform: capitalize;
}
</style>