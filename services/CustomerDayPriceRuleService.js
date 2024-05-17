exports.isValidCustomerDayPriceRules = (data) => {
  if (!Array.isArray(data)) return false;
  let minDay = 0, invalidData = false;
  for (let index = 0; index < data.length; index++) {
    const rule = data[index];
    if (rule.day_count_from <= minDay || rule.day_count_to <= minDay) {
      invalidData = true;
      break;
    }
    minDay = rule.day_count_to;
  }
  return !invalidData;
}