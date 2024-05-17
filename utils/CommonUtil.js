exports.isObject = (val) => typeof val === "object" && !Array.isArray(val) && val !== null;
exports.isArray = (val) => Array.isArray(val);

exports.JSONParse = value => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}
