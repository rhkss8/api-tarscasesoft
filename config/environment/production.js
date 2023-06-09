'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            8080,

  // MongoDB connection options
  mongo: {
    uri:    process.env.OPENSHIFT_MONGODB_DB_URL ||
            'mongodb+srv://tars:D29uiZHQI7RsnUuz@tarscasesoft.uinlet3.mongodb.net/pdcom?retryWrites=true&w=majority'
  },

  seedDB: true
};
