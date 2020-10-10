

module.exports.validate_email = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

module.exports.handle_response = (status_code, message, event) => {
    return {
      statusCode: status_code,
      body: JSON.stringify({
        message: message
      })
    };
}

module.exports.handle_error = (status_code, error_message) => {
    return {
      statusCode: status_code,
      body: JSON.stringify({
        errorMessage: error_message
      })
    };
}

module.exports.validate_body = (body_keys, body) => {
    for (const key of body_keys){
        if (!(key in body)) {
            return [false, key];
        }
    }
    return [true, null];
}

  