/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var path = require('path');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
      console.error('MongoDB connection error: ' + err);
      process.exit(-1);
    }
);
// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
const app = express();
const server = require('http').createServer(app);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'nasdb')));

app.use(function(req, res, next) {

    const allowedOrigins = [
      'http://localhost:3000'
    ];
    const origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Credentials', 'true');

    next();
});

// const socketio = require('socket.io')(server, {
//   serveClient: config.env !== 'production',
//   path: '/socket.io-client'
// });
// require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes/routes')(app);

// Start server
server.listen(config.port, config.ip, function () {

  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});


// Expose app
exports = module.exports = app;

