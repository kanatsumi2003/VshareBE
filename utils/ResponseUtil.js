exports.success = (res, { data = null, message = null, status = 200, extra = {} } = {}) => {
  const resData = {
    status: 'success',
    ...extra
  }
  if (typeof data != 'undefined') {
    resData.data = data;
  }
  if (message) {
    resData.message = message;
  }
  return res.status(status).json(resData);
}

exports.error = (res, { errors = null, message = null, status = 400 }) => {
  const resData = {
    status: 'error',
  }
  if (errors) {
    resData.errors = errors;
  }
  if (message) {
    resData.message = message;
  }
  return res.status(status).json(resData);
}
