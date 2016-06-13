'use strict'

const config = {
  development: {
    host: 'localhost',
    port: 6379,
    db: 1
  },
  test: {
    host: 'localhost',
    port: 6379,
    db: 2
  }
}

const createClient = require('then-redis').createClient;
const env = process.env.NODE_ENV || 'development';
const redis = createClient(config[env]);

module.exports = redis;
