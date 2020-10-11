const STAGE = process.env.STAGE || 'dev';
const REGION = process.env.REGION || 'ap-southeast-2';
const DYNAMODB_USERS = process.env.DYNAMODB_USERS || 'ddb-users-dev'; 

module.exports = {
    STAGE: STAGE,
    REGION: REGION,
    DYNAMODB_USERS: DYNAMODB_USERS
}