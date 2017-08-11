const handlers = require('./handlers.js');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: handlers.get_home
  },
  {
    method: 'POST',
    path: '/',
    handler: handlers.post_home
  },
  {
    method: 'GET',
    path: '/js/{param*}',
    handler: handlers.static_js
  },
  {
    method: 'GET',
    path: '/css/{param*}',
    handler: handlers.static_css
  },
];
