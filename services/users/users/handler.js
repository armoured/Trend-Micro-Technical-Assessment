'use strict';

var AWS = require('aws-sdk')

function handle_response(status_code, message, event) {
  return {
    statusCode: status_code,
    body: JSON.stringify({
      message: message,
      input: event,
    })
  };
}

// {
//   "firstname": "a",
//   "lastname": "b",
//   "email": "c",
//   "username": "d"
// }

module.exports.create_user = async (event, context, callback) => {

  // TODO
  // 1. Get Body from event
  // 2. validate email
  // 3. check user doesn't exist already by querying GSI where email is hash key
  // 4. Generate UUID and create user

  console.log(event.body)

  const body = JSON.parse(event.body)
  // Check firstname, lastname, email and username in body


  console.log(body.firstname)
  console.log(body.lastname)
  console.log(body.email)
  console.log(body.username)
  


  // var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'ap-southeast-2'});
  // var params = {};

  // try { 
  //   var result = await dynamodb.listTables(params, (err, data) => {
  //     if (err) return err;
  //     else return data;         
  //   }).promise();
  // } catch (err) {
  //   console.log(err, err.stack)
  //   console.log("Internal Server Error");

  //   const response = handle_response(500, 'Internal Server Error', event)
  //   callback(null, response);
  //   return;
  // }


  // if (result) {
  //   console.log(result);
  // }


  
  const response = handle_response(200, 'Create User', event);

  callback(null, response);
  return;
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

