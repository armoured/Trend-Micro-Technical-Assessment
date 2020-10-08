'use strict';

module.exports.create_user = (event, context, callback) => {

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Create User',
      input: event,
    }),
  };

  callback(null, response);

};


module.exports.get_users = (event, context, callback) => {

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Get Users',
        input: event,
      }),
    };
  
    callback(null, response);
};
