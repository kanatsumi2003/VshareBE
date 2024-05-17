const jwt = require('jsonwebtoken');
const constants = require('../config/constants');

module.exports = function () {
  return (req, res, next) => {
    try {
      let token = req.headers.authorization || ''
      token = token.replace('Bearer ', '')

      const decoded = jwt.verify(token, constants.JWT_TOKEN_SECRET);
      if (decoded) {
        req.user = decoded;
        return next();
      }
      throw new Error('error')
    }
    catch (error) {
      console.log(error);
      return res.status(403).json({ message: "Access denied!" });
    }
  }
}
