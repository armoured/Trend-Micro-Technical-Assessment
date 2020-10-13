"use strict";

var UserManager = require("./manager");
var util = require("./util");

/**
 *
 * This is the primary lambda function used
 * to dispatch requests to the relevant function.
 * Currently supports create_user for POST and
 * get_users for GET requests.
 *
 * @param {*} event the lambda event
 * @param {*} context the lambda context
 * @param {*} callback the lambda callback
 */
module.exports.handle_http = (event, context, callback) => {
  var user_manager = new UserManager();

  if (event.httpMethod === "POST") {
    return user_manager.dispatch("create_user", event, callback);
  } else if (event.httpMethod === "GET") {
    return user_manager.dispatch("get_users", event, callback);
  }

  const msg =
    "Unknown Route or httpMethod for " + event.httpMethod + " " + event.path;
  return util.handle_error(404, msg);
};
