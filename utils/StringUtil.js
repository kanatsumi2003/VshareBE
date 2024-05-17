"use strict";

const { customAlphabet } = require("nanoid");

exports.genReferralCode = () => {
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 10);
  const code = nanoid();
  return code.toString().toUpperCase();
};

exports.randomString = (length) => {
  const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$", length || 8);
  const str = nanoid();
  return str.toString();
};
