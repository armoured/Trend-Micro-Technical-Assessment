'use strict';

var UserManager = require('./manager');
var util = require('./util');

module.exports.handle_http = (event, context, callback) => {

  var user_manager = new UserManager();

  if (event.httpMethod === "POST" && event.path === "/user") {
    return user_manager.dispatch('create_user', event, callback);
  } else if (event.httpMethod === "GET" && event.path === "/users") {
    return user_manager.dispatch('get_users', event, callback);
  }

  const msg = 'Unknown Route or httpMethod for ' + event.path
  return util.handle_error(404, msg);

}

