'use strict'
const fs = require('fs'),
  path = require('path'),
  swaggerTools = require('swagger-tools'),
  jsyaml = require('js-yaml'),
  swaggerMerger = require('swagger-merger');

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan');
const upload = require('express-fileupload')
const ValidationError = require('express-validation').ValidationError
require('module-alias/register');
const constants = require('./config/constants')
const requestio = require('./middleware/requestio')
const routes = require('./routes');
const { formatValidationMessage } = require('./helpers');

const app = express();
app.set('port', constants.PORT);

app.use(cors());
app.use(express.static('public'))
app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(upload());
app.use(requestio);

//combine file swagger
swaggerMerger({
  input: path.join(__dirname, './shared/swagger/swagger-raw.yaml'),
  output: path.join(__dirname, './shared/swagger/swagger.yaml'),
  compact: false
}).catch(e => {
  console.error(e)
})

const spec = fs.readFileSync(path.join(__dirname, './shared/swagger/swagger.yaml'), 'utf8');
const swaggerDoc = jsyaml.load(spec);

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  app.use(middleware.swaggerMetadata());
  // app.use(middleware.swaggerValidator());
  app.use(middleware.swaggerUi());
  app.use('/api', routes);

  app.use(function (err, req, res, next) {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).send({
        code: 'error',
        message: formatValidationMessage(err),
      })
    }
    return res.status(400).json(err)
  })

  app.listen(app.get('port'), () => {
    const serverPort = app.get('port');
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
  });
});


