const jwt = require("jsonwebtoken");
const constants = require("../config/constants");

function encodeData(data) {
  const access_token = jwt.sign(data, constants.JWT_TOKEN_SECRET, {
    expiresIn: constants.JWT_TOKEN_EXPIRATION * 1000,
  });
  const refresh_token = jwt.sign(data, constants.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: constants.JWT_REFRESH_TOKEN_EXPIRATION * 1000,
  });
  return {
    access_token,
    exp: constants.JWT_TOKEN_EXPIRATION,
    refresh_token,
    token_type: "Bearer",
  };
}

module.exports = {
  encodeData,
};
