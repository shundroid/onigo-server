<template>
  <section :style="{ color }">[{{ formattedTimeStamp }}] {{ text }}</section>
</template>

<script>
const logTypeColors = {
  log: "white",
  error: "red",
  warning: "orange",
  success: "lightgreen"
};

export default {
  props: {
    timeStamp: Date,
    text: String,
    type: String
  },
  computed: {
    formattedTimeStamp() {
      const date = this.timeStamp;
      return ("0" + date.getHours()).slice(-2) + ":" +
        ("0" + date.getMinutes()).slice(-2) + ":" +
        ("0" + date.getSeconds()).slice(-2) + "." +
        ("00" + date.getMilliseconds()).slice(-3);
    },
    color() {
      return logTypeColors[this.type];
    }
  }
}
</script>
