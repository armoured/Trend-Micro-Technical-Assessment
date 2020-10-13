/**
 *
 * Checks that the email is valid
 *
 * @param {*} email the users email
 */
module.exports.validate_email = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

/**
 *
 * @param {*} status_code the status code of the request
 * @param {*} data the data to return
 */
module.exports.handle_response = (status_code, data) => {
  return {
    statusCode: status_code,
    body: JSON.stringify({
      data: data,
    }),
  };
};

/**
 *
 * @param {*} status_code the status code of the request
 * @param {*} error_message the error message to return
 */
module.exports.handle_error = (status_code, error_message) => {
  return {
    statusCode: status_code,
    body: JSON.stringify({
      errors: [
        {
          errorMessage: error_message,
        },
      ],
    }),
  };
};

/**
 *
 * Checks that the expected body keys are in the lambda event body
 *
 * @param {*} body_keys the expected keys in body
 * @param {*} body the lambda event body
 */
module.exports.validate_body = (body_keys, body) => {
  for (const key of body_keys) {
    if (!(key in body)) {
      return [false, key];
    }
  }
  return [true, null];
};
