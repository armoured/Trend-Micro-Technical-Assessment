const { DYNAMODB_USERS } = require('./settings');

/**
 * 
 * DynamoDB query for getting users by email from the EmailIndex GSI
 * 
 * @param {*} email the users email
 */
module.exports.get_user_from_email = (email) => {
    return {
        TableName: DYNAMODB_USERS,
        IndexName: 'EmailIndex',
        ExpressionAttributeNames: {
            "#id": "id", "#type": "type", 
            "#firstname": "firstname", "#lastname": "lastname",
            "#email": "email", "#username": "username"
        },
        ProjectionExpression: "#id, #type, #firstname, #lastname, #email, #username",
        KeyConditionExpression: '#email = :email',
        ExpressionAttributeValues: {
            ':email': email
        }
    }
};

/**
 * DynamoDB scan to get all users
 */
module.exports.scan_users = () => {
    return {
        TableName: DYNAMODB_USERS,
        ExpressionAttributeNames: {
            "#id": "id", "#type": "type", 
            "#firstname": "firstname", "#lastname": "lastname",
            "#email": "email", "#username": "username"
        },
        ProjectionExpression: "#id,#type,#firstname,#lastname,#email,#username"
    }
}

/**
 * 
 * DynamoDB put to create a new user on the users table
 * 
 * @param {*} id the generated uuid for the user
 * @param {*} body the lambda event body
 * @param {*} ciphertext_credentials the encrypted credentials
 */
module.exports.put_user = (id, body, ciphertext_credentials) => {
    return {
        TableName: DYNAMODB_USERS,
        Item: {
            id: id,
            type: 'users',
            firstname: body.firstname,
            lastname: body.lastname,
            email: body.email,
            username: body.username,
            credentials: ciphertext_credentials
        }
    }
}
