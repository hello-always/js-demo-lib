const compact = require("lodash/compact");

const name1 = "qinll";
const a = 1;
console.log(name1);
const getUrlParam = (name, url) => {
  compact([0, 1, false, 2, "", 3]);
  name = String(name);
  url = String(url);
  let results = new RegExp("[\\?&]" + name + "=([^&#]*)").exec(url);
  if (!results) {
    return "";
  }
  return results[1] || "";
};
module.exports = getUrlParam;
