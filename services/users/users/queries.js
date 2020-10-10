const { DYNAMODB_USERS } = require('./settings');


module.exports.get_user_from_email = (email) => {
    return {
        TableName: DYNAMODB_USERS,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
            ':email': email
        }
    }
};

module.exports.put_user = (id, body) => {
    return {
        TableName: DYNAMODB_USERS,
        Item: {
            id: id,
            firstname: body.firstname,
            lastname: body.lastname,
            email: body.email,
            username: body.username
        }
    }
}
