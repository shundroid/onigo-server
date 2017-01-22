export default function(store) {
  store.subscribe(({ type, payload }) => {
    if (type === "pushLog") {
      const timeStamp = new Date();
      store.dispatch("setTimeStampToLog", { target: payload, timeStamp });
    }
  });
}
