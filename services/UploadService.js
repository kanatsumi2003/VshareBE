const path = require('path'),
  slugify = require('slugify'),
  sharp = require('sharp'),
  moment = require('moment');

const PUBLIC_PATH = path.resolve(__dirname, '../public');
const UPLOAD_DIR = '/uploads';

exports.uploadBinary = function (binaryFile) {
  const fileName = slugify(binaryFile.name.toLowerCase(), '_');
  const spl = fileName.split('.');
  const ext = spl[spl.length - 1];
  const newName = fileName.replace(/.\w+$/, `${moment().format('YYYYMMDDHHmmss')}.${ext}`);
  const uploadPath = UPLOAD_DIR + '/' + newName;
  let thumbFullPath;
  if (binaryFile.mimetype.match('image/.*')) {
    thumbFullPath = PUBLIC_PATH + UPLOAD_DIR + '/' + fileName.replace(/.\w+$/, `${moment().format('YYYYMMDDHHmmss')}_100x100.${ext}`);
  }
  return new Promise((resolve, _) => {
    binaryFile.mv(PUBLIC_PATH + uploadPath, function (err, data) {
      if (err) resolve(null);
      if (thumbFullPath) {
        sharp(binaryFile.data)
          .resize(100)
          .toFile(thumbFullPath, (err, info) => {
            resolve(process.env.API_URL + uploadPath);
          });
      } else {
        resolve(process.env.API_URL + uploadPath);
      }
    });
  });
}