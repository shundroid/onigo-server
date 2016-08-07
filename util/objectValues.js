export default function ObjectValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}