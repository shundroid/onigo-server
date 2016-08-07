export default {
  getDiff(before, after) {
    const getAddedItem = (before, after) => {
      return after.filter(item => before.indexOf(item) === -1);
    };
    return {
      added: getAddedItem(before, after),
      removed: getAddedItem(after, before),
      noChanged: before.filter(item => after.indexOf(item) !== -1)
    };
  }
};