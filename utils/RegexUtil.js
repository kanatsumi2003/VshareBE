module.exports = {
  latLngRegex: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
  timeRegex: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  identityRegex: /^[0-9a-z]{8,12}$/i,
  phoneRegex: /^[0-9]{9,13}$/,
  numberRegex: /^[0-9]+$/,
  durationRegex: /^((\d+y)?(\d+m)?(\d+(.\d+)?d)?|\d+(.\d+)?)(\d+h)?$/,
}
