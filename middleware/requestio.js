const { beautifyJson } = require("../helpers");

module.exports = function (req, res, next) {
  if (req.body) {
    req.body = beautifyJson(req.body);
  }
  next();
}
