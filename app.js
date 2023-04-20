/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/environment');
const path = require('path');

// const { MongoClient, ServerApiVersion } = require('mongodb');
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(config.mongo.uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("pdcom").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options)
  .then(() => {})
  .catch((err) => {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
  })
// Setup server
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'nasdb')));

const server = require('http').createServer(app);

// app.use(function(req, res, next) {
//
//     // const allowedOrigins = [
//     //   'http://localhost:3000'
//     // ];
//     // const origin = req.headers.origin;
//     // if(allowedOrigins.indexOf(origin) > -1){
//     //     res.header('Access-Control-Allow-Origin', origin);
//     // }
//     // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
//     // res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     // res.header('Access-Control-Allow-Credentials', 'true');
//
//     next();
// });

// const socketio = require('socket.io')(server, {
//   serveClient: config.env !== 'production',
//   path: '/socket.io-client'
// });
// require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes/routes')(app);

// Start server
server.listen(config.port, config.ip, function () {

  console.log('Express server listening on %d, in %s mode %s', config.port, app.get('env'), process.env.NODE_ENV);
});


// Expose app
exports = module.exports = app;

