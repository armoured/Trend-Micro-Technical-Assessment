'use strict';

var AWS = require('aws-sdk')
var uuid = require('uuid');

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

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

module.exports.create_user = async (event, context, callback) => {

  // TODO
  // 1. Get Body from event
  // 2. check params exist
  // 3. validate email
  // 4. check user doesn't exist already by querying GSI where email is hash key
  // 5. Generate UUID and create user
  var response;
  console.log(event.body)

  // const body = JSON.parse(event.body)
  const body = event.body

  // Check firstname, lastname, email and username in body
  var params = ['firstname', 'lastname', 'email', 'username'];
  for (const param of params){
      console.log(param);
      if (!(param in body)) {
        const message = "Missing param " + param + " in body"
        console.log(message)
        response = handle_response(400, message, event);
        callback(null, response);
        return;
      }
  }


  console.log(body.firstname)
  console.log(body.lastname)
  console.log(body.email)
  console.log(body.username)

  if (!validateEmail(body.email)) {
    console.log("invalid email format")
    response = handle_response(400, 'Invalid Email Format', event);
    callback(null, response);
    return;
  }
  


  var params = {
    TableName: 'ddb-users-dev',
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': body.email
    }
  };

  var documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10', region: 'ap-southeast-2'});

  try {
    var result = await documentClient.query(params, (err, data) => {
      if (err) return err;
      else return data;
    }).promise();
  } catch (err) {
    console.log(err, err.stack);
    response = handle_response(500, 'Internal Server Error', event)
    callback(null, response)
    return;
  }

  if (result && result.Count !== 0) {
    console.log("User already exists");
    response = handle_response(400, 'User Already Exists', event)
    callback(null, response)
    return;
  }

  const id = uuid.v4();

  params = {
    TableName : 'ddb-users-dev',
    Item: {
       id: id,
       firstname: body.firstname,
       lastname: body.lastname,
       email: body.email,
       username: body.username
    }
  };

  try {
    result = await documentClient.put(params, (err, data) => {
      if (err) return err;
      else return data;
    }).promise();
  } catch (err) {
    console.log(err, err.stack);
    response = handle_response(500, 'Internal Server Error', event)
    callback(null, response)
    return;
  }

  console.log(result)
  console.log("User Successfully Created")
  response = handle_response(200, 'User Successfully Created', event);
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

