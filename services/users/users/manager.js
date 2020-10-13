

var AWS = require('aws-sdk')
var uuid = require('uuid');
var util = require('./util');
var queries = require ('./queries');

const { REGION } = require('./settings');


class UserManager {

    constructor() {
       this.document_client = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10', region: REGION});
       this.kms = new AWS.KMS({apiVersion: '2014-11-01', region: REGION});
    }

    async dispatch(method, event, callback) {
        return this[method](event, callback);  
    }

    async create_user(event, callback) {

        var response;

        const body = JSON.parse(event.body)

        // Check firstname, lastname, email and username in body
        const body_keys = ['firstname', 'lastname', 'email', 'username', 'credentials']
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
            console.log(err)
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

        
        // Generate a uuid as the hash key for the user
        // so that dynamodb will have even partitioning
        // of data.
        const id = uuid.v4();
        
        // Create KMS CMK
        params = {
            Tags: [{
                TagKey: "CreatedBy", 
                TagValue: id
            }]
        };
        try {
            result = await this.kms.createKey(params, (err, data) => {
                if (err) return err;
                else return data;
            }).promise();
        } catch(err) {
            console.log(err)
            response = util.handle_error(err.statusCode, err.code);
            callback(null, response)
            return;
        }

        const cmk_key_id = result.KeyMetadata.KeyId

        // Encrypt User Credentials with the newly created KMS CMK
        params = {
            KeyId: cmk_key_id,
            Plaintext: body.credentials
        };
        try {
            result = await this.kms.encrypt(params, (err, data) => {
                if (err) return err;
                else return data;
            }).promise();
        } catch (err) {
            console.log(err)
            response = util.handle_error(err.statusCode, err.code);
            callback(null, response)
            return;
        }

        // At this point, we can create a new user.
        const ciphertext_credentials = result.CiphertextBlob;
        params = queries.put_user(id, body, ciphertext_credentials);
        try {
            result = await this.document_client.put(params, (err, data) => {
                if (err) return err;
                else return data;
            }).promise();
        } catch (err) {
            console.log(err)
            response = util.handle_error(err.statusCode, err.code);
            callback(null, response)
            return;
        }

        // The user has been successfully created.
        console.log("User Successfully Created");

        const user = {
            id: id,
            type: 'user',
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

        const params = queries.scan_users();
        try {
            var result = await this.document_client.scan(params, (err, data) => {
                if (err) return err;
                else return data;
            }).promise();
        } catch (err) {
            console.log(err)
            response = util.handle_error(err.statusCode, err.code);
            callback(null, response)
            return;
        }

        const data = {
            "Items": result.Items
        }

        response = util.handle_response(200, data);

        callback(null, response);
        return;
    }



}

module.exports = UserManager;