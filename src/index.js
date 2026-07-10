require('dotenv').config();

function serviceInfo() {
  return {
    name: 'ServicePro',
    version: require('../package.json').version,
    environment: process.env.NODE_ENV || 'development'
  };
}

module.exports = { serviceInfo };
