

var AWS = require('aws-sdk')
var uuid = require('uuid');
var util = require('./util');
var queries = require ('./queries');

const { REGION } = require('./settings');


class UserManager {

    constructor() {
       this.document_client = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10', region: REGION});
    }

    dispatch(method, event, callback) {
        return this[method](event, callback);
    }

    async create_user(event, callback) {

        var response;

        const body = JSON.parse(event.body)
        // const body = event.body

        // Check firstname, lastname, email and username in body
        const body_keys = ['firstname', 'lastname', 'email', 'username']
        const [ valid, key ] = util.validate_body(body_keys, body)
        if (!valid) {
            const message = "Missing key " + key + " in body"
            console.log(message)
            response = util.handle_error(400, message);
            callback(null, response);
            return;
        }

        // Check the email is in a valid format
        if (!(util.validate_email(body.email))) {
            console.log("invalid email format")
            response = util.handle_error(400, 'Invalid Email Format');
            callback(null, response);
            return;
        }
        
        // Check the user doesn't already exist by querying
        // for their email from the email GSI on the users tables.
        // We cannot query the user by uuid as this does not come
        // with the request and logically shouldn't as we are 
        // creating the user.
        var params = queries.get_user_from_email(body.email);
        try {
            var result = await this.document_client.query(params, (err, data) => {
                if (err) return err;
                else return data;
            }).promise();
        } catch (err) {
            response = util.handle_error(err.statusCode, err.code);
            callback(null, response)
            return;
        }

        // If this is true then a user exists with the given email. 
        if (result && result.Count !== 0) {
            console.log("User already exists");
            response = util.handle_error(400, 'User Already Exists')
            callback(null, response)
            return;
        }

        // At this point, we can create a new user.
        // Generate a uuid as the hash key for the user
        // so that dynamodb will have even partitioning
        // of data.
        const id = uuid.v4();
        params = queries.put_user(id, body);
        try {
            result = await this.document_client.put(params, (err, data) => {
                if (err) return err;
                else return data;
            }).promise();
        } catch (err) {
            response = util.handle_error(err.statusCode, err.code);
            callback(null, response)
            return;
        }

        // The user has been successfully created.
        console.log("User Successfully Created");

        const user = {
            id: id,
            firstname: body.firstname,
            lastname: body.lastname,
            email: body.email,
            username: body.username
        }
      
        response = util.handle_response(201, user);
        callback(null, response);
        return;
    }

    async get_users(event, callback) {

        var response;   

        response = util.handle_response(200, 'Get Users');

        callback(null, response);
        return;
    }



}

module.exports = UserManager;