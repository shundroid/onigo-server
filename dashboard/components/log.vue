<template>
  <div id="log-column">
    <h2>Log <button @click="clearLog">Clear Log</button></h2>
    <div id="log-area">
      <log-item
          v-for="item in logs"
          :text="item.text"
          :timeStamp="item.timeStamp"
          :type="item.type"></log-item>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import logItem from "./logItem.vue";

export default {
  components: {
    logItem
  },
  computed: mapState({
    logs: state => state.log.logs
  }),
  methods: mapActions([
    "pushLog",
    "clearLog"
  ])
};
</script>

<style scoped>
#log-column {
  display: flex;
  flex-direction: column;
}

#log-area {
  flex: 1;
  background-color: black;
  color: white;
  margin: 5px;
  overflow-y: scroll;
  padding: 2px;
}
</style>
